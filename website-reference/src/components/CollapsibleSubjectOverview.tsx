"use client";

import { useState } from "react";
import { ChevronDown, BookOpen } from "lucide-react";

export default function CollapsibleSubjectOverview({
  description,
  accent = "text-purple-300",
}: {
  description: string;
  accent?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-4 pt-3 border-t border-white/8 text-left">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-1 text-xs font-semibold text-wisdom-muted hover:text-white transition-colors"
      >
        <span className="flex items-center gap-1.5">
          <BookOpen className={`w-3.5 h-3.5 ${accent}`} />
          <span>Course syllabus & scope</span>
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-200 ${
            open ? "rotate-180 text-white" : ""
          }`}
        />
      </button>
      {open && (
        <div className="mt-2 text-xs sm:text-sm text-slate-300/90 leading-relaxed bg-white/[0.03] p-3 rounded-xl border border-white/8">
          {description}
        </div>
      )}
    </div>
  );
}
