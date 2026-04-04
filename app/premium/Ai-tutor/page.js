import { redirect } from "next/navigation";
import AiTutorClient from "./ai-tutor-client";
import { getAuthSession } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/lib/models/User";
import { canAccessAiTutor, resolvePlanTierFromUser } from "@/lib/premium/plans";

export default async function AiTutorPage() {
  const session = await getAuthSession();

  if (!session?.user?.id) {
    redirect("/user/login?callbackUrl=/premium/ai-tutor");
  }

  await connectToDatabase();
  const user = await User.findById(session.user.id).select("isPremium planTier").lean();
  const planTier = resolvePlanTierFromUser(user || session.user);

  if (!canAccessAiTutor(planTier)) {
    redirect("/premium/plan");
  }

  return <AiTutorClient />;
}
