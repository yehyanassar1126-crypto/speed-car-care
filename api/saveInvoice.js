import { createClient } from '@supabase/supabase-js';
const SibApiV3Sdk = require('@getbrevo/brevo');

export default async function handler(req, res) {
    if (req.method !== 'POST') 
        return res.status(405).json({ error: 'Method Not Allowed' });

    const supabase = createClient(
        process.env.SUPABASE_URL, 
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    try {
        const { invoiceData, points } = req.body;

        // ✅ Generate carpet code ONLY if carpet exists
        let carpetCode = null;

        if (invoiceData.carpet_total > 0) {

            // 🔥 هات آخر كود
            const { data: lastInvoice, error } = await supabase
                .from('invoices')
                .select('carpet_code')
                .not('carpet_code', 'is', null)
                .order('carpet_code', { ascending: false })
                .limit(1)
                .maybeSingle(); // أفضل من single عشان مايضربش error

            if (error) throw error;

            // 🔥 احسب الكود الجديد
            let newCarpetCode = 100;

            if (lastInvoice && lastInvoice.carpet_code) {
                newCarpetCode = lastInvoice.carpet_code + 1;
            }

            carpetCode = newCarpetCode;
            invoiceData.carpet_code = carpetCode;
        }

        // 1. Save in pending
        const { data: pendingData, error: pendingError } = await supabase
            .from('pending_invoices')
            .insert([{ 
                invoice_data: invoiceData, 
                points_data: points 
            }])
            .select();

        if (pendingError) throw pendingError;

        const pendingId = pendingData[0].id;

        // 2. Queue count
        const { count } = await supabase
            .from('pending_invoices')
            .select('*', { count: 'exact', head: true });

        const queueNumber = count ? count - 1 : 0;

        // 3. URLs
        const host = req.headers.host;
        const protocol = host.includes('localhost') ? 'http' : 'https';

        const approveUrl = `${protocol}://${host}/api/processApproval?id=${pendingId}&action=approve`;
        const rejectUrl = `${protocol}://${host}/api/processApproval?id=${pendingId}&action=reject`;

        // 4. Email
        let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
        apiInstance.authentications['apiKey'].apiKey = process.env.BREVO_API_KEY;

        let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

        sendSmtpEmail.sender = {
            name: "Speed Car Care",
            email: "nassaryehya26@gmail.com"
        };

        sendSmtpEmail.to = [
            { email: "nassaryehya26@gmail.com" }
        ];

        sendSmtpEmail.subject = `Invoice Approval Required: ${invoiceData.customer_name} - ${invoiceData.total} EGP`;

        sendSmtpEmail.htmlContent = `
            <div style="font-family: Arial; direction: rtl; text-align: right;">
                <h2>مطلوب مراجعة فاتورة جديدة</h2>

                <p><strong>العميل:</strong> ${invoiceData.customer_name}</p>
                <p><strong>رقم التليفون:</strong> ${invoiceData.mobile_number}</p>

                <p><strong>الغسيل:</strong> ${invoiceData.wash_services || 'لا يوجد'}</p>
                <p><strong>الزيت:</strong> ${invoiceData.oil_services || 'لا يوجد'}</p>
                <p><strong>السجاد:</strong> ${invoiceData.carpet_services || 'لا يوجد'}</p>

                ${carpetCode ? `<p><strong>🪑 كود السجاد:</strong> ${carpetCode}</p>` : ''}

                <p><strong>الإجمالي:</strong> ${invoiceData.total} ج.م</p>

                <br>

                <a href="${approveUrl}" style="background:green;color:#fff;padding:10px 15px;">موافقة</a>
                <a href="${rejectUrl}" style="background:red;color:#fff;padding:10px 15px;">رفض</a>
            </div>
        `;

        await apiInstance.sendTransacEmail(sendSmtpEmail);

        // 5. Response
        return res.status(200).json({
            success: true,
            queueNumber: queueNumber,
            carpetCode: carpetCode
        });

    } catch (error) {
        return res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
}
