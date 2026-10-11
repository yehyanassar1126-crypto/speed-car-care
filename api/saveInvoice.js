import { createClient } from '@supabase/supabase-js';
import { sendWhatsApp } from './_whatsapp.js';

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
        // STEP 4: Send the customer details to the owner on WhatsApp
        // ============================================================
        const host = req.headers.host;
        const protocol = host.includes('localhost') ? 'http' : 'https';
        const approveUrl = `${protocol}://${host}/api/processApproval?id=${pendingId}&action=approve`;
        const rejectUrl = `${protocol}://${host}/api/processApproval?id=${pendingId}&action=reject`;

        const lines = [
            '*Speed Car Care - فاتورة جديدة* 🚗',
            '',
            `👤 العميل: ${invoiceData.customer_name || 'غير محدد'}`,
            `📞 التليفون: ${invoiceData.mobile_number || 'غير محدد'}`,
            `🚘 رقم العربية: ${invoiceData.car_number || 'غير محدد'}`
        ];
        if (invoiceData.current_km) lines.push(`🔢 العداد القديم: ${invoiceData.current_km}`);
        if (invoiceData.next_km) lines.push(`🔢 العداد الجديد: ${invoiceData.next_km}`);

        lines.push('', '*تفاصيل الخدمات:*');
        if (invoiceData.wash_services) lines.push(`🚿 الغسيل: ${invoiceData.wash_services} (${invoiceData.wash_total} ج.م)`);
        if (invoiceData.oil_services) lines.push(`🛢️ الزيت: ${invoiceData.oil_services} (${invoiceData.oil_total} ج.م)`);
        if (invoiceData.carpet_services) lines.push(`🪑 السجاد: ${invoiceData.carpet_services} (${invoiceData.carpet_total} ج.م)`);
        if (carpetCode) lines.push(`🔑 كود السجاد: ${carpetCode}`);

        lines.push(
            '',
            `💰 *الإجمالي: ${invoiceData.total} ج.م*`,
            '',
            `✅ موافقة: ${approveUrl}`,
            `❌ رفض: ${rejectUrl}`
        );

        // A WhatsApp failure must not break the customer's order (it is already saved as pending).
        let notified = true;
        try {
            await sendWhatsApp(lines.join('\n'));
        } catch (waError) {
            notified = false;
            console.error('WhatsApp notification failed:', waError.message);
        }

        // ============================================================
        // STEP 5: Return success
        // ============================================================
        return res.status(200).json({
            success: true,
            washQueueNumber, oilQueueNumber, carpetQueueNumber,
            hasWash, hasOil, hasCarpet,
            carpetCode,
            notified
        });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}
