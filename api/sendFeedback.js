import { createClient } from '@supabase/supabase-js';
const SibApiV3Sdk = require('@getbrevo/brevo');

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

        // --- TASK 2: SEND EMAIL ALERT VIA BREVO ---
        let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
        let apiKey = apiInstance.authentications['apiKey'];
        apiKey.apiKey = process.env.BREVO_API_KEY;

        let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
        
        // CHANGE TO YOUR VERIFIED SENDER
        sendSmtpEmail.sender = { "name": "Speed Car Care", "email": "nassaryehya26@gmail.com" }; 
        
        // CHANGE TO WHERE YOU WANT TO RECEIVE IT
        sendSmtpEmail.to = [{ "email": "nassaryehya26@gmail.com" }]; 
        
        sendSmtpEmail.subject = `New Feedback from ${customerName}`;
        sendSmtpEmail.htmlContent = `
            <html>
                <body>
                    <h2>New Customer Feedback</h2>
                    <p><strong>Customer:</strong> ${customerName}</p>
                    <p><strong>Phone:</strong> ${customerPhone}</p>
                    <p><strong>Rating:</strong> ${rating} Stars</p>
                    <p><strong>Type:</strong> ${type}</p>
                    <p><strong>Message:</strong> ${message}</p>
                </body>
            </html>`;

        await apiInstance.sendTransacEmail(sendSmtpEmail);

        // --- BOTH TASKS FINISHED SUCCESSFULLY ---
        return res.status(200).json({ success: true });

    } catch (error) {
        console.error("Feedback Process Error:", error);
        return res.status(500).json({ success: false, error: error.message });
    }
}
