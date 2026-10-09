"use client";

import { useCallback, useEffect, useState } from "react";
import {
  FREE_RESOURCE_LABELS,
  FREE_RESOURCE_SLUGS,
  PAGE_ITEM_KIND,
  NOTE_ONLY_SLUGS,
  listFreeResourcePages,
  listFreeResourceItems,
  upsertFreeResourcePage,
  upsertFreeResourceItem,
  deleteFreeResourceItem,
  uploadFreeResourceFile,
  freeResourcePublicUrl,
  type FreeResourcePage,
  type FreeResourceItem,
  type FreeResourceSlug,
  type FreeResourceItemKind,
} from "@/lib/free-resources";
import { universities } from "@/data/universities";
import {
  BookOpen,
  Save,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  Circle,
  Plus,
  Pencil,
  Trash2,
  X,
  ImageIcon,
  Star,
  StickyNote,
} from "lucide-react";

const inputCls =
  "mt-1 w-full rounded-xl border border-white/15 bg-wisdom-dark/50 px-3 py-2.5 text-sm text-white";
const labelCls = "block text-xs text-wisdom-muted";

function emptyMetaFor(kind: FreeResourceItemKind, slug: FreeResourceSlug): Record<string, unknown> {
  if (kind === "success_story") {
    return { studentName: "", program: "", result: "", year: "", quote: "" };
  }
  if (kind === "scholarship") {
    return { organization: "", amount: "", eligibility: "", status: "open" };
  }
  if (kind === "university" || slug === "universities") {
    return { universityId: "" };
  }
  if (kind === "department" || slug === "departments") {
    return { departmentId: "" };
  }
  return {};
}

