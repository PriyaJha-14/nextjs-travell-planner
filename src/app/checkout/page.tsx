"use client";

import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { useSearchParams, useRouter } from "next/navigation";
import CheckoutForm from "./components/checkout-form/checkout-form";

// ✅ Load Stripe with proper error handling
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function CheckoutPage() {
  const [clientSecret, setClientSecret] = useState("");
  const [stripeError, setStripeError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (!searchParams) {
      setLoading(false);
      return;
    }

    // ✅ Get client secret from URL params with correct parameter name
    const clientSecretParam = searchParams.get("payment_intent_client_secret");
    
    console.log("Client secret from URL:", clientSecretParam); // Debug log
    
    if (clientSecretParam) {
      setClientSecret(clientSecretParam);
      setStripeError(null);
    } else {
      // ✅ Also check for alternative parameter names (backward compatibility)
      const altClientSecret = searchParams.get("client_secret");
      if (altClientSecret) {
        setClientSecret(altClientSecret);
        setStripeError(null);
      } else {
        setStripeError("Payment information missing. Please restart the booking process.");
      }
    }
    
    setLoading(false);
  }, [searchParams]);

  // ✅ Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing payment...</p>
        </div>
      </div>
    );
  }

  // ✅ Show error state
  if (stripeError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md p-6 bg-white rounded-lg shadow-lg text-center">
          <div className="text-red-600 text-xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Payment Error</h2>
          <p className="text-gray-600 mb-4">{stripeError}</p>
          <button 
            onClick={() => router.push('/flights')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
          >
            Book Another Flight
          </button>
          <button 
            onClick={() => window.history.back()}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // ✅ Show checkout form if client secret exists
  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️</div>
          <p className="text-gray-600">No payment information found.</p>
          <button 
            onClick={() => router.push('/flights')}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Book a Flight
          </button>
        </div>
      </div>
    );
  }

  // ✅ Stripe Elements options
  const appearance = {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#0570de',
      colorBackground: '#ffffff',
      colorText: '#30313d',
      colorDanger: '#df1b41',
      fontFamily: 'system-ui, sans-serif',
    }
  };

  const options = {
    clientSecret,
    appearance,
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Complete Your Flight Booking
        </h1>
        
        <Elements options={options} stripe={stripePromise}>
          <CheckoutForm />
        </Elements>
      </div>
    </div>
  );
}
