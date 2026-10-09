"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, LogIn, UserPlus, GraduationCap } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  packageId: string;
  hubName?: string;
};

function ModalShell({
  children,
  onClose,
  labelledBy,
}: {
  children: React.ReactNode;
  onClose: () => void;
  labelledBy: string;
}) {
  return (
    <div
      className="fixed left-0 top-0 z-[9999] flex h-[100dvh] w-screen items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      style={{
        paddingTop: "max(1rem, env(safe-area-inset-top))",
        paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
    >
      <button
        type="button"
        className="absolute inset-0 bg-transparent"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-[min(24rem,calc(100vw-2rem))] max-h-[min(90dvh,36rem)] overflow-y-auto overscroll-contain rounded-3xl border border-white/15 bg-gradient-to-b from-[#111a2f] via-[#0c1324] to-[#080d19] shadow-2xl shadow-black/80">
        {children}
      </div>
    </div>
  );
}

export default function PurchaseRequiredModal({
  open,
  onClose,
  hubName,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    const prevTouch = document.body.style.touchAction;
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      document.body.style.touchAction = prevTouch;
    };
  }, [open, onClose]);

  if (!open || !mounted) return null;

  const targetNext = pathname || "/learning";

  return createPortal(
    <ModalShell onClose={onClose} labelledBy="unsigned-access-title">
      <button
        type="button"
        onClick={onClose}
        className="absolute right-3.5 top-3.5 z-10 rounded-full border border-white/10 p-2 text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        aria-label="Close dialog"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="relative px-6 pt-9 pb-7 text-center sm:px-8 sm:pt-10 sm:pb-8">
        {/* Soft Cyan Brand Icon */}
        <div className="mx-auto mb-4 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-500/10 text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
          <GraduationCap className="w-7 h-7 sm:w-8 sm:h-8" />
        </div>

        <p className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-cyan-400/25 bg-cyan-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-cyan-300">
          Wisdom Tower Academy
        </p>

        <h2
          id="unsigned-access-title"
          className="font-display text-xl sm:text-2xl font-black text-white tracking-tight mb-2"
        >
          Sign In to Access
        </h2>

        {hubName && (
          <p className="text-xs font-semibold text-cyan-300/90 mb-2">{hubName}</p>
        )}

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xs mx-auto mb-6">
          Sign in or create a free scholar account to view this course and explore all learning hubs.
        </p>

        <div className="flex flex-col gap-2.5">
          <Link
            href={`/login?next=${encodeURIComponent(targetNext)}`}
            onClick={onClose}
            className="w-full py-3 px-5 rounded-xl font-bold text-xs sm:text-sm bg-cyan-400 text-slate-950 hover:bg-cyan-300 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-md shadow-cyan-950/40 cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In</span>
          </Link>

          <Link
            href={`/login?mode=signup&next=${encodeURIComponent(targetNext)}`}
            onClick={onClose}
            className="w-full py-3 px-5 rounded-xl font-semibold text-xs sm:text-sm border border-white/15 bg-white/5 hover:bg-white/10 text-white active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-cyan-300" />
            <span>Create Free Account</span>
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-white pt-2 transition-colors cursor-pointer"
          >
            Keep exploring
          </button>
        </div>
      </div>
    </ModalShell>,
    document.body
  );
}
