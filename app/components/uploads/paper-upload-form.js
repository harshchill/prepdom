"use client";

import { useMemo, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, FileUp, Loader2, Sparkles } from "lucide-react";
import { useSession } from "next-auth/react";
import { submitPaperUploadAction } from "@/app/actions/uploads/paper";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const MAX_FILE_SIZE_LABEL = "10 MB";
const STAGE_LABELS = {
  uploading: "Uploading PDF...",
  parsing: "Gemini is parsing the PDF...",
  analyzing: "Analyzing extracted fields...",
  saving: "Saving extraction and paper status...",
};
const PROCESS_STAGES = ["parsing", "analyzing", "saving"];

function cleanFileName(name) {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9._-]/g, "");
}

function buildStoragePath(userId, fileName) {
  const safeUser = (userId || "unknown-user").replace(/[^a-zA-Z0-9_-]/g, "");
  const safeFile = cleanFileName(fileName || "paper.pdf") || "paper.pdf";
  const uniquePart = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  return `papers/${safeUser}/${uniquePart}-${safeFile}`;
}

function validate(values, file) {
  if (!values.title || !values.subject || !values.institute || !values.specialization) {
    return "Please complete all required metadata fields.";
  }

  const sem = Number(values.sem);
  if (!Number.isInteger(sem) || sem < 1 || sem > 12) {
    return "Semester must be between 1 and 12.";
  }

  const year = Number(values.year);
  if (!Number.isInteger(year) || year < 1900 || year > 2100) {
    return "Year must be between 1900 and 2100.";
  }

  if (!file) {
    return "Choose a PDF file before submitting.";
  }

  if (file.type !== "application/pdf") {
    return "Only PDF files are allowed.";
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return `File size exceeds ${MAX_FILE_SIZE_LABEL}.`;
  }

  return null;
}

const initialFormValues = {
  title: "",
  subject: "",
  institute: "",
  sem: "",
  specialization: "",
  year: String(new Date().getFullYear()),
};

