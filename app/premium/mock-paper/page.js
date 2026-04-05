import Link from "next/link";
import { redirect } from "next/navigation";
import { Sparkles, Wand2 } from "lucide-react";
import { getAuthSession } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/lib/models/User";
import Paper from "@/lib/models/Paper";
import {
  canAccessMockPaper,
  hasAllPapersFreeAccess,
  resolvePlanTierFromUser,
} from "@/lib/premium/plans";
import MockPaperGeneratorClient from "./mock-paper-generator-client";
import { APPROVED_PAPER_STATUS } from "@/lib/library/config";

export const dynamic = "force-dynamic";

function toSortedStringList(values) {
  return Array.from(new Set(values.map((item) => (typeof item === "string" ? item.trim() : "")).filter(Boolean))).sort(
    (a, b) => a.localeCompare(b, undefined, { sensitivity: "base" })
  );
}

function buildNestedSourceOptions(papers) {
  const tree = new Map();

  for (const paper of papers) {
    const institute = paper.institute?.trim();
    const specialization = paper.specialization?.trim();
    const subject = paper.subject?.trim();
    const sem = Number(paper.sem);
    const title = paper.title?.trim();
    const year = Number(paper.year);

    if (!institute || !specialization || !subject || !title) {
      continue;
    }

    if (!Number.isInteger(sem) || !Number.isInteger(year)) {
      continue;
    }

    if (!tree.has(institute)) {
      tree.set(institute, new Map());
    }

    const specializationMap = tree.get(institute);
    if (!specializationMap.has(specialization)) {
      specializationMap.set(specialization, new Map());
    }

    const subjectMap = specializationMap.get(specialization);
    if (!subjectMap.has(subject)) {
      subjectMap.set(subject, new Map());
    }

    const semesterMap = subjectMap.get(subject);
    if (!semesterMap.has(String(sem))) {
      semesterMap.set(String(sem), []);
    }

    semesterMap.get(String(sem)).push({
      id: String(paper._id),
      title,
      year,
      sem,
      subject,
      institute,
      specialization,
    });
  }

  return toSortedStringList(Array.from(tree.keys())).map((institute) => {
    const specializationMap = tree.get(institute);
    const specializations = toSortedStringList(Array.from(specializationMap.keys())).map((specialization) => {
      const subjectMap = specializationMap.get(specialization);
      const subjects = toSortedStringList(Array.from(subjectMap.keys())).map((subject) => {
        const semesterMap = subjectMap.get(subject);
        const semesters = Array.from(semesterMap.keys())
          .map((semValue) => ({
            value: semValue,
            sourcePapers: [...semesterMap.get(semValue)].sort((a, b) => {
              if (b.year !== a.year) {
                return b.year - a.year;
              }

              return a.title.localeCompare(b.title, undefined, { sensitivity: "base" });
            }),
          }))
          .sort((a, b) => Number(a.value) - Number(b.value));

        return {
          value: subject,
          semesters,
        };
      });

      return {
        value: specialization,
        subjects,
      };
    });

    return {
      value: institute,
      specializations,
    };
  });
}

export default async function MockPaperPage() {
  const session = await getAuthSession();

  if (!session?.user?.id) {
    redirect("/user/login?callbackUrl=/premium/mock-paper");
  }

  await connectToDatabase();
<<<<<<< HEAD
  const user = await User.findById(session.user.id)
    .select("isPremium planTier")
=======
  const user = await User.findById(session.user.id).select("isPremium planTier").lean();
  const eligibleSourcePapers = await Paper.find({
    status: APPROVED_PAPER_STATUS,
    hasExtraction: true,
    extractionStatus: "completed",
  })
    .select("title subject institute specialization sem year")
    .sort({ institute: 1, specialization: 1, subject: 1, sem: 1, year: -1, title: 1 })
>>>>>>> cc37e721584359a4c1c441c084a84aece8be7d3f
    .lean();
  const planTier = resolvePlanTierFromUser(user || session.user);

  if (!canAccessMockPaper(planTier)) {
    redirect("/premium/plan");
  }

  const sourceOptions = buildNestedSourceOptions(eligibleSourcePapers);

  return (
<<<<<<< HEAD
    <div className="min-h-screen bg-[linear-gradient(160deg,#f8fafc_0%,#ecfeff_45%,#f0fdf4_100%)] px-5 py-10 sm:px-8">
      <main className="mx-auto w-full max-w-4xl rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-[0_22px_80px_-28px_rgba(15,23,42,0.28)] sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
          Premium Mock Papers
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900">
          Mock paper generator
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          You are now on the premium mock-paper route. The generator workflow
          can be connected here next.
        </p>

        <form className="mt-6 space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="university"
              className="block text-sm font-semibold text-zinc-700"
            >
              University / College Name
            </label>
            <input
              type="text"
              id="university"
              name="university"
              placeholder="e.g., University of Delhi"
              className="w-full rounded-lg border border-zinc-300 px-4 py-2 text-sm placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              required
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="program"
              className="block text-sm font-semibold text-zinc-700"
            >
              Program
            </label>
            <select
              id="program"
              name="program"
              className="w-full rounded-lg border border-zinc-300 px-4 py-2 text-sm text-zinc-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              required
            >
              <option value="">Select a program</option>
              <option value="b-tech">B.Tech (Bachelor of Technology)</option>
              <option value="b-sc">B.Sc (Bachelor of Science)</option>
              <option value="b-a">B.A (Bachelor of Arts)</option>
              <option value="b-com">B.Com (Bachelor of Commerce)</option>
              <option value="b-ca">
                B.CA (Bachelor of Computer Applications)
              </option>
              <option value="m-tech">M.Tech (Master of Technology)</option>
              <option value="m-sc">M.Sc (Master of Science)</option>
              <option value="mba">
                MBA (Master of Business Administration)
              </option>
              <option value="diploma">Diploma</option>
            </select>
          </div>
          <div className="space-y-2">
            <label
              htmlFor="specialization"
              className="block text-sm font-semibold text-zinc-700"
            >
              Specialization
            </label>
            <select
              id="specialization"
              name="specialization"
              className="w-full rounded-lg border border-zinc-300 px-4 py-2 text-sm text-zinc-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              required
            >
              <option value="">Select a specialization</option>
              <option value="cse">Computer Science & Engineering</option>
              <option value="ai-ml">
                AI/ML (Artificial Intelligence & Machine Learning)
              </option>
              <option value="data-science">Data Science</option>
              <option value="iot">IoT (Internet of Things)</option>
              <option value="cybersecurity">Cybersecurity</option>
              <option value="web-dev">Web Development</option>
              <option value="cloud-computing">Cloud Computing</option>
              <option value="devops">DevOps</option>
              <option value="mechanical">Mechanical Engineering</option>
              <option value="civil">Civil Engineering</option>
              <option value="electrical">Electrical Engineering</option>
              <option value="electronics">Electronics & Communication</option>
              <option value="chemical">Chemical Engineering</option>
              <option value="physics">Physics</option>
              <option value="chemistry">Chemistry</option>
              <option value="mathematics">Mathematics</option>
              <option value="biology">Biology</option>
              <option value="commerce">Commerce</option>
              <option value="economics">Economics</option>
            </select>
          </div>
          <div className="space-y-2">
            <label
              htmlFor="subject"
              className="block text-sm font-semibold text-zinc-700"
            >
              Subject Name
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              placeholder="e.g., Physics, Mathematics, Chemistry"
              className="w-full rounded-lg border border-zinc-300 px-4 py-2 text-sm placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              required
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="syllabus"
              className="block text-sm font-semibold text-zinc-700"
            >
              Syllabus (PDF File)
            </label>
            <input
              type="file"
              id="syllabus"
              name="syllabus"
              accept=".pdf"
              className="block w-full text-sm text-zinc-500 file:mr-4 file:rounded-lg file:border-0 file:bg-[#006045] file:cursor-pointer file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white file:hover:bg-[#0d542b] "
              required
            />
            <p className="text-xs text-zinc-500">Max file size: 10MB</p>
          </div>

          <button
            type="submit"
            className="mt-4 flex items-center justify-center gap-2 rounded-lg cursor-pointer bg-[#006045] px-6 py-2 font-semibold text-white transition-colors hover:bg-[#0d542b] focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <Sparkles size={18} />
            Generate Mock Paper
          </button>
        </form>

        {hasAllPapersFreeAccess(planTier) && (
          <section className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
            Premium Plus detected: all papers are free to access for your
            account.
          </section>
        )}

        <div className="mt-6 flex flex-wrap gap-4 text-sm font-semibold text-zinc-700">
          <Link
            href="/premium/plan"
            className="underline decoration-zinc-300 underline-offset-4"
          >
            Manage Plan
          </Link>
          <Link
            href="/user/dashboard"
            className="underline decoration-zinc-300 underline-offset-4"
          >
            Go to Dashboard
          </Link>
        </div>
=======
    <div className="min-h-screen bg-[radial-gradient(circle_at_12%_18%,rgba(22,163,74,0.14),transparent_36%),radial-gradient(circle_at_84%_14%,rgba(14,165,233,0.14),transparent_30%),linear-gradient(155deg,#f5f7eb_0%,#edfdf7_40%,#eef7ff_100%)] px-5 py-10 sm:px-8">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <section className="overflow-hidden rounded-4xl border border-zinc-200/80 bg-white/85 p-6 shadow-[0_24px_90px_-34px_rgba(15,23,42,0.35)] backdrop-blur-sm sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-3xl">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-700/75">
                Premium Mock Papers
              </p>
              <h1 className="mt-3 text-3xl font-black tracking-tight text-zinc-900 sm:text-4xl">
                Generate a fresh exam from last year&apos;s pattern
              </h1>
              <p className="mt-3 text-sm font-medium leading-6 text-zinc-600 sm:text-base">
                Fill the academic profile, let Gemini study the approved previous-year paper, and get a
                polished mock paper with section flow, marks logic, and revision-friendly insights.
              </p>
            </div>

            <div className="rounded-[1.75rem] border border-emerald-200 bg-emerald-50/90 px-5 py-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Generation flow</p>
              <div className="mt-2 flex items-center gap-3 text-sm font-semibold text-emerald-900">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 text-white">
                  <Sparkles className="h-5 w-5" />
                </span>
                Source paper match -&gt; Gemini -&gt; interactive exam UI
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[1.45fr_0.95fr]">
            <div className="order-2 rounded-[1.75rem] border border-zinc-200 bg-zinc-50/90 p-5 lg:order-2">
              <div className="grid gap-3 sm:grid-cols-3">
                <article className="rounded-2xl border border-white/80 bg-white p-4 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">1</p>
                  <p className="mt-2 text-sm font-semibold text-zinc-900">Match previous year</p>
                  <p className="mt-1 text-xs leading-5 text-zinc-500">
                    We automatically locate the best approved paper from the previous year.
                  </p>
                </article>
                <article className="rounded-2xl border border-white/80 bg-white p-4 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">2</p>
                  <p className="mt-2 text-sm font-semibold text-zinc-900">Generate fresh questions</p>
                  <p className="mt-1 text-xs leading-5 text-zinc-500">
                    Gemini keeps the structure and mark balance while creating new content.
                  </p>
                </article>
                <article className="rounded-2xl border border-white/80 bg-white p-4 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">3</p>
                  <p className="mt-2 text-sm font-semibold text-zinc-900">Study interactively</p>
                  <p className="mt-1 text-xs leading-5 text-zinc-500">
                    Review sections, coverage notes, and question metadata in one result page.
                  </p>
                </article>
              </div>
            </div>

            <aside className="order-1 rounded-[1.75rem] border border-zinc-200 bg-zinc-950 p-5 text-white shadow-[0_18px_60px_-30px_rgba(15,23,42,0.65)] lg:order-1">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-200">
                <Wand2 className="h-3.5 w-3.5" />
                Pattern-aware generation
              </div>
              <p className="mt-4 text-lg font-bold">Best for full-length practice before exams.</p>
              <p className="mt-2 text-sm leading-6 text-zinc-300">
                Use the same metadata profile as your real paper, then iterate with regenerate and print
                actions once you land on a version you like.
              </p>

              {hasAllPapersFreeAccess(planTier) ? (
                <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-200">
                  Premium Plus detected: your account already has the highest premium access tier.
                </div>
              ) : null}

              <div className="mt-5 flex flex-wrap gap-4 text-sm font-semibold text-zinc-200">
                <Link href="/premium/plan" className="underline decoration-white/20 underline-offset-4">
                  Manage Plan
                </Link>
                <Link href="/user/dashboard" className="underline decoration-white/20 underline-offset-4">
                  Back to Dashboard
                </Link>
              </div>
            </aside>
          </div>
        </section>

        <MockPaperGeneratorClient sourceOptions={sourceOptions} />
>>>>>>> cc37e721584359a4c1c441c084a84aece8be7d3f
      </main>
    </div>
  );
}
