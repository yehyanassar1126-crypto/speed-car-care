import { createClient } from '@supabase/supabase-js';
import { approvePending, rejectPending } from './_approval.js';

// Kept for the approve / reject links sent to the owner on WhatsApp.
// (The dashboard at /admin.html does the same thing and also records the payment method.)
export default async function handler(req, res) {
    if (req.method !== 'GET') return res.status(405).send('Method Not Allowed');

    const { id, action } = req.query;
    if (!id || !action) return res.status(400).send('Missing ID or Action parameter.');

    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');

    try {
        const result = action === 'approve'
            ? await approvePending(supabase, id)
            : await rejectPending(supabase, id);

        if (result.notFound) {
            return res.status(404).send('<h1 style="color:red; text-align:center;">Record not found or already processed.</h1>');
        }
        if (!result.ok) {
            return res.status(500).send('Error: ' + result.error);
        }

        const message = action === 'approve'
            ? '<h1 style="color:green; text-align:center; font-family: sans-serif; margin-top:50px;">✅ تم تأكيد وحفظ الفاتورة بنجاح</h1>'
            : '<h1 style="color:red; text-align:center; font-family: sans-serif; margin-top:50px;">❌ تم رفض ومسح الفاتورة</h1>';
        return res.status(200).send(message);

    } catch (error) {
        return res.status(500).send('System Error: ' + error.message);
    }
}
