import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).send('Method Not Allowed');
    }
    
    const { id } = req.query;
    if (!id) return res.status(400).send('Missing Approval ID');

    const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    try {
        // 1. Fetch the pending data
        const { data: pendingRecord, error: fetchError } = await supabase
            .from('pending_invoices')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError || !pendingRecord) {
            return res.status(404).send('<h1 style="color:red; text-align:center;">Invoice not found or already approved.</h1>');
        }

        const { invoice_data: invoiceData, points_data: points } = pendingRecord;

        // 2. Move to permanent invoice tables
        await supabase.from('invoices').insert([invoiceData]);
        await supabase.from('daily_invoices').insert([invoiceData]);

        // 3. Update customer points
        const { data: existingCustomer } = await supabase
            .from('customer_points')
            .select('*')
            .eq('customer_name', invoiceData.customer_name)
            .single();

        if (existingCustomer) {
            await supabase.from('customer_points').update({
                wash_points: existingCustomer.wash_points + (points.wash || 0),
                oil_points: existingCustomer.oil_points + (points.oil || 0),
                carpet_points: existingCustomer.carpet_points + (points.carpet || 0)
            }).eq('customer_name', invoiceData.customer_name);
        } else {
            await supabase.from('customer_points').insert([{
                customer_name: invoiceData.customer_name,
                wash_points: points.wash || 0,
                oil_points: points.oil || 0,
                carpet_points: points.carpet || 0
            }]);
        }

        // 4. Delete from pending table to prevent duplicate approvals
        await supabase.from('pending_invoices').delete().eq('id', id);

        // 5. Display success message
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.status(200).send('<h1 style="color:green; text-align:center; font-family: sans-serif; margin-top:50px;">تم تأكيد وحفظ الفاتورة بنجاح في قاعدة البيانات ✅</h1>');

    } catch (error) {
        console.error("Approval Error:", error);
        return res.status(500).send('Error approving invoice: ' + error.message);
    }
}
