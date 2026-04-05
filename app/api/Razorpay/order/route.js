import Razorpay from "razorpay";
import { NextResponse } from "next/server";
const instance = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // ✅ Correct
  key_secret: process.env.RAZORPAY_KEY_SECRET, // ✅ Correct
});

export async function POST(req) {
  try {
    const { amount } = await req.json();

    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: "receipt_id_" + Math.random(),
    };

    const order = await instance.orders.create(options);
    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
