import Link from "next/link";
import { redirect } from "next/navigation";
import { Check, Crown, Sparkles, Star } from "lucide-react";
import { selectPlanAction } from "@/app/actions/premium/plan";
import { getAuthSession } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/lib/models/User";
import {
  PLAN_DEFINITIONS,
  PLAN_TIERS,
  getPlanLabel,
  hasAllPapersFreeAccess,
  resolvePlanTierFromUser,
} from "@/lib/premium/plans";

export const dynamic = "force-dynamic";

const STATUS_MESSAGES = {
  updated: {
    tone: "success",
    text: "Plan updated successfully.",
  },
  unchanged: {
    tone: "neutral",
    text: "You already have this plan.",
  },
  invalid: {
    tone: "error",
    text: "Invalid plan selection. Please choose again.",
  },
};
"use client";
import React, { useState } from "react";
import Script from "next/script";

const plans = [
  {
    name: "FREE",
    price: { monthly: 0, yearly: 0 },
    description: "Perfect for getting started",
    color: "free",
    features: [
      "Browse previous papers",
      "Get 50 coins",
      "Unlock 5 paper",
      "Top up coins",
    ],
    cta: "Use Vault for Free",
    popular: false,
  },
  {
    name: "PRO",
    price: { monthly: 79, yearly: 799 },
    description: "For power users & professionals",
    color: "pro",
    features: [
      "Everything in the Free and:",
      "AI tutor",
      "Mock Paper generate",
      "1 paper generation in Day",
      "Priority support",
    ],
    cta: "Get Pro Plan",
    popular: true,
  },
  {
    name: "MAX",
    price: { monthly: 179 },
    description: "Built for teams & enterprises",
    color: "max",
    features: [
      "Everything in Pro and:",
      "3 paper generation in day",
      "removes Ads",
      "Extended thinking for complex work",
      "Dedicated support",
      ,
    ],
    cta: "Get Max Plan",
    popular: false,
  },
];

const CheckIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    className="shrink-0"
  >
    <circle cx="8" cy="8" r="8" fill="currentColor" fillOpacity="0.15" />
    <path
      d="M4.5 8L7 10.5L11.5 6"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function SubscriptionPage() {
  const [billing, setBilling] = useState("monthly");
  // 1. Update the function to accept the specific plan object and current billing state
  const handlePayment = async (plan, currentBilling) => {
    // Logic to get the correct price based on billing toggle
    const price =
      currentBilling === "monthly" ? plan.price.monthly : plan.price.yearly;

    // Don't trigger Razorpay for the Free plan
    if (price === 0) {
      alert("You've started with the Free plan!");
      return;
    }

    try {
      const response = await fetch("/api/Razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: price }), // Sends actual plan price
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API Error ${response.status}:`, errorText);
        alert(`Payment failed: ${errorText}`);
        return;
      }

      const order = await response.json();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: "INR",
        name: "shubh",
        description: `${plan.name} Subscription (${currentBilling})`,
        order_id: order.id,
        handler: function (response) {
          // HACKATHON TIP: Trigger a success state or redirect
          alert(`Payment Success! ID: ${response.razorpay_payment_id}`);
          // window.location.href = "/success";
        },
        prefill: {
          name: "Shubh Mishra",
          email: "shubh@example.com",
        },
        theme: { color: "#10b981" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment failed", error);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#f0fdf4] font-['DM_Sans',sans-serif] px-5 py-10 flex flex-col items-center justify-center">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      {/* Header Section */}
      <div className="relative z-10 flex flex-col items-center mb-14 text-center">
        <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-green-600/20 bg-green-600/10 text-green-700 text-[12px] font-semibold tracking-widest uppercase mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          Vault Plans
        </div>

        <h1 className="font-['Playfair_Display',serif] text-4xl md:text-6xl font-black text-green-950 leading-tight mb-3">
          Choose Your
          <span className="bg-gradient-to-br from-green-600 via-green-500 to-green-400 bg-clip-text text-transparent">
            Vault
          </span>
        </h1>
        <p className="text-green-800/70 text-lg font-light tracking-wide max-w-md">
          Plans that grow with you — no hidden fees, cancel anytime.
        </p>
      </div>

      {/* Toggle */}
      <div className="relative z-10 flex items-center gap-1 p-1 bg-white/70 backdrop-blur-md border border-green-300/60 rounded-full shadow-lg shadow-green-500/10 mb-10">
        <button
          onClick={() => setBilling("monthly")}
          className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
            billing === "monthly"
              ? "bg-gradient-to-br from-green-500 to-green-600 text-white shadow-md shadow-green-500/40"
              : "text-green-800 hover:text-green-600"
          }`}
        >
          Monthly
        </button>
      </div>

      {/* Cards Grid */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 w-full h-1/2 max-w-5xl items-stretch">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`group relative flex flex-col p-8 rounded-[50px] transition-all duration-300 hover:-translate-y-2 cursor-pointer overflow-hidden
              ${
                plan.color === "pro"
                  ? "bg-gradient-to-br from-white  to-white border border-green-400 scale-105 shadow-xl shadow-green-500/30"
                  : plan.color === "free"
                    ? "bg-gradient-to-br from-white to-green-50 border border-green-300/50 shadow-lg shadow-green-300/20"
                    : "bg-gradient-to-br from-white to-white border border-green-300/45 shadow-lg shadow-green-300/20"
              }
              hover:shadow-2xl hover:shadow-green-500/30
            `}
          >
            {/* Shimmer Effect */}
            <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_3s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

            {plan.popular && (
              <span className="absolute top-5 right-5 px-3 py-1 bg-gradient-to-br from-green-800 to-green-900 text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-md">
                Most Popular
              </span>
            )}


            <h3
              className={`font-['Playfair_Display',serif] font-bold text-sm tracking-[3px] uppercase mb-1.5
              ${plan.color === "pro" ? "text-green-950" : plan.color === "max" ? "text-green-800" : "text-green-600"}`}
            >
              {plan.name}
            </h3>
            <p className="text-[13px] font-normal opacity-70 text-green-900 mb-6">
              {plan.description}
            </p>

            <div
              className={`flex items-baseline gap-1 mb-1.5 font-['Playfair_Display',serif] ${plan.color === "pro" ? "text-green-950" : "text-green-700"}`}
            >
              {plan.price.monthly === 0 ? (
                <span className="text-5xl font-black">Free</span>
              ) : (
                <>
                  <span className="text-2xl font-semibold opacity-60">₹</span>
                  <span className="text-6xl text-green-800 font-bold leading-none">
                    {billing === "monthly"
                      ? plan.price.monthly
                      : plan.price.yearly}
                  </span>
                  <span className="text-sm font-['DM_Sans'] opacity-50 font-light">
                    {billing === "monthly" ? "mo" : "yr"}
                  </span>
                </>
              )}
            </div>

            <div
              className={`h-px w-full my-6 ${plan.color === "pro" ? "bg-green-800/25" : "bg-green-400/35"}`}
            />

            <ul className="flex-1 space-y-3 mb-8">
              {plan.features.map((feature) => (
                <li
                  key={feature}
                  className={`flex items-center gap-2.5 text-[13.5px] ${plan.color === "pro" ? "text-green-950" : "text-green-800"}`}
                >
                  <CheckIcon />
                  {feature}
                </li>
              ))}
            </ul>

            <button
              onClick={() => handlePayment(plan, billing)}
              className={`w-full py-3.5 cursor-pointer rounded-xl font-['DM_Sans'] text-sm font-semibold tracking-wide transition-all duration-200 relative overflow-hidden active:scale-95
              ${
                plan.color === "pro"
                  ? "bg-gradient-to-br cursor-pointer from-green-900 to-green-800 text-green-50 shadow-lg shadow-green-900/30"
                  : plan.color === "max"
                    ? "bg-gradient-to-br cursor-pointer from-green-400 to-green-500 text-green-950 shadow-lg shadow-green-500/30"
                    : "bg-gradient-to-br from-green-100 to-green-200 border border-green-300 text-green-700"
              }`}
            >
              <div className="absolute inset-0 bg-black opacity-0 hover:opacity-5 transition-opacity" />
              {plan.cta}
            </button>
          </div>
        ))}
      </div>

      <p className="relative z-10 mt-12 text-green-800/50 text-[13px] font-light text-center">
        🔒 256-bit encryption · 30-day money-back guarantee · No credit card for
        free tier
      </p>

      <style jsx global>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(200%);
          }
        }
      `}</style>
    </div>
  );
}
