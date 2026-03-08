import { createClient } from '@supabase/supabase-js';
const SibApiV3Sdk = require('@getbrevo/brevo');

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    try {
        const { invoiceData, points } = req.body;

        // 1. Stage the data in the pending table
        const { data: pendingData, error: pendingError } = await supabase
            .from('pending_invoices')
            .insert([{ invoice_data: invoiceData, points_data: points }])
            .select();

        if (pendingError) throw pendingError;
        const pendingId = pendingData[0].id;

        // 2. Count the current queue (This was the missing logic!)
        const { count, error: countError } = await supabase
            .from('pending_invoices')
            .select('*', { count: 'exact', head: true });
        
        // Subtract 1 so it does not count the user's newly submitted invoice
        const queueNumber = count ? count - 1 : 0;

        // 3. Construct dynamic action URLs
        const host = req.headers.host;
        const protocol = host.includes('localhost') ? 'http' : 'https';
        const approveUrl = `${protocol}://${host}/api/processApproval?id=${pendingId}&action=approve`;
        const rejectUrl = `${protocol}://${host}/api/processApproval?id=${pendingId}&action=reject`;

        // 4. Configure Brevo email parameters
        let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
        let apiKey = apiInstance.authentications['apiKey'];
        apiKey.apiKey = process.env.BREVO_API_KEY;

        let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
        sendSmtpEmail.sender = { "name": "Speed Car Care", "email": "nassaryehya26@gmail.com" }; 
        sendSmtpEmail.to = [{ "email": "nassaryehya26@gmail.com" }]; 
        sendSmtpEmail.subject = `Invoice Approval Required: ${invoiceData.customer_name} - ${invoiceData.total} EGP`;
        
        sendSmtpEmail.htmlContent = `
            <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right; background-color: #f9f9f9; padding: 20px; border-radius: 10px;">
                <h2 style="color: #1a1a2e;">مطلوب مراجعة فاتورة جديدة</h2>
                <p><strong>العميل:</strong> ${invoiceData.customer_name || 'غير محدد'}</p>
                <p><strong>رقم التليفون:</strong> ${invoiceData.mobile_number || 'غير محدد'}</p>
                <p><strong>خدمات الغسيل:</strong> ${invoiceData.wash_services || 'لا يوجد'}</p>
                <p><strong>خدمات الزيت:</strong> ${invoiceData.oil_services || 'لا يوجد'}</p>
                <p><strong>خدمات السجاد:</strong> ${invoiceData.carpet_services || 'لا يوجد'}</p>
                <p><strong>الإجمالي:</strong> ${invoiceData.total} ج.م</p>
                
                <hr style="border-top: 1px solid #ccc;">
                <br>
                <div style="text-align: center;">
                    <a href="${approveUrl}" style="background-color: #28a745; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-left: 10px;">✅ موافقة وحفظ</a>
                    <a href="${rejectUrl}" style="background-color: #dc3545; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">❌ رفض ومسح</a>
                </div>
                <br>
            </div>`;

        await apiInstance.sendTransacEmail(sendSmtpEmail);

        // 5. Return success WITH the calculated queue number
        return res.status(200).json({ success: true, queueNumber: queueNumber });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}

