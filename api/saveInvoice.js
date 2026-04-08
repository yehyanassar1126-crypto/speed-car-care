import { createClient } from '@supabase/supabase-js';
const SibApiV3Sdk = require('@getbrevo/brevo');

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    try {
        const { invoiceData, points } = req.body;

        const hasWash = invoiceData.wash_total && invoiceData.wash_total > 0;
        const hasOil = invoiceData.oil_total && invoiceData.oil_total > 0;
        const hasCarpet = invoiceData.carpet_total && invoiceData.carpet_total > 0;

        // ============================================================
        // STEP 1: INSERT FIRST (so concurrent requests can see each other)
        // ============================================================
        const { data: pendingData, error: pendingError } = await supabase
            .from('pending_invoices')
            .insert([{ invoice_data: invoiceData, points_data: points }])
            .select();

        if (pendingError) throw pendingError;
        const pendingId = pendingData[0].id;

        // ============================================================
        // STEP 2: NOW calculate everything (after insert, so data is accurate)
        // ============================================================

        // Fetch ALL pending invoices (including the one we just inserted)
        const { data: allPending, error: pendingFetchError } = await supabase
            .from('pending_invoices')
            .select('id, invoice_data');

        // --- Queue counts ---
        let washQueueNumber = 0;
        let oilQueueNumber = 0;
        let carpetQueueNumber = 0;

        if (!pendingFetchError && allPending) {
            if (hasWash) {
                washQueueNumber = allPending.filter(row =>
                    row.invoice_data && row.invoice_data.wash_total > 0 && row.id < pendingId
                ).length;
            }
            if (hasOil) {
                oilQueueNumber = allPending.filter(row =>
                    row.invoice_data && row.invoice_data.oil_total > 0 && row.id < pendingId
                ).length;
            }
            if (hasCarpet) {
                carpetQueueNumber = allPending.filter(row =>
                    row.invoice_data && row.invoice_data.carpet_total > 0 && row.id < pendingId
                ).length;
            }
        }

        // --- Carpet code ---
        let carpetCode = null;
        if (hasCarpet) {
            const customerPhone = invoiceData.mobile_number;

            // Get carpet code atomically from database (guaranteed unique!)
            const { data: codeResult, error: codeErr } = await supabase
                .rpc('assign_carpet_code', { p_phone: customerPhone });

            if (codeErr) throw codeErr;
            carpetCode = codeResult;

            // ============================================================
            // STEP 3: UPDATE the pending invoice with the carpet code
            // ============================================================
            invoiceData.carpet_code = carpetCode;
            await supabase
                .from('pending_invoices')
                .update({ invoice_data: invoiceData })
                .eq('id', pendingId);
        }

        // ============================================================
        // STEP 4: Send email with all details
        // ============================================================
        const host = req.headers.host;
        const protocol = host.includes('localhost') ? 'http' : 'https';
        const approveUrl = `${protocol}://${host}/api/processApproval?id=${pendingId}&action=approve`;
        const rejectUrl = `${protocol}://${host}/api/processApproval?id=${pendingId}&action=reject`;

        let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
        let apiKey = apiInstance.authentications['apiKey'];
        apiKey.apiKey = process.env.BREVO_API_KEY;

        let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
        sendSmtpEmail.sender = { "name": "Speed Car Care", "email": "nassaryehya26@gmail.com" };
        sendSmtpEmail.to = [{ "email": "nassaryehya26@gmail.com" }];
        sendSmtpEmail.subject = `Invoice Approval Required: ${invoiceData.customer_name} - ${invoiceData.total} EGP`;

        // Build service details sections
        let servicesHtml = '';
        if (invoiceData.wash_services) {
            servicesHtml += `<p><strong>الغسيل:</strong> ${invoiceData.wash_services} (${invoiceData.wash_total} ج.م)</p>`;
        }
        if (invoiceData.oil_services) {
            servicesHtml += `<p><strong>الزيت:</strong> ${invoiceData.oil_services} (${invoiceData.oil_total} ج.م)</p>`;
        }
        if (invoiceData.carpet_services) {
            servicesHtml += `<p><strong>السجاد:</strong> ${invoiceData.carpet_services} (${invoiceData.carpet_total} ج.م)</p>`;
        }

        let carpetCodeHtml = '';
        if (carpetCode) {
            carpetCodeHtml = `<p style="font-size: 16px;"><strong>🪑 كود السجاد:</strong> ${carpetCode}</p>`;
        }

        sendSmtpEmail.htmlContent = `
            <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right; background-color: #1a1a2e; padding: 30px; border-radius: 10px; color: #eaeaea;">
                <h2 style="color: #e94560; text-align: center;">Speed Car Care - فاتورة جديدة</h2>
                
                <p><strong>اسم العميل:</strong> ${invoiceData.customer_name || 'غير محدد'}</p>
                <p><strong>رقم التليفون:</strong> ${invoiceData.mobile_number || 'غير محدد'}</p>
                <p><strong>رقم العربية:</strong> ${invoiceData.car_number || 'غير محدد'}</p>
                ${invoiceData.current_km ? `<p><strong>العداد القديم:</strong> ${invoiceData.current_km}</p>` : ''}
                ${invoiceData.next_km ? `<p><strong>العداد الجديد:</strong> ${invoiceData.next_km}</p>` : ''}
                
                <hr style="border-top: 1px solid #444;">
                <p style="font-weight: bold;">تفاصيل الخدمات:</p>
                ${servicesHtml}
                ${carpetCodeHtml}
                
                <hr style="border-top: 1px solid #444;">
                <p style="color: #e94560; font-size: 18px; text-align: center;"><strong>الإجمالي: ${invoiceData.total} ج.م</strong></p>
                
                <div style="text-align: center; margin-top: 20px;">
                    <a href="${approveUrl}" style="background-color: #28a745; color: white; padding: 14px 28px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-left: 10px; font-size: 16px;">موافقة</a>
                    <a href="${rejectUrl}" style="background-color: #dc3545; color: white; padding: 14px 28px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">رفض</a>
                </div>
            </div>`;

        await apiInstance.sendTransacEmail(sendSmtpEmail);

        // ============================================================
        // STEP 5: Return success
        // ============================================================
        return res.status(200).json({
            success: true,
            washQueueNumber, oilQueueNumber, carpetQueueNumber,
            hasWash, hasOil, hasCarpet,
            carpetCode
        });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}
