import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // Connect to Supabase using your environment variables
    const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { rating, type, message, customerName, customerPhone } = req.body;

    try {
        // Insert the feedback into your new table
        const { error } = await supabase.from('customer_feedback').insert([{
            customer_name: customerName,
            customer_phone: customerPhone,
            rating: parseInt(rating),
            feedback_type: type,
            message: message
        }]);

        if (error) throw error;

        // Tell the browser it was a success!
        return res.status(200).json({ success: true });

    } catch (error) {
        console.error("Database Error:", error);
        return res.status(500).json({ success: false, error: error.message });
    }
}
