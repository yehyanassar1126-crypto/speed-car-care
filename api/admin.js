import { createClient } from '@supabase/supabase-js';
import crypto from 'node:crypto';
import { approvePending, rejectPending, PAYMENT_METHODS } from './_approval.js';

// One endpoint for the whole dashboard:  POST /api/admin  { action, ...params }
// Admins live in the `admin_users` table (bcrypt-hashed passwords, see sql/admin_migration.sql).
// Login returns a signed token (12h) that the page sends as  Authorization: Bearer <token>.
// The signing key is derived from SUPABASE_SERVICE_ROLE_KEY, so no extra env var is needed.

const TOKEN_TTL_MS = 12 * 60 * 60 * 1000;
const signKey = () => crypto.createHmac('sha256', 'scc-admin-v1').update(process.env.SUPABASE_SERVICE_ROLE_KEY || '').digest();
const mac = b64 => crypto.createHmac('sha256', signKey()).update(b64).digest('base64url');

function signToken(payload) {
    const b64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
    return b64 + '.' + mac(b64);
}
function readToken(token) {
    const [b64, sig] = String(token || '').split('.');
    if (!b64 || !sig) return null;
    const a = Buffer.from(sig), b = Buffer.from(mac(b64));
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
    try {
        const p = JSON.parse(Buffer.from(b64, 'base64url').toString());
        return p.exp > Date.now() ? p : null;
    } catch { return null; }
}

// Supabase returns max 1000 rows per request, so read in pages.
async function fetchAll(makeQuery) {
    const out = [];
    for (let from = 0; ; from += 1000) {
        const { data, error } = await makeQuery().range(from, from + 999);
        if (error) throw error;
        out.push(...data);
        if (data.length < 1000) break;
    }
    return out;
}

// "name (x2) | other (x1)"  ->  [{name, quantity}]   (for invoices saved before `items` existed)
function parseOilServices(text) {
    if (!text) return [];
    return String(text).split('|').map(s => s.trim()).filter(Boolean).map(part => {
        const m = part.match(/^(.*?)\s*\(x(\d+)\)\s*$/);
        return m ? { name: m[1].trim(), quantity: Number(m[2]) } : { name: part, quantity: 1 };
    });
}

// Which role is the configured Supabase key? (JWT keys carry it; new sb_secret_ keys don't)
function keyRole() {
    const k = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    if (k.startsWith('sb_secret_')) return 'service_role';
    if (k.startsWith('sb_publishable_')) return 'anon';
    try { return JSON.parse(Buffer.from(k.split('.')[1], 'base64url').toString()).role || null; } catch { return null; }
}

