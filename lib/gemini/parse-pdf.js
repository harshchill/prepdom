import crypto from "node:crypto";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import { coerceExamJson, getGeminiExamResponseSchema, isStructuredExamJson } from "@/lib/exam-schema";

const GEMINI_MODEL = "gemini-2.5-flash";

function extractJsonCandidate(value) {
  const text = typeof value === "string" ? value.trim() : "";

  if (!text) {
    return "";
  }

  const codeFenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (codeFenceMatch?.[1]) {
    return codeFenceMatch[1].trim();
  }

  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");

  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return text.slice(firstBrace, lastBrace + 1);
  }

  return text;
}

function parseGeminiJson(value) {
  const candidate = extractJsonCandidate(value);
  if (!candidate) {
    throw new Error("Gemini returned an empty response.");
  }

  try {
    return JSON.parse(candidate);
  } catch {
    throw new Error("Gemini returned invalid JSON.");
  }
}

function createPrompt() {
  return [
    "You are extracting a strict structured JSON representation of a university exam paper PDF.",
    "Only return JSON that matches the provided response schema.",
    "Set isExamPaper to true only if the document is a real exam/test question paper.",
    "If the PDF is not an exam paper, still return schema-compatible JSON with isExamPaper=false.",
    "Do not include markdown, comments, or any additional text.",
  ].join(" ");
}

export async function parseExamPdfFromUrl(pdfUrl) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const response = await fetch(pdfUrl);
  if (!response.ok) {
    throw new Error(`Could not fetch PDF (${response.status}).`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const tmpFileName = `exam-${Date.now()}-${crypto.randomUUID()}.pdf`;
  const tmpPath = path.join(os.tmpdir(), tmpFileName);

  const genAI = new GoogleGenerativeAI(apiKey);
  const fileManager = new GoogleAIFileManager(apiKey);

  let uploadedFileName = "";

  try {
    await fs.writeFile(tmpPath, buffer);

    const uploadResult = await fileManager.uploadFile(tmpPath, {
      mimeType: "application/pdf",
      displayName: tmpFileName,
    });

    uploadedFileName = uploadResult.file?.name || "";

    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
    const geminiResult = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              fileData: {
                fileUri: uploadResult.file?.uri,
                mimeType: "application/pdf",
              },
            },
            {
              text: createPrompt(),
            },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: getGeminiExamResponseSchema(),
      },
    });

    const raw = parseGeminiJson(geminiResult.response.text());
    const structured = coerceExamJson(raw);

    if (!isStructuredExamJson(structured)) {
      throw new Error("Gemini JSON did not match expected exam structure.");
    }

    return {
      success: true,
      structured,
      model: GEMINI_MODEL,
    };
  } finally {
    await fs.rm(tmpPath, { force: true }).catch(() => {});

    if (uploadedFileName) {
      await fileManager.deleteFile(uploadedFileName).catch(() => {});
    }
  }
}
