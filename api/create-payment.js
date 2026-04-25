const SSLCommerzPayment = require('sslcommerz-lts');

module.exports = async (req, res) => {
    // 1. Hand-holding check: Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // 2. Destructure data from the frontend
    const { appointmentId, amount, patientName, patientEmail, patientPhone } = req.body;

    // 3. Initialize SSLCommerz with your Vercel Environment Variables
    // Make sure SSL_STORE_ID and SSL_STORE_PASSWORD match your Vercel settings exactly!
    const sslcz = new SSLCommerzPayment(
        process.env.SSL_STORE_ID,
        process.env.SSL_STORE_PASSWORD,
        process.env.SSL_IS_SANDBOX === 'true'
    );

    // 4. Set up the payment data
    // Using VITE_APP_URL ensures it works on both local and live sites.
    const baseUrl = process.env.VITE_APP_URL || 'https://dr-moon-beryl.vercel.app';

    const data = {
        total_amount: amount,
        currency: 'BDT',
        tran_id: appointmentId, // This must be a unique ID for every attempt
        success_url: `${baseUrl}/payment-success?id=${appointmentId}`,
        fail_url: `${baseUrl}/payment-fail?id=${appointmentId}`,
        cancel_url: `${baseUrl}/payment-cancel?id=${appointmentId}`,
        shipping_method: 'No',
        product_name: 'Doctor Consultation',
        product_category: 'Healthcare',
        product_profile: 'general',
        cus_name: patientName || 'Customer Name',
        cus_email: patientEmail || 'test@test.com',
        cus_add1: 'Dhaka',
        cus_city: 'Dhaka',
        cus_state: 'Dhaka',
        cus_postcode: '1000',
        cus_country: 'Bangladesh',
        cus_phone: patientPhone || '01700000000',
        ship_name: 'No Shipping',
        ship_add1: 'No Shipping',
        ship_city: 'No Shipping',
        ship_state: 'No Shipping',
        ship_postcode: '0000',
        ship_country: 'Bangladesh',
    };

    try {
        // 5. Attempt to create the payment session
        const response = await sslcz.init(data);
        
        if (response?.GatewayPageURL) {
            // Success! Send the URL back to the frontend
            return res.status(200).json({ url: response.GatewayPageURL });
        } else {
            // This happens if the Store ID or Password is wrong
            console.error("SSLCommerz Error Response:", response);
            return res.status(400).json({ 
                error: 'SSLCommerz failed to provide a gateway URL. Check your Store ID/Password.',
                details: response 
            });
        }
    } catch (err) {
        // 6. Catch any network or code crashes
        console.error("Server Error:", err);
        return res.status(500).json({ error: err.message });
    }
};