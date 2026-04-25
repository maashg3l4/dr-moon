export default async function handler(req, res) {
    const { id } = req.query; // Appointment ID passed in the URL
    // Here, you should ideally verify the payment with SSLCommerz API
    // For now, redirect to a frontend success page that updates Firestore
    res.redirect(`/payment-confirmation?status=success&appointmentId=${id}`);
}