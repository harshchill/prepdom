import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/mongodb";
import Paper from "@/lib/models/Paper";
import Unlock from "@/lib/models/Unlock";
import User from "@/lib/models/User";
import {
  APPROVED_PAPER_STATUS,
  DEFAULT_LIBRARY_PAGE_SIZE,
  MAX_LIBRARY_PAGE_SIZE,
  MAX_LIBRARY_SEARCH_LENGTH,
  PAPER_UNLOCK_COST_COINS,
} from "@/lib/library/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function parseOptionalNumber(value) {
  if (typeof value !== "string" || value.trim() === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : null;
}

function parsePage(value) {
  if (typeof value !== "string") {
    return 1;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    return 1;
  }

  return parsed;
}

function parseLimit(value) {
  if (typeof value !== "string") {
    return DEFAULT_LIBRARY_PAGE_SIZE;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    return DEFAULT_LIBRARY_PAGE_SIZE;
  }

  return Math.min(parsed, MAX_LIBRARY_PAGE_SIZE);
}

function normalizeText(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function toSortedStringList(values) {
  return values
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
}

function toSortedNumberList(values) {
  return values
    .map((item) => Number(item))
    .filter((item) => Number.isInteger(item))
    .sort((a, b) => b - a);
}

function escapeRegexInput(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function GET(request) {
  const session = await getAuthSession();

  if (!session?.user?.id) {
    return NextResponse.json(
      { ok: false, error: "Please sign in to access the paper library." },
      { status: 401 }
    );
  }

  const q = normalizeText(request.nextUrl.searchParams.get("q")).slice(
    0,
    MAX_LIBRARY_SEARCH_LENGTH
  );
  const subject = normalizeText(request.nextUrl.searchParams.get("subject"));
  const institute = normalizeText(request.nextUrl.searchParams.get("institute"));
  const specialization = normalizeText(
    request.nextUrl.searchParams.get("specialization")
  );
  const sem = parseOptionalNumber(request.nextUrl.searchParams.get("sem"));
  const year = parseOptionalNumber(request.nextUrl.searchParams.get("year"));

  const page = parsePage(request.nextUrl.searchParams.get("page"));
  const limit = parseLimit(request.nextUrl.searchParams.get("limit"));

  const filters = {
    status: APPROVED_PAPER_STATUS,
  };

  if (subject) {
    filters.subject = subject;
  }

  if (institute) {
    filters.institute = institute;
  }

  if (specialization) {
    filters.specialization = specialization;
  }

  if (sem !== null) {
    filters.sem = sem;
  }

  if (year !== null) {
    filters.year = year;
  }

  if (q) {
    const queryPattern = new RegExp(escapeRegexInput(q), "i");
    filters.$or = [
      { title: queryPattern },
      { subject: queryPattern },
      { institute: queryPattern },
      { specialization: queryPattern },
    ];
  }

  await connectToDatabase();

  const skip = (page - 1) * limit;

  const [paperDocs, total, subjects, institutes, specializations, semesters, years, user] =
    await Promise.all([
      Paper.find(filters)
        .select(
          "title subject institute sem specialization year status unlockCount fileName fileSizeBytes createdAt"
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Paper.countDocuments(filters),
      Paper.distinct("subject", { status: APPROVED_PAPER_STATUS }),
      Paper.distinct("institute", { status: APPROVED_PAPER_STATUS }),
      Paper.distinct("specialization", { status: APPROVED_PAPER_STATUS }),
      Paper.distinct("sem", { status: APPROVED_PAPER_STATUS }),
      Paper.distinct("year", { status: APPROVED_PAPER_STATUS }),
      User.findById(session.user.id).select("coins").lean(),
    ]);

  const paperIds = paperDocs.map((paper) => paper._id);

  let unlockedPaperIdSet = new Set();

  if (paperIds.length > 0) {
    const unlockDocs = await Unlock.find({
      user: session.user.id,
      paper: { $in: paperIds },
    })
      .select("paper")
      .lean();

    unlockedPaperIdSet = new Set(
      unlockDocs.map((unlock) => String(unlock.paper))
    );
  }

  const papers = paperDocs.map((paper) => ({
    id: String(paper._id),
    title: paper.title,
    subject: paper.subject || "",
    institute: paper.institute || "",
    sem: paper.sem ?? null,
    specialization: paper.specialization || "",
    year: paper.year ?? null,
    status: paper.status,
    unlockCount: paper.unlockCount ?? 0,
    fileName: paper.fileName || "",
    fileSizeBytes: paper.fileSizeBytes ?? null,
    createdAt: paper.createdAt,
    isUnlocked: unlockedPaperIdSet.has(String(paper._id)),
  }));

  const totalPages = total > 0 ? Math.ceil(total / limit) : 1;

  return NextResponse.json({
    ok: true,
    data: {
      papers,
      wallet: {
        coins: user?.coins ?? 0,
      },
      pricing: {
        unlockCoins: PAPER_UNLOCK_COST_COINS,
      },
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
      filters: {
        options: {
          subjects: toSortedStringList(subjects),
          institutes: toSortedStringList(institutes),
          specializations: toSortedStringList(specializations),
          semesters: toSortedNumberList(semesters),
          years: toSortedNumberList(years),
        },
        applied: {
          q,
          subject,
          institute,
          specialization,
          sem,
          year,
        },
      },
    },
  });
}
