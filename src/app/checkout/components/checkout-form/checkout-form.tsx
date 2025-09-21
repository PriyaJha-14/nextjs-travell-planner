"use client";

import { useEffect, useState } from "react";
import {
  PaymentElement,
  LinkAuthenticationElement,
  useStripe,
  useElements
} from "@stripe/react-stripe-js";

export default function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();

  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!stripe) {
      return;
    }

    const clientSecret = new URLSearchParams(window.location.search).get(
      "payment_intent_client_secret"
    );

    if (!clientSecret) {
      setMessage("Payment information missing. Please restart the booking process.");
      return;
    }

    // ✅ Enhanced error handling for payment intent retrieval
    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent, error }) => {
      // ✅ Check for errors first
      if (error) {
        console.error("Error retrieving payment intent:", error);
        setMessage("Error loading payment information. Please try again.");
        return;
      }

      // ✅ Check if paymentIntent exists
      if (!paymentIntent) {
        console.error("Payment intent is null or undefined");
        setMessage("Payment information not found. Please try again.");
        return;
      }

      // ✅ Safe to access status now
      switch (paymentIntent.status) {
        case "succeeded":
          setMessage("Payment succeeded!");
          break;
        case "processing":
          setMessage("Your payment is processing.");
          break;
        case "requires_payment_method":
          setMessage("Your payment was not successful, please try again.");
          break;
        default:
          setMessage("Something went wrong.");
          break;
      }
    }).catch((err) => {
      // ✅ Catch any other errors
      console.error("Payment intent retrieval failed:", err);
      setMessage("Failed to load payment information. Please refresh and try again.");
    });
  }, [stripe]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          // ✅ FIXED: Change from /payment-success to /success
          return_url: `${window.location.origin}/success`,
        },
      });

      if (error && (error.type === "card_error" || error.type === "validation_error")) {
        setMessage(error.message || "An error occurred during payment.");
      } else if (error) {
        setMessage("An unexpected error occurred.");
        console.error("Payment confirmation error:", error);
      }
    } catch (err) {
      console.error("Payment submission error:", err);
      setMessage("Payment submission failed. Please try again.");
    }

    setIsLoading(false);
  };

  // ✅ Fixed payment element options
  const paymentElementOptions = {
    layout: "tabs" as const
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <form id="payment-form" onSubmit={handleSubmit}>
        {/* ✅ Fixed LinkAuthenticationElement */}
        <div className="mb-4">
          <LinkAuthenticationElement
            id="link-authentication-element"
          />
        </div>
        
        <div className="mb-6">
          <PaymentElement 
            id="payment-element" 
            options={paymentElementOptions}
          />
        </div>
        
        <button 
          disabled={isLoading || !stripe || !elements} 
          id="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-colors"
        >
          <span id="button-text">
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </div>
            ) : (
              "Pay now"
            )}
          </span>
        </button>
        
        {/* Show any error or success messages */}
        {message && (
          <div 
            id="payment-message" 
            className={`mt-4 p-3 rounded ${
              message.includes("succeeded") 
                ? "bg-green-100 text-green-800 border border-green-200" 
                : "bg-red-100 text-red-800 border border-red-200"
            }`}
          >
            {message}
          </div>
        )}
      </form>
    </div>
  );
}
