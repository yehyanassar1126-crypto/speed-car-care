import { createClient } from '@supabase/supabase-js';
const SibApiV3Sdk = require('@getbrevo/brevo');

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    try {
        const { invoiceData, points } = req.body;

        // --- TASK 1: SAVE TO SUPABASE (Invoices & Points) ---
        const { error: invError } = await supabase.from('invoices').insert([invoiceData]);
        if (invError) throw invError;

        const { error: dailyError } = await supabase.from('daily_invoices').insert([invoiceData]);
        if (dailyError) throw dailyError;

        const { data: existingCustomer } = await supabase
            .from('customer_points')
            .select('*')
            .eq('customer_name', invoiceData.customer_name)
            .single();

        if (existingCustomer) {
            const { error: updateError } = await supabase.from('customer_points').update({
                wash_points: existingCustomer.wash_points + (points.wash || 0),
                oil_points: existingCustomer.oil_points + (points.oil || 0),
                carpet_points: existingCustomer.carpet_points + (points.carpet || 0)
            }).eq('customer_name', invoiceData.customer_name);
            if (updateError) throw updateError;
        } else {
            const { error: insertError } = await supabase.from('customer_points').insert([{
                customer_name: invoiceData.customer_name,
                wash_points: points.wash || 0,
                oil_points: points.oil || 0,
                carpet_points: points.carpet || 0
            }]);
            if (insertError) throw insertError;
        }

        // --- TASK 2: SEND INVOICE EMAIL VIA BREVO ---
        let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
        let apiKey = apiInstance.authentications['apiKey'];
        apiKey.apiKey = process.env.BREVO_API_KEY;

        let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
        
        // CHANGE TO YOUR VERIFIED SENDER
        sendSmtpEmail.sender = { "name": "Speed Car Care", "email": "nassaryehya26@gmail.com" }; 
        
        // CHANGE TO WHERE YOU WANT TO RECEIVE IT
        sendSmtpEmail.to = [{ "email": "nassaryehya26@gmail.com" }]; 
        
        sendSmtpEmail.subject = `New Invoice: ${invoiceData.customer_name} - ${invoiceData.total} EGP`;
        
        // Building a nice Arabic right-to-left layout for your email
        sendSmtpEmail.htmlContent = `
            <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right; background-color: #f9f9f9; padding: 20px; border-radius: 10px;">
                <h2 style="color: #e94560;">فاتورة جديدة - Speed Car Care</h2>
                <p><strong>اسم العميل:</strong> ${invoiceData.customer_name || 'غير محدد'}</p>
                <p><strong>رقم التليفون:</strong> ${invoiceData.mobile_number || 'غير محدد'}</p>
                <p><strong>رقم العربية:</strong> ${invoiceData.car_number || 'غير محدد'}</p>
                ${invoiceData.current_km ? `<p><strong>العداد القديم:</strong> ${invoiceData.current_km}</p>` : ''}
                ${invoiceData.next_km ? `<p><strong>العداد الجديد:</strong> ${invoiceData.next_km}</p>` : ''}
                
                <hr style="border-top: 1px solid #ccc;">
                <h3 style="color: #1a1a2e;">تفاصيل الخدمات:</h3>
                ${invoiceData.wash_services ? `<p><strong>الغسيل:</strong> ${invoiceData.wash_services} (${invoiceData.wash_total} ج.م)</p>` : ''}
                ${invoiceData.oil_services ? `<p><strong>الزيت:</strong> ${invoiceData.oil_services} (${invoiceData.oil_total} ج.م)</p>` : ''}
                ${invoiceData.carpet_services ? `<p><strong>السجاد:</strong> ${invoiceData.carpet_services} (${invoiceData.carpet_total} ج.م)</p>` : ''}
                
                <hr style="border-top: 1px solid #ccc;">
                <h2 style="color: #e94560;">الإجمالي: ${invoiceData.total} ج.م</h2>
            </div>`;

        await apiInstance.sendTransacEmail(sendSmtpEmail);

        // --- EVERYTHING FINISHED SUCCESSFULLY ---
        return res.status(200).json({ success: true });

    } catch (error) {
        console.error("Database or Email Error:", error);
        return res.status(500).json({ success: false, error: error.message });
    }
}
