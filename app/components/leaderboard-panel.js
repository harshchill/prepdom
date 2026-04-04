"use client";

import { motion } from "framer-motion";

function getInitials(name) {
  const [first = "", second = ""] = (name || "").trim().split(/\s+/);
  return `${first.charAt(0)}${second.charAt(0)}`.toUpperCase() || "VC";
}

export default function LeaderboardPanel({
  entries = [],
  meta = {},
  currentUserEntry = null,
  title = "Top uploaders in the Vault",
  description,
  compact = false,
}) {
  const leaderboardCount = meta.totalContributors ?? entries.length;
  const leaderboardFootnote = meta.scoring ?? "Ranked by uploads and engagement";
  const resolvedDescription =
    description ?? `Live DB ranking across ${leaderboardCount} contributors. ${leaderboardFootnote}.`;

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-[22px] border border-[#25671e]/10 bg-[radial-gradient(circle_at_top_right,rgba(163,230,53,0.14),transparent_35%),white] shadow-[0_18px_40px_rgba(37,103,30,0.08)]"
    >
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#25671e]/10 px-5 py-5">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#25671e]/15 bg-white/90 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#25671e]">
            <span className="h-2 w-2 rounded-full bg-[#48A111] shadow-[0_0_10px_rgba(72,161,17,0.55)]" />
            Contributor Leaderboard
          </div>
          <h2 className={`${compact ? "text-2xl" : "text-3xl"} mt-3 font-extrabold tracking-tight text-zinc-900`}>
            {title}
          </h2>
          <p className="mt-1 text-sm text-zinc-500">{resolvedDescription}</p>
        </div>
        <div className="rounded-full border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-extrabold text-amber-800">
          {currentUserEntry ? `Your rank #${currentUserEntry.rank}` : "Upload to get ranked"}
        </div>
      </div>

      <div className="space-y-3 p-3">
        {entries.length > 0 ? (
          entries.map((entry) => (
            <div
              key={entry.userId}
              className={`flex flex-wrap items-center gap-3 rounded-2xl border p-3 transition hover:-translate-y-0.5 hover:shadow-sm ${
                entry.isCurrentUser
                  ? "border-amber-300 bg-[linear-gradient(135deg,rgba(242,181,11,0.10),rgba(163,230,53,0.16))]"
                  : "border-[#25671e]/10 bg-white/90"
              }`}
            >
              <div className="rounded-full bg-[#25671e]/8 px-3 py-2 text-sm font-extrabold text-[#25671e]">
                #{entry.rank}
              </div>
              <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border border-[#25671e]/10 bg-[linear-gradient(135deg,rgba(37,103,30,0.12),rgba(163,230,53,0.34))] font-extrabold text-[#25671e]">
                {entry.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={entry.avatarUrl} alt={`${entry.name} avatar`} className="h-full w-full object-cover" />
                ) : (
                  getInitials(entry.name)
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-sm font-extrabold text-zinc-900">{entry.name}</p>
                  {entry.isCurrentUser ? (
                    <span className="rounded-full bg-[#25671e]/10 px-2 py-1 text-[10px] font-extrabold uppercase tracking-[0.15em] text-[#25671e]">
                      You
                    </span>
                  ) : null}
                </div>
                <p className="truncate text-xs text-zinc-500">{entry.email}</p>
                <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-bold text-[#335a31]">
                  <span className="rounded-full bg-[#25671e]/7 px-2.5 py-1">{entry.uploadsCount} uploads</span>
                  <span className="rounded-full bg-[#25671e]/7 px-2.5 py-1">{entry.totalUnlocks} unlocks</span>
                  <span className="rounded-full bg-[#25671e]/7 px-2.5 py-1">{entry.totalSaves} saves</span>
                </div>
              </div>
              <div className="ml-auto min-w-[82px] text-right">
                <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">Score</p>
                <p className="text-2xl font-extrabold tracking-tight text-zinc-900">{entry.contributorScore}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="px-4 py-8 text-center text-sm text-zinc-500">
            No published uploads yet. The leaderboard will appear once contributors start publishing papers.
          </div>
        )}
      </div>
    </motion.section>
  );
}
