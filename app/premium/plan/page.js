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

export default async function PremiumPlanPage({ searchParams }) {
  const session = await getAuthSession();

  if (!session?.user?.id) {
    redirect("/user/login?callbackUrl=/premium/plan");
  }

  const resolvedSearchParams = await searchParams;
  const status =
    typeof resolvedSearchParams?.status === "string" ? resolvedSearchParams.status : null;
  const statusMessage = status ? STATUS_MESSAGES[status] : null;

  await connectToDatabase();
  const user = await User.findById(session.user.id).select("isPremium planTier").lean();
  const activeTier = resolvePlanTierFromUser(user || session.user);
  const activeLabel = getPlanLabel(activeTier);

  return (
    <div className="min-h-screen bg-[linear-gradient(160deg,#f8fafc_0%,#ecfeff_45%,#f0fdf4_100%)] px-5 py-10 sm:px-8">
      <main className="mx-auto w-full max-w-6xl space-y-8">
        <header className="rounded-3xl border border-zinc-200/80 bg-white/80 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] backdrop-blur-xl sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#25671E]/70">Premium Plans</p>
              <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-zinc-900">Choose your Prepdom plan</h1>
              <p className="mt-2 text-sm font-medium text-zinc-600">
                Current plan: <span className="font-bold text-zinc-900">{activeLabel}</span>
                {hasAllPapersFreeAccess(activeTier) ? " (all papers free enabled)" : ""}
              </p>
            </div>
            <Link
              href="/user/dashboard"
              className="inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white px-5 py-2 text-sm font-semibold text-zinc-700 transition hover:border-[#25671E]/30 hover:text-[#25671E]"
            >
              Back to Dashboard
            </Link>
          </div>
        </header>

        {statusMessage && (
          <section
            className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${
              statusMessage.tone === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : statusMessage.tone === "error"
                  ? "border-rose-200 bg-rose-50 text-rose-800"
                  : "border-zinc-200 bg-zinc-50 text-zinc-700"
            }`}
          >
            {statusMessage.text}
          </section>
        )}

        <section className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {PLAN_DEFINITIONS.map((plan) => {
            const isActive = plan.id === activeTier;
            const isRecommended = plan.id === PLAN_TIERS.PREMIUM;
            const isTop = plan.id === PLAN_TIERS.PREMIUM_PLUS;

            return (
              <article
                key={plan.id}
                className={`relative flex flex-col rounded-3xl border p-6 shadow-sm transition-all sm:p-7 ${
                  isActive
                    ? "border-[#25671E]/40 bg-white shadow-[0_18px_45px_-25px_rgba(37,103,30,0.5)]"
                    : "border-zinc-200/80 bg-white/80"
                }`}
              >
                {isRecommended && (
                  <div className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full border border-[#25671E]/20 bg-[#25671E]/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#25671E]">
                    <Star className="h-3 w-3" />
                    Popular
                  </div>
                )}

                {isTop && (
                  <div className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full border border-purple-500/30 bg-purple-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-purple-700">
                    <Crown className="h-3 w-3" />
                    Plus
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#25671E]/10 text-[#25671E]">
                    {plan.id === PLAN_TIERS.FREE ? <Check className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">{plan.cadenceLabel}</p>
                    <h2 className="text-xl font-bold text-zinc-900">{plan.name}</h2>
                  </div>
                </div>

                <div className="mt-5">
                  <p className="text-4xl font-black text-zinc-900">₹{plan.priceInr}</p>
                  <p className="text-sm text-zinc-500">{plan.priceInr === 0 ? "No payment required" : "Per month"}</p>
                </div>

                <p className="mt-4 text-sm font-medium text-zinc-600">{plan.description}</p>

                <ul className="mt-5 space-y-2.5 text-sm text-zinc-700">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#25671E]" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <form action={selectPlanAction} className="mt-7">
                  <input type="hidden" name="tier" value={plan.id} />
                  <button
                    type="submit"
                    disabled={isActive}
                    className={`inline-flex w-full items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                      isActive
                        ? "cursor-not-allowed border border-zinc-200 bg-zinc-100 text-zinc-500"
                        : plan.id === PLAN_TIERS.FREE
                          ? "border border-zinc-300 bg-white text-zinc-700 hover:border-[#25671E]/30 hover:text-[#25671E]"
                          : "bg-[#25671E] text-white hover:bg-[#1e5618]"
                    }`}
                  >
                    {isActive ? "Current Plan" : `Choose ${plan.name}`}
                  </button>
                </form>
              </article>
            );
          })}
        </section>
      </main>
    </div>
  );
}
