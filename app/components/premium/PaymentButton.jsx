"use client";

import { useState } from "react";
import Script from "next/script";

export default function PaymentButton({ plan, isActive }) {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    // If the plan is free, we don't need Razorpay
    if (plan.priceInr === 0) {
      // You can call your existing selectPlanAction logic here if needed
      return;
    }

    setLoading(true);

    try {
      // 1. Create Order on the server
      const res = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: plan.priceInr,
          tier: plan.id,
        }),
      });

      const order = await res.json();

      if (!res.ok) throw new Error(order.error || "Failed to create order");

      // 2. Configure Razorpay Options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Prepdom",
        description: `Upgrade to ${plan.name}`,
        order_id: order.id,
        handler: async function (response) {
          // This runs after successful payment
          // You can add a fetch call here to verify the payment on your backend
          alert("Payment Successful! Your plan is being updated.");
          window.location.href = `/premium/plan?status=updated`;
        },
        prefill: {
          name: "Shubh Mishra",
          email: "smishra64310@gmail.com",
        },
        theme: {
          color: "#25671E",
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      // 3. Open the Razorpay Modal
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment Error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Load Razorpay SDK */}
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />

      <button
        onClick={handlePayment}
        disabled={isActive || loading}
        className={`inline-flex w-full items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
          isActive
            ? "cursor-not-allowed border border-zinc-200 bg-zinc-100 text-zinc-500"
            : "bg-[#25671E] text-white hover:bg-[#1e5618] active:scale-95"
        }`}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg
              className="animate-spin h-4 w-4 text-white"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Processing...
          </span>
        ) : isActive ? (
          "Current Plan"
        ) : (
          `Choose ${plan.name}`
        )}
      </button>
    </>
  );
}
