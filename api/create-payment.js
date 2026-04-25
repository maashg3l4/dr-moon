import SSLCommerzPayment from 'sslcommerz-lts';

export default async (req, res) => {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    // Use default values so SSLCommerz never sees an "empty" box
    const { 
        appointmentId = `TRX${Date.now()}`, 
        amount = 10, 
        patientName = "Patient", 
        patientEmail = "patient@example.com", 
        patientPhone = "01700000000" 
    } = req.body;

    const sslcz = new SSLCommerzPayment(
        process.env.SSL_STORE_ID,
        process.env.SSL_STORE_PASSWORD,
        process.env.SSL_IS_SANDBOX === 'true'
    );

    const baseUrl = "https://dr-moon-beryl.vercel.app";

    const data = {
        total_amount: amount,
        currency: 'BDT',
        tran_id: appointmentId,
        success_url: `${baseUrl}/api/payment-success?id=${appointmentId}`,
        fail_url: `${baseUrl}/api/payment-fail?id=${appointmentId}`,
        cancel_url: `${baseUrl}/api/payment-cancel?id=${appointmentId}`,
        shipping_method: 'No',
        product_name: 'Consultation',
        product_category: 'Medical',
        product_profile: 'general',
        cus_name: patientName,
        cus_email: patientEmail,
        cus_add1: 'Dhaka',
        cus_city: 'Dhaka',
        cus_state: 'Dhaka',
        cus_postcode: '1000',
        cus_country: 'Bangladesh',
        cus_phone: patientPhone,
        ship_name: 'N/A',
        ship_add1: 'N/A',
        ship_city: 'N/A',
        ship_state: 'N/A',
        ship_postcode: '0000',
        ship_country: 'Bangladesh',
    };

    try {
        const response = await sslcz.init(data);
        if (response?.GatewayPageURL) {
            return res.status(200).json({ url: response.GatewayPageURL });
        } else {
            // This will show us the EXACT reason in Vercel Logs
            console.error("SSLCommerz Rejected Request:", response);
            return res.status(400).json({ error: 'SSLCommerz rejected the request. check logs.' });
        }
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};