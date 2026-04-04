import { getContributorLeaderboard } from "@/app/actions/wallet/coin";
import LeaderboardPanel from "@/app/components/leaderboard-panel";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Leaderboard | Vault",
  description: "See the top contributors and uploaders in the Vault community.",
};

export default async function LeaderboardPage() {
  let leaderboardData;

  try {
    leaderboardData = await getContributorLeaderboard(20);
  } catch (error) {
    console.error("Error loading leaderboard:", error);
    return (
      <div className="min-h-screen bg-[#f2f2f2] px-4 pb-16 pt-28 sm:px-6">
        <div className="mx-auto max-w-5xl rounded-[24px] border border-red-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-3xl font-extrabold tracking-tight text-red-700">Error loading leaderboard</h1>
          <p className="mt-2 text-sm text-zinc-600">Please try again later.</p>
        </div>
      </div>
    );
  }

  const topEntry = leaderboardData.leaderboard[0] || null;
  const rankedUsers = leaderboardData.meta?.totalContributors ?? leaderboardData.leaderboard.length;
  const totalUploads = leaderboardData.leaderboard.reduce(
    (sum, entry) => sum + (entry.uploadsCount || 0),
    0
  );
  const topEntryEngagement = topEntry
    ? (topEntry.totalUnlocks || 0) + (topEntry.totalSaves || 0)
    : 0;

  return (
    <div className="min-h-screen bg-[#f2f2f2] px-4 pb-16 pt-0 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 rounded-[28px] border border-[#25671e]/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(240,249,235,0.95))] p-6 shadow-[0_20px_60px_rgba(37,103,30,0.08)] sm:p-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#25671e]/15 bg-white px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#25671e]">
            <span className="h-2 w-2 rounded-full bg-[#48A111] shadow-[0_0_10px_rgba(72,161,17,0.55)]" />
            Vault Rankings
          </div>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-5xl">
            Leaderboard
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-zinc-600 sm:text-base">
            The top contributors are ranked from live database data, using published uploads and real engagement from unlocks and saves.
          </p>
        </div>

        
        <LeaderboardPanel
          entries={leaderboardData.leaderboard}
          meta={leaderboardData.meta}
          currentUserEntry={leaderboardData.currentUserEntry}
          title="Top uploaders and contributors"
          description="Styled like the Vault navbar, powered by live database rankings, and updated from published paper activity."
        />

        <div className="mb-6 grid gap-4 lg:grid-cols-[1.1fr,0.9fr]">
          <div className="rounded-[24px] border border-[#25671e]/10 bg-white p-6 shadow-[0_16px_40px_rgba(17,24,39,0.05)]">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#25671e]/15 bg-[#25671e]/5 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#25671e]">
              How Leaderboard Works
            </div>
            <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-zinc-900">
              Simple, fair, and based on real contribution
            </h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-zinc-500">Step 1</p>
                <p className="mt-2 text-sm font-bold text-zinc-900">Upload published papers</p>
                <p className="mt-1 text-xs leading-5 text-zinc-500">
                  Only published uploads count, so rankings stay based on approved contributions.
                </p>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-zinc-500">Step 2</p>
                <p className="mt-2 text-sm font-bold text-zinc-900">Earn score from impact</p>
                <p className="mt-1 text-xs leading-5 text-zinc-500">
                  Each upload adds score, and real unlocks and saves push useful contributors higher.
                </p>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-zinc-500">Step 3</p>
                <p className="mt-2 text-sm font-bold text-zinc-900">Ranks refresh live</p>
                <p className="mt-1 text-xs leading-5 text-zinc-500">
                  The page reads directly from the database, so new published activity updates the board.
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-[22px] border border-dashed border-amber-300 bg-[linear-gradient(135deg,rgba(255,251,235,0.96),rgba(240,253,244,0.92))] p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-amber-700">
                    Scoring Formula
                  </p>
                  <h3 className="mt-2 text-lg font-extrabold tracking-tight text-zinc-900">
                    10 points per upload, 2 per unlock, 1 per save
                  </h3>
                  <p className="mt-2 max-w-2xl text-sm text-zinc-600">
                    This balances volume with usefulness, so leaderboard spots reward both contribution and community engagement.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-sm font-bold text-[#25671e] shadow-sm">
                  Tie-breakers: higher uploads first, then older top activity
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            <div className="rounded-[24px] border border-[#25671e]/10 bg-white p-5 shadow-[0_16px_40px_rgba(17,24,39,0.05)]">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-zinc-500">Active Contributors</p>
              <p className="mt-2 text-3xl font-extrabold tracking-tight text-zinc-900">{rankedUsers}</p>
              <p className="mt-1 text-sm text-zinc-500">Contributors currently ranked from live DB data.</p>
            </div>
            <div className="rounded-[24px] border border-[#25671e]/10 bg-white p-5 shadow-[0_16px_40px_rgba(17,24,39,0.05)]">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-zinc-500">Uploads Tracked</p>
              <p className="mt-2 text-3xl font-extrabold tracking-tight text-zinc-900">{totalUploads}</p>
              <p className="mt-1 text-sm text-zinc-500">Published uploads represented in the visible rankings.</p>
            </div>
            <div className="rounded-[24px] border border-[#25671e]/10 bg-white p-5 shadow-[0_16px_40px_rgba(17,24,39,0.05)]">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-zinc-500">Current #1</p>
              <p className="mt-2 truncate text-2xl font-extrabold tracking-tight text-zinc-900">
                {topEntry?.name || "Waiting for first contributor"}
              </p>
              <p className="mt-1 text-sm text-zinc-500">
                {topEntry ? `${topEntry.contributorScore} score from ${topEntry.uploadsCount} uploads and ${topEntryEngagement} direct engagement actions.` : "The board will crown its first top contributor soon."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
