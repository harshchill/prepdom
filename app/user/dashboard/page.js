import Link from "next/link";
import { redirect } from "next/navigation";
import { Coins, Crown, FileText, Sparkles } from "lucide-react";
import SignOutButton from "@/app/components/auth/sign-out-button";
import { getAuthSession } from "@/lib/auth/session";

export default async function DashboardPage() {
  const session = await getAuthSession();

  if (!session?.user) {
    redirect("/user/login");
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(160deg,#f8fafc_0%,#ecfeff_45%,#f0fdf4_100%)] px-5 py-10 sm:px-8">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-[0_22px_80px_-28px_rgba(15,23,42,0.28)] sm:p-10">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Dashboard</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900">Hello, {session.user.name}</h1>
            <p className="mt-2 text-sm text-zinc-600">Your Prepdom account is connected with Google OAuth.</p>
          </div>
          <SignOutButton />
        </header>

        <section className="grid gap-4 sm:grid-cols-3">
          <article className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
            <Coins className="h-5 w-5 text-zinc-700" />
            <p className="mt-3 text-2xl font-bold tracking-tight text-zinc-900">{session.user.coins ?? 0}</p>
            <p className="text-xs uppercase tracking-wide text-zinc-500">Coins</p>
          </article>

          <article className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
            <Crown className="h-5 w-5 text-zinc-700" />
            <p className="mt-3 text-2xl font-bold tracking-tight text-zinc-900">
              {session.user.isPremium ? "Premium" : "Free"}
            </p>
            <p className="text-xs uppercase tracking-wide text-zinc-500">Membership</p>
          </article>

          <article className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
            <Sparkles className="h-5 w-5 text-zinc-700" />
            <p className="mt-3 text-2xl font-bold tracking-tight text-zinc-900">
              {session.user.referralCode || "Pending"}
            </p>
            <p className="text-xs uppercase tracking-wide text-zinc-500">Referral Code</p>
          </article>
        </section>

        <section className="rounded-2xl border border-zinc-200 p-5">
          <h2 className="text-lg font-semibold text-zinc-900">What to build next</h2>
          <ul className="mt-3 space-y-2 text-sm text-zinc-600">
            <li className="flex items-start gap-2">
              <FileText className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />
              Add upload endpoints to create Paper records and store file metadata.
            </li>
            <li className="flex items-start gap-2">
              <FileText className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />
              Trigger Gemini extraction and save structured JSON in PaperExtraction.
            </li>
            <li className="flex items-start gap-2">
              <FileText className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />
              Wire unlock and save actions to update coin transactions and counters.
            </li>
          </ul>
        </section>

        <footer>
          <Link href="/" className="text-sm font-semibold text-zinc-700 underline decoration-zinc-300 underline-offset-4">
            Back to Home
          </Link>
        </footer>
      </main>
    </div>
  );
}
