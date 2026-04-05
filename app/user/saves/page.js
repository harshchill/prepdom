import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpRight, BookMarked, BookmarkCheck, Sparkles } from "lucide-react";
import { getAuthSession } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/mongodb";
import Paper from "@/lib/models/Paper";
import Saved from "@/lib/models/Saved";

export const dynamic = "force-dynamic";

function formatDate(value) {
  if (!value) {
    return "Recently saved";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatPaperMeta(paper) {
  const parts = [
    paper.subject,
    paper.institute,
    paper.year ? String(paper.year) : "",
    paper.sem ? `Sem ${paper.sem}` : "",
  ].filter(Boolean);

  if (!parts.length) {
    return "Saved paper";
  }

  return parts.join(" | ");
}

export default async function SavesPage() {
  const session = await getAuthSession();

  if (!session?.user?.id) {
    redirect("/user/login?callbackUrl=/user/saves");
  }

  await connectToDatabase();

  const savedDocs = await Saved.find({ user: session.user.id })
    .sort({ savedAt: -1, createdAt: -1 })
    .populate({
      path: "paper",
      model: Paper,
      select:
        "title subject institute year sem specialization unlockCount saveCount status",
    })
    .lean();

  const saves = savedDocs.map((entry) => {
    const paper = entry.paper && typeof entry.paper === "object" ? entry.paper : null;

    return {
      id: String(entry._id),
      paperId: paper?._id ? String(paper._id) : "",
      title: paper?.title || "Paper unavailable",
      meta: paper ? formatPaperMeta(paper) : "This saved paper is no longer available in the library.",
      specialization: paper?.specialization || "",
      savedAt: formatDate(entry.savedAt || entry.createdAt),
      unlockCount: paper?.unlockCount || 0,
      saveCount: paper?.saveCount || 0,
      isAvailable: Boolean(paper?._id),
    };
  });

  const latestSave = saves[0]?.savedAt || "No saves yet";
  const revisionReadyCount = saves.filter((entry) => entry.isAvailable).length;
  const popularSavedCount = saves.filter((entry) => entry.saveCount >= 5).length;

  return (
    <div className="min-h-screen bg-[linear-gradient(160deg,#f8fafc_0%,#ecfeff_45%,#f0fdf4_100%)] px-5 py-10 sm:px-8">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <section className="overflow-hidden rounded-[30px] border border-[#25671e]/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(239,246,255,0.94))] p-6 shadow-[0_22px_70px_-28px_rgba(15,23,42,0.22)] sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.16em] text-blue-700">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                My Saves
              </div>
              <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">
                Papers you saved for revision
              </h1>
              <p className="mt-3 text-sm text-zinc-600 sm:text-base">
                Keep your important papers together, reopen them fast, and build a cleaner revision shortlist.
              </p>
            </div>

            <div className="rounded-3xl border border-white/80 bg-white/80 px-5 py-4 shadow-sm">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-zinc-500">
                Latest save
              </p>
              <p className="mt-2 text-lg font-extrabold text-zinc-900">{latestSave}</p>
              <p className="mt-1 text-sm text-zinc-500">
                {saves.length ? "Your shortlist is ready whenever revision starts." : "Your saved papers will appear here."}
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          <article className="rounded-3xl border border-blue-100 bg-white p-5 shadow-[0_16px_40px_rgba(17,24,39,0.05)]">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-zinc-500">Saved papers</p>
            <p className="mt-2 text-3xl font-extrabold tracking-tight text-zinc-900">{saves.length}</p>
            <p className="mt-1 text-sm text-zinc-500">Papers you bookmarked for later study sessions.</p>
          </article>

          <article className="rounded-3xl border border-blue-100 bg-white p-5 shadow-[0_16px_40px_rgba(17,24,39,0.05)]">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-zinc-500">Revision ready</p>
            <div className="mt-2 flex items-center gap-2">
              <BookmarkCheck className="h-5 w-5 text-blue-600" />
              <p className="text-3xl font-extrabold tracking-tight text-zinc-900">{revisionReadyCount}</p>
            </div>
            <p className="mt-1 text-sm text-zinc-500">Saved papers that can be opened right now from the library.</p>
          </article>

          <article className="rounded-3xl border border-blue-100 bg-white p-5 shadow-[0_16px_40px_rgba(17,24,39,0.05)]">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-zinc-500">Popular picks</p>
            <p className="mt-2 text-3xl font-extrabold tracking-tight text-zinc-900">{popularSavedCount}</p>
            <p className="mt-1 text-sm text-zinc-500">Saved papers that are also widely bookmarked by other students.</p>
          </article>
        </section>

        {saves.length ? (
          <section className="rounded-[28px] border border-zinc-200/80 bg-white p-4 shadow-[0_22px_70px_-32px_rgba(15,23,42,0.18)] sm:p-5">
            <div className="flex flex-col gap-2 border-b border-zinc-200/80 px-2 pb-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-zinc-500">Saved list</p>
                <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-zinc-900">Your revision shortlist</h2>
              </div>
              <Link
                href="/user/library"
                className="inline-flex items-center gap-2 text-sm font-bold text-blue-700 transition hover:text-blue-800"
              >
                Browse more papers
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-4 grid gap-4">
              {saves.map((entry) => (
                <article
                  key={entry.id}
                  className="rounded-3xl border border-zinc-200 bg-[linear-gradient(135deg,rgba(255,255,255,1),rgba(248,250,252,0.92))] p-5"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.14em] text-blue-700">
                          <BookMarked className="h-3.5 w-3.5" />
                          Saved {entry.savedAt}
                        </span>
                        <span className="rounded-full bg-zinc-100 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-600">
                          {entry.saveCount} total saves
                        </span>
                      </div>

                      <h3 className="mt-3 text-xl font-extrabold tracking-tight text-zinc-900">
                        {entry.title}
                      </h3>
                      <p className="mt-2 text-sm text-zinc-600">{entry.meta}</p>

                      {entry.specialization ? (
                        <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
                          Specialization: {entry.specialization}
                        </p>
                      ) : null}

                      <div className="mt-4 flex flex-wrap gap-3 text-xs font-semibold text-zinc-500">
                        <span className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5">
                          {entry.unlockCount} unlocks
                        </span>
                        <span className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5">
                          Bookmarked for quick access
                        </span>
                      </div>
                    </div>

                    {entry.isAvailable ? (
                      <Link
                        href={`/user/library/${entry.paperId}`}
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-green-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700"
                      >
                        Open paper
                        <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    ) : (
                      <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm font-semibold text-zinc-500">
                        Unavailable
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : (
          <section className="rounded-[28px] border border-dashed border-blue-200 bg-white/90 p-8 text-center shadow-[0_16px_40px_rgba(17,24,39,0.05)]">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
              <Sparkles className="h-7 w-7" />
            </div>
            <h2 className="mt-5 text-2xl font-extrabold tracking-tight text-zinc-900">No saved papers yet</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-zinc-600">
              Save useful papers from the library so your revision stack is ready without searching again later.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/user/library"
                className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700"
              >
                Explore library
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link
                href="/user/dashboard"
                className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-5 py-2.5 text-sm font-bold text-zinc-700 transition hover:border-zinc-300 hover:text-zinc-900"
              >
                Back to dashboard
              </Link>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

