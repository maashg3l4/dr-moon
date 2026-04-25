import SSLCommerzPayment from 'sslcommerz-lts';

export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    // 1. Setup Credentials from your Vercel Environment Variables
    const store_id = process.env.SSL_STORE_ID;
    const store_passwd = process.env.SSL_STORE_PASSWORD;
    const is_live = process.env.SSL_IS_SANDBOX === 'false'; 

    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);

    // 2. Prepare the Payment Object
    const transId = `TXN_${Date.now()}`;
    const data = {
        total_amount: 100, // Amount in BDT
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
        cus_name: req.body.name || 'Customer',
        cus_email: 'customer@example.com',
        cus_add1: 'Dhaka',
        cus_city: 'Dhaka',
        cus_state: 'Dhaka',
        cus_postcode: '1000',
        cus_country: 'Bangladesh',
        cus_phone: req.body.phone || '01700000000',
        ship_name: 'Customer',
        ship_add1: 'Dhaka',
        ship_city: 'Dhaka',
        ship_state: 'Dhaka',
        ship_postcode: '1000',
        ship_country: 'Bangladesh',
    };

    // 3. The Handshake Logic
    try {
        const response = await sslcz.init(data);
        
        // This is the specific part that fixes the redirect
        if (response?.GatewayPageURL) {
            console.log("SSLCommerz Success! URL generated:", response.GatewayPageURL);
            return res.status(200).json({ url: response.GatewayPageURL });
        } else {
            console.error("SSLCommerz failed to provide URL:", response);
            return res.status(400).json({ 
                error: 'SSLCommerz rejected the request', 
                details: response.failedreason || 'Unknown error' 
            });
        }
    } catch (err) {
        console.error("Critical Server Error:", err);
        return res.status(500).json({ error: err.message });
    }
}