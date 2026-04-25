import SSLCommerzPayment from 'sslcommerz-lts';

export default async (req, res) => {
    // 1. Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { appointmentId, amount, patientName, patientEmail, patientPhone } = req.body;

    // 2. Initialize SSLCommerz
    const sslcz = new SSLCommerzPayment(
        process.env.SSL_STORE_ID,
        process.env.SSL_STORE_PASSWORD,
        process.env.SSL_IS_SANDBOX === 'true'
    );

    const baseUrl = process.env.VITE_APP_URL || 'https://dr-moon-beryl.vercel.app';

    const data = {
        total_amount: amount,
        currency: 'BDT',
        tran_id: appointmentId,
        success_url: `${baseUrl}/api/payment-success?id=${appointmentId}`,
        fail_url: `${baseUrl}/api/payment-fail?id=${appointmentId}`,
        cancel_url: `${baseUrl}/api/payment-cancel?id=${appointmentId}`,
        shipping_method: 'No',
        product_name: 'Doctor Consultation',
        product_category: 'Healthcare',
        product_profile: 'general',
        cus_name: patientName || 'Customer',
        cus_email: patientEmail || 'test@test.com',
        cus_phone: patientPhone || '01700000000',
        cus_add1: 'Dhaka',
        cus_city: 'Dhaka',
        cus_country: 'Bangladesh',
        ship_name: 'No Shipping',
        ship_add1: 'No Shipping',
        ship_city: 'No Shipping',
        ship_country: 'Bangladesh',
    };

    try {
        const response = await sslcz.init(data);
        
        if (response?.GatewayPageURL) {
            return res.status(200).json({ url: response.GatewayPageURL });
        } else {
            return res.status(400).json({ 
                error: 'SSLCommerz failed',
                details: response 
            });
        }
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};