import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'غير مسموح' });

    // الاتصال الآمن بـ Supabase
    const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // استقبال البيانات من الموقع
    const { invoiceData, points } = req.body;

    // 1. إضافة الفاتورة الرئيسية
    const { error: invError } = await supabase.from('invoices').insert([invoiceData]);
    if (invError) return res.status(500).json({ success: false, error: "خطأ في الفاتورة: " + invError.message });

    // 2. إضافة الفاتورة اليومية
    const { error: dailyError } = await supabase.from('daily_invoices').insert([invoiceData]);
    if (dailyError) return res.status(500).json({ success: false, error: "خطأ في اليومية: " + dailyError.message });

    // 3. فحص وتحديث نقاط العميل
    const { data: existingCustomer } = await supabase
        .from('customer_points')
        .select('*')
        .eq('customer_name', invoiceData.customer_name)
        .single();

    if (existingCustomer) {
        // تحديث النقاط لو العميل موجود
        await supabase.from('customer_points').update({
            wash_points: existingCustomer.wash_points + points.wash,
            oil_points: existingCustomer.oil_points + points.oil,
            carpet_points: existingCustomer.carpet_points + points.carpet
        }).eq('customer_name', invoiceData.customer_name);
    } else {
        // إنشاء عميل جديد بنقاط جديدة
        await supabase.from('customer_points').insert([{
            customer_name: invoiceData.customer_name,
            wash_points: points.wash,
            oil_points: points.oil,
            carpet_points: points.carpet
        }]);
    }

    // الرد على الموقع بنجاح العملية
    return res.status(200).json({ success: true });
}