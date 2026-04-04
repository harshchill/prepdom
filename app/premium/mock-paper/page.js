import Link from "next/link";
import { redirect } from "next/navigation";
import { FileBadge, Sparkles } from "lucide-react";
import { getAuthSession } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/lib/models/User";
import {
  canAccessMockPaper,
  hasAllPapersFreeAccess,
  resolvePlanTierFromUser,
} from "@/lib/premium/plans";

export default async function MockPaperPage() {
  const session = await getAuthSession();

  if (!session?.user?.id) {
    redirect("/user/login?callbackUrl=/premium/mock-paper");
  }

  await connectToDatabase();
  const user = await User.findById(session.user.id).select("isPremium planTier").lean();
  const planTier = resolvePlanTierFromUser(user || session.user);

  if (!canAccessMockPaper(planTier)) {
    redirect("/premium/plan");
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(160deg,#f8fafc_0%,#ecfeff_45%,#f0fdf4_100%)] px-5 py-10 sm:px-8">
      <main className="mx-auto w-full max-w-4xl rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-[0_22px_80px_-28px_rgba(15,23,42,0.28)] sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Premium Mock Papers</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900">Mock paper generator</h1>
        <p className="mt-2 text-sm text-zinc-600">
          You are now on the premium mock-paper route. The generator workflow can be connected here next.
        </p>

        <section className="mt-6 grid gap-4 sm:grid-cols-2">
          <article className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
            <FileBadge className="h-5 w-5 text-zinc-700" />
            <p className="mt-3 text-sm font-semibold text-zinc-900">Generate a custom paper</p>
            <p className="text-xs text-zinc-500">Create exam-like question sets from your preferred topics.</p>
          </article>

          <article className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
            <Sparkles className="h-5 w-5 text-zinc-700" />
            <p className="mt-3 text-sm font-semibold text-zinc-900">AI-based patterning</p>
            <p className="text-xs text-zinc-500">Use AI pattern analysis to mimic recent paper weightage and structure.</p>
          </article>
        </section>

        {hasAllPapersFreeAccess(planTier) && (
          <section className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
            Premium Plus detected: all papers are free to access for your account.
          </section>
        )}

        <div className="mt-6 flex flex-wrap gap-4 text-sm font-semibold text-zinc-700">
          <Link href="/premium/plan" className="underline decoration-zinc-300 underline-offset-4">
            Manage Plan
          </Link>
          <Link href="/user/dashboard" className="underline decoration-zinc-300 underline-offset-4">
            Go to Dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}
