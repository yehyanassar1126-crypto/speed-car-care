import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    // السيرفر بيسحب المفاتيح السرية من إعدادات Vercel المخفية
    const supabaseUrl = process.env.SUPABASE_URL || 'https://kqaexwzelmdjyrimqvhu.supabase.co';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || 'sb_publishable_rm-HO9wbB89_nhRgPW3eMQ_Vsv6GiJ9';
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase.from('oil_products').select('*');

    if (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
    return res.status(200).json({ success: true, data: data });
}
