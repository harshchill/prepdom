import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2, Clock3, FileText, ShieldAlert, XCircle } from "lucide-react";
import { approvePaperAction, rejectPaperAction } from "@/app/actions/admin/papers";
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

function statusPill(status) {
  if (status === "published") {
    return "bg-emerald-100 text-emerald-700 border-emerald-200";
  }

  if (status === "rejected") {
    return "bg-rose-100 text-rose-700 border-rose-200";
  }

  return "bg-amber-100 text-amber-700 border-amber-200";
}

export default async function AdminPapersPage() {
  const session = await getAuthSession();

  if (!session?.user) {
    redirect("/user/login?callbackUrl=/admin/papers");
  }

  if (session.user.role !== "admin") {
    redirect("/user/dashboard");
  }

  await connectToDatabase();

  const [pendingPapers, reviewedPapers] = await Promise.all([
    Paper.find({ status: "pending" })
      .populate("uploader", "name email")
      .sort({ createdAt: 1 })
      .limit(60)
      .lean(),
    Paper.find({ status: { $in: ["published", "rejected"] } })
      .populate("uploader", "name email")
      .sort({ reviewedAt: -1, createdAt: -1 })
      .limit(40)
      .lean(),
  ]);

  return (
    <div className="min-h-screen bg-[linear-gradient(160deg,#f8fafc_0%,#ecfeff_45%,#f0fdf4_100%)] px-5 py-10 sm:px-8">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-[0_14px_55px_-26px_rgba(15,23,42,0.25)] sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Admin</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900">Paper review desk</h1>
          <p className="mt-2 text-sm text-zinc-600">
            Moderate uploads, publish valid papers, and keep the library quality high.
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <article className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
              <Clock3 className="h-5 w-5 text-zinc-700" />
              <p className="mt-3 text-sm font-semibold text-zinc-900">Pending queue</p>
              <p className="text-xs text-zinc-500">{pendingPapers.length} papers waiting for review</p>
            </article>

            <article className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
              <CheckCircle2 className="h-5 w-5 text-zinc-700" />
              <p className="mt-3 text-sm font-semibold text-zinc-900">Published recently</p>
              <p className="text-xs text-zinc-500">
                {reviewedPapers.filter((paper) => paper.status === "published").length} in recent history
              </p>
            </article>

            <article className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
              <ShieldAlert className="h-5 w-5 text-zinc-700" />
              <p className="mt-3 text-sm font-semibold text-zinc-900">Review policy</p>
              <p className="text-xs text-zinc-500">Approve valid papers. Reject low-quality submissions.</p>
            </article>
          </div>
        </header>

        <section className="rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-[0_14px_55px_-26px_rgba(15,23,42,0.25)] sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-zinc-900">Pending submissions</h2>
            <span className="rounded-full border border-amber-200 bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700">
              {pendingPapers.length} pending
            </span>
          </div>

          {pendingPapers.length === 0 ? (
            <p className="mt-4 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-600">
              Queue is clear. No papers are waiting for review.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {pendingPapers.map((paper) => (
                <article
                  key={String(paper._id)}
                  className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4"
                >
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="text-base font-semibold text-zinc-900">{paper.title}</p>
                      <p className="mt-1 text-xs text-zinc-500">
                        {paper.subject} | Sem {paper.sem} | {paper.specialization} | {paper.year}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">
                        Uploaded by {paper.uploader?.name || "Unknown user"} ({paper.uploader?.email || "No email"})
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">Submitted on {formatDate(paper.createdAt)}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={paper.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full border border-zinc-300 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 no-underline transition-all hover:border-zinc-400"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        View PDF
                      </Link>

                      <form action={approvePaperAction}>
                        <input type="hidden" name="paperId" value={String(paper._id)} />
                        <button
                          type="submit"
                          className="inline-flex items-center gap-1.5 rounded-full bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white transition-all hover:bg-emerald-800"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Approve
                        </button>
                      </form>

                      <form action={rejectPaperAction}>
                        <input type="hidden" name="paperId" value={String(paper._id)} />
                        <button
                          type="submit"
                          className="inline-flex items-center gap-1.5 rounded-full bg-rose-700 px-3 py-1.5 text-xs font-semibold text-white transition-all hover:bg-rose-800"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          Reject
                        </button>
                      </form>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-[0_14px_55px_-26px_rgba(15,23,42,0.25)] sm:p-8">
          <h2 className="text-xl font-semibold text-zinc-900">Recently reviewed</h2>
          {reviewedPapers.length === 0 ? (
            <p className="mt-4 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-600">
              No reviewed papers yet.
            </p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-2 text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-zinc-500">
                    <th className="px-3 py-2">Paper</th>
                    <th className="px-3 py-2">Uploader</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Reviewed</th>
                  </tr>
                </thead>
                <tbody>
                  {reviewedPapers.map((paper) => (
                    <tr key={String(paper._id)} className="rounded-2xl bg-zinc-50">
                      <td className="px-3 py-3 font-medium text-zinc-900">{paper.title}</td>
                      <td className="px-3 py-3 text-zinc-600">{paper.uploader?.name || "Unknown"}</td>
                      <td className="px-3 py-3">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${statusPill(
                            paper.status
                          )}`}
                        >
                          {paper.status}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-zinc-600">{formatDate(paper.reviewedAt || paper.updatedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