export default function FreeResourcesPanel() {
  const [pages, setPages] = useState<FreeResourcePage[]>([]);
  const [items, setItems] = useState<FreeResourceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const [activeSlug, setActiveSlug] = useState<FreeResourceSlug>("success-stories");

  const [pageTitle, setPageTitle] = useState("");
  const [pageSubtitle, setPageSubtitle] = useState("");
  const [pageBody, setPageBody] = useState("");
  const [pagePublished, setPagePublished] = useState(false);
  const [pageId, setPageId] = useState<string | undefined>();
  const [savingPage, setSavingPage] = useState(false);

  const [editing, setEditing] = useState<FreeResourceItem | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [itTitle, setItTitle] = useState("");
  const [itSubtitle, setItSubtitle] = useState("");
  const [itBody, setItBody] = useState("");
  const [itMeta, setItMeta] = useState<Record<string, unknown>>({});
  const [itPublished, setItPublished] = useState(false);
  const [itFeatured, setItFeatured] = useState(false);
  const [itDeadline, setItDeadline] = useState("");
  const [itUrl, setItUrl] = useState("");
  const [itImagePath, setItImagePath] = useState<string | null>(null);
  const [itFile, setItFile] = useState<File | null>(null);
  const [savingItem, setSavingItem] = useState(false);

  const itemKind = PAGE_ITEM_KIND[activeSlug];
  const isNoteOnly = NOTE_ONLY_SLUGS.includes(activeSlug);
  const hasItemList = Boolean(itemKind);

  const load = useCallback(async () => {
    setLoading(true);
    const [pRes, iRes] = await Promise.all([
      listFreeResourcePages(),
      listFreeResourceItems({ pageSlug: activeSlug }),
    ]);
    setPages(pRes.items);
    setItems(iRes.items);
    if (pRes.error) setToast(pRes.error);
    else if (iRes.error) setToast(iRes.error);
    setLoading(false);
  }, [activeSlug]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 4500);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    const page = pages.find((p) => p.slug === activeSlug);
    if (page) {
      setPageId(page.id);
      setPageTitle(page.title);
      setPageSubtitle(page.subtitle || "");
      setPageBody(page.bodyMd || "");
      setPagePublished(page.published);
    } else {
      setPageId(undefined);
      setPageTitle(FREE_RESOURCE_LABELS[activeSlug]);
      setPageSubtitle("");
      setPageBody("");
      setPagePublished(false);
    }
    setEditing(null);
    setIsNew(false);
  }, [activeSlug, pages]);

  async function savePage() {
    setSavingPage(true);
    const res = await upsertFreeResourcePage({
      id: pageId,
      slug: activeSlug,
      title: pageTitle.trim() || FREE_RESOURCE_LABELS[activeSlug],
      subtitle: pageSubtitle.trim() || null,
      bodyMd: pageBody,
      published: pagePublished,
      sortOrder: (FREE_RESOURCE_SLUGS.indexOf(activeSlug) + 1) * 10,
    });
    setSavingPage(false);
    if (!res.ok) {
      setToast(res.error || "Page save failed. Run docs/free-resources-setup.sql");
      return;
    }
    setToast(pagePublished ? "Page saved and published" : "Page saved (draft)");
    await load();
  }

  function openNewItem() {
    if (!itemKind) return;
    setIsNew(true);
    setEditing({
      id: "",
      pageSlug: activeSlug,
      kind: itemKind,
      title: "",
      subtitle: null,
      bodyMd: "",
      imagePath: null,
      meta: emptyMetaFor(itemKind, activeSlug),
      featured: false,
      published: false,
      sortOrder: items.length * 10,
      deadline: null,
      externalUrl: null,
      createdAt: "",
      updatedAt: "",
    });
    setItTitle("");
    setItSubtitle("");
    setItBody("");
    setItMeta(emptyMetaFor(itemKind, activeSlug));
    setItPublished(false);
    setItFeatured(false);
    setItDeadline("");
    setItUrl("");
    setItImagePath(null);
    setItFile(null);
  }

  function openEditItem(item: FreeResourceItem) {
    setIsNew(false);
    setEditing(item);
    setItTitle(item.title);
    setItSubtitle(item.subtitle || "");
    setItBody(item.bodyMd || "");
    setItMeta({ ...emptyMetaFor(item.kind, activeSlug), ...item.meta });
    setItPublished(item.published);
    setItFeatured(item.featured);
    setItDeadline(item.deadline || "");
    setItUrl(item.externalUrl || "");
    setItImagePath(item.imagePath);
    setItFile(null);
  }

  async function saveItem() {
    if (!editing || !itemKind) return;
    setSavingItem(true);
    let imagePath = itImagePath;
    if (itFile) {
      const safe = itFile.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const path = `${activeSlug}/${Date.now()}-${safe}`;
      const up = await uploadFreeResourceFile(path, itFile);
      if (up.error) {
        setToast(up.error);
        setSavingItem(false);
        return;
      }
      imagePath = up.path || path;
    }
    const res = await upsertFreeResourceItem({
      id: isNew ? undefined : editing.id,
      pageSlug: activeSlug,
      kind: itemKind,
      title: itTitle.trim() || "Untitled",
      subtitle: itSubtitle.trim() || null,
      bodyMd: itBody,
      imagePath,
      meta: itMeta,
      featured: itFeatured,
      published: itPublished,
      sortOrder: editing.sortOrder,
      deadline: itDeadline || null,
      externalUrl: itUrl.trim() || null,
    });
    setSavingItem(false);
    if (!res.ok) {
      setToast(res.error || "Item save failed. Run docs/free-resources-setup.sql");
      return;
    }
    setToast(itPublished ? "Item published" : "Item saved as draft");
    setEditing(null);
    setIsNew(false);
    await load();
  }

  async function removeItem(id: string) {
    if (!confirm("Delete this item permanently?")) return;
    const res = await deleteFreeResourceItem(id);
    if (!res.ok) setToast(res.error || "Delete failed");
    else {
      setToast("Deleted");
      if (editing?.id === id) setEditing(null);
      await load();
    }
  }

  function setMetaField(key: string, value: unknown) {
    setItMeta((m) => ({ ...m, [key]: value }));
  }

  const addLabel =
    itemKind === "success_story"
      ? "Add story"
      : itemKind === "scholarship"
        ? "Add opportunity"
        : "Add note";

  return (
    <div className="space-y-5">
      {toast && (
        <div className="rounded-xl border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          {toast}
        </div>
      )}

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            Free resources
          </h2>
          <p className="text-sm text-wisdom-muted mt-0.5 max-w-xl">
            Stories and scholarships are full cards. University, department, campus life, and study
            technique notes only append at the end of the hard-coded guides.
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/12 text-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {FREE_RESOURCE_SLUGS.map((slug) => {
          const page = pages.find((p) => p.slug === slug);
          const isActive = activeSlug === slug;
          const noteOnly = NOTE_ONLY_SLUGS.includes(slug);
          return (
            <button
              key={slug}
              type="button"
              onClick={() => setActiveSlug(slug)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                isActive
                  ? "border-cyan-400/50 bg-cyan-500/15 text-cyan-200"
                  : "border-white/10 text-wisdom-muted hover:text-white hover:border-white/20"
              }`}
            >
              {noteOnly ? (
                <StickyNote className="w-3.5 h-3.5 text-amber-300" />
              ) : page?.published ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Circle className="w-3.5 h-3.5 opacity-50" />
              )}
              {FREE_RESOURCE_LABELS[slug]}
            </button>
          );
        })}
      </div>

      {!isNoteOnly && (
        <div className="rounded-2xl border border-white/12 bg-wisdom-card p-4 sm:p-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs uppercase tracking-wider text-wisdom-muted">
              Page settings · <code className="text-cyan-300">{activeSlug}</code>
            </p>
            <a
              href={`/academy/${activeSlug}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-cyan-300 hover:underline"
            >
              Open live page <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <label className={labelCls}>
              Page title
              <input className={inputCls} value={pageTitle} onChange={(e) => setPageTitle(e.target.value)} />
            </label>
            <label className={labelCls}>
              Subtitle
              <input
                className={inputCls}
                value={pageSubtitle}
                onChange={(e) => setPageSubtitle(e.target.value)}
                placeholder="One line under the title"
              />
            </label>
          </div>

          <label className={labelCls}>
            {activeSlug === "scholarships" ? "Tips and guidance (Markdown)" : "Intro blurb (Markdown, optional)"}
            <textarea
              className={`${inputCls} font-mono leading-relaxed`}
              rows={activeSlug === "scholarships" ? 10 : 4}
              value={pageBody}
              onChange={(e) => setPageBody(e.target.value)}
              placeholder={"## Heading\n\nYour content…"}
            />
          </label>

          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={pagePublished}
                onChange={(e) => setPagePublished(e.target.checked)}
              />
              Page published
            </label>
            <button
              type="button"
              disabled={savingPage}
              onClick={savePage}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 text-wisdom-dark text-sm font-bold disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {savingPage ? "Saving…" : "Save page"}
            </button>
          </div>
        </div>
      )}

      {isNoteOnly && (
        <div className="rounded-2xl border border-amber-400/25 bg-amber-500/5 p-4 text-sm text-wisdom-muted">
          <p className="font-semibold text-amber-200 mb-1 flex items-center gap-2">
            <StickyNote className="w-4 h-4" />
            Additive notes only
          </p>
          <p>
            Hard-coded page content stays in code. Notes you publish here appear at the end of the
            matching card or section on the live page.
          </p>
          <a
            href={`/academy/${activeSlug === "universities" ? "universities" : activeSlug}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-cyan-300 hover:underline mt-2"
          >
            Open live page <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}

      {hasItemList && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-semibold text-white">
              {itemKind === "success_story" && "Student stories"}
              {itemKind === "scholarship" && "Opportunity listings"}
              {isNoteOnly && "Published notes"}
              <span className="ml-2 text-sm font-normal text-wisdom-muted">
                {items.length} · {items.filter((i) => i.published).length} live
              </span>
            </h3>
            <button
              type="button"
              onClick={openNewItem}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 text-wisdom-dark text-sm font-bold"
            >
              <Plus className="w-4 h-4" />
              {addLabel}
            </button>
          </div>

          {loading && <p className="text-sm text-wisdom-muted py-6 text-center">Loading…</p>}

          {!loading && items.length === 0 && !editing && (
            <p className="text-center text-wisdom-muted text-sm py-10 border border-dashed border-white/15 rounded-2xl">
              No items yet. Click <strong className="text-white">Add</strong> to create the first one.
            </p>
          )}

          <ul className="space-y-2">
            {items.map((item) => {
              const uniId = String(item.meta?.universityId || "");
              const uni = universities.find((u) => u.id === uniId);
              return (
                <li
                  key={item.id}
                  className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/12 bg-wisdom-card p-3"
                >
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-white/5 border border-white/10 shrink-0 flex items-center justify-center">
                    {item.imagePath ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={freeResourcePublicUrl(item.imagePath)}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="w-5 h-5 text-wisdom-muted" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-white truncate flex items-center gap-2">
                      {item.title}
                      {item.featured && <Star className="w-3.5 h-3.5 text-amber-300" />}
                    </p>
                    <p className="text-xs text-wisdom-muted truncate">
                      {uni ? `${uni.abbr} · ${uni.name}` : item.subtitle || item.kind}
                      {item.published ? " · published" : " · draft"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => openEditItem(item)}
                    className="px-3 py-1.5 rounded-lg border border-white/12 text-xs font-semibold"
                  >
                    <Pencil className="w-3.5 h-3.5 inline" /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="px-3 py-1.5 rounded-lg border border-rose-400/30 text-xs text-rose-300"
                  >
                    <Trash2 className="w-3.5 h-3.5 inline" />
                  </button>
                </li>
              );
            })}
          </ul>

          {editing && (
            <div className="rounded-2xl border border-amber-400/30 bg-wisdom-card p-4 sm:p-5 space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-white">{isNew ? "New item" : "Edit item"}</h3>
                <button type="button" onClick={() => setEditing(null)} className="p-2">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <label className={labelCls}>
                  Title *
                  <input className={inputCls} value={itTitle} onChange={(e) => setItTitle(e.target.value)} />
                </label>
                <label className={labelCls}>
                  Subtitle
                  <input
                    className={inputCls}
                    value={itSubtitle}
                    onChange={(e) => setItSubtitle(e.target.value)}
                  />
                </label>
              </div>

              {activeSlug === "universities" && (
                <label className={labelCls}>
                  University *
                  <select
                    className={inputCls}
                    value={String(itMeta.universityId || "")}
                    onChange={(e) => setMetaField("universityId", e.target.value)}
                  >
                    <option value="">Select university…</option>
                    {universities.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.abbr} · {u.name}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              {itemKind === "success_story" && (
                <div className="grid sm:grid-cols-2 gap-3">
                  <label className={labelCls}>
                    Student name
                    <input
                      className={inputCls}
                      value={String(itMeta.studentName || "")}
                      onChange={(e) => setMetaField("studentName", e.target.value)}
                    />
                  </label>
                  <label className={labelCls}>
                    Result / score
                    <input
                      className={inputCls}
                      value={String(itMeta.result || "")}
                      onChange={(e) => setMetaField("result", e.target.value)}
                      placeholder="e.g. 600/600"
                    />
                  </label>
                  <label className={labelCls}>
                    Program
                    <input
                      className={inputCls}
                      value={String(itMeta.program || "")}
                      onChange={(e) => setMetaField("program", e.target.value)}
                    />
                  </label>
                  <label className={labelCls}>
                    Year
                    <input
                      className={inputCls}
                      value={String(itMeta.year || "")}
                      onChange={(e) => setMetaField("year", e.target.value)}
                    />
                  </label>
                  <label className={`${labelCls} sm:col-span-2`}>
                    Quote
                    <input
                      className={inputCls}
                      value={String(itMeta.quote || "")}
                      onChange={(e) => setMetaField("quote", e.target.value)}
                    />
                  </label>
                </div>
              )}

              {itemKind === "scholarship" && (
                <div className="grid sm:grid-cols-2 gap-3">
                  <label className={labelCls}>
                    Organization
                    <input
                      className={inputCls}
                      value={String(itMeta.organization || "")}
                      onChange={(e) => setMetaField("organization", e.target.value)}
                    />
                  </label>
                  <label className={labelCls}>
                    Amount
                    <input
                      className={inputCls}
                      value={String(itMeta.amount || "")}
                      onChange={(e) => setMetaField("amount", e.target.value)}
                    />
                  </label>
                  <label className={labelCls}>
                    Deadline
                    <input
                      className={inputCls}
                      type="date"
                      value={itDeadline}
                      onChange={(e) => setItDeadline(e.target.value)}
                    />
                  </label>
                  <label className={labelCls}>
                    External URL
                    <input
                      className={inputCls}
                      value={itUrl}
                      onChange={(e) => setItUrl(e.target.value)}
                      placeholder="https://…"
                    />
                  </label>
                  <label className={`${labelCls} sm:col-span-2`}>
                    Eligibility
                    <textarea
                      className={inputCls}
                      rows={2}
                      value={String(itMeta.eligibility || "")}
                      onChange={(e) => setMetaField("eligibility", e.target.value)}
                    />
                  </label>
                </div>
              )}

              <label className={labelCls}>
                {isNoteOnly ? "Note body (Markdown)" : "Full text / story (Markdown)"}
                <textarea
                  className={`${inputCls} font-mono`}
                  rows={6}
                  value={itBody}
                  onChange={(e) => setItBody(e.target.value)}
                />
              </label>

              {!isNoteOnly && (
                <label className={labelCls}>
                  Photo
                  <input
                    type="file"
                    accept="image/*"
                    className={`${inputCls} file:mr-3 file:rounded-lg file:border-0 file:bg-cyan-500/20 file:px-3 file:py-1 file:text-cyan-200`}
                    onChange={(e) => setItFile(e.target.files?.[0] || null)}
                  />
                </label>
              )}

              <div className="flex flex-wrap items-center gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={itPublished}
                    onChange={(e) => setItPublished(e.target.checked)}
                  />
                  Published
                </label>
                {!isNoteOnly && (
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={itFeatured}
                      onChange={(e) => setItFeatured(e.target.checked)}
                    />
                    Featured
                  </label>
                )}
                <button
                  type="button"
                  disabled={savingItem}
                  onClick={saveItem}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 text-wisdom-dark text-sm font-bold disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {savingItem ? "Saving…" : "Save item"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
