// src/pages/PaymentConfirmation.jsx
import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase'; // your firebase config
import { doc, updateDoc } from 'firebase/firestore';

const PaymentConfirmation = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const status = searchParams.get('status');
    const appointmentId = searchParams.get('appointmentId');

    useEffect(() => {
        if (status === 'success' && appointmentId) {
            const updatePayment = async () => {
                const appRef = doc(db, "appointments", appointmentId);
                await updateDoc(appRef, {
                    paymentStatus: "paid",
                    paymentMethod: "sslcommerz",
                    updatedAt: new Date()
                });
            };
            updatePayment();
        }
    }, [status, appointmentId]);

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            {status === 'success' ? (
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-green-600">Payment Successful!</h2>
                    <p>Your appointment is confirmed.</p>
                    <button onClick={() => navigate('/dashboard')} className="mt-4 btn-primary">Go to Dashboard</button>
                </div>
            ) : (
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-red-600">Payment Failed</h2>
                    <button onClick={() => navigate('/appointment')} className="mt-4 btn-secondary">Try Again</button>
                </div>
            )}
        </div>
    );
};