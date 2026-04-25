const SSLCommerzPayment = require('sslcommerz-lts');

module.exports = async (req, res) => {
    // Only allow POST requests
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { appointmentId, amount, patientName, patientEmail, patientPhone } = req.body;

    const sslcz = new SSLCommerzPayment(
        process.env.SSL_STORE_ID,
        process.env.SSL_STORE_PASSWORD,
        process.env.SSL_IS_SANDBOX === 'true'
    );

    const data = {
        total_amount: amount,
        currency: 'BDT',
        tran_id: appointmentId,
        success_url: `https://dr-moon-beryl.vercel.app/payment-success?id=${appointmentId}`,
        fail_url: `https://dr-moon-beryl.vercel.app/payment-fail?id=${appointmentId}`,
        cancel_url: `https://dr-moon-beryl.vercel.app/payment-cancel?id=${appointmentId}`,
        shipping_method: 'No',
        product_name: 'Consultation',
        product_category: 'Healthcare',
        cus_name: patientName,
        cus_email: patientEmail,
        cus_phone: patientPhone,
        cus_add1: 'Dhaka',
        cus_country: 'Bangladesh',
    };

    try {
        const response = await sslcz.init(data);
        if (response?.GatewayPageURL) {
            res.status(200).json({ url: response.GatewayPageURL });
        } else {
            res.status(400).json({ error: 'Failed to create payment session' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};