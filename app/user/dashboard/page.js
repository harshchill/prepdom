import Link from "next/link";
import { redirect } from "next/navigation";
import { 
  Coins, 
  Crown, 
  Sparkles, 
  UploadCloud, 
  Gift, 
  Search, 
  FileBadge, 
  Brain, 
  Unlock as UnlockIcon,
  Bookmark, 
  ChevronRight 
} from "lucide-react";
import SignOutButton from "@/app/components/auth/sign-out-button";
import { getAuthSession } from "@/lib/auth/session";
import { applyReferralCodeAction } from "@/app/actions/dashboard/referral";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/lib/models/User";
import UnlockModel from "@/lib/models/Unlock";
import Saved from "@/lib/models/Saved";
import Paper from "@/lib/models/Paper";
import {
  canAccessAiTutor,
  canAccessMockPaper,
  getPlanLabel,
  hasAllPapersFreeAccess,
  resolvePlanTierFromUser,
} from "@/lib/premium/plans";

const REFERRAL_STATUS = {
  success: {
    tone: "success",
    message: "Referral applied. You and your friend both received 50 coins.",
  },
  empty: {
    tone: "error",
    message: "Enter a valid referral code before submitting.",
  },
  invalid: {
    tone: "error",
    message: "That referral code was not found.",
  },
  self: {
    tone: "error",
    message: "You cannot apply your own referral code.",
  },
  "already-used": {
    tone: "error",
    message: "You have already used a referral code on this account.",
  },
};

export default async function DashboardPage({ searchParams }) {
  const session = await getAuthSession();

  if (!session?.user) {
    redirect("/user/login");
  }

  const userId = session.user.id;
  const resolvedSearchParams = await searchParams;
  const referralStatus =
    typeof resolvedSearchParams?.ref === "string" ? resolvedSearchParams.ref : null;
  const referralFeedback = referralStatus ? REFERRAL_STATUS[referralStatus] : null;

  await connectToDatabase();

  const [userDoc, unlockedPapers, savedPapers, libraryPapers] = await Promise.all([
    User.findById(userId).select("name coins isPremium planTier referredBy referralCode").lean(),
    UnlockModel.countDocuments({ user: userId }),
    Saved.countDocuments({ user: userId }),
    Paper.countDocuments({ status: "published" }),
  ]);

  const currentUser = userDoc || {
    name: session.user.name,
    coins: session.user.coins,
    isPremium: session.user.isPremium,
    planTier: session.user.planTier,
    referredBy: null,
    referralCode: session.user.referralCode,
  };

  const planTier = resolvePlanTierFromUser(currentUser);
  const canUseAiTutor = canAccessAiTutor(planTier);
  const canUseMockGenerator = canAccessMockPaper(planTier);
  const hasAllPaperAccess = hasAllPapersFreeAccess(planTier);
  const planLabel = getPlanLabel(planTier);
  const firstName = currentUser.name?.split(" ")[0] || "Student";
  const coinBalance = typeof currentUser.coins === "number" ? currentUser.coins : 0;
  const hasUsedReferral = Boolean(currentUser.referredBy);

  const stats = {
    unlockedPapers,
    savedPapers,
    libraryPapers,
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(160deg,#f8fafc_0%,#ecfeff_45%,#f0fdf4_100%)] px-5 py-10 sm:px-8">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        {/* Header Ribbon */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-3xl border border-zinc-200/80 bg-white/60 backdrop-blur-xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#25671E]/70">Dashboard</p>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-zinc-900">
              Welcome back, {firstName}! ✨
            </h1>
            <p className="mt-1.5 text-sm font-medium text-zinc-600">Ready to crush your next exam?</p>
          </div>
          <SignOutButton />
        </header>

        {referralFeedback && (
          <section
            className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${
              referralFeedback.tone === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-rose-200 bg-rose-50 text-rose-800"
            }`}
          >
            {referralFeedback.message}
          </section>
        )}

        {/* Stats Strip */}
        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {/* Coins */}
          <article className="group relative overflow-hidden rounded-2xl border border-zinc-200/60 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-[#F2B50B]/40 hover:-translate-y-0.5">
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-[#F2B50B]/10 blur-2xl transition-all group-hover:bg-[#F2B50B]/20" />
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F2B50B]/10 text-[#F2B50B]">
                <Coins className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Coins</p>
                <p className="text-2xl font-black text-zinc-900">{coinBalance}</p>
              </div>
            </div>
          </article>

          {/* Unlocked */}
          <article className="group relative overflow-hidden rounded-2xl border border-zinc-200/60 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-[#25671E]/30 hover:-translate-y-0.5">
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-[#25671E]/5 blur-2xl transition-all group-hover:bg-[#25671E]/10" />
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#25671E]/10 text-[#25671E]">
                <UnlockIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Unlocked</p>
                <p className="text-2xl font-black text-zinc-900">{stats.unlockedPapers}</p>
              </div>
            </div>
          </article>

          {/* Saved */}
          <article className="group relative overflow-hidden rounded-2xl border border-zinc-200/60 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-blue-500/30 hover:-translate-y-0.5">
             <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-blue-500/5 blur-2xl transition-all group-hover:bg-blue-500/10" />
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
                <Bookmark className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Saved</p>
                <p className="text-2xl font-black text-zinc-900">{stats.savedPapers}</p>
              </div>
            </div>
          </article>

          {/* Membership */}
          <article className="group relative overflow-hidden rounded-2xl border border-zinc-200/60 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-purple-500/30 hover:-translate-y-0.5">
             <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-purple-500/5 blur-2xl transition-all group-hover:bg-purple-500/10" />
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600">
                <Crown className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Plan</p>
                <p className="text-2xl font-black text-zinc-900 capitalize">{planLabel}</p>
                {hasAllPaperAccess && (
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-purple-600">
                    All papers free
                  </p>
                )}
              </div>
            </div>
          </article>
        </section>

        {/* Bento Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-5">
           
           {/* Upload Paper */}
           <div className="group relative overflow-hidden rounded-3xl border border-zinc-200/80 bg-white p-6 sm:p-8 shadow-sm transition-all hover:shadow-lg lg:col-span-4 md:col-span-2 flex flex-col justify-between min-h-[220px]">
              <div className="absolute bottom-0 right-0 h-full w-1/2 bg-gradient-to-r from-transparent to-[#25671E]/5 transition-all group-hover:to-[#25671E]/10" />
              <div className="relative z-10 flex flex-col items-start">
                 <div className="inline-flex items-center gap-2 rounded-full border border-[#25671E]/20 bg-[#25671E]/10 px-3 py-1 mb-4 border-opacity-30">
                    <span className="text-[10px] sm:text-xs font-bold tracking-wider text-[#25671E]">EARN REWARDS</span>
                 </div>
                 <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 group-hover:text-[#25671E] transition-colors">Contribute & Earn</h2>
                 <p className="mt-2 text-zinc-600 max-w-sm">Upload past examination papers to our library. When your upload is approved, you&apos;ll receive <strong className="text-[#F2B50B]">20 Coins</strong> instantly!</p>
                 
                  <Link href="/user/uploads" className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#25671E] px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-[#1e5618] hover:shadow-lg active:scale-95">
                    <UploadCloud className="h-5 w-5" />
                    Upload Paper
                  </Link>
              </div>
              <UploadCloud className="absolute -bottom-6 -right-6 h-48 w-48 text-[#25671E]/5 transition-all group-hover:scale-110 group-hover:text-[#25671E]/10" />
           </div>

           {/* Refer Card */}
           <div className="group relative overflow-hidden rounded-3xl border border-[#F2B50B]/30 bg-gradient-to-br from-[#FFFAEC] to-white p-6 sm:p-8 shadow-sm transition-all hover:shadow-lg lg:col-span-2 md:col-span-1 flex flex-col justify-between">
              <div className="relative z-10 w-full h-full flex flex-col">
                 <div className="mb-4 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F2B50B]/20 text-[#D49E09]">
                    <Gift className="h-6 w-6" />
                 </div>
                 <h2 className="text-xl font-bold text-zinc-900">Refer a Friend</h2>
                 <p className="mt-1.5 text-sm text-zinc-600 flex-grow">Both of you get <strong className="text-[#D49E09]">50 Coins</strong>! Share the wealth.</p>
                 <div className="mt-3 rounded-xl border border-[#F2B50B]/30 bg-white/80 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-[#8A6404]">
                   Your referral code: <span className="font-black tracking-[0.14em]">{currentUser.referralCode || "PENDING"}</span>
                 </div>
                 
                 {/* Logic for referring */}
                 {!hasUsedReferral && (
                   <form action={applyReferralCodeAction} className="mt-5 w-full">
                     <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Got a code?</label>
                     <div className="flex mt-1.5 gap-2">
                        <input
                          name="referralCode"
                          type="text"
                          required
                          placeholder="Enter code"
                          className="w-full min-w-0 rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm font-medium uppercase outline-none transition-all focus:border-[#F2B50B] focus:ring-2 focus:ring-[#F2B50B]/20"
                        />
                        <button type="submit" className="shrink-0 rounded-xl bg-[#F2B50B] px-4 py-2 text-sm font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#D49E09] active:scale-95">
                          Submit
                        </button>
                     </div>
                   </form>
                 )}
                 {hasUsedReferral && (
                   <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-3 text-center text-sm font-semibold text-green-700">
                     You&apos;ve used a referral code!
                   </div>
                 )}
              </div>
           </div>

           {/* Browse Library */}
           <div className="group relative overflow-hidden rounded-3xl border border-zinc-200/80 bg-white p-6 sm:p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl lg:col-span-2 md:col-span-1 cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="flex items-center gap-4">
                 <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 group-hover:rotate-6 transition-transform">
                    <Search className="h-6 w-6" />
                 </div>
                 <div>
                   <h3 className="text-lg font-bold text-zinc-900">Explore Library</h3>
                 <p className="text-sm font-medium text-zinc-500">{stats.libraryPapers.toLocaleString()} papers available</p>
                 </div>
              </div>
              <p className="mt-4 text-sm text-zinc-600">Dive into our massive archive of past papers and unlock the knowledge you need.</p>
                <Link href="/user/library" className="mt-6 inline-flex items-center text-sm font-bold text-blue-600 group-hover:text-blue-700">
                 Browse now <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
           </div>

           {/* Mock Paper Generator - Premium */}
           <div className="group relative overflow-hidden rounded-3xl border border-zinc-200/80 bg-zinc-900 p-6 sm:p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl lg:col-span-2 md:col-span-1 flex flex-col justify-between">
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-purple-500/20 blur-3xl transition-all group-hover:bg-purple-500/30" />
              <div className="relative z-10">
                 <div className="flex items-center justify-between mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/20 text-purple-400">
                       <FileBadge className="h-6 w-6" />
                    </div>
                    <div className="flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 px-2.5 py-1">
                       <Crown className="h-3 w-3 text-purple-400" />
                       <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">Premium</span>
                    </div>
                 </div>
                 <h3 className="text-lg font-bold text-white">Mock Generator</h3>
                  <p className="mt-2 text-sm text-zinc-400">
                   Generate highly accurate mock exams. {canUseMockGenerator
                    ? "Your plan includes access."
                    : "Upgrade your plan to unlock this feature."}
                  </p>
              </div>
                {canUseMockGenerator ? (
                 <Link href="/premium/mock-paper" className="relative z-10 mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-white/20 active:scale-95">
                   <Sparkles className="h-4 w-4 text-purple-300" />
                   Generate Now
                 </Link>
                ) : (
                 <Link href="/premium/plan" className="relative z-10 mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#F2B50B] px-4 py-2.5 text-sm font-semibold text-zinc-900 transition-all hover:bg-[#f7c842] active:scale-95">
                   <Crown className="h-4 w-4" />
                   Get Premium
                 </Link>
                )}
           </div>

           {/* AI Tutor */}
           <div className="group relative overflow-hidden rounded-3xl border border-teal-200/50 bg-gradient-to-br from-teal-50 to-emerald-50/30 p-6 sm:p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl lg:col-span-2 md:col-span-1 cursor-pointer">
              <div className="relative z-10 h-full flex flex-col">
                 <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-600 mb-4 shadow-[0_0_15px_rgba(20,184,166,0.2)]">
                    <Brain className="h-6 w-6" />
                 </div>
                 <h3 className="text-lg font-bold text-zinc-900">AI Tutor</h3>
                  <p className="mt-2 text-sm text-zinc-600 flex-1">
                   Stuck on a tricky concept? Let our AI Tutor break it down and prep you for the exam.
                  </p>
                  {canUseAiTutor ? (
                   <Link href="/premium/ai-tutor" className="mt-6 inline-flex items-center text-sm font-bold text-teal-700 group-hover:text-teal-800">
                     Start Learning <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                   </Link>
                  ) : (
                   <Link href="/premium/plan" className="mt-6 inline-flex items-center text-sm font-bold text-[#25671E] group-hover:text-[#1e5618]">
                     Get Premium <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                   </Link>
                  )}
              </div>
           </div>
        </section>

        <footer className="mt-4 flex justify-center pb-8">
          <Link href="/" className="text-sm font-semibold text-zinc-500 transition-colors hover:text-[#25671E] underline decoration-zinc-300 underline-offset-4">
            Back to Home
          </Link>
        </footer>
      </main>
    </div>
  );
}
