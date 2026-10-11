import { createClient } from '@supabase/supabase-js';
import { sendWhatsApp } from './_whatsapp.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { rating, type, message, customerName, customerPhone } = req.body;

    try {
        // --- TASK 1: SAVE TO SUPABASE DATABASE ---
        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        );

        const { error: dbError } = await supabase.from('customer_feedback').insert([{
            customer_name: customerName,
            customer_phone: customerPhone,
            rating: parseInt(rating),
            feedback_type: type,
            message: message
        }]);

        if (dbError) throw new Error("Database failed: " + dbError.message);

        // --- TASK 2: SEND WHATSAPP ALERT ---
        // The feedback is already saved, so a WhatsApp failure must not fail the request.
        try {
            await sendWhatsApp([
                '*Speed Car Care - تقييم جديد* ⭐',
                '',
                `👤 العميل: ${customerName}`,
                `📞 التليفون: ${customerPhone}`,
                `⭐ التقييم: ${rating} نجوم`,
                `📝 النوع: ${type}`,
                `💬 الرسالة: ${message}`
            ].join('\n'));
        } catch (waError) {
            console.error('WhatsApp feedback alert failed:', waError.message);
        }

        // --- BOTH TASKS FINISHED SUCCESSFULLY ---
        return res.status(200).json({ success: true });

    } catch (error) {
        console.error("Feedback Process Error:", error);
        return res.status(500).json({ success: false, error: error.message });
    }
}
