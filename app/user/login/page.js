import { redirect } from "next/navigation";
import { BadgeCheck, BookOpenText, Sparkles } from "lucide-react";
import GoogleSignInButton from "@/app/components/auth/google-signin-button";
import { getAuthSession } from "@/lib/auth/session";

const highlights = [
  "Google OAuth only, no password fatigue",
  "Paper extraction sync on first sign-in",
  "Coin-powered unlocks for premium papers",
];

export default async function LoginPage() {
  const session = await getAuthSession();

  if (session?.user) {
    redirect("/user/dashboard");
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_15%_15%,#cffafe_0%,transparent_35%),radial-gradient(circle_at_85%_15%,#dcfce7_0%,transparent_35%),linear-gradient(160deg,#f8fafc_0%,#ecfeff_45%,#f0fdf4_100%)] px-5 py-12 sm:px-8">
      <div className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-cyan-300/45 blur-3xl" />
      <div className="absolute -right-20 bottom-10 h-80 w-80 rounded-full bg-emerald-300/35 blur-3xl" />

      <main className="relative z-10 grid w-full max-w-5xl overflow-hidden rounded-3xl border border-white/70 bg-white/85 shadow-[0_24px_90px_-30px_rgba(17,24,39,0.4)] backdrop-blur-md md:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-8 bg-zinc-950 px-7 py-10 text-zinc-100 sm:px-10">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-200">
              <Sparkles className="h-3.5 w-3.5" />
              Prepdom Authentication
            </p>
            <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">Welcome back, future topper.</h1>
            <p className="mt-4 max-w-md text-sm leading-7 text-zinc-300 sm:text-base">
              Access your uploaded papers, manage coins, and generate Gemini-powered mock exams from your
              personal dashboard.
            </p>
          </div>

          <ul className="space-y-3">
            {highlights.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-zinc-200">
                <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <div className="rounded-2xl border border-white/15 bg-white/5 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-zinc-100">
              <BookOpenText className="h-4 w-4 text-cyan-300" />
              Why sign in?
            </div>
            <p className="mt-2 text-xs leading-6 text-zinc-300">
              Authentication enables personalized paper recommendations, unlock tracking, and secure access to
              your extracted JSON workspace.
            </p>
          </div>
        </section>

        <section className="flex items-center bg-white/80 px-7 py-10 sm:px-10">
          <div className="w-full space-y-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Login</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
                Continue with Google
              </h2>
              <p className="mt-2 text-sm leading-7 text-zinc-600">
                Use the same Google account you want linked to your Prepdom profile.
              </p>
            </div>

            <GoogleSignInButton />

            <p className="text-xs leading-6 text-zinc-500">
              By continuing, you agree to use Prepdom responsibly and keep your account secure.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
