"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { createPortal } from "react-dom";
import {
  FileText,
  Maximize2,
  X,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  ChevronsUp,
  Timer,
  Download,
} from "lucide-react";
import { fetchPdfCached, getCachedPdf } from "@/lib/pdfCache";
import PomodoroBreak from "@/components/learning/PomodoroBreak";
import {
  pickRandomQuote,
  type MotivationalQuote,
} from "@/data/motivational-quotes";

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

const LARGE_FILE_BYTES = 20 * 1024 * 1024;
const POMODORO_SECONDS = 25 * 60;
const WINDOW = 2;
const DEFAULT_PAGE_H = 520;

type Props = {
  url: string;
  title: string;
  onOpened?: () => void;
  onPageChange?: (page: number, total: number) => void;
};

export default function PdfReader({ url, title, onOpened, onPageChange }: Props) {
  const [started, setStarted] = useState(() => !!getCachedPdf(url));
  const [sizeProbe, setSizeProbe] = useState<number | null>(null);
  const [sizeProbeBusy, setSizeProbeBusy] = useState(false);
  const [sizeProbeFailed, setSizeProbeFailed] = useState(false);

  const [fullscreen, setFullscreen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [loadPhase, setLoadPhase] = useState<"download" | "parse">("download");
  const [fileBytes, setFileBytes] = useState<number | null>(null);
  const [loadedBytes, setLoadedBytes] = useState(0);
  const pdfBytesRef = useRef<ArrayBuffer | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.15);
  const [currentPage, setCurrentPage] = useState(1);
  const [gotoInput, setGotoInput] = useState("");
  const [scrollWidth, setScrollWidth] = useState(360);
  const [pageHeights, setPageHeights] = useState<Record<number, number>>({});
  const [focusSeconds, setFocusSeconds] = useState(0);
  const [breakOpen, setBreakOpen] = useState(false);
  const [breakQuote, setBreakQuote] = useState<MotivationalQuote | null>(null);
  const focusSecondsRef = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pdfRef = useRef<any>(null);
  const openedRef = useRef(false);
  const onOpenedRef = useRef(onOpened);
  const onPageChangeRef = useRef(onPageChange);
  onOpenedRef.current = onOpened;
  onPageChangeRef.current = onPageChange;

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const cached = !!getCachedPdf(url);
    setStarted(cached);
    setSizeProbe(null);
    setSizeProbeFailed(false);
    setError("");
    setLoading(false);
    setNumPages(0);
    setCurrentPage(1);
    setPageHeights({});
    setLoadProgress(0);
    setFileBytes(null);
    setLoadedBytes(0);
    pdfBytesRef.current = null;
    pdfRef.current = null;
    openedRef.current = false;
  }, [url]);

  useEffect(() => {
    if (started) return;
    let cancelled = false;
    setSizeProbeBusy(true);
    setSizeProbeFailed(false);
    setSizeProbe(null);

    // Instant size if already in memory cache (re-open same book)
    const cached = getCachedPdf(url);
    if (cached && cached.byteLength > 0) {
      setSizeProbe(cached.byteLength);
      setSizeProbeBusy(false);
      return;
    }

    const timeout = window.setTimeout(() => {
      if (!cancelled) {
        setSizeProbeBusy(false);
        setSizeProbeFailed(true);
      }
    }, 2500);

    const ctrl = new AbortController();

    (async () => {
      try {
        // 1) HEAD: cheap size probe (works in desktop browsers)
        let res = await fetch(url, {
          method: "HEAD",
          cache: "no-store",
          signal: ctrl.signal,
        });
        if (cancelled) return;
        if (res.ok) {
          const cl = res.headers.get("Content-Length");
          if (cl) {
            const n = parseInt(cl, 10);
            if (Number.isFinite(n) && n > 0) {
              setSizeProbe(n);
              setSizeProbeBusy(false);
              clearTimeout(timeout);
              return;
            }
          }
        }

        // 2) Range GET: more reliable in Android WebView; only 1 byte
        res = await fetch(url, {
          method: "GET",
          headers: { Range: "bytes=0-0" },
          cache: "no-store",
          signal: ctrl.signal,
        });
        if (cancelled) return;

        // Drain tiny body so the connection closes cleanly in WebView
        try {
          await res.arrayBuffer();
        } catch {
          /* ignore */
        }

        const cr = res.headers.get("Content-Range");
        const m = cr?.match(/\/(\d+)\s*$/);
        if (m) {
          const n = parseInt(m[1], 10);
          if (Number.isFinite(n) && n > 0) {
            setSizeProbe(n);
            setSizeProbeBusy(false);
            clearTimeout(timeout);
            return;
          }
        }

        const cl2 = res.headers.get("Content-Length");
        if (cl2) {
          const n = parseInt(cl2, 10);
          if (Number.isFinite(n) && n > 1) {
            setSizeProbe(n);
            setSizeProbeBusy(false);
            clearTimeout(timeout);
            return;
          }
        }

        setSizeProbeFailed(true);
      } catch {
        if (!cancelled) setSizeProbeFailed(true);
      } finally {
        if (!cancelled) {
          setSizeProbeBusy(false);
          clearTimeout(timeout);
        }
      }
    })();

    return () => {
      cancelled = true;
      clearTimeout(timeout);
      try {
        ctrl.abort();
      } catch {
        /* ignore */
      }
    };
  }, [url, started]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.clientWidth || 360;
      setScrollWidth((prev) => (Math.abs(prev - w) < 2 ? prev : w));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [fullscreen, loading, numPages, started]);

  useEffect(() => {
    if (!fullscreen) return;
    const prevB = document.body.style.overflow;
    const prevH = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevB;
      document.documentElement.style.overflow = prevH;
    };
  }, [fullscreen]);

  useEffect(() => {
    if (!fullscreen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFullscreen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fullscreen]);

  useEffect(() => {
    if (!started || loading || error || breakOpen) return;
    const id = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      focusSecondsRef.current += 1;
      const next = focusSecondsRef.current;
      setFocusSeconds(next);
      if (next >= POMODORO_SECONDS) {
        setBreakQuote(pickRandomQuote());
        setBreakOpen(true);
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [started, loading, error, breakOpen]);

  function resetPomodoro() {
    focusSecondsRef.current = 0;
    setFocusSeconds(0);
    setBreakOpen(false);
    setBreakQuote(null);
  }

  function downloadPdf() {
    const data = pdfBytesRef.current;
    if (!data) return;
    const blob = new Blob([new Uint8Array(data)], { type: "application/pdf" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${title.replace(/[^\w\s-]+/g, "").trim() || "book"}.pdf`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  useEffect(() => {
    if (!started) return;
    let cancelled = false;
    setLoading(true);
    setError("");
    setNumPages(0);
    setCurrentPage(1);
    setPageHeights({});
    setLoadProgress(0);
    setLoadPhase("download");
    setFileBytes(null);
    setLoadedBytes(0);
    pdfBytesRef.current = null;
    pdfRef.current = null;
    openedRef.current = false;

    (async () => {
      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = new URL(
          "pdfjs-dist/build/pdf.worker.min.mjs",
          import.meta.url
        ).toString();

        const data = await fetchPdfCached(url, (loaded, total) => {
          if (cancelled) return;
          setLoadedBytes(loaded);
          if (total && total > 0) {
            setFileBytes(total);
            setLoadProgress(Math.min(99, Math.round((loaded / total) * 100)));
          } else {
            setLoadProgress((p) => Math.min(90, Math.max(p, Math.round(loaded / 50000))));
          }
        });
        if (cancelled) return;

        pdfBytesRef.current = data;
        setFileBytes(data.byteLength);
        setLoadedBytes(data.byteLength);
        setLoadPhase("parse");
        setLoadProgress(99);

        const doc = await pdfjs.getDocument({
          data,
          disableAutoFetch: true,
          disableStream: true,
        }).promise;
        if (cancelled) {
          doc.destroy();
          return;
        }
        pdfRef.current = doc;
        setNumPages(doc.numPages);
        setLoadProgress(100);
        setLoading(false);
        if (!openedRef.current) {
          openedRef.current = true;
          onOpenedRef.current?.();
        }
      } catch (e) {
        if (!cancelled) {
          console.error(e);
          const msg = e instanceof Error ? e.message : "Failed to load PDF";
          if (/fake worker|dynamically imported module|pdf\.worker/i.test(msg)) {
            setError("Could not open this book. Check your connection and try again.");
          } else {
            setError(msg);
          }
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
      try {
        pdfRef.current?.destroy?.();
      } catch {
        /* ignore */
      }
      pdfRef.current = null;
    };
  }, [url, started]);

  useEffect(() => {
    const root = scrollRef.current;
    if (!root || !numPages) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const scrollTop = root.scrollTop;
        let acc = 0;
        let page = 1;
        for (let i = 1; i <= numPages; i++) {
          const h = pageHeights[i] ?? DEFAULT_PAGE_H;
          if (scrollTop + 80 < acc + h) {
            page = i;
            break;
          }
          acc += h + 12;
          page = i;
        }
        setCurrentPage((prev) => {
          if (prev !== page) {
            onPageChangeRef.current?.(page, numPages);
            return page;
          }
          return prev;
        });
      });
    };
    root.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      cancelAnimationFrame(raf);
      root.removeEventListener("scroll", onScroll);
    };
  }, [numPages, pageHeights]);

  const scrollToPage = useCallback(
    (p: number) => {
      const root = scrollRef.current;
      if (!root || !numPages) return;
      const clamped = Math.max(1, Math.min(numPages, p));
      let top = 0;
      for (let i = 1; i < clamped; i++) {
        top += (pageHeights[i] ?? DEFAULT_PAGE_H) + 12;
      }
      root.scrollTo({ top, behavior: "smooth" });
      setCurrentPage(clamped);
    },
    [numPages, pageHeights]
  );

  function onGotoSubmit(e: FormEvent) {
    e.preventDefault();
    const n = parseInt(gotoInput, 10);
    if (!Number.isFinite(n)) return;
    scrollToPage(n);
    setGotoInput("");
  }

  const visiblePages = useMemo(() => {
    const start = Math.max(1, currentPage - WINDOW);
    const end = Math.min(numPages, currentPage + WINDOW);
    const set = new Set<number>();
    for (let i = start; i <= end; i++) set.add(i);
    return set;
  }, [currentPage, numPages]);

  const onPageMeasured = useCallback((pageNumber: number, height: number) => {
    setPageHeights((prev) => {
      if (prev[pageNumber] === height) return prev;
      return { ...prev, [pageNumber]: height };
    });
  }, []);

  if (!started) {
    const displaySize =
      sizeProbe != null
        ? formatBytes(sizeProbe)
        : sizeProbeBusy
          ? "Checking size…"
          : "Ready";
    const isLarge = sizeProbe != null && sizeProbe >= LARGE_FILE_BYTES;

    return (
      <div className="relative flex flex-col rounded-2xl border border-white/12 bg-neutral-950 overflow-hidden min-h-[280px]">
        <div className="flex items-center gap-2 px-3 py-2 border-b border-white/10 bg-[#0b1220] shrink-0">
          <FileText className="w-4 h-4 shrink-0 text-amber-300" />
          <p className="text-xs sm:text-sm text-white/80 truncate font-medium flex-1 min-w-0">
            {title}
          </p>
        </div>
        <div className="flex flex-col items-center justify-center gap-5 px-6 py-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-500/10">
            <FileText className="w-8 h-8 text-amber-300" />
          </div>
          <div className="space-y-1.5 max-w-sm">
            <h3 className="font-display text-lg font-bold text-white leading-snug">
              {title}
            </h3>
            <p className="text-sm text-white/55">
              PDF book ·{" "}
              <span className="tabular-nums text-cyan-200/90 font-semibold">
                {displaySize}
              </span>
            </p>
            {isLarge && (
              <p className="text-xs text-amber-200/90 rounded-xl border border-amber-400/30 bg-amber-500/10 px-3 py-2 mt-2">
                Large file ({displaySize}). Prefer Wi‑Fi if possible.
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => setStarted(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-6 py-3 text-sm font-bold text-wisdom-dark hover:bg-cyan-400 transition-colors shadow-lg shadow-cyan-500/20 min-w-[200px]"
          >
            <Download className="w-4 h-4" />
            Download & open
            {sizeProbe != null && (
              <span className="opacity-80 font-semibold tabular-nums">
                ({formatBytes(sizeProbe)})
              </span>
            )}
          </button>
        </div>
      </div>
    );
  }

  const readerChrome = (
    <>
      <div className="flex items-center gap-2 px-2 sm:px-3 py-2 border-b border-white/10 bg-[#0b1220] shrink-0">
        <FileText className="w-4 h-4 shrink-0 text-amber-300" />
        <p className="text-xs sm:text-sm text-white/80 truncate font-medium flex-1 min-w-0">
          {title}
        </p>
        {!loading && !error && (
          <span className="hidden sm:inline-flex items-center gap-1 rounded-lg border border-amber-400/25 bg-amber-500/10 px-2 py-1 text-[10px] font-semibold tabular-nums text-amber-200/90 shrink-0">
            <Timer className="w-3 h-3" />
            {Math.floor(focusSeconds / 60)}:
            {String(focusSeconds % 60).padStart(2, "0")}
          </span>
        )}
        <div className="flex items-center gap-1 shrink-0">
          {!loading && !error && fileBytes != null && (
            <button
              type="button"
              onClick={downloadPdf}
              className="mr-1 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-cyan-400/35 bg-cyan-500/10 text-cyan-200 text-[11px] font-bold"
              title={`Save (${formatBytes(fileBytes)})`}
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Save</span>
              <span className="tabular-nums opacity-80">{formatBytes(fileBytes)}</span>
            </button>
          )}
          <ToolBtn
            onClick={() =>
              setScale((s) => Math.max(0.55, Math.round((s - 0.15) * 100) / 100))
            }
            label="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </ToolBtn>
          <span className="text-[11px] tabular-nums text-white/50 w-10 text-center hidden sm:inline">
            {Math.round(scale * 100)}%
          </span>
          <ToolBtn
            onClick={() =>
              setScale((s) => Math.min(2.2, Math.round((s + 0.15) * 100) / 100))
            }
            label="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </ToolBtn>
          {!fullscreen ? (
            <button
              type="button"
              onClick={() => setFullscreen(true)}
              className="ml-1 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/90 text-wisdom-dark text-[11px] font-bold"
            >
              <Maximize2 className="w-3.5 h-3.5" /> Full screen
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setFullscreen(false)}
              className="ml-1 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500 text-white text-[11px] font-bold"
            >
              <X className="w-4 h-4" /> Exit
            </button>
          )}
        </div>
      </div>

      {numPages > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-2 px-2 py-2 border-b border-white/8 bg-[#0d1526] shrink-0">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => scrollToPage(currentPage - 1)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-white/12 text-xs font-semibold text-white/85 disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4" /> Prev
          </button>
          <form onSubmit={onGotoSubmit} className="flex items-center gap-1.5">
            <input
              type="number"
              min={1}
              max={numPages}
              value={gotoInput}
              placeholder={String(currentPage)}
              onChange={(e) => setGotoInput(e.target.value)}
              className="w-14 rounded-lg border border-white/15 bg-black/40 px-2 py-1.5 text-xs text-center tabular-nums text-white focus:outline-none focus:border-amber-400/50"
            />
            <span className="text-[11px] text-white/45 tabular-nums">/ {numPages}</span>
            <button
              type="submit"
              className="px-2 py-1.5 rounded-lg border border-amber-400/30 text-[11px] font-semibold text-amber-200"
            >
              Go
            </button>
          </form>
          <button
            type="button"
            disabled={currentPage >= numPages}
            onClick={() => scrollToPage(currentPage + 1)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-white/12 text-xs font-semibold text-white/85 disabled:opacity-30"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => scrollToPage(1)}
            className="p-1.5 rounded-lg border border-white/10 text-white/50"
            title="Top"
          >
            <ChevronsUp className="w-4 h-4" />
          </button>
        </div>
      )}

      <div
        ref={scrollRef}
        className="overflow-y-auto overflow-x-hidden flex-1 min-h-0 bg-[#121212]"
      >
        {loading && (
          <div className="flex flex-col items-center justify-center w-full py-24 px-6 gap-4">
            <p className="text-sm text-white/50">
              {loadPhase === "parse" ? "Opening book…" : "Downloading…"}
            </p>
            <div className="w-full max-w-xs h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-cyan-400 transition-all duration-300"
                style={{ width: `${loadProgress}%` }}
              />
            </div>
            {fileBytes != null && loadPhase === "download" && (
              <p className="text-[11px] text-white/40 tabular-nums">
                {formatBytes(loadedBytes)} / {formatBytes(fileBytes)}
              </p>
            )}
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center gap-3 py-20 px-6 text-center">
            <AlertCircle className="w-10 h-10 text-rose-400" />
            <p className="text-sm text-rose-200/90 max-w-sm">{error}</p>
            <button
              type="button"
              onClick={() => {
                setError("");
                setStarted(false);
              }}
              className="text-cyan-300 text-sm font-semibold underline"
            >
              Back
            </button>
          </div>
        )}

        {!loading && !error && numPages > 0 && (
          <div className="flex flex-col items-center gap-3 py-3 px-1">
            {Array.from({ length: numPages }, (_, i) => i + 1).map((pageNumber) => {
              const visible = visiblePages.has(pageNumber);
              const h = pageHeights[pageNumber] ?? DEFAULT_PAGE_H;
              return (
                <div
                  key={pageNumber}
                  data-page={pageNumber}
                  style={{ minHeight: h }}
                  className="w-full flex justify-center"
                >
                  {visible ? (
                    <PdfPage
                      pdf={pdfRef.current}
                      pageNumber={pageNumber}
                      scale={scale}
                      maxWidth={scrollWidth - 16}
                      onMeasured={onPageMeasured}
                    />
                  ) : (
                    <div style={{ height: h }} className="w-full max-w-full" />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );

  if (fullscreen && mounted) {
    return createPortal(
      <div
        className="fixed inset-0 z-[9999] flex flex-col bg-neutral-950"
        style={{ height: "100dvh", width: "100vw" }}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        {readerChrome}
        <button
          type="button"
          onClick={() => setFullscreen(false)}
          className="absolute top-[max(0.75rem,env(safe-area-inset-top))] right-3 z-[10000] inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-500 text-white text-sm font-bold shadow-xl"
        >
          <X className="w-5 h-5" /> Exit
        </button>
        <PomodoroBreak
          open={breakOpen}
          quote={breakQuote}
          sessionMinutes={Math.max(1, Math.round(focusSeconds / 60))}
          onContinue={resetPomodoro}
          onTakeBreak={resetPomodoro}
        />
      </div>,
      document.body
    );
  }

  return (
    <div className="relative flex flex-col rounded-2xl border border-white/12 bg-neutral-950 overflow-hidden h-[min(72vh,680px)]">
      {readerChrome}
      <PomodoroBreak
        open={breakOpen}
        quote={breakQuote}
        sessionMinutes={Math.max(1, Math.round(focusSeconds / 60))}
        onContinue={resetPomodoro}
        onTakeBreak={resetPomodoro}
      />
    </div>
  );
}

function ToolBtn({
  children,
  onClick,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="p-1.5 rounded-lg border border-white/12 text-white/70 hover:bg-white/5"
    >
      {children}
    </button>
  );
}

function PdfPage({
  pdf,
  pageNumber,
  scale,
  maxWidth,
  onMeasured,
}: {
  // PDF document proxy
  pdf: any;
  pageNumber: number;
  scale: number;
  maxWidth: number;
  onMeasured: (pageNumber: number, height: number) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!pdf || !canvasRef.current) return;
    let cancelled = false;
    (async () => {
      try {
        const page = await pdf.getPage(pageNumber);
        if (cancelled) return;
        const base = page.getViewport({ scale: 1 });
        const fitScale = maxWidth > 0 ? Math.min(scale, maxWidth / base.width) : scale;
        const outputScale = Math.min(window.devicePixelRatio || 1, 3);
        const viewport = page.getViewport({ scale: fitScale * 1.15 });
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext("2d", { alpha: false });
        if (!ctx) return;
        canvas.width = Math.floor(viewport.width * outputScale);
        canvas.height = Math.floor(viewport.height * outputScale);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;
        const transform =
          outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : undefined;
        await page.render({
          canvasContext: ctx,
          viewport,
          transform,
        }).promise;
        if (!cancelled) {
          onMeasured(pageNumber, Math.floor(viewport.height));
        }
      } catch (e) {
        if (!cancelled) {
          setErr(e instanceof Error ? e.message : "Page error");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pdf, pageNumber, scale, maxWidth, onMeasured]);

  if (err) {
    return (
      <div className="text-rose-300 text-xs p-4">Failed to render page {pageNumber}</div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className="max-w-full shadow-lg rounded-sm bg-white"
    />
  );
}
