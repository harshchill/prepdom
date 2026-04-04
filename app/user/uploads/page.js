import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2, Clock3, XCircle } from "lucide-react";
import PaperUploadForm from "@/app/components/uploads/paper-upload-form";
import { getAuthSession } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/mongodb";
import Paper from "@/lib/models/Paper";

function formatDate(value) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function statusStyles(status) {
  if (status === "published") {
    return "bg-emerald-100 text-emerald-700 border-emerald-200";
  }

  if (status === "rejected") {
    return "bg-rose-100 text-rose-700 border-rose-200";
  }

  return "bg-amber-100 text-amber-700 border-amber-200";
}

export default async function UploadsPage() {
  const session = await getAuthSession();

  if (!session?.user) {
    redirect("/user/login?callbackUrl=/user/uploads");
  }

  await connectToDatabase();

  const papers = await Paper.find({ uploader: session.user.id })
    .select("title subject institute sem specialization year fileUrl status createdAt")
    .sort({ createdAt: -1 })
    .limit(30)
    .lean();

  const counts = papers.reduce(
    (acc, paper) => {
      if (paper.status === "published") {
        acc.published += 1;
      } else if (paper.status === "rejected") {
        acc.rejected += 1;
      } else {
        acc.pending += 1;
      }

      return acc;
    },
    { pending: 0, published: 0, rejected: 0 }
  );

  return (
    <div className="min-h-screen bg-[linear-gradient(160deg,#f8fafc_0%,#ecfeff_45%,#f0fdf4_100%)] px-5 py-10 sm:px-8">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-[0_22px_80px_-28px_rgba(15,23,42,0.28)] sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">My Uploads</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900">Upload and publish papers</h1>
          <p className="mt-2 text-sm text-zinc-600">
            Upload your PDF directly to Supabase Storage, submit metadata, and track admin approval in one place.
          </p>

          <section className="mt-6 grid gap-4 sm:grid-cols-3">
            <article className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
              <Clock3 className="h-5 w-5 text-zinc-700" />
              <p className="mt-3 text-sm font-semibold text-zinc-900">Pending review</p>
              <p className="text-xs text-zinc-500">{counts.pending} paper(s) waiting for admin.</p>
            </article>

            <article className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
              <CheckCircle2 className="h-5 w-5 text-zinc-700" />
              <p className="mt-3 text-sm font-semibold text-zinc-900">Approved papers</p>
              <p className="text-xs text-zinc-500">{counts.published} paper(s) published in library.</p>
            </article>

            <article className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
              <XCircle className="h-5 w-5 text-zinc-700" />
              <p className="mt-3 text-sm font-semibold text-zinc-900">Rejected papers</p>
              <p className="text-xs text-zinc-500">{counts.rejected} paper(s) not approved.</p>
            </article>
          </section>

          <section className="mt-6 rounded-2xl border border-zinc-200 p-5">
            <h2 className="text-lg font-semibold text-zinc-900">How this flow works</h2>
            <div className="mt-2 grid gap-3 text-sm text-zinc-600 sm:grid-cols-3">
              <p className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2">1. Fill metadata and choose a PDF.</p>
              <p className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2">2. PDF uploads directly to Supabase bucket.</p>
              <p className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2">3. Admin approves/rejects your submission.</p>
            </div>
          </section>
        </header>

        <PaperUploadForm />

        <section className="rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-[0_22px_80px_-28px_rgba(15,23,42,0.28)] sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Submission history</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-zinc-900">Your latest papers</h2>
            </div>
            <span className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-semibold text-zinc-600">
              {papers.length} record(s)
            </span>
          </div>

          {papers.length === 0 ? (
            <p className="mt-4 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-600">
              No uploads yet. Submit your first paper using the form above.
            </p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-2 text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-zinc-500">
                    <th className="px-3 py-2">Paper</th>
                    <th className="px-3 py-2">Details</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Submitted</th>
                    <th className="px-3 py-2">File</th>
                  </tr>
                </thead>
                <tbody>
                  {papers.map((paper) => (
                    <tr key={String(paper._id)} className="rounded-2xl bg-zinc-50">
                      <td className="px-3 py-3 font-medium text-zinc-900">{paper.title}</td>
                      <td className="px-3 py-3 text-zinc-600">
                        {paper.subject} | Sem {paper.sem} | {paper.year}
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${statusStyles(
                            paper.status
                          )}`}
                        >
                          {paper.status}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-zinc-600">{formatDate(paper.createdAt)}</td>
                      <td className="px-3 py-3">
                        <Link
                          href={paper.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-semibold text-[#25671E] underline decoration-[#25671E]/30 underline-offset-4"
                        >
                          View PDF
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <div className="flex flex-wrap gap-4 px-1 text-sm font-semibold text-zinc-700">
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
