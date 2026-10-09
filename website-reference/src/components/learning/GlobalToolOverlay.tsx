"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";
import ScientificCalculator from "./ScientificCalculator";
import AiTutor from "./AiTutor";
import { closeToolOverlay } from "@/lib/native-app";
import { X, Sparkles, Calculator as CalcIcon, ExternalLink } from "lucide-react";
import Link from "next/link";

type ToolType = "tutor" | "calculator" | "notes" | "timer" | null;

/**
 * Global Non-Destructive Tool Overlay
 *
 * Allows students studying hub content (textbooks, short notes, flashcards, question banks, exams)
 * to open and use essential academic tools (AI Tutor, Scientific Calculator) WITHOUT requiring
 * a full site navigation away from their study session.
 *
 * Supported triggers:
 * 1. App Bridge: window.__wtaOpenTool?.("tutor" | "calculator")
 * 2. Window event: window.dispatchEvent(new CustomEvent("wta-open-tool", { detail: { tool: "..." } }))
 * 3. Header drawer tool links on any non-/learning page
 *
 * Closing:
 * - Calls AndroidBridge.closeOverlay() / closeTool() if native bridge is attached
 * - Restores student right where they left off with ZERO page reload
 */
export default function GlobalToolOverlay() {
  const pathname = usePathname() || "/";
  const [activeTool, setActiveTool] = useState<ToolType>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close overlay helper
  const handleClose = useCallback(() => {
    const current = activeTool;
    setActiveTool(null);
    closeToolOverlay(current || undefined);
  }, [activeTool]);

  // Open tool helper
  const handleOpen = useCallback((tool: string) => {
    const normalized = tool.toLowerCase().trim();
    if (normalized === "tutor" || normalized === "ai-tutor" || normalized === "aitutor") {
      setActiveTool("tutor");
    } else if (normalized === "calculator" || normalized === "calc") {
      setActiveTool("calculator");
    } else if (normalized === "notes" || normalized === "notebook") {
      setActiveTool("notes");
    } else if (normalized === "timer" || normalized === "pomodoro") {
      setActiveTool("timer");
    }
  }, []);

  // Expose global bridge hooks and custom event listeners
  useEffect(() => {
    // 1. App bridge hook on window
    window.__wtaOpenTool = (tool: string) => {
      handleOpen(tool);
    };

    window.__wtaCloseTool = () => {
      handleClose();
    };

    // 2. Custom event listeners
    const onOpenEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ tool?: string }>;
      if (customEvent.detail?.tool) {
        handleOpen(customEvent.detail.tool);
      }
    };

    const onCloseEvent = () => {
      handleClose();
    };

    window.addEventListener("wta-open-tool", onOpenEvent);
    window.addEventListener("wta-close-tool", onCloseEvent);

    return () => {
      delete window.__wtaOpenTool;
      delete window.__wtaCloseTool;
      window.removeEventListener("wta-open-tool", onOpenEvent);
      window.removeEventListener("wta-close-tool", onCloseEvent);
    };
  }, [handleOpen, handleClose]);

  // Android structural back button interception when overlay is active
  useEffect(() => {
    if (activeTool) {
      window.__wtaInPageBack = () => {
        handleClose();
        return true;
      };
    } else {
      if (typeof window !== "undefined" && window.__wtaInPageBack) {
        window.__wtaInPageBack = undefined;
      }
    }
    return () => {
      if (typeof window !== "undefined" && window.__wtaInPageBack) {
        window.__wtaInPageBack = undefined;
      }
    };
  }, [activeTool, handleClose]);

  // Keyboard accessibility: Escape key closes overlay
  useEffect(() => {
    if (!activeTool) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeTool, handleClose]);

  // If already on /learning, let LearningContent handle tools natively
  // But if the overlay was explicitly requested on /learning via bridge, overlay is available
  if (!activeTool) return null;

  return (
    <div
      ref={overlayRef}
      className={`fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-150 overflow-hidden ${
        activeTool === "tutor" ? "p-0 sm:p-4" : "p-2 sm:p-4"
      }`}
      role="dialog"
      aria-modal="true"
      aria-label={`${activeTool === "tutor" ? "AI Tutor" : "Scientific Calculator"} Overlay`}
      onClick={(e) => {
        // Close if clicked on outer backdrop
        if (e.target === overlayRef.current) {
          handleClose();
        }
      }}
    >
      <div className={`relative w-full max-w-4xl flex flex-col justify-center items-center ${activeTool === "tutor" ? "h-full sm:h-auto sm:max-h-[96dvh]" : "max-h-[96dvh]"}`}>
        {/* Subtle quick bar above modal for deep link reference */}
        <div
          className={`w-full items-center justify-between px-2 pb-2 text-xs text-slate-400 select-none ${
            activeTool === "tutor" ? "hidden sm:flex" : "flex"
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-semibold text-slate-300">
              {activeTool === "tutor" ? "AI Academic Tutor" : "Scientific Calculator"}
            </span>
            <span className="text-slate-500 hidden sm:inline">• Active Study Overlay</span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/learning?tool=${activeTool}`}
              onClick={handleClose}
              className="text-[11px] text-slate-400 hover:text-cyan-300 flex items-center gap-1 transition-colors px-2 py-0.5 rounded-lg hover:bg-white/5"
              title="Open full page"
            >
              <ExternalLink className="w-3 h-3" />
              <span className="hidden sm:inline">Open Full Page</span>
            </Link>

            <button
              type="button"
              onClick={handleClose}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 hover:text-white border border-rose-500/30 font-semibold active:scale-95 transition-all cursor-pointer"
              aria-label="Close study tool overlay"
            >
              <X className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Close</span>
            </button>
          </div>
        </div>

        {/* Tool Component Container */}
        <div
          className={`w-full flex justify-center items-center overflow-auto ${
            activeTool === "tutor"
              ? "h-full max-h-none sm:max-h-[calc(96dvh-2.5rem)]"
              : "max-h-[calc(96dvh-2.5rem)]"
          }`}
        >
          {activeTool === "tutor" && (
            <div className="w-full sm:max-w-3xl h-full">
              <AiTutor
                isOpen={true}
                onClose={handleClose}
                isEmbedded={false}
                isStandalone={true}
              />
            </div>
          )}

          {activeTool === "calculator" && (
            <div className="w-full max-w-xl">
              <ScientificCalculator
                isOpen={true}
                onClose={handleClose}
                isEmbedded={false}
                isStandalone={true}
              />
            </div>
          )}

          {activeTool === "notes" && (
            <div className="w-full max-w-lg p-6 rounded-3xl bg-[#0a1122] border border-cyan-400/30 text-white shadow-2xl space-y-4 text-center">
              <h3 className="text-lg font-bold">Quick Study Notes</h3>
              <p className="text-xs text-slate-300">
                Access your organized notebooks and course summaries.
              </p>
              <div className="flex justify-center gap-3 pt-2">
                <Link
                  href="/learning?tool=notes"
                  onClick={handleClose}
                  className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400"
                >
                  Open Full Notebook
                </Link>
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 rounded-xl bg-white/10 text-white font-semibold text-xs hover:bg-white/20"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {activeTool === "timer" && (
            <div className="w-full max-w-lg p-6 rounded-3xl bg-[#0a1122] border border-cyan-400/30 text-white shadow-2xl space-y-4 text-center">
              <h3 className="text-lg font-bold">Pomodoro Study Timer</h3>
              <p className="text-xs text-slate-300">
                Focus for 25 minutes, then take a short active rest.
              </p>
              <div className="flex justify-center gap-3 pt-2">
                <Link
                  href="/learning?tool=timer"
                  onClick={handleClose}
                  className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400"
                >
                  Open Pomodoro Timer
                </Link>
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 rounded-xl bg-white/10 text-white font-semibold text-xs hover:bg-white/20"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
