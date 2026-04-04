import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/lib/models/User";
import {
  getPlanLabel,
  isPaidTier,
  resolvePlanTierFromUser,
} from "@/lib/premium/plans";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getAuthSession();

  if (!session?.user?.id) {
    return NextResponse.json(
      { ok: false, error: "Please sign in to access navbar data." },
      { status: 401 }
    );
  }

  await connectToDatabase();

  const userDoc = await User.findById(session.user.id)
    .select("name email avatarUrl role coins isPremium planTier")
    .lean();

  if (!userDoc) {
    return NextResponse.json(
      { ok: false, error: "User account was not found." },
      { status: 404 }
    );
  }

  const planTier = resolvePlanTierFromUser(userDoc);
  const isPremium = Boolean(userDoc.isPremium) || isPaidTier(planTier);

  return NextResponse.json({
    ok: true,
    data: {
      id: String(userDoc._id),
      name: userDoc.name || session.user.name || "Prepdom User",
      email: userDoc.email || session.user.email || "",
      image: userDoc.avatarUrl || session.user.image || null,
      role: userDoc.role || "student",
      coins: typeof userDoc.coins === "number" ? userDoc.coins : 0,
      isPremium,
      planTier,
      planLabel: getPlanLabel(planTier),
    },
  });
}