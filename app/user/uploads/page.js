import Link from "next/link";
import { redirect } from "next/navigation";
import { Clock3, FileUp, ListChecks } from "lucide-react";
import { getAuthSession } from "@/lib/auth/session";

export default async function UploadsPage() {
  const session = await getAuthSession();

  if (!session?.user) {
    redirect("/user/login?callbackUrl=/user/uploads");
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(160deg,#f8fafc_0%,#ecfeff_45%,#f0fdf4_100%)] px-5 py-10 sm:px-8">
      <main className="mx-auto w-full max-w-4xl rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-[0_22px_80px_-28px_rgba(15,23,42,0.28)] sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">My Uploads</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900">Uploaded papers</h1>
        <p className="mt-2 text-sm text-zinc-600">Track files you upload for extraction, publishing, and unlocks.</p>

        <section className="mt-6 grid gap-4 sm:grid-cols-3">
          <article className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
            <FileUp className="h-5 w-5 text-zinc-700" />
            <p className="mt-3 text-sm font-semibold text-zinc-900">Upload queue</p>
            <p className="text-xs text-zinc-500">New papers waiting for processing.</p>
          </article>

          <article className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
            <Clock3 className="h-5 w-5 text-zinc-700" />
            <p className="mt-3 text-sm font-semibold text-zinc-900">Extraction status</p>
            <p className="text-xs text-zinc-500">Processing and completion states.</p>
          </article>

          <article className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
            <ListChecks className="h-5 w-5 text-zinc-700" />
            <p className="mt-3 text-sm font-semibold text-zinc-900">Publishing checklist</p>
            <p className="text-xs text-zinc-500">Review metadata before publish.</p>
          </article>
        </section>

        <section className="mt-6 rounded-2xl border border-zinc-200 p-5">
          <h2 className="text-lg font-semibold text-zinc-900">Coming next</h2>
          <p className="mt-2 text-sm text-zinc-600">
            This page is now active in navigation. The uploads table and filters will be added when upload APIs are wired.
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
