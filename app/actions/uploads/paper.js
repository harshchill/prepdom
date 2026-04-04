"use server";

import { revalidatePath } from "next/cache";
import { getAuthSession } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/mongodb";
import Paper from "@/lib/models/Paper";
import PaperExtraction from "@/lib/models/PaperExtraction";
import User from "@/lib/models/User";
import { parseExamPdfFromUrl } from "@/lib/gemini/parse-pdf";

const MAX_PDF_SIZE_BYTES = 10 * 1024 * 1024;
const MIN_YEAR = 1900;
const MAX_YEAR = 2100;
const MIN_SEM = 1;
const MAX_SEM = 12;

function asTrimmedString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function asNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function isLikelySupabasePublicUrl(url) {
  const baseUrl = asTrimmedString(process.env.NEXT_PUBLIC_SUPABASE_URL);
  if (!baseUrl) {
    return false;
  }

  try {
    const normalizedBase = new URL(baseUrl);
    const normalizedUrl = new URL(url);

    return (
      normalizedBase.hostname === normalizedUrl.hostname &&
      normalizedUrl.pathname.includes("/storage/v1/object/public/")
    );
  } catch {
    return false;
  }
}

function validatePayload(payload) {
  const title = asTrimmedString(payload?.title);
  const subject = asTrimmedString(payload?.subject);
  const institute = asTrimmedString(payload?.institute);
  const specialization = asTrimmedString(payload?.specialization);
  const fileName = asTrimmedString(payload?.fileName);
  const fileUrl = asTrimmedString(payload?.fileUrl);
  const storagePath = asTrimmedString(payload?.storagePath);
  const fileBucket = asTrimmedString(payload?.fileBucket);
  const mimeType = asTrimmedString(payload?.mimeType).toLowerCase();

  const sem = asNumber(payload?.sem);
  const year = asNumber(payload?.year);
  const fileSizeBytes = asNumber(payload?.fileSizeBytes);

  if (!title || !subject || !institute || !specialization) {
    return { error: "Fill all required metadata fields before uploading." };
  }

  if (!Number.isInteger(sem) || sem < MIN_SEM || sem > MAX_SEM) {
    return { error: "Semester must be between 1 and 12." };
  }

  if (!Number.isInteger(year) || year < MIN_YEAR || year > MAX_YEAR) {
    return { error: "Enter a valid exam year." };
  }

  if (!fileName || !fileUrl || !storagePath || !fileBucket) {
    return { error: "Upload metadata is incomplete. Please upload the PDF again." };
  }

  if (mimeType !== "application/pdf") {
    return { error: "Only PDF files are allowed." };
  }

  if (!Number.isInteger(fileSizeBytes) || fileSizeBytes < 1 || fileSizeBytes > MAX_PDF_SIZE_BYTES) {
    return { error: "PDF size exceeds the 10 MB limit." };
  }

  if (!isLikelySupabasePublicUrl(fileUrl)) {
    return { error: "Uploaded file URL is invalid." };
  }

  return {
    value: {
      title,
      subject,
      institute,
      specialization,
      sem,
      year,
      fileName,
      fileUrl,
      storagePath,
      fileBucket,
      mimeType,
      fileSizeBytes,
    },
  };
}

function getStructuredPayload(payload) {
  const structured = payload?.structured;

  if (!structured || typeof structured !== "object") {
    return null;
  }

  if (typeof structured.isExamPaper !== "boolean") {
    return null;
  }

  return structured;
}

