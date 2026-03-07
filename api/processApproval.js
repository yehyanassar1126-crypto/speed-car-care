import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    if (req.method !== 'GET') return res.status(405).send('Method Not Allowed');
    
    const { id, action } = req.query;
    if (!id || !action) return res.status(400).send('Missing ID or Action parameter.');

    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    try {
        // Fetch the staged record
        const { data: pendingRecord, error: fetchError } = await supabase
            .from('pending_invoices')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError || !pendingRecord) {
            return res.status(404).send('<h1 style="color:red; text-align:center;">Record not found or already processed.</h1>');
        }

        if (action === 'approve') {
            const { invoice_data: invoiceData, points_data: points } = pendingRecord;

            // Commit to permanent tables
            await supabase.from('invoices').insert([invoiceData]);
            await supabase.from('daily_invoices').insert([invoiceData]);

            // Update loyalty points
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
        }

        // Hard delete the record from pending_invoices regardless of approval or rejection
        await supabase.from('pending_invoices').delete().eq('id', id);

        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        const message = action === 'approve' 
            ? '<h1 style="color:green; text-align:center; font-family: sans-serif; margin-top:50px;">✅ تم تأكيد وحفظ الفاتورة بنجاح</h1>'
            : '<h1 style="color:red; text-align:center; font-family: sans-serif; margin-top:50px;">❌ تم رفض ومسح الفاتورة</h1>';
            
        return res.status(200).send(message);

    } catch (error) {
        return res.status(500).send('System Error: ' + error.message);
    }
}
