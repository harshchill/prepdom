import { NextResponse } from "next/server";
import { parseExamPdfFromUrl } from "@/lib/gemini/parse-pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function asUrl(value) {
  if (typeof value !== "string") {
    return "";
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  try {
    const parsed = new URL(trimmed);
    if (!parsed.protocol.startsWith("http")) {
      return "";
    }

    return parsed.toString();
  } catch {
    return "";
  }
}

export async function POST(request) {
  let payload;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body." },
      { status: 400 }
    );
  }

  const pdfUrl = asUrl(payload?.pdfUrl);

  if (!pdfUrl) {
    return NextResponse.json(
      { success: false, error: "A valid pdfUrl is required." },
      { status: 400 }
    );
  }

  try {
    const result = await parseExamPdfFromUrl(pdfUrl);
    return NextResponse.json(
      {
        success: true,
        structured: result.structured,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to parse PDF with Gemini.",
      },
      { status: 500 }
    );
  }
}
