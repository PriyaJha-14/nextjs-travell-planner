"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import axios from "axios";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function PaymentSuccess() {
  const [message, setMessage] = useState("Checking payment status...");
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (!searchParams) return;

    const clientSecret = searchParams.get("payment_intent_client_secret");
    const paymentIntent = searchParams.get("payment_intent");

    console.log("Success page loaded with:", { clientSecret, paymentIntent });

    if (clientSecret) {
      stripePromise.then((stripe) => {
        if (!stripe) {
          setMessage("Failed to verify payment.");
          setLoading(false);
          return;
        }

        stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent, error }) => {
          if (error) {
            console.error("Error retrieving payment intent:", error);
            setMessage("Error verifying payment. Please contact support.");
            setLoading(false);
            return;
          }

          if (!paymentIntent) {
            setMessage("Payment information not found.");
            setLoading(false);
            return;
          }

          console.log("Payment intent retrieved:", paymentIntent);
          setPaymentDetails(paymentIntent);

          switch (paymentIntent.status) {
            case "succeeded":
              setMessage("Payment succeeded!");
              // ✅ Update booking status after successful payment
              updateBookingStatus(paymentIntent.id);
              break;
            case "processing":
              setMessage("Your payment is processing. We'll update you when payment is received.");
              break;
            case "requires_payment_method":
              setMessage("Your payment was not successful, please try again.");
              break;
            default:
              setMessage("Something went wrong.");
              break;
          }
          setLoading(false);
        }).catch((err) => {
          console.error("Payment verification failed:", err);
          setMessage("Failed to verify payment. Please contact support.");
          setLoading(false);
        });
      });
    } else {
      setMessage("No payment information found in URL.");
      setLoading(false);
    }
  }, [searchParams]);

  // ✅ Function to update booking status
  const updateBookingStatus = async (paymentIntentId: string) => {
    try {
      console.log("🔄 Updating booking status for payment:", paymentIntentId);
      await axios.patch('/api/booking', {
        paymentIntent: paymentIntentId
      });
      console.log("✅ Booking status updated successfully");
    } catch (error) {
      console.error("❌ Failed to update booking status:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-md p-8 bg-white rounded-2xl shadow-xl text-center">
        {message.includes("succeeded") ? (
          <>
            {/* ✅ Success State */}
            <div className="text-green-500 text-6xl mb-6">✅</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Payment Successful!</h1>
            <p className="text-gray-600 mb-6">Thank you for your booking. You'll receive a confirmation email shortly.</p>
            
            {paymentDetails && (
              <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
                <h3 className="font-semibold text-gray-700 mb-2">Payment Details:</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><span className="font-medium">Amount:</span> ${(paymentDetails.amount / 1).toFixed(2)}</p>
                  <p><span className="font-medium">Payment ID:</span> {paymentDetails.id}</p>
                  <p><span className="font-medium">Status:</span> <span className="text-green-600 font-medium">Confirmed</span></p>
                </div>
              </div>
            )}
          </>
        ) : message.includes("processing") ? (
          <>
            {/* ⏳ Processing State */}
            <div className="text-yellow-500 text-6xl mb-6">⏳</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Payment Processing</h1>
            <p className="text-gray-600 mb-6">{message}</p>
          </>
        ) : (
          <>
            {/* ❌ Error State */}
            <div className="text-red-500 text-6xl mb-6">❌</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Payment Issue</h1>
            <p className="text-gray-600 mb-6">{message || "Checking payment status..."}</p>
          </>
        )}
        
        {/* Navigation Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => router.push('/flights')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            ✈️ View More Flights
          </button>
          
          <button
            onClick={() => router.push('/hotels')}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            🏨 Book Hotels
          </button>
          
          <button
            onClick={() => router.push('/')}
            className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-6 rounded-lg transition-colors"
          >
            🏠 Go to Homepage
          </button>
        </div>

        {/* Help Section */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Need help? Contact support at pjha63172@gmail.com
          </p>
        </div>
      </div>
    </div>
  );
}
