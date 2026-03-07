import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'غير مسموح' });

    const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { id, newStock } = req.body;

    // تحديث المخزون في قاعدة البيانات
    const { error } = await supabase.from('oil_products').update({ stock: newStock }).eq('id', id);

    if (error) return res.status(500).json({ success: false, error: error.message });
    return res.status(200).json({ success: true });
}
