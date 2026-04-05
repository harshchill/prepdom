import React from "react";

// --- Sub-Components ---

const StatCard = ({ num, label, sub, subColor }) => (
  <div className="group relative bg-white/75 backdrop-blur-md border border-[#c8ddd0] rounded-2xl p-5 transition-all hover:-translate-y-0.5 hover:border-[#149a58] hover:shadow-xl hover:shadow-[#149a58]/10 overflow-hidden">
    <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-emerald-500 to-emerald-300 opacity-0 group-hover:opacity-100 transition-opacity" />
    <div className="font-['Syne'] text-3xl font-extrabold tracking-tighter text-[#1c3328]">
      {num}
    </div>
    <div className="text-[#4a7a5e] text-xs mt-1.5">{label}</div>
    <div className={`mt-2 text-[12px] font-['DM_Mono'] ${subColor}`}>{sub}</div>
  </div>
);

const QueueItem = ({ title, meta = [], uploader, hasIssue, year = "2024" }) => (
  <div className="flex items-center gap-4 p-4 border-b border-[#c8ddd0]/50 last:border-none hover:bg-[#149a58]/5 transition-colors">
    <div
      className={`w-11 h-13 flex flex-col items-center justify-center rounded-lg border shrink-0 ${hasIssue ? "bg-red-50 border-red-200" : "bg-emerald-50 border-[#c8ddd0]"}`}
    >
      <span
        className={`text-[10px] font-bold font-['DM_Mono'] ${hasIssue ? "text-red-600" : "text-[#149a58]"}`}
      >
        PDF
      </span>
      <span className="text-[9px] text-[#8aab97] font-['DM_Mono']">
        {hasIssue ? "?" : year}
      </span>
    </div>
    <div className="flex-1 min-w-0">
      <div className="font-medium text-sm text-[#1c3328] truncate">{title}</div>
      <div className="mt-1 text-xs text-[#8aab97] flex gap-2">
        {meta.map((m, i) => (
          <span key={i}>{m}</span>
        ))}
      </div>
      {hasIssue ? (
        <div className="flex gap-2 mt-1.5">
          <span className="text-[10px] px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-['DM_Mono']">
            ⚠ Year not specified
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-red-50 text-red-600 font-['DM_Mono']">
            Review required
          </span>
        </div>
      ) : (
        <div className="mt-1 text-[11px] text-[#4a7a5e] font-['DM_Mono']">
          Uploaded by: {uploader}
        </div>
      )}
    </div>
    <div className="flex gap-2 shrink-0">
      <button className="px-3.5 py-2 text-xs font-medium rounded-lg border border-[#c8ddd0] text-[#4a7a5e] hover:border-[#149a58] hover:text-[#1c3328] hover:bg-[#149a58]/5 transition-all">
        Preview
      </button>
      <button className="px-3.5 py-2 text-xs font-medium rounded-lg border border-emerald-200 bg-emerald-50 text-[#149a58] hover:bg-emerald-100 transition-all">
        ✓ Approve
      </button>
      <button className="px-3.5 py-2 text-xs font-medium rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-all">
        ✕ Reject
      </button>
    </div>
  </div>
);

