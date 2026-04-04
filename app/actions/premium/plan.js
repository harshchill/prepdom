"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/lib/models/User";
import { isPaidTier, normalizePlanTier, resolvePlanTierFromUser } from "@/lib/premium/plans";

function redirectToPlan(status, tier) {
  const params = new URLSearchParams({ status });

  if (tier) {
    params.set("tier", tier);
  }

  redirect(`/premium/plan?${params.toString()}`);
}

export async function selectPlanAction(formData) {
  const session = await getAuthSession();

  if (!session?.user?.id) {
    redirect("/user/login?callbackUrl=/premium/plan");
  }

  const requestedTier = normalizePlanTier(formData.get("tier"));

  if (!requestedTier) {
    redirectToPlan("invalid");
  }

  await connectToDatabase();

  const user = await User.findById(session.user.id).select("planTier isPremium");

  if (!user) {
    redirect("/user/login?callbackUrl=/premium/plan");
  }

  const currentTier = resolvePlanTierFromUser(user);
  const shouldBePremium = isPaidTier(requestedTier);

  if (currentTier === requestedTier && Boolean(user.isPremium) === shouldBePremium) {
    redirectToPlan("unchanged", requestedTier);
  }

  user.planTier = requestedTier;
  user.isPremium = shouldBePremium;
  await user.save();

  revalidatePath("/premium/plan");
  revalidatePath("/user/dashboard");
  revalidatePath("/user/profile");
  revalidatePath("/user/wallet");

  redirectToPlan("updated", requestedTier);
}
