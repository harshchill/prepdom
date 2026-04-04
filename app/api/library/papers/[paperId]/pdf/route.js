import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/mongodb";
import Paper from "@/lib/models/Paper";
import Unlock from "@/lib/models/Unlock";
import { APPROVED_PAPER_STATUS } from "@/lib/library/config";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FALLBACK_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_BUCKET || "Vault-2.0";
const STORAGE_PUBLIC_MARKER = "/storage/v1/object/public/";

function isValidObjectId(value) {
  return typeof value === "string" && mongoose.Types.ObjectId.isValid(value);
}

function safeFileName(value) {
  if (typeof value !== "string") {
    return "paper.pdf";
  }

  const cleaned = value.trim().replace(/[\r\n"]/g, "");
  return cleaned || "paper.pdf";
}

function parseStorageFromPublicUrl(url) {
  if (typeof url !== "string" || !url.trim()) {
    return null;
  }

  try {
    const normalized = new URL(url);
    const markerPosition = normalized.pathname.indexOf(STORAGE_PUBLIC_MARKER);

    if (markerPosition < 0) {
      return null;
    }

    const objectPath = normalized.pathname.slice(
      markerPosition + STORAGE_PUBLIC_MARKER.length
    );
    const firstSlashIndex = objectPath.indexOf("/");

    if (firstSlashIndex < 1) {
      return null;
    }

    return {
      bucket: decodeURIComponent(objectPath.slice(0, firstSlashIndex)),
      storagePath: decodeURIComponent(objectPath.slice(firstSlashIndex + 1)),
    };
  } catch {
    return null;
  }
}

function resolveStorageLocation(paper) {
  const directBucket =
    typeof paper?.fileBucket === "string" ? paper.fileBucket.trim() : "";
  const directPath =
    typeof paper?.storagePath === "string" ? paper.storagePath.trim() : "";

  if (directPath) {
    return {
      bucket: directBucket || FALLBACK_BUCKET,
      storagePath: directPath,
    };
  }

  const fromPublicUrl = parseStorageFromPublicUrl(paper?.fileUrl);

  if (fromPublicUrl?.storagePath) {
    return {
      bucket: fromPublicUrl.bucket || directBucket || FALLBACK_BUCKET,
      storagePath: fromPublicUrl.storagePath,
    };
  }

  return {
    bucket: "",
    storagePath: "",
  };
}

export async function GET(_request, { params }) {
  const session = await getAuthSession();

  if (!session?.user?.id) {
    return NextResponse.json(
      { ok: false, error: "Please sign in to read this paper." },
      { status: 401 }
    );
  }

  const resolvedParams = await params;
  const paperId =
    typeof resolvedParams?.paperId === "string"
      ? resolvedParams.paperId.trim()
      : "";

  if (!isValidObjectId(paperId)) {
    return NextResponse.json(
      { ok: false, error: "Invalid paper id." },
      { status: 400 }
    );
  }

  await connectToDatabase();

  const [paper, unlock] = await Promise.all([
    Paper.findOne({ _id: paperId, status: APPROVED_PAPER_STATUS })
      .select("fileName fileUrl fileBucket storagePath mimeType")
      .lean(),
    Unlock.findOne({ user: session.user.id, paper: paperId }).select("_id").lean(),
  ]);

  if (!paper) {
    return NextResponse.json(
      { ok: false, error: "This paper is not available." },
      { status: 404 }
    );
  }

  if (!unlock) {
    return NextResponse.json(
      { ok: false, error: "Unlock this paper before reading." },
      { status: 403 }
    );
  }

  const { bucket, storagePath } = resolveStorageLocation(paper);

  if (!bucket || !storagePath) {
    return NextResponse.json(
      { ok: false, error: "Paper file metadata is incomplete." },
      { status: 500 }
    );
  }

  try {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase.storage.from(bucket).download(storagePath);

    if (error || !data) {
      return NextResponse.json(
        { ok: false, error: "Unable to fetch the paper file." },
        { status: 500 }
      );
    }

    const bytes = await data.arrayBuffer();

    return new Response(bytes, {
      status: 200,
      headers: {
        "Content-Type": paper.mimeType || "application/pdf",
        "Content-Disposition": `inline; filename="${safeFileName(paper.fileName)}"`,
        "Cache-Control": "private, no-store, max-age=0",
        Pragma: "no-cache",
        Expires: "0",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Unable to stream this paper right now." },
      { status: 500 }
    );
  }
}