const toInt = v => Math.trunc(Number(v));

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method Not Allowed' });

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        return res.status(500).json({ success: false, error: 'متغيرات SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY ناقصة في Vercel (وبعد إضافتها اعمل Redeploy)' });
    }

    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    const body = req.body || {};

    // ---- login (the only action that does not need a token) ----
    if (body.action === 'login') {
        try {
            const { data, error } = await supabase.rpc('admin_login', {
                p_username: String(body.username || ''), p_password: String(body.password || '')
            });
            if (error) throw error;
            if (!data?.ok) {
                return res.status(401).json({
                    success: false,
                    error: data?.locked ? 'الحساب اتقفل 15 دقيقة بسبب محاولات غلط كتير' : 'اسم المستخدم أو كلمة السر غير صحيحة'
                });
            }
            const token = signToken({ uid: data.id, exp: Date.now() + TOKEN_TTL_MS });
            return res.json({ success: true, token, user: { id: data.id, username: data.username, display_name: data.display_name } });
        } catch (e) {
            const role = keyRole();
            if (/permission denied/i.test(e.message) && role !== 'service_role') {
                return res.status(500).json({ success: false, error:
                    'المفتاح SUPABASE_SERVICE_ROLE_KEY في Vercel هو مفتاح "' + (role || 'غير معروف') +
                    '" مش service_role. خد مفتاح service_role من Supabase ← Project Settings ← API وحطه في Vercel ثم Redeploy.' });
            }
            return res.status(500).json({ success: false, error: e.message });
        }
    }

    // ---- everything else needs a valid token of an admin that still exists ----
    const bearer = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    const session = readToken(bearer);
    let me = null;
    if (session) {
        const { data } = await supabase.from('admin_users').select('id, username, display_name').eq('id', session.uid).maybeSingle();
        me = data;
    }
    if (!me) return res.status(401).json({ success: false, error: 'سجّل دخول تاني' });

    try {
        switch (body.action) {

            case 'ping':
                return res.json({ success: true, user: me });

            // ---------------- Admins ----------------
            case 'admins': {
                const { data, error } = await supabase.from('admin_users')
                    .select('id, username, display_name, last_login, created_at').order('id', { ascending: true });
                if (error) throw error;
                return res.json({ success: true, data, me_id: me.id });
            }

            case 'admin_add': {
                const username = String(body.username || '').trim();
                const password = String(body.password || '');
                if (!/^[A-Za-z0-9_.-]{3,30}$/.test(username)) {
                    return res.status(400).json({ success: false, error: 'اسم المستخدم: 3 إلى 30 حرف إنجليزي أو أرقام (_ . - مسموحين)' });
                }
                if (password.length < 6) return res.status(400).json({ success: false, error: 'كلمة السر لازم تكون 6 حروف أو أرقام على الأقل' });
                const { error } = await supabase.rpc('admin_create', {
                    p_username: username, p_password: password, p_display: String(body.display_name || '')
                });
                if (error) {
                    const dup = /duplicate|unique/i.test(error.message);
                    return res.status(dup ? 400 : 500).json({ success: false, error: dup ? 'اسم المستخدم ده موجود بالفعل' : error.message });
                }
                return res.json({ success: true });
            }

            case 'admin_password': {
                const password = String(body.password || '');
                if (password.length < 6) return res.status(400).json({ success: false, error: 'كلمة السر لازم تكون 6 حروف أو أرقام على الأقل' });
                const { error } = await supabase.rpc('admin_set_password', { p_id: body.id, p_password: password });
                if (error) throw error;
                return res.json({ success: true });
            }

            case 'admin_delete': {
                if (String(body.id) === String(me.id)) return res.status(400).json({ success: false, error: 'مينفعش تمسح حسابك اللي داخل بيه' });
                const { count } = await supabase.from('admin_users').select('id', { count: 'exact', head: true });
                if ((count || 0) <= 1) return res.status(400).json({ success: false, error: 'لازم يفضل مدير واحد على الأقل' });
                const { error } = await supabase.from('admin_users').delete().eq('id', body.id);
                if (error) throw error;
                return res.json({ success: true });
            }

            // ---------------- Requests ----------------
            case 'pending': {
                const { data, error } = await supabase
                    .from('pending_invoices').select('*').order('id', { ascending: true });
                if (error) throw error;
                return res.json({ success: true, data });
            }

            case 'approve': {
                if (!PAYMENT_METHODS.includes(body.payment_method)) {
                    return res.status(400).json({ success: false, error: 'اختار طريقة الدفع' });
                }
                const r = await approvePending(supabase, body.id, body.payment_method);
                if (r.notFound) return res.status(404).json({ success: false, error: 'الطلب مش موجود أو اتعالج قبل كده' });
                if (!r.ok) return res.status(500).json({ success: false, error: r.error });
                return res.json({ success: true });
            }

            case 'reject': {
                const r = await rejectPending(supabase, body.id);
                if (r.notFound) return res.status(404).json({ success: false, error: 'الطلب مش موجود أو اتعالج قبل كده' });
                return res.json({ success: true });
            }

            // ---------------- Invoices / daily totals ----------------
            case 'invoices': {
                const data = await fetchAll(() =>
                    supabase.from('invoices').select('*').order('created_at', { ascending: false }));
                return res.json({ success: true, data });
            }

            case 'daily_totals': {
                const data = await fetchAll(() =>
                    supabase.from('daily_totals').select('*').order('day', { ascending: false }));
                return res.json({ success: true, data });
            }

            // ---------------- Feedback ----------------
            case 'feedback': {
                const data = await fetchAll(() =>
                    supabase.from('customer_feedback').select('*').order('created_at', { ascending: false }));
                return res.json({ success: true, data });
            }

            // ---------------- Oil inventory ----------------
            case 'oil_report': {
                const { data: products, error: pErr } = await supabase
                    .from('oil_products').select('*').order('name', { ascending: true });
                if (pErr) throw pErr;

                const invoices = await fetchAll(() =>
                    supabase.from('invoices').select('id, oil_services, items').order('created_at', { ascending: true }));
                const log = await fetchAll(() =>
                    supabase.from('oil_stock_log').select('*').order('created_at', { ascending: false }));

                const sold = {};
                for (const inv of invoices) {
                    const lines = Array.isArray(inv.items) && inv.items.length
                        ? inv.items.filter(i => i.category === 'oil').map(i => ({ name: i.name, quantity: Number(i.quantity) || 0 }))
                        : parseOilServices(inv.oil_services);
                    for (const l of lines) sold[l.name] = (sold[l.name] || 0) + l.quantity;
                }

                const added = {}, adjusted = {};
                for (const l of log) {
                    const bucket = l.type === 'add' ? added : adjusted;
                    bucket[l.product_name] = (bucket[l.product_name] || 0) + l.qty;
                }

                const rows = products.map(p => {
                    const s = sold[p.name] || 0, a = added[p.name] || 0, j = adjusted[p.name] || 0;
                    const remaining = Number(p.stock) || 0;
                    return {
                        id: p.id, name: p.name, price: Number(p.price) || 0,
                        max_kilometers: Number(p.max_kilometers) || 0,
                        opening: remaining - a - j + s,   // رصيد قبل أول حركة مسجلة
                        added: a, sold: s, adjusted: j, remaining
                    };
                });

                // Oils that were sold but no longer exist in oil_products
                const known = new Set(products.map(p => p.name));
                for (const name of Object.keys(sold)) {
                    if (!known.has(name)) rows.push({
                        id: null, name, price: 0, max_kilometers: 0, opening: null,
                        added: added[name] || 0, sold: sold[name], adjusted: adjusted[name] || 0, remaining: null
                    });
                }
                return res.json({ success: true, data: rows, log });
            }

            case 'add_oil': {
                const name = String(body.name || '').trim();
                const price = Number(body.price), stock = toInt(body.stock || 0), km = toInt(body.max_kilometers || 0);
                if (!name) return res.status(400).json({ success: false, error: 'اكتب اسم الزيت' });
                if (!(price >= 0)) return res.status(400).json({ success: false, error: 'السعر غير صحيح' });
                if (!(stock >= 0)) return res.status(400).json({ success: false, error: 'الكمية غير صحيحة' });

                const { data: dup } = await supabase.from('oil_products').select('id').ilike('name', name).limit(1);
                if (dup && dup.length) return res.status(400).json({ success: false, error: 'النوع ده موجود بالفعل' });

                const { data, error } = await supabase.from('oil_products')
                    .insert([{ name, price, stock, max_kilometers: km || 0 }]).select().single();
                if (error) throw error;
                if (stock > 0) {
                    await supabase.from('oil_stock_log').insert([{
                        product_id: String(data.id), product_name: name, type: 'add', qty: stock, note: 'رصيد افتتاحي لنوع جديد'
                    }]);
                }
                return res.json({ success: true, data });
            }

            case 'edit_oil': {
                const price = Number(body.price), km = toInt(body.max_kilometers || 0);
                if (!(price >= 0)) return res.status(400).json({ success: false, error: 'السعر غير صحيح' });
                const { error } = await supabase.from('oil_products')
                    .update({ price, max_kilometers: km || 0 }).eq('id', body.id);
                if (error) throw error;
                return res.json({ success: true });
            }

            case 'restock': {
                const qty = toInt(body.qty);
                if (!(qty > 0)) return res.status(400).json({ success: false, error: 'اكتب كمية أكبر من صفر' });
                const { data: p, error } = await supabase.from('oil_products').select('id, name, stock').eq('id', body.id).single();
                if (error || !p) return res.status(404).json({ success: false, error: 'الزيت مش موجود' });
                const { error: uErr } = await supabase.from('oil_products')
                    .update({ stock: (Number(p.stock) || 0) + qty }).eq('id', p.id);
                if (uErr) throw uErr;
                await supabase.from('oil_stock_log').insert([{
                    product_id: String(p.id), product_name: p.name, type: 'add', qty, note: body.note || 'توريد'
                }]);
                return res.json({ success: true });
            }

            case 'adjust': {
                const newStock = toInt(body.newStock);
                if (!(newStock >= 0)) return res.status(400).json({ success: false, error: 'الكمية غير صحيحة' });
                const { data: p, error } = await supabase.from('oil_products').select('id, name, stock').eq('id', body.id).single();
                if (error || !p) return res.status(404).json({ success: false, error: 'الزيت مش موجود' });
                const delta = newStock - (Number(p.stock) || 0);
                if (delta === 0) return res.json({ success: true });
                const { error: uErr } = await supabase.from('oil_products').update({ stock: newStock }).eq('id', p.id);
                if (uErr) throw uErr;
                await supabase.from('oil_stock_log').insert([{
                    product_id: String(p.id), product_name: p.name, type: 'adjust', qty: delta, note: body.note || 'تسوية جرد'
                }]);
                return res.json({ success: true });
            }

            default:
                return res.status(400).json({ success: false, error: 'Unknown action' });
        }
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}