// --- Main Layout ---

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-[#f5f0e8] text-[#1c3328] font-['DM_Sans'] selection:bg-[#149a58]/20 relative">
      {/* Background Gradients */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-[15%] w-[70%] h-[60%] rounded-full bg-[#d4edda] blur-[120px] opacity-50" />
        <div className="absolute top-[20%] right-0 w-[60%] h-[50%] rounded-full bg-[#e8f5e9] blur-[100px] opacity-50" />
        <div className="absolute bottom-0 left-[20%] w-[50%] h-[40%] rounded-full bg-[#cfe8d4] blur-[100px] opacity-40" />
      </div>
      <main className="max-w-[1200px] mx-auto p-7">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            num="12,430"
            label="Total users"
            sub="↑ +340 this week"
            subColor="text-emerald-700"
          />
          <StatCard
            num="3,891"
            label="Papers live"
            sub="8 pending approval"
            subColor="text-amber-600"
          />
          <StatCard
            num="847"
            label="Premium users"
            sub="₹66,913/mo MRR"
            subColor="text-emerald-600"
          />
          <StatCard
            num="94K"
            label="Coins transacted"
            sub="Last 30 days"
            subColor="text-[#8aab97]"
          />
        </div>

        {/* Queue Section */}
        <div className="flex items-center justify-between mb-3.5">
          <h2 className="font-['Syne'] text-[15px] font-bold tracking-tight">
            Paper approval queue
          </h2>
          <span className="px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-['DM_Mono'] font-medium">
            8 pending
          </span>
        </div>

        <div className="bg-white/75 backdrop-blur-md border border-[#c8ddd0] rounded-2xl overflow-hidden mb-8">
          <QueueItem
            title="Computer Networks — End Sem 2024"
            meta={["VTU · CSE", "Sem 6", "End Semester", "100 marks"]}
            uploader="Aditya Kumar · 2 hrs ago"
          />
          <QueueItem
            title="Compiler Design — Mid Sem 2023"
            meta={["Anna Univ · IT", "Sem 5", "Mid Semester", "50 marks"]}
            uploader="Sneha Iyer · 5 hrs ago"
            year="2023"
          />
          <QueueItem
            title="Mathematics-III — End Sem"
            uploader="Anonymous · 1 day ago"
            hasIssue={true}
          />
        </div>

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Reports Panel */}
          <div className="bg-white/75 backdrop-blur-md border border-[#c8ddd0] rounded-2xl overflow-hidden">
            <div className="border-b border-[#c8ddd0]/50 flex items-center justify-between px-5 py-4">
              <h2 className="font-['Syne'] text-[15px] font-bold">
                Open reports
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-red-50 border border-red-100 text-red-600 text-[11px] font-['DM_Mono'] font-medium">
                3 active
              </span>
            </div>
            <div className="divide-y divide-[#c8ddd0]/30">
              {[
                {
                  title: "GATE CS 2024 — suspected current paper",
                  reason: "Reason: May be from active exam",
                  color: "bg-red-600",
                },
                {
                  title: "DSA Mid Sem 2022 — duplicate",
                  reason: "Reason: Same as paper #3821",
                  color: "bg-amber-500",
                },
                {
                  title: "Chemistry paper — wrong subject tag",
                  reason: "Reason: Listed under CSE department",
                  color: "bg-[#8aab97]",
                },
              ].map((report, i) => (
                <div key={i} className="flex gap-3 px-5 py-4">
                  <div
                    className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${report.color}`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium leading-snug">
                      {report.title}
                    </div>
                    <div className="text-[11px] text-[#8aab97] mt-0.5">
                      {report.reason}
                    </div>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <button className="px-2.5 py-1 text-[11px] font-medium rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
                      Remove
                    </button>
                    <button className="px-2.5 py-1 text-[11px] font-medium rounded-lg border border-[#c8ddd0] text-[#4a7a5e] hover:bg-[#149a58]/5 transition-colors">
                      Dismiss
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Users Panel */}
          <div className="bg-white/75 backdrop-blur-md border border-[#c8ddd0] rounded-2xl overflow-hidden">
            <div className="border-b border-[#c8ddd0]/50 flex items-center justify-between px-5 py-4">
              <h2 className="font-['Syne'] text-[15px] font-bold">
                Recent users
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[#149a58] text-[11px] font-['DM_Mono'] font-medium">
                Live
              </span>
            </div>
            <div className="divide-y divide-[#c8ddd0]/30">
              {[
                {
                  name: "Aditya Kumar",
                  initial: "A",
                  coins: 240,
                  plan: "Free",
                  bg: "bg-blue-100",
                  text: "text-blue-600",
                },
                {
                  name: "Priya Sharma",
                  initial: "P",
                  coins: 80,
                  plan: "Premium",
                  bg: "bg-purple-100",
                  text: "text-purple-600",
                },
                {
                  name: "Raj Patel",
                  initial: "R",
                  coins: 340,
                  plan: "Free",
                  bg: "bg-red-100",
                  text: "text-red-600",
                },
                {
                  name: "Sneha Iyer",
                  initial: "S",
                  coins: 920,
                  plan: "Premium",
                  bg: "bg-emerald-100",
                  text: "text-[#149a58]",
                },
              ].map((user, i) => (
                <div key={i} className="px-5 py-3.5 flex items-center gap-3">
                  <div
                    className={`w-8.5 h-8.5 rounded-full flex items-center justify-center font-['Syne'] font-bold text-sm ${user.bg} ${user.text}`}
                  >
                    {user.initial}
                  </div>
                  <div className="flex-1 font-medium text-[13px]">
                    {user.name}
                  </div>
                  <div className="flex items-center gap-1 text-xs font-['DM_Mono'] text-[#4a7a5e] mr-2">
                    <span className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-amber-500 to-yellow-400" />
                    {user.coins}
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-semibold font-['DM_Mono'] ${user.plan === "Premium" ? "bg-emerald-50 text-[#149a58] border border-emerald-100" : "bg-[#8aab97]/15 text-[#4a7a5e]"}`}
                  >
                    {user.plan}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
