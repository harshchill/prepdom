"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/lib/models/User";
import CoinTransaction from "@/lib/models/CoinTransaction";

const REFERRAL_REWARD = 50;

function redirectToDashboard(status) {
  redirect(`/user/dashboard?ref=${encodeURIComponent(status)}`);
}

export async function applyReferralCodeAction(formData) {
  const session = await getAuthSession();

  if (!session?.user?.id) {
    redirect("/user/login?callbackUrl=/user/dashboard");
  }

  const rawCode = formData.get("referralCode");
  const referralCode = typeof rawCode === "string" ? rawCode.trim().toUpperCase() : "";

  if (!referralCode) {
    redirectToDashboard("empty");
  }

  await connectToDatabase();

  const currentUser = await User.findById(session.user.id);

  if (!currentUser) {
    redirect("/user/login?callbackUrl=/user/dashboard");
  }

  if (currentUser.referredBy) {
    redirectToDashboard("already-used");
  }

  if (currentUser.referralCode && currentUser.referralCode === referralCode) {
    redirectToDashboard("self");
  }

  const inviter = await User.findOne({ referralCode });

  if (!inviter) {
    redirectToDashboard("invalid");
  }

  if (inviter._id.toString() === currentUser._id.toString()) {
    redirectToDashboard("self");
  }

  const currentBefore = currentUser.coins ?? 0;
  const inviterBefore = inviter.coins ?? 0;

  currentUser.referredBy = inviter._id;
  currentUser.coins = currentBefore + REFERRAL_REWARD;
  inviter.coins = inviterBefore + REFERRAL_REWARD;

  await Promise.all([currentUser.save(), inviter.save()]);

  await CoinTransaction.create([
    {
      user: currentUser._id,
      type: "credit",
      reason: "bonus",
      amount: REFERRAL_REWARD,
      balanceBefore: currentBefore,
      balanceAfter: currentUser.coins,
    },
    {
      user: inviter._id,
      type: "credit",
      reason: "bonus",
      amount: REFERRAL_REWARD,
      balanceBefore: inviterBefore,
      balanceAfter: inviter.coins,
    },
  ]);

  revalidatePath("/user/dashboard");
  revalidatePath("/user/profile");
  revalidatePath("/user/wallet");

  redirectToDashboard("success");
}
