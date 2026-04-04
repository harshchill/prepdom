"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, Loader2, ShieldCheck } from "lucide-react";

const MIN_READER_WIDTH = 280;
const MIN_RENDER_SCALE = 0.45;
const MAX_RENDER_SCALE = 2.4;

let pdfjsClientModulePromise;

async function getPdfJsClientModule() {
  if (!pdfjsClientModulePromise) {
    pdfjsClientModulePromise = import("pdfjs-dist/legacy/build/pdf.mjs").then((pdfjs) => {
      pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
        import.meta.url
      ).toString();
      return pdfjs;
    });
  }

  return pdfjsClientModulePromise;
}

function extractApiErrorMessage(response, fallback) {
  if (response && typeof response === "object" && typeof response.error === "string") {
    return response.error;
  }

  return fallback;
}

export default function PaperReaderClient({ paperId }) {
  const [loadingDocument, setLoadingDocument] = useState(true);
  const [renderingPages, setRenderingPages] = useState(false);
  const [error, setError] = useState("");
  const [pageCount, setPageCount] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  const containerRef = useRef(null);
  const canvasRefs = useRef(new Map());
  const pdfDocumentRef = useRef(null);
  const renderSequenceRef = useRef(0);
  const pdfjsRef = useRef(null);

  const pdfEndpoint = useMemo(
    () => `/api/library/papers/${encodeURIComponent(paperId)}/pdf`,
    [paperId]
  );

  function setCanvasRef(pageNumber, node) {
    if (!node) {
      canvasRefs.current.delete(pageNumber);
      return;
    }

    canvasRefs.current.set(pageNumber, node);
  }

  useEffect(() => {
    const element = containerRef.current;

    if (!element) {
      return undefined;
    }

    const updateWidth = (nextWidth) => {
      const width = Number.isFinite(nextWidth) ? Math.floor(nextWidth) : 0;
      setContainerWidth(Math.max(width, MIN_READER_WIDTH));
    };

    updateWidth(element.clientWidth);

    const observer = new ResizeObserver((entries) => {
      const firstEntry = entries[0];
      updateWidth(firstEntry?.contentRect?.width ?? element.clientWidth);
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const abortController = new AbortController();
    let cancelled = false;

    async function loadDocument() {
      setLoadingDocument(true);
      setError("");
      setPageCount(0);

      try {
        const response = await fetch(pdfEndpoint, {
          method: "GET",
          cache: "no-store",
          signal: abortController.signal,
        });

        if (!response.ok) {
          let payload = null;

          try {
            payload = await response.json();
          } catch {
            payload = null;
          }

          throw new Error(
            extractApiErrorMessage(payload, "Unable to open this paper right now.")
          );
        }

        if (!pdfjsRef.current) {
          pdfjsRef.current = await getPdfJsClientModule();
        }

        const bytes = new Uint8Array(await response.arrayBuffer());
        const loadingTask = pdfjsRef.current.getDocument({
          data: bytes,
          isEvalSupported: false,
          disableFontFace: false,
        });

        const documentProxy = await loadingTask.promise;

        if (cancelled) {
          await documentProxy.destroy();
          return;
        }

        if (pdfDocumentRef.current) {
          await pdfDocumentRef.current.destroy();
        }

        pdfDocumentRef.current = documentProxy;
        setPageCount(documentProxy.numPages);
      } catch (reason) {
        if (!abortController.signal.aborted) {
          const message =
            reason instanceof Error ? reason.message : "Unable to open this paper right now.";
          setError(message);
        }

        if (pdfDocumentRef.current) {
          await pdfDocumentRef.current.destroy();
          pdfDocumentRef.current = null;
        }
      } finally {
        if (!cancelled) {
          setLoadingDocument(false);
        }
      }
    }

    loadDocument();

    return () => {
      cancelled = true;
      abortController.abort();
    };
  }, [pdfEndpoint]);

  useEffect(() => {
    const pdfDocument = pdfDocumentRef.current;

    if (!pdfDocument || !pageCount || !containerWidth) {
      return undefined;
    }

    const renderSequence = renderSequenceRef.current + 1;
    renderSequenceRef.current = renderSequence;
    let cancelled = false;

    async function renderPages() {
      setRenderingPages(true);

      try {
        const availableWidth = Math.max(containerWidth - 8, MIN_READER_WIDTH);
        const outputScale = Math.min(window.devicePixelRatio || 1, 2);

        for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
          if (cancelled || renderSequenceRef.current !== renderSequence) {
            return;
          }

          const canvas = canvasRefs.current.get(pageNumber);
          if (!canvas) {
            continue;
          }

          const page = await pdfDocument.getPage(pageNumber);
          const baseViewport = page.getViewport({ scale: 1 });
          const adaptiveScale = Math.min(
            MAX_RENDER_SCALE,
            Math.max(MIN_RENDER_SCALE, availableWidth / baseViewport.width)
          );
          const viewport = page.getViewport({ scale: adaptiveScale });

          canvas.width = Math.floor(viewport.width * outputScale);
          canvas.height = Math.floor(viewport.height * outputScale);
          canvas.style.width = `${Math.floor(viewport.width)}px`;
          canvas.style.height = `${Math.floor(viewport.height)}px`;

          const context = canvas.getContext("2d", { alpha: false });

          if (!context) {
            continue;
          }

          context.setTransform(outputScale, 0, 0, outputScale, 0, 0);
          context.imageSmoothingEnabled = true;
          context.imageSmoothingQuality = "high";

          const renderTask = page.render({
            canvasContext: context,
            viewport,
            background: "rgb(255,255,255)",
          });

          await renderTask.promise;
          page.cleanup();
        }
      } catch {
        if (!cancelled) {
          setError("Unable to render this paper right now. Please refresh and try again.");
        }
      } finally {
        if (!cancelled && renderSequenceRef.current === renderSequence) {
          setRenderingPages(false);
        }
      }
    }

    renderPages();

    return () => {
      cancelled = true;
      renderSequenceRef.current += 1;
    };
  }, [containerWidth, pageCount]);

  useEffect(() => {
    return () => {
      const currentDocument = pdfDocumentRef.current;
      pdfDocumentRef.current = null;

      if (currentDocument) {
        currentDocument.destroy().catch(() => {});
      }
    };
  }, []);

  useEffect(() => {
    function handleKeyDown(event) {
      const hasModifier = event.ctrlKey || event.metaKey;
      if (!hasModifier) {
        return;
      }

      const key = String(event.key || "").toLowerCase();

      if (key === "s" || key === "p") {
        event.preventDefault();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_12%_18%,rgba(22,163,74,0.08),transparent_42%),radial-gradient(circle_at_88%_8%,rgba(59,130,246,0.09),transparent_36%),linear-gradient(165deg,#f8fafc_0%,#eefbf4_45%,#f0f9ff_100%)] px-4 py-8 sm:px-8 sm:py-10">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-5">
        <header className="overflow-hidden rounded-3xl border border-zinc-200/80 bg-white/90 p-5 shadow-[0_18px_70px_-30px_rgba(15,23,42,0.35)] backdrop-blur-sm sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link
              href="/user/library"
              className="inline-flex items-center gap-2 rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:border-zinc-400"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to library
            </Link>

            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
              <ShieldCheck className="h-3.5 w-3.5" />
              Protected reader
            </span>
          </div>

          <h1 className="mt-4 text-2xl font-black tracking-tight text-zinc-900 sm:text-3xl">
            Canvas paper reader
          </h1>
          <p className="mt-2 max-w-3xl text-sm font-medium text-zinc-600">
            This paper is rendered as canvas pages to reduce direct copy and download actions.
          </p>
        </header>

        {error ? (
          <section className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          </section>
        ) : null}

        <section className="rounded-3xl border border-zinc-200 bg-white/85 p-3 shadow-[0_14px_45px_-28px_rgba(15,23,42,0.38)] sm:p-5">
          <div
            ref={containerRef}
            onContextMenu={(event) => event.preventDefault()}
            className="mx-auto w-full max-w-4xl touch-manipulation"
          >
            {loadingDocument ? (
              <div className="flex min-h-[50vh] items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-8 text-zinc-600">
                <div className="inline-flex items-center gap-2 text-sm font-semibold">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Opening paper...
                </div>
              </div>
            ) : pageCount > 0 ? (
              <div className="space-y-4 sm:space-y-5">
                <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-zinc-600">
                  {renderingPages
                    ? "Rendering pages..."
                    : `All ${pageCount} pages loaded`}
                </div>

                {Array.from({ length: pageCount }, (_, index) => {
                  const pageNumber = index + 1;

                  return (
                    <article
                      key={pageNumber}
                      className="overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100 p-2.5 sm:p-3"
                    >
                      <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-500">
                        Page {pageNumber} of {pageCount}
                      </p>
                      <canvas
                        ref={(node) => setCanvasRef(pageNumber, node)}
                        className="mx-auto block h-auto max-w-full rounded-lg bg-white shadow-[0_14px_26px_-22px_rgba(15,23,42,0.7)]"
                        aria-label={`Paper page ${pageNumber}`}
                      />
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="flex min-h-[40vh] items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-8 text-sm font-semibold text-zinc-600">
                No pages were found for this paper.
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}