export async function submitPaperUploadAction(payload) {
  const session = await getAuthSession();

  if (!session?.user?.id) {
    return { ok: false, error: "Please sign in before uploading a paper." };
  }

  const validated = validatePayload(payload);
  if (validated.error) {
    return { ok: false, error: validated.error };
  }

  await connectToDatabase();

  const uploader = await User.findById(session.user.id).select("_id").lean();
  if (!uploader?._id) {
    return { ok: false, error: "Your account could not be found. Please sign in again." };
  }

  const createdPaper = await Paper.create({
    uploader: uploader._id,
    ...validated.value,
    status: "pending",
    extractionStatus: "not_started",
    hasExtraction: false,
    isExamPaper: false,
    rewardGranted: false,
  });

  await Paper.updateOne(
    { _id: createdPaper._id },
    {
      $set: {
        extractionStatus: "processing",
      },
    }
  );

  let parseResult;
  const preParsedStructured = getStructuredPayload(payload);

  try {
    if (preParsedStructured) {
      parseResult = {
        success: true,
        structured: preParsedStructured,
        model: "gemini-2.5-flash",
      };
    } else {
      parseResult = await parseExamPdfFromUrl(validated.value.fileUrl);
    }
  } catch (error) {
    await Promise.all([
      Paper.updateOne(
        { _id: createdPaper._id },
        {
          $set: {
            status: "rejected",
            extractionStatus: "failed",
            hasExtraction: false,
            isExamPaper: false,
          },
        }
      ),
      PaperExtraction.findOneAndUpdate(
        { paper: createdPaper._id },
        {
          paper: createdPaper._id,
          status: "failed",
          modelName: "gemini-2.5-flash",
          extractedJson: {},
          failureReason: error instanceof Error ? error.message : "Gemini parsing failed.",
          extractedAt: new Date(),
        },
        { upsert: true, new: true }
      ),
    ]);

    revalidatePath("/user/uploads");
    revalidatePath("/user/dashboard");

    return {
      ok: false,
      error: "Paper was rejected because parsing failed. Please retry with a clearer PDF.",
      paperId: createdPaper._id.toString(),
      status: "rejected",
    };
  }

  const structured = parseResult?.structured;
  const isExamPaper = Boolean(structured?.isExamPaper);

  if (!structured) {
    await Promise.all([
      Paper.updateOne(
        { _id: createdPaper._id },
        {
          $set: {
            status: "rejected",
            extractionStatus: "failed",
            hasExtraction: false,
            isExamPaper: false,
          },
        }
      ),
      PaperExtraction.findOneAndUpdate(
        { paper: createdPaper._id },
        {
          paper: createdPaper._id,
          status: "failed",
          modelName: "gemini-2.5-flash",
          extractedJson: {},
          failureReason: "Gemini did not return a valid structured payload.",
          extractedAt: new Date(),
        },
        { upsert: true, new: true }
      ),
    ]);

    revalidatePath("/user/uploads");
    revalidatePath("/user/dashboard");

    return {
      ok: false,
      error: "Gemini did not return a valid structured payload.",
      paperId: createdPaper._id.toString(),
      status: "rejected",
    };
  }

  const nextStatus = isExamPaper ? "published" : "rejected";
  const nextExtractionStatus = isExamPaper ? "completed" : "failed";

  await Promise.all([
    Paper.updateOne(
      { _id: createdPaper._id },
      {
        $set: {
          status: nextStatus,
          extractionStatus: nextExtractionStatus,
          hasExtraction: isExamPaper,
          isExamPaper,
          reviewedAt: new Date(),
        },
      }
    ),
    PaperExtraction.findOneAndUpdate(
      { paper: createdPaper._id },
      {
        paper: createdPaper._id,
        status: nextExtractionStatus,
        modelName: parseResult.model || "gemini-2.5-flash",
        extractedJson: structured,
        failureReason: isExamPaper ? "" : "Document is not an exam paper.",
        extractedAt: new Date(),
      },
      { upsert: true, new: true }
    ),
  ]);

  revalidatePath("/user/uploads");
  revalidatePath("/user/dashboard");
  revalidatePath("/user/library");

  return {
    ok: isExamPaper,
    paperId: createdPaper._id.toString(),
    status: nextStatus,
    isExamPaper,
    structured,
    message: isExamPaper
      ? "Upload processed and published successfully."
      : "Upload was rejected because Gemini marked it as a non-exam document.",
  };
}
