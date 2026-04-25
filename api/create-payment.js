import SSLCommerzPayment from 'sslcommerz-lts';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    // 1. Setup Credentials from Environment Variables
    const store_id = process.env.SSL_STORE_ID;
    const store_passwd = process.env.SSL_STORE_PASSWORD;
    const is_live = process.env.SSL_IS_SANDBOX === 'false'; // true for live, false for sandbox

    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);

    // 2. Prepare Payment Data
    const transId = `TXN_${Date.now()}`;
    const data = {
        total_amount: 100, // You can change this to dynamic amount later
        currency: 'BDT',
        tran_id: transId,
        success_url: `https://dr-moon-beryl.vercel.app/api/payment-success`,
        fail_url: `https://dr-moon-beryl.vercel.app/api/payment-fail`,
        cancel_url: `https://dr-moon-beryl.vercel.app/api/payment-cancel`,
        ipn_url: `https://dr-moon-beryl.vercel.app/api/ipn`,
        shipping_method: 'NO',
        product_name: 'Doctor Appointment',
        product_category: 'Healthcare',
        product_profile: 'general',
        cus_name: req.body.name || 'Customer Name',
        cus_email: 'customer@example.com',
        cus_add1: 'Dhaka',
        cus_city: 'Dhaka',
        cus_state: 'Dhaka',
        cus_postcode: '1000',
        cus_country: 'Bangladesh',
        cus_phone: req.body.phone || '01700000000',
        ship_name: 'Customer Name',
        ship_add1: 'Dhaka',
        ship_city: 'Dhaka',
        ship_state: 'Dhaka',
        ship_postcode: '1000',
        ship_country: 'Bangladesh',
    };

    // 3. Initialize Payment and Redirect
    try {
        const response = await sslcz.init(data);
        
        // This is the CRITICAL fix to ensure your browser moves to the payment page
        if (response?.GatewayPageURL) {
            console.log("SSLCommerz Success! Redirecting to:", response.GatewayPageURL);
            return res.status(200).json({ url: response.GatewayPageURL });
        } else {
            console.error("SSLCommerz Rejected Request:", response);
            return res.status(400).json({ 
                error: 'SSLCommerz rejected the request', 
                details: response.failedreason || 'Unknown reason' 
            });
        }
    } catch (err) {
        console.error("Server Side Error:", err);
        return res.status(500).json({ error: err.message });
    }
}