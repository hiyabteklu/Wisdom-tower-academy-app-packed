"use client";

import { useEffect, useState } from "react";
import { StickyNote } from "lucide-react";
import {
  listFreeResourceItems,
  type FreeResourceItem,
  type FreeResourceSlug,
} from "@/lib/free-resources";
import { simpleMarkdownToHtml } from "@/lib/format-content";

export default function PageNotes({ pageSlug }: { pageSlug: FreeResourceSlug }) {
  const [notes, setNotes] = useState<FreeResourceItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { items } = await listFreeResourceItems({
        pageSlug,
        publishedOnly: true,
      });
      if (!cancelled) setNotes(items);
    })();
    return () => {
      cancelled = true;
    };
  }, [pageSlug]);

  if (!notes.length) return null;

  return (
    <section className="mt-12 mb-8 rounded-2xl border border-amber-400/30 bg-amber-500/5 p-5 sm:p-6 space-y-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-amber-200/90 flex items-center gap-2">
        <StickyNote className="w-4 h-4" />
        Extra notes
      </p>
      {notes.map((n) => (
        <div key={n.id} className="space-y-1.5 border-t border-white/8 pt-4 first:border-0 first:pt-0">
          {n.title && (
            <h3 className="font-display text-base font-bold text-white">{n.title}</h3>
          )}
          {n.subtitle && (
            <p className="text-sm text-wisdom-muted">{n.subtitle}</p>
          )}
          {n.bodyMd && (
            <div
              className="formatted-body text-sm sm:text-[15px] text-wisdom-muted leading-relaxed"
              dangerouslySetInnerHTML={{ __html: simpleMarkdownToHtml(n.bodyMd) }}
            />
          )}
        </div>
      ))}
    </section>
  );
}
