import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    const { phone } = req.body;

    try {
        // Fetch latest invoice to retrieve the name and car number associated with this phone
        const { data: invoiceData } = await supabase
            .from('invoices')
            .select('customer_name, car_number')
            .eq('mobile_number', phone)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (!invoiceData) return res.status(200).json({ found: false });

        // Fetch points using the associated customer name
        const { data: pointsData } = await supabase
            .from('customer_points')
            .select('*')
            .eq('customer_name', invoiceData.customer_name)
            .single();

        return res.status(200).json({
            found: true,
            customer_name: invoiceData.customer_name,
            car_number: invoiceData.car_number,
            points: pointsData || { wash_points: 0, oil_points: 0, carpet_points: 0 }
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