export default function PaperUploadForm() {
  const { data: session } = useSession();
  const bucket = process.env.NEXT_PUBLIC_SUPABASE_BUCKET || "Vault-2.0";

  const [values, setValues] = useState(initialFormValues);
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [processStage, setProcessStage] = useState("uploading");
  const [feedback, setFeedback] = useState(null);

  const fileInputRef = useRef(null);

  const selectedFileLabel = useMemo(() => {
    if (!file) {
      return "No file selected";
    }

    const mb = (file.size / (1024 * 1024)).toFixed(2);
    return `${file.name} (${mb} MB)`;
  }, [file]);

  function updateField(field, nextValue) {
    setValues((prev) => ({
      ...prev,
      [field]: nextValue,
    }));
  }

  function handleFileChange(event) {
    const nextFile = event.target.files?.[0] || null;
    setFile(nextFile);
    setFeedback(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFeedback(null);

    const validationError = validate(values, file);
    if (validationError) {
      setFeedback({ type: "error", message: validationError });
      return;
    }

    const userId = session?.user?.id;
    if (!userId) {
      setFeedback({ type: "error", message: "Please sign in before uploading." });
      return;
    }

    setIsSubmitting(true);
    setProcessStage("uploading");

    const supabase = getSupabaseBrowserClient();
    const storagePath = buildStoragePath(userId, file.name);
    let uploaded = false;

    try {
      const { error: uploadError } = await supabase.storage.from(bucket).upload(storagePath, file, {
        upsert: false,
        contentType: "application/pdf",
        cacheControl: "3600",
      });

      if (uploadError) {
        throw new Error(uploadError.message || "Upload failed");
      }

      uploaded = true;
      setProcessStage("parsing");

      const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(storagePath);
      const publicUrl = publicUrlData?.publicUrl;

      if (!publicUrl) {
        throw new Error("Could not resolve public file URL.");
      }

      const parseResponse = await fetch("/api/parse-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pdfUrl: publicUrl,
        }),
      });

      const parsePayload = await parseResponse.json();

      if (!parseResponse.ok || !parsePayload?.success || !parsePayload?.structured) {
        throw new Error(parsePayload?.error || "Gemini could not parse this PDF.");
      }

      setProcessStage("analyzing");

      let stageIndex = 0;
      const stageTicker = window.setInterval(() => {
        stageIndex = (stageIndex + 1) % PROCESS_STAGES.length;
        setProcessStage(PROCESS_STAGES[stageIndex]);
      }, 2000);

      let result;
      try {
        result = await submitPaperUploadAction({
          ...values,
          sem: Number(values.sem),
          year: Number(values.year),
          fileName: file.name,
          fileUrl: publicUrl,
          storagePath,
          fileBucket: bucket,
          mimeType: file.type,
          fileSizeBytes: file.size,
          structured: parsePayload.structured,
        });
      } finally {
        window.clearInterval(stageTicker);
      }

      if (!result?.ok && result?.status !== "rejected") {
        if (uploaded) {
          await supabase.storage.from(bucket).remove([storagePath]);
        }

        throw new Error(result?.error || "Could not save metadata. Please retry.");
      }

      setProcessStage("saving");
      setValues(initialFormValues);
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setFeedback({
        type: result?.status === "published" ? "success" : "error",
        message:
          result?.message ||
          (result?.status === "published"
            ? "Upload processed and published successfully."
            : "Upload was rejected because it is not an exam paper."),
      });
    } catch (error) {
      if (uploaded) {
        await supabase.storage.from(bucket).remove([storagePath]).catch(() => {});
      }

      setFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "Upload failed. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
      setProcessStage("uploading");
    }
  }

  return (
    <section className="rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-[0_14px_50px_-24px_rgba(15,23,42,0.24)] sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">New submission</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-zinc-900">Upload paper metadata</h2>
          <p className="mt-2 max-w-2xl text-sm text-zinc-600">
            PDF uploads go to Supabase, then Gemini extracts structured exam data before auto publishing or rejecting.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#25671E]/25 bg-[#25671E]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#25671E]">
          <Sparkles className="h-3.5 w-3.5" />
          Direct upload enabled
        </span>
      </div>

      <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1.5">
            <span className="text-sm font-semibold text-zinc-900">Paper title</span>
            <input
              type="text"
              value={values.title}
              onChange={(event) => updateField("title", event.target.value)}
              placeholder="Data Structures - End Semester"
              className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none transition-all focus:border-[#25671E] focus:ring-2 focus:ring-[#25671E]/20"
              required
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-sm font-semibold text-zinc-900">Subject</span>
            <input
              type="text"
              value={values.subject}
              onChange={(event) => updateField("subject", event.target.value)}
              placeholder="Computer Science"
              className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none transition-all focus:border-[#25671E] focus:ring-2 focus:ring-[#25671E]/20"
              required
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-sm font-semibold text-zinc-900">Institute</span>
            <input
              type="text"
              value={values.institute}
              onChange={(event) => updateField("institute", event.target.value)}
              placeholder="Prepdom University"
              className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none transition-all focus:border-[#25671E] focus:ring-2 focus:ring-[#25671E]/20"
              required
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-sm font-semibold text-zinc-900">Specialization</span>
            <input
              type="text"
              value={values.specialization}
              onChange={(event) => updateField("specialization", event.target.value)}
              placeholder="Artificial Intelligence"
              className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none transition-all focus:border-[#25671E] focus:ring-2 focus:ring-[#25671E]/20"
              required
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-sm font-semibold text-zinc-900">Semester</span>
            <input
              type="number"
              min={1}
              max={12}
              value={values.sem}
              onChange={(event) => updateField("sem", event.target.value)}
              placeholder="6"
              className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none transition-all focus:border-[#25671E] focus:ring-2 focus:ring-[#25671E]/20"
              required
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-sm font-semibold text-zinc-900">Year</span>
            <input
              type="number"
              min={1900}
              max={2100}
              value={values.year}
              onChange={(event) => updateField("year", event.target.value)}
              placeholder="2026"
              className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none transition-all focus:border-[#25671E] focus:ring-2 focus:ring-[#25671E]/20"
              required
            />
          </label>
        </div>

        <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50/90 p-4 sm:p-5">
          <p className="text-sm font-semibold text-zinc-900">Paper PDF</p>
          <p className="mt-1 text-xs text-zinc-500">Accepted: PDF only, max {MAX_FILE_SIZE_LABEL}</p>

          <label className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm font-semibold text-zinc-700 transition-all hover:border-[#25671E]/40 hover:text-[#25671E]">
            <FileUp className="h-4 w-4" />
            Choose PDF file
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="hidden"
              required
            />
          </label>

          <p className="mt-2 truncate text-xs font-medium text-zinc-600">{selectedFileLabel}</p>
        </div>

        {feedback ? (
          <div
            className={`flex items-start gap-2 rounded-xl border px-3 py-2 text-sm ${
              feedback.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-rose-200 bg-rose-50 text-rose-700"
            }`}
            role="status"
          >
            {feedback.type === "success" ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            ) : (
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        ) : null}

        {isSubmitting ? (
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-700" role="status">
            <span className="inline-flex items-center gap-2 font-medium">
              <Loader2 className="h-4 w-4 animate-spin" />
              {STAGE_LABELS[processStage]}
            </span>
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25671E] px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-[#1e5618] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileUp className="h-4 w-4" />}
          {isSubmitting ? STAGE_LABELS[processStage] : "Submit paper"}
        </button>
      </form>
    </section>
  );
}
