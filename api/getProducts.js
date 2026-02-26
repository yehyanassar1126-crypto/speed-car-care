import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    // السيرفر بيسحب المفاتيح السرية من إعدادات Vercel المخفية
    const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data, error } = await supabase.from('oil_products').select('*');

    if (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
    return res.status(200).json({ success: true, data: data });
}
