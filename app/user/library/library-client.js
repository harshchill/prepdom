"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  BookMarked,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Coins,
  Filter,
  Loader2,
  Search,
  ShieldCheck,
  Sparkles,
  Unlock,
  X,
} from "lucide-react";

const DEFAULT_LIMIT = 18;

function toQueryString(filters, page, limit) {
  const query = new URLSearchParams();

  if (filters.q) {
    query.set("q", filters.q);
  }

  if (filters.subject) {
    query.set("subject", filters.subject);
  }

  if (filters.institute) {
    query.set("institute", filters.institute);
  }

  if (filters.specialization) {
    query.set("specialization", filters.specialization);
  }

  if (filters.sem) {
    query.set("sem", filters.sem);
  }

  if (filters.year) {
    query.set("year", filters.year);
  }

  query.set("page", String(page));
  query.set("limit", String(limit));

  return query.toString();
}

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

function initialFilterState() {
  return {
    q: "",
    subject: "",
    institute: "",
    specialization: "",
    sem: "",
    year: "",
  };
}

function ConfirmUnlockModal({
  open,
  onClose,
  onConfirm,
  paper,
  unlockCost,
  userCoins,
  confirming,
  error,
}) {
  if (!open || !paper) {
    return null;
  }

  const insufficientCoins = userCoins < unlockCost;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/45 px-4 py-6">
      <div className="w-full max-w-lg rounded-3xl border border-zinc-200 bg-white p-6 shadow-[0_28px_80px_-25px_rgba(15,23,42,0.55)] sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">
              Confirm unlock
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-zinc-900">
              Unlock this paper?
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 text-zinc-500 transition hover:text-zinc-900"
            aria-label="Close unlock modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
          <p className="text-sm font-semibold text-zinc-900">{paper.title}</p>
          <p className="mt-1 text-xs text-zinc-500">
            {paper.subject || "General"}
            {paper.year ? ` | ${paper.year}` : ""}
            {paper.sem ? ` | Sem ${paper.sem}` : ""}
          </p>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-zinc-200 p-3">
            <p className="text-xs uppercase tracking-wide text-zinc-500">Unlock cost</p>
            <p className="mt-1 text-xl font-black text-zinc-900">{unlockCost} coins</p>
          </div>
          <div className="rounded-2xl border border-zinc-200 p-3">
            <p className="text-xs uppercase tracking-wide text-zinc-500">Your balance</p>
            <p className="mt-1 text-xl font-black text-zinc-900">{userCoins} coins</p>
          </div>
        </div>

        {insufficientCoins ? (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            You do not have enough coins to unlock this paper.
          </div>
        ) : null}

        {error ? (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </div>
        ) : null}

        <div className="mt-5 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:border-zinc-400"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={insufficientCoins || confirming}
            className="inline-flex items-center gap-2 rounded-full bg-[#25671E] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1e5618] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {confirming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Unlock className="h-4 w-4" />}
            {confirming ? "Unlocking..." : `Confirm ${unlockCost}-coin unlock`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LibraryClient() {
  const [filters, setFilters] = useState(initialFilterState);
  const [page, setPage] = useState(1);
  const [limit] = useState(DEFAULT_LIMIT);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [payload, setPayload] = useState(null);

  const [pendingPaper, setPendingPaper] = useState(null);
  const [unlocking, setUnlocking] = useState(false);
  const [unlockError, setUnlockError] = useState("");

  const queryString = useMemo(() => toQueryString(filters, page, limit), [filters, page, limit]);

  useEffect(() => {
    let cancelled = false;

    async function fetchLibrary() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(`/api/library/papers?${queryString}`, {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok || !data?.ok) {
          throw new Error(data?.error || "Unable to load paper library.");
        }

        if (!cancelled) {
          setPayload(data.data);
        }
      } catch (reason) {
        if (!cancelled) {
          const message = reason instanceof Error ? reason.message : "Unable to load paper library.";
          setError(message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchLibrary();

    return () => {
      cancelled = true;
    };
  }, [queryString]);

  const papers = payload?.papers || [];
  const walletCoins = payload?.wallet?.coins ?? 0;
  const unlockCost = payload?.pricing?.unlockCoins ?? 8;
  const options = payload?.filters?.options || {
    subjects: [],
    institutes: [],
    specializations: [],
    semesters: [],
    years: [],
  };
  const pagination = payload?.pagination || {
    page: 1,
    totalPages: 1,
    total: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  };

  function handleFilterChange(key, value) {
    setPage(1);
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  function clearFilters() {
    setPage(1);
    setFilters(initialFilterState());
  }

  function openUnlockModal(paper) {
    setUnlockError("");
    setPendingPaper(paper);
  }

  function closeUnlockModal() {
    if (unlocking) {
      return;
    }

    setPendingPaper(null);
    setUnlockError("");
  }

  async function confirmUnlock() {
    if (!pendingPaper || unlocking) {
      return;
    }

    setUnlocking(true);
    setUnlockError("");

    try {
      const response = await fetch("/api/library/unlock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paperId: pendingPaper.id,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data?.ok) {
        throw new Error(data?.error || "Unlock failed. Please try again.");
      }

      const nextCoins = data?.wallet?.coins;

      setPayload((prev) => {
        if (!prev) {
          return prev;
        }

        return {
          ...prev,
          wallet: {
            ...prev.wallet,
            coins: typeof nextCoins === "number" ? nextCoins : prev.wallet.coins,
          },
          papers: prev.papers.map((paper) => {
            if (paper.id !== pendingPaper.id) {
              return paper;
            }

            if (paper.isUnlocked) {
              return paper;
            }

            return {
              ...paper,
              isUnlocked: true,
              unlockCount: (paper.unlockCount || 0) + 1,
            };
          }),
        };
      });

      setPendingPaper(null);
      setUnlockError("");
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : "Unlock failed. Please try again.";
      setUnlockError(message);
    } finally {
      setUnlocking(false);
    }
  }

  const hasFiltersApplied =
    Boolean(filters.q) ||
    Boolean(filters.subject) ||
    Boolean(filters.institute) ||
    Boolean(filters.specialization) ||
    Boolean(filters.sem) ||
    Boolean(filters.year);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_10%_20%,rgba(22,163,74,0.08),transparent_40%),radial-gradient(circle_at_90%_10%,rgba(59,130,246,0.08),transparent_35%),linear-gradient(160deg,#f8fafc_0%,#eefbf4_45%,#f0f9ff_100%)] px-5 py-10 sm:px-8">
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="overflow-hidden rounded-3xl border border-zinc-200/80 bg-white/85 p-6 shadow-[0_18px_70px_-30px_rgba(15,23,42,0.35)] backdrop-blur-sm sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#25671E]/70">Paper Library</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-zinc-900 sm:text-4xl">
                Approved paper vault
              </h1>
              <p className="mt-2 max-w-2xl text-sm font-medium text-zinc-600">
                Explore approved papers, filter by academic details, and unlock each paper for {unlockCost} coins.
              </p>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Coin wallet</p>
              <div className="mt-1 flex items-center gap-2 text-amber-900">
                <Coins className="h-4 w-4" />
                <span className="text-xl font-black">{walletCoins}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-3 rounded-2xl border border-zinc-200 bg-zinc-50/80 p-4 sm:grid-cols-2 lg:grid-cols-4">
            <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Search
              <div className="mt-1 flex items-center gap-2 rounded-xl border border-zinc-300 bg-white px-3 py-2">
                <Search className="h-4 w-4 text-zinc-400" />
                <input
                  type="text"
                  value={filters.q}
                  onChange={(event) => handleFilterChange("q", event.target.value)}
                  placeholder="Title, subject, institute..."
                  className="w-full bg-transparent text-sm font-medium text-zinc-800 outline-none"
                />
              </div>
            </label>

            <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Subject
              <select
                value={filters.subject}
                onChange={(event) => handleFilterChange("subject", event.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-800 outline-none"
              >
                <option value="">All subjects</option>
                {options.subjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Institute
              <select
                value={filters.institute}
                onChange={(event) => handleFilterChange("institute", event.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-800 outline-none"
              >
                <option value="">All institutes</option>
                {options.institutes.map((institute) => (
                  <option key={institute} value={institute}>
                    {institute}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Specialization
              <select
                value={filters.specialization}
                onChange={(event) => handleFilterChange("specialization", event.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-800 outline-none"
              >
                <option value="">All specializations</option>
                {options.specializations.map((specialization) => (
                  <option key={specialization} value={specialization}>
                    {specialization}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Semester
              <select
                value={filters.sem}
                onChange={(event) => handleFilterChange("sem", event.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-800 outline-none"
              >
                <option value="">All semesters</option>
                {options.semesters.map((sem) => (
                  <option key={String(sem)} value={String(sem)}>
                    Sem {sem}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Year
              <select
                value={filters.year}
                onChange={(event) => handleFilterChange("year", event.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-800 outline-none"
              >
                <option value="">All years</option>
                {options.years.map((year) => (
                  <option key={String(year)} value={String(year)}>
                    {year}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex items-end gap-2">
              <button
                type="button"
                onClick={clearFilters}
                disabled={!hasFiltersApplied}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm font-semibold text-zinc-700 transition hover:border-zinc-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Filter className="h-4 w-4" />
                Clear filters
              </button>
            </div>
          </div>
        </header>

        {loading ? (
          <section className="flex min-h-70 items-center justify-center rounded-3xl border border-zinc-200 bg-white/80 p-6 text-zinc-600 shadow-sm">
            <div className="inline-flex items-center gap-2 text-sm font-semibold">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading approved papers...
            </div>
          </section>
        ) : error ? (
          <section className="rounded-3xl border border-rose-200 bg-rose-50 p-5 text-sm font-medium text-rose-700">
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          </section>
        ) : (
          <>
            <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-white/85 px-4 py-3 text-sm text-zinc-600 shadow-sm">
              <p>
                Showing <span className="font-semibold text-zinc-900">{papers.length}</span> papers out of{" "}
                <span className="font-semibold text-zinc-900">{pagination.total}</span>
              </p>
              <p className="inline-flex items-center gap-1.5 font-medium text-emerald-700">
                <ShieldCheck className="h-4 w-4" />
                Only approved papers are listed
              </p>
            </section>

            {papers.length === 0 ? (
              <section className="rounded-3xl border border-zinc-200 bg-white p-10 text-center shadow-sm">
                <BookMarked className="mx-auto h-9 w-9 text-zinc-300" />
                <h2 className="mt-3 text-xl font-bold text-zinc-900">No papers matched these filters</h2>
                <p className="mt-2 text-sm text-zinc-600">Try clearing filters or searching with broader terms.</p>
              </section>
            ) : (
              <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {papers.map((paper) => (
                  <article
                    key={paper.id}
                    className="group relative overflow-hidden rounded-3xl border border-zinc-200 bg-white p-5 shadow-[0_12px_35px_-28px_rgba(15,23,42,0.6)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_45px_-28px_rgba(15,23,42,0.5)]"
                  >
                    <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-emerald-500 via-lime-500 to-cyan-500" />

                    <div className="flex items-start justify-between gap-3">
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-emerald-700">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Approved
                      </span>
                      <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                        {paper.unlockCount || 0} unlocks
                      </span>
                    </div>

                    <h3 className="mt-4 text-lg font-bold leading-tight text-zinc-900">{paper.title}</h3>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-zinc-600">
                      <p className="rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-1.5">
                        <span className="font-semibold text-zinc-700">Subject:</span> {paper.subject || "General"}
                      </p>
                      <p className="rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-1.5">
                        <span className="font-semibold text-zinc-700">Institute:</span> {paper.institute || "-"}
                      </p>
                      <p className="rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-1.5">
                        <span className="font-semibold text-zinc-700">Sem:</span> {paper.sem ?? "-"}
                      </p>
                      <p className="rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-1.5">
                        <span className="font-semibold text-zinc-700">Year:</span> {paper.year ?? "-"}
                      </p>
                    </div>

                    <p className="mt-3 text-xs font-medium text-zinc-500">Added {formatDate(paper.createdAt)}</p>

                    <div className="mt-4">
                      {paper.isUnlocked ? (
                        <Link
                          href={`/user/library/${paper.id}`}
                          className="inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
                        >
                          <Sparkles className="h-4 w-4" />
                          Read
                        </Link>
                      ) : (
                        <button
                          type="button"
                          onClick={() => openUnlockModal(paper)}
                          className="inline-flex items-center gap-2 rounded-full bg-[#25671E] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1e5618]"
                        >
                          <Unlock className="h-4 w-4" />
                          Unlock for {unlockCost} coins
                        </button>
                      )}
                    </div>
                  </article>
                ))}
              </section>
            )}

            <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-white/85 px-4 py-3 shadow-sm">
              <div className="text-sm font-medium text-zinc-600">
                Page <span className="font-semibold text-zinc-900">{pagination.page}</span> of{" "}
                <span className="font-semibold text-zinc-900">{pagination.totalPages}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={!pagination.hasPreviousPage}
                  className="inline-flex items-center gap-1 rounded-full border border-zinc-300 bg-white px-3 py-1.5 text-sm font-semibold text-zinc-700 transition hover:border-zinc-400 disabled:cursor-not-allowed disabled:opacity-55"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => setPage((prev) => prev + 1)}
                  disabled={!pagination.hasNextPage}
                  className="inline-flex items-center gap-1 rounded-full border border-zinc-300 bg-white px-3 py-1.5 text-sm font-semibold text-zinc-700 transition hover:border-zinc-400 disabled:cursor-not-allowed disabled:opacity-55"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </section>
          </>
        )}

        <footer className="pt-1 text-sm font-semibold text-zinc-600">
          <Link href="/user/dashboard" className="underline decoration-zinc-300 underline-offset-4">
            Back to Dashboard
          </Link>
        </footer>
      </main>

      <ConfirmUnlockModal
        open={Boolean(pendingPaper)}
        onClose={closeUnlockModal}
        onConfirm={confirmUnlock}
        paper={pendingPaper}
        unlockCost={unlockCost}
        userCoins={walletCoins}
        confirming={unlocking}
        error={unlockError}
      />
    </div>
  );
}
