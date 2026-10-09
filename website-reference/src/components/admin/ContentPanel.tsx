"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ADMIN_CONTENT_TREE,
  HUB_CONTENT_DEFAULTS,
  scopeUsesAppwrite,
  type AdminNavNode,
} from "@/data/admin-nav";
import {
  listResources,
  upsertResource,
  deleteResource,
  uploadLearningFile,
  APPWRITE_PATH_PREFIX,
  type HubId,
  type LearningResource,
  type ContentType,
} from "@/lib/content";
import {
  ChevronRight,
  FolderOpen,
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  Upload,
  BookOpen,
  RefreshCw,
  Cloud,
} from "lucide-react";

type Crumb = { id: string; label: string; node: AdminNavNode };

export default function ContentPanel() {
  const [crumbs, setCrumbs] = useState<Crumb[]>([]);
  const [hub, setHub] = useState<HubId | null>(null);
  const [items, setItems] = useState<LearningResource[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");
  const [editing, setEditing] = useState<LearningResource | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [title, setTitle] = useState("");
  const [bodyMd, setBodyMd] = useState("");
  const [chapter, setChapter] = useState("");
  const [metaJson, setMetaJson] = useState("{}");
  const [published, setPublished] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [appwriteFileId, setAppwriteFileId] = useState("");
  const [saving, setSaving] = useState(false);

  const current = crumbs[crumbs.length - 1]?.node;
  const scopePath = current?.scopePath;
  const packageId = current?.packageId || "freshman";
  const onAppwrite = scopeUsesAppwrite(scopePath);

  const hubIds = [
    "books",
    "short-notes",
    "videos",
    "flashcards",
    "question-banks",
    "exams",
    "life-savers",
  ];
  const isOnHub =
    Boolean(scopePath) && hubIds.includes(current?.id || "") && Boolean(hub);

  const loadItems = useCallback(async () => {
    if (!scopePath || !hub) return;
    setLoading(true);
    const res = await listResources({ scopePath, hub, skipAuthCheck: true });
    setItems(res.items);
    if (res.error) setToast(res.error);
    setLoading(false);
  }, [scopePath, hub]);

  useEffect(() => {
    if (isOnHub) void loadItems();
  }, [isOnHub, loadItems]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 8000);
    return () => clearTimeout(t);
  }, [toast]);

  function enter(node: AdminNavNode) {
    setCrumbs((c) => [...c, { id: node.id, label: node.label, node }]);
    if (hubIds.includes(node.id)) {
      setHub(node.id as HubId);
    } else {
      setHub(null);
      setItems([]);
    }
    setEditing(null);
  }

  function goTo(index: number) {
    setCrumbs((c) => c.slice(0, index + 1));
    const node = crumbs[index]?.node;
    if (node && hubIds.includes(node.id)) setHub(node.id as HubId);
    else {
      setHub(null);
      setItems([]);
    }
    setEditing(null);
  }

  function resetRoot() {
    setCrumbs([]);
    setHub(null);
    setItems([]);
    setEditing(null);
  }

  function openNew() {
    if (!hub || !scopePath) return;
    const def = HUB_CONTENT_DEFAULTS[hub];
    setIsNew(true);
    setEditing({
      id: "",
      packageId,
      scopePath,
      hub,
      title: "",
      chapter: null,
      sortOrder: items.length * 10,
      contentType: (def?.contentType || "markdown") as ContentType,
      storagePath: null,
      bodyMd: "",
      meta: {},
      published: false,
    });
    setTitle("");
    setBodyMd("");
    setChapter("");
    setMetaJson(
      hub === "flashcards"
        ? JSON.stringify({ cards: [{ front: "Term", back: "Definition" }] }, null, 2)
        : hub === "question-banks" || hub === "exams"
          ? JSON.stringify(
              {
                durationMin: hub === "exams" ? 60 : undefined,
                questions: [
                  {
                    prompt: "Sample question?",
                    choices: ["A", "B", "C", "D"],
                    correct: 0,
                    solution: "Explanation…",
                  },
                ],
              },
              null,
              2
            )
          : "{}"
    );
    setPublished(false);
    setFile(null);
    setAppwriteFileId("");
  }

  function openEdit(item: LearningResource) {
    setIsNew(false);
    setEditing(item);
    setTitle(item.title);
    setBodyMd(item.bodyMd || "");
    setChapter(item.chapter != null ? String(item.chapter) : "");
    setMetaJson(JSON.stringify(item.meta || {}, null, 2));
    setPublished(item.published);
    setFile(null);
    const existingId =
      item.storagePath?.startsWith(APPWRITE_PATH_PREFIX)
        ? item.storagePath.slice(APPWRITE_PATH_PREFIX.length)
        : "";
    setAppwriteFileId(existingId);
  }

  async function save() {
    if (!editing || !hub || !scopePath) return;
    setSaving(true);
    let storagePath = editing.storagePath;

    // Prefer pasted Appwrite file ID (for large textbooks)
    const pastedId = appwriteFileId.trim();
    if (onAppwrite && pastedId) {
      storagePath = `${APPWRITE_PATH_PREFIX}${pastedId}`;
    } else if (file) {
      const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const path = `${scopePath}/${hub}/${Date.now()}-${safe}`;
      const up = await uploadLearningFile(path, file, { scopePath });
      if (up.error) {
        setToast(up.error);
        setSaving(false);
        return;
      }
      storagePath = up.path || path;
    }

    let meta: Record<string, unknown> = {};
    try {
      meta = JSON.parse(metaJson || "{}");
    } catch {
      setToast("Meta JSON is invalid");
      setSaving(false);
      return;
    }
    const def = HUB_CONTENT_DEFAULTS[hub];
    const res = await upsertResource({
      id: isNew ? undefined : editing.id,
      packageId,
      scopePath,
      hub,
      title: title.trim() || "Untitled",
      chapter: chapter ? Number(chapter) : null,
      sortOrder: editing.sortOrder,
      contentType: (def?.contentType || editing.contentType) as ContentType,
      storagePath,
      bodyMd: bodyMd || null,
      meta,
      published,
    });
    setSaving(false);
    if (!res.ok) {
      setToast(res.error || "Save failed: run learning-content-setup.sql?");
      return;
    }
    setToast(
      published
        ? onAppwrite
          ? "Saved & published (Appwrite)"
          : "Saved & published"
        : onAppwrite
          ? "Saved draft (Appwrite)"
          : "Saved (draft)"
    );
    setEditing(null);
    loadItems();
  }

  async function remove(id: string) {
    if (!confirm("Delete this content item?")) return;
    const res = await deleteResource(id);
    if (!res.ok) setToast(res.error || "Delete failed");
    else {
      setToast("Deleted");
      loadItems();
    }
  }

  const listNodes =
    crumbs.length === 0 ? ADMIN_CONTENT_TREE : current?.children || [];

  return (
    <div className="space-y-4">
      {toast && (
        <div className="rounded-xl border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200 whitespace-pre-wrap">
          {toast}
        </div>
      )}

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            Content library
          </h2>
          <p className="text-sm text-wisdom-muted mt-0.5">
            All package PDFs/files → Appwrite · catalog & auth stay on Supabase
          </p>
        </div>
        {isOnHub && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={loadItems}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/12 text-sm"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <button
              type="button"
              onClick={openNew}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 text-wisdom-dark text-sm font-bold"
            >
              <Plus className="w-4 h-4" />
              Add item
            </button>
          </div>
        )}
      </div>

      <nav className="flex flex-wrap items-center gap-1 text-sm">
        <button
          type="button"
          onClick={resetRoot}
          className="text-amber-300 hover:underline font-medium"
        >
          Academy
        </button>
        {crumbs.map((c, i) => (
          <span key={c.id + i} className="flex items-center gap-1">
            <ChevronRight className="w-3.5 h-3.5 text-wisdom-muted" />
            <button
              type="button"
              onClick={() => goTo(i)}
              className={
                i === crumbs.length - 1
                  ? "text-white font-semibold"
                  : "text-cyan-300 hover:underline"
              }
            >
              {c.label}
            </button>
          </span>
        ))}
      </nav>

      {isOnHub && onAppwrite && (
        <div className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-400/30 bg-cyan-500/10 px-2.5 py-1 text-xs text-cyan-200">
          <Cloud className="w-3.5 h-3.5" />
          Files upload to Appwrite · large PDFs: paste File ID
        </div>
      )}

      {!isOnHub && (
        <ul className="grid sm:grid-cols-2 gap-2">
          {listNodes.map((node) => (
            <li key={node.id}>
              <button
                type="button"
                onClick={() => enter(node)}
                className="w-full flex items-center gap-3 rounded-2xl border border-white/12 bg-wisdom-card px-4 py-3.5 text-left hover:border-amber-400/40 transition-colors"
              >
                <FolderOpen className="w-5 h-5 text-amber-400 shrink-0" />
                <span className="flex-1 font-semibold text-white">{node.label}</span>
                {node.useAppwrite && (
                  <span className="text-[10px] uppercase tracking-wide text-cyan-300/80">
                    Appwrite
                  </span>
                )}
                <ChevronRight className="w-4 h-4 text-wisdom-muted" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {isOnHub && (
        <div className="space-y-3">
          <p className="text-xs text-wisdom-muted">
            Scope <code className="text-cyan-300">{scopePath}</code> · hub{" "}
            <code className="text-cyan-300">{hub}</code>
            {" · "}
            {HUB_CONTENT_DEFAULTS[hub || ""]?.hint}
          </p>

          {editing && (
            <div className="rounded-2xl border border-amber-400/30 bg-wisdom-card p-4 space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">{isNew ? "New item" : "Edit item"}</h3>
                <button type="button" onClick={() => setEditing(null)} className="p-2">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <label className="block text-xs text-wisdom-muted">
                Title
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/15 bg-wisdom-dark/50 px-3 py-2 text-sm text-white"
                />
              </label>
              <label className="block text-xs text-wisdom-muted">
                Chapter # (optional)
                <input
                  value={chapter}
                  onChange={(e) => setChapter(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/15 bg-wisdom-dark/50 px-3 py-2 text-sm text-white"
                />
              </label>
              {(hub === "books" || hub === "life-savers" || hub === "videos") && (
                <>
                  <label className="block text-xs text-wisdom-muted">
                    {hub === "books" || hub === "life-savers" ? "PDF file" : "Optional file"}
                    {onAppwrite && (
                      <span className="ml-1 text-cyan-300">(Appwrite · max ~4 MB via site)</span>
                    )}
                    <div className="mt-1 flex items-center gap-2">
                      <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-white/20 cursor-pointer text-sm">
                        <Upload className="w-4 h-4" />
                        {file ? file.name : "Choose file"}
                        <input
                          type="file"
                          accept={hub === "books" || hub === "life-savers" ? "application/pdf" : "*/*"}
                          className="hidden"
                          onChange={(e) => setFile(e.target.files?.[0] || null)}
                        />
                      </label>
                    </div>
                  </label>
                  {onAppwrite && (
                    <label className="block text-xs text-wisdom-muted">
                      Appwrite File ID {hub === "life-savers" ? "(for Life Saver PDFs)" : "(for large textbooks)"}
                      <input
                        value={appwriteFileId}
                        onChange={(e) => setAppwriteFileId(e.target.value)}
                        placeholder="Paste file ID from Appwrite Console"
                        className="mt-1 w-full rounded-xl border border-white/15 bg-wisdom-dark/50 px-3 py-2 text-sm text-white font-mono"
                      />
                      <span className="mt-1 block text-[11px] text-wisdom-muted leading-relaxed">
                        Upload the PDF in Appwrite → Storage → your bucket → Create file, then copy the
                        File ID here. Skips the 4 MB site limit.
                      </span>
                    </label>
                  )}
                </>
              )}
              {(hub === "short-notes" || hub === "videos") && (
                <label className="block text-xs text-wisdom-muted">
                  {hub === "videos" ? "Video URL (or notes)" : "Short notes (Markdown)"}
                  <textarea
                    value={bodyMd}
                    onChange={(e) => setBodyMd(e.target.value)}
                    rows={8}
                    className="mt-1 w-full rounded-xl border border-white/15 bg-wisdom-dark/50 px-3 py-2 text-sm text-white font-mono"
                    placeholder={
                      hub === "videos"
                        ? "https://youtube.com/..."
                        : "## Topic\n\nYour short notes…"
                    }
                  />
                </label>
              )}
              {(hub === "flashcards" ||
                hub === "question-banks" ||
                hub === "exams") && (
                <label className="block text-xs text-wisdom-muted">
                  Content JSON (meta)
                  <textarea
                    value={metaJson}
                    onChange={(e) => setMetaJson(e.target.value)}
                    rows={10}
                    className="mt-1 w-full rounded-xl border border-white/15 bg-wisdom-dark/50 px-3 py-2 text-sm text-white font-mono"
                  />
                </label>
              )}
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                />
                Published (visible to students who own the package)
              </label>
              <button
                type="button"
                disabled={saving}
                onClick={save}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-wisdom-dark text-sm font-bold disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          )}

          {loading && <p className="text-wisdom-muted text-sm py-6 text-center">Loading…</p>}
          {!loading && items.length === 0 && !editing && (
            <p className="text-center text-wisdom-muted text-sm py-10 border border-dashed border-white/15 rounded-2xl">
              No items yet. Click <strong className="text-white">Add item</strong>.
            </p>
          )}
          <ul className="space-y-2">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/12 bg-wisdom-card p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-white truncate">{item.title}</p>
                  <p className="text-xs text-wisdom-muted">
                    {item.contentType}
                    {item.chapter != null ? ` · ch ${item.chapter}` : ""}
                    {item.published ? " · published" : " · draft"}
                    {item.storagePath?.startsWith("appwrite:") ? " · Appwrite" : ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => openEdit(item)}
                  className="px-3 py-1.5 rounded-lg border border-white/12 text-xs font-semibold"
                >
                  <Pencil className="w-3.5 h-3.5 inline" /> Edit
                </button>
                <button
                  type="button"
                  onClick={() => remove(item.id)}
                  className="px-3 py-1.5 rounded-lg border border-rose-400/30 text-xs text-rose-300"
                >
                  <Trash2 className="w-3.5 h-3.5 inline" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
