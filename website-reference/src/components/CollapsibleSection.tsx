"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

type Props = {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
  className?: string;
};

export default function CollapsibleSection({
  title,
  subtitle,
  icon,
  defaultOpen = false,
  children,
  className = "",
}: Props) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className={`mb-6 sm:mb-8 ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 rounded-2xl border border-white/[0.08] bg-[#0c1328]/70 hover:bg-[#0f1833]/85 backdrop-blur-xl px-4 py-3 sm:px-5 sm:py-3.5 text-left transition-all duration-200 active:scale-[0.995] shadow-lg shadow-black/20"
        aria-expanded={open}
      >
        <div className="flex items-center gap-3 min-w-0">
          {icon ? (
            <span className="shrink-0 flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl sm:rounded-2xl border border-white/10 bg-white/[0.04] shadow-sm">
              {icon}
            </span>
          ) : null}
          <div className="min-w-0">
            <p className="font-display font-bold text-white text-sm sm:text-base">{title}</p>
            {subtitle ? (
              <p className="text-xs text-slate-400 mt-0.5 truncate">{subtitle}</p>
            ) : null}
          </div>
        </div>
        <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0">
          <ChevronDown
            className={`w-4 h-4 text-slate-300 transition-transform duration-300 ${
              open ? "rotate-180" : ""
            }`}
          />
        </span>
      </button>
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="pt-3 sm:pt-4">{children}</div>
        </div>
      </div>
    </section>
  );
}
