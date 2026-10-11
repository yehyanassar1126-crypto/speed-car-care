// Shared approve / reject logic.
// Used by processApproval.js (WhatsApp links) and admin.js (dashboard).
// File name starts with "_" so Vercel does NOT expose it as a public API route.

export const PAYMENT_METHODS = ['cash', 'card', 'instapay', 'wallet'];

export async function approvePending(supabase, id, paymentMethod = null) {
    const { data: rec, error: fetchError } = await supabase
        .from('pending_invoices')
        .select('*')
        .eq('id', id)
        .single();

    if (fetchError || !rec) return { ok: false, notFound: true };

    const invoiceData = rec.invoice_data || {};
    const points = rec.points_data || {};
    const row = { ...invoiceData, payment_method: paymentMethod };

    // The permanent invoice MUST be saved. If it fails we keep the pending
    // request so nothing is lost, and report the real reason.
    const { error: invError } = await supabase.from('invoices').insert([row]);
    if (invError) return { ok: false, error: invError.message };

    const { error: dailyError } = await supabase.from('daily_invoices').insert([row]);
    if (dailyError) console.error('daily_invoices insert error:', dailyError.message);

    // Loyalty points
    const { data: existing } = await supabase
        .from('customer_points')
        .select('*')
        .eq('customer_name', invoiceData.customer_name)
        .maybeSingle();

    if (existing) {
        await supabase.from('customer_points').update({
            wash_points: (existing.wash_points || 0) + (points.wash || 0),
            oil_points: (existing.oil_points || 0) + (points.oil || 0),
            carpet_points: (existing.carpet_points || 0) + (points.carpet || 0)
        }).eq('customer_name', invoiceData.customer_name);
    } else {
        await supabase.from('customer_points').insert([{
            customer_name: invoiceData.customer_name,
            wash_points: points.wash || 0,
            oil_points: points.oil || 0,
            carpet_points: points.carpet || 0
        }]);
    }

    await supabase.from('pending_invoices').delete().eq('id', id);
    return { ok: true };
}

export async function rejectPending(supabase, id) {
    const { data: rec, error: fetchError } = await supabase
        .from('pending_invoices')
        .select('*')
        .eq('id', id)
        .single();

    if (fetchError || !rec) return { ok: false, notFound: true };

    // The storefront already deducted oil stock when the items were added to the
    // cart, so a rejected request must give that stock back.
    const items = Array.isArray(rec.invoice_data?.items) ? rec.invoice_data.items : [];
    for (const it of items) {
        if (it.category !== 'oil' || !it.stock_id) continue;
        const { data: p } = await supabase
            .from('oil_products').select('stock').eq('id', it.stock_id).maybeSingle();
        if (p) {
            await supabase.from('oil_products')
                .update({ stock: (Number(p.stock) || 0) + (Number(it.quantity) || 0) })
                .eq('id', it.stock_id);
        }
    }

    await supabase.from('pending_invoices').delete().eq('id', id);
    return { ok: true };
}
