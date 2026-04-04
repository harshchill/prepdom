import Link from "next/link";
import { redirect } from "next/navigation";
import { Coins, CreditCard, Sparkles } from "lucide-react";
import { getAuthSession } from "@/lib/auth/session";

export default async function WalletPage() {
  const session = await getAuthSession();

  if (!session?.user) {
    redirect("/user/login?callbackUrl=/user/wallet");
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(160deg,#f8fafc_0%,#ecfeff_45%,#f0fdf4_100%)] px-5 py-10 sm:px-8">
      <main className="mx-auto w-full max-w-5xl rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-[0_22px_80px_-28px_rgba(15,23,42,0.28)] sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">My Wallet</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900">Wallet overview</h1>
        <p className="mt-2 text-sm text-zinc-600">Track your Prepdom coins, membership tier, and wallet activity.</p>

        <section className="mt-6 grid gap-4 sm:grid-cols-3">
          <article className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
            <Coins className="h-5 w-5 text-zinc-700" />
            <p className="mt-3 text-2xl font-bold text-zinc-900">{session.user.coins ?? 0}</p>
            <p className="text-xs uppercase tracking-wide text-zinc-500">Current coins</p>
          </article>

          <article className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
            <CreditCard className="h-5 w-5 text-zinc-700" />
            <p className="mt-3 text-2xl font-bold text-zinc-900">{session.user.isPremium ? "Premium" : "Free"}</p>
            <p className="text-xs uppercase tracking-wide text-zinc-500">Membership</p>
          </article>

          <article className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
            <Sparkles className="h-5 w-5 text-zinc-700" />
            <p className="mt-3 text-2xl font-bold text-zinc-900">{session.user.referralCode || "Pending"}</p>
            <p className="text-xs uppercase tracking-wide text-zinc-500">Referral code</p>
          </article>
        </section>

        <section className="mt-6 rounded-2xl border border-zinc-200 p-5">
          <h2 className="text-lg font-semibold text-zinc-900">Transactions</h2>
          <p className="mt-2 text-sm text-zinc-600">
            Wallet transaction history (credits/debits) will appear here once unlock and rewards flows are connected.
          </p>
        </section>

        <div className="mt-6 flex flex-wrap gap-4 text-sm font-semibold text-zinc-700">
          <Link href="/user/dashboard" className="underline decoration-zinc-300 underline-offset-4">
            Go to Dashboard
          </Link>
          <Link href="/" className="underline decoration-zinc-300 underline-offset-4">
            Back to Home
          </Link>
        </div>
      </main>
    </div>
  );
}
