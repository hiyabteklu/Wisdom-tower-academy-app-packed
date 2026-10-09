"use client";

import { useCallback, useEffect, useState } from "react";
import {
  listAllCatalogForAdmin,
  upsertCatalogItem,
  deleteCatalogItem,
  seedCatalogFromStatic,
  packageToInput,
  type CatalogRow,
  type CatalogInput,
} from "@/lib/catalog";
import { academyPackages, formatEtb } from "@/data/packages";
import {
  Package,
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  Save,
  X,
  Database,
} from "lucide-react";

const EMPTY: CatalogInput = {
  id: "",
  name: "",
  shortName: "",
  description: "",
  priceEtb: 250,
  href: "/packages",
  image: "",
  includes: [""],
  enrolledLabel: "",
  group: "custom",
  active: true,
  sortOrder: 200,
};

function rowToInput(row: CatalogRow): CatalogInput {
  return {
    id: row.id,
    name: row.name,
    shortName: row.short_name,
    description: row.description,
    priceEtb: Number(row.price_etb),
    href: row.href,
    image: row.image,
    includes: row.includes?.length ? row.includes : [""],
    enrolledLabel: row.enrolled_label,
    group: row.group_key,
    active: row.active,
    sortOrder: row.sort_order,
  };
}

export default function CatalogPanel() {
  const [rows, setRows] = useState<CatalogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<CatalogInput | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const res = await listAllCatalogForAdmin();
    if (res.error) {
      setError(
        res.error.includes("relation") || res.error.includes("does not exist")
          ? "Table missing: run docs/catalog-setup.sql in Supabase SQL Editor."
          : res.error
      );
      setRows([]);
    } else {
      setRows(res.rows);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  function openNew() {
    setIsNew(true);
    setEditing({ ...EMPTY, id: `custom-${Date.now().toString(36)}` });
  }

  function openEdit(row: CatalogRow) {
    setIsNew(false);
    setEditing(rowToInput(row));
  }

  function setField<K extends keyof CatalogInput>(key: K, value: CatalogInput[K]) {
    setEditing((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  async function save() {
    if (!editing) return;
    setSaving(true);
    const res = await upsertCatalogItem({
      ...editing,
      includes: editing.includes.map((s) => s.trim()).filter(Boolean),
    });
    setSaving(false);
    if (!res.ok) {
      setError(res.error || "Save failed");
      return;
    }
    setToast(isNew ? "Package created" : "Package updated");
    setEditing(null);
    await load();
  }

  async function remove(id: string) {
    if (!confirm(`Delete package ${id}?`)) return;
    setBusyId(id);
    const res = await deleteCatalogItem(id);
    setBusyId("");
    if (!res.ok) {
      setError(res.error || "Delete failed");
      return;
    }
    setToast("Deleted");
    await load();
  }

  async function seed() {
    setBusyId("seed");
    const res = await seedCatalogFromStatic();
    setBusyId("");
    if (!res.ok) {
      setError(res.error || "Seed failed");
      return;
    }
    setToast(res.error || `Seeded ${res.count} packages from static list`);
    await load();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-amber-400" />
            Package catalog
          </h2>
          <p className="text-xs text-wisdom-muted mt-1">
            Prices and About text shown on /packages and offer banners. Default new price: 250 ETB.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={load}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 px-3 py-2 text-xs font-semibold text-white/80 hover:border-cyan-400/40"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
          <button
            type="button"
            onClick={seed}
            disabled={busyId === "seed"}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 px-3 py-2 text-xs font-semibold text-white/80 hover:border-amber-400/40"
          >
            <Database className="w-3.5 h-3.5" />
            Seed from static
          </button>
          <button
            type="button"
            onClick={openNew}
            className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-3 py-2 text-xs font-bold text-wisdom-dark"
          >
            <Plus className="w-3.5 h-3.5" />
            Add package
          </button>
        </div>
      </div>

      {toast && (
        <p className="text-sm text-emerald-300 border border-emerald-400/30 rounded-xl px-3 py-2">{toast}</p>
      )}
      {error && (
        <p className="text-sm text-rose-300 border border-rose-400/30 rounded-xl px-3 py-2">{error}</p>
      )}

      {editing && (
        <div className="rounded-2xl border border-amber-400/30 bg-wisdom-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-white">{isNew ? "New package" : "Edit package"}</p>
            <button type="button" onClick={() => setEditing(null)} className="text-wisdom-muted hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <label className="block text-xs text-wisdom-muted">
              ID
              <input
                value={editing.id}
                onChange={(e) => setField("id", e.target.value)}
                disabled={!isNew}
                className="mt-1 w-full rounded-xl border border-white/15 bg-wisdom-dark/50 px-3 py-2 text-sm text-white disabled:opacity-60"
              />
            </label>
            <label className="block text-xs text-wisdom-muted">
              Price (ETB)
              <input
                type="number"
                value={editing.priceEtb}
                onChange={(e) => setField("priceEtb", Number(e.target.value) || 0)}
                className="mt-1 w-full rounded-xl border border-white/15 bg-wisdom-dark/50 px-3 py-2 text-sm text-white"
              />
            </label>
            <label className="block text-xs text-wisdom-muted sm:col-span-2">
              Name
              <input
                value={editing.name}
                onChange={(e) => setField("name", e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/15 bg-wisdom-dark/50 px-3 py-2 text-sm text-white"
              />
            </label>
            <label className="block text-xs text-wisdom-muted">
              Short name
              <input
                value={editing.shortName}
                onChange={(e) => setField("shortName", e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/15 bg-wisdom-dark/50 px-3 py-2 text-sm text-white"
              />
            </label>
            <label className="block text-xs text-wisdom-muted">
              Group
              <select
                value={editing.group}
                onChange={(e) =>
                  setField("group", e.target.value as CatalogInput["group"])
                }
                className="mt-1 w-full rounded-xl border border-white/15 bg-wisdom-dark/50 px-3 py-2 text-sm text-white"
              >
                <option value="grades">grades</option>
                <option value="branch">branch</option>
                <option value="special">special</option>
                <option value="custom">custom</option>
              </select>
            </label>
            <label className="block text-xs text-wisdom-muted sm:col-span-2">
              About this package (shown to buyers)
              <textarea
                value={editing.description}
                onChange={(e) => setField("description", e.target.value)}
                rows={6}
                placeholder="What students get, who it is for, and what is included..."
                className="mt-1 w-full rounded-xl border border-white/15 bg-wisdom-dark/50 px-3 py-2 text-sm text-white resize-y min-h-[6rem]"
              />
            </label>
            <label className="block text-xs text-wisdom-muted">
              Preview href
              <input
                value={editing.href}
                onChange={(e) => setField("href", e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/15 bg-wisdom-dark/50 px-3 py-2 text-sm text-white"
                placeholder="/academy/freshman"
              />
            </label>
            <label className="block text-xs text-wisdom-muted">
              Image URL
              <input
                value={editing.image}
                onChange={(e) => setField("image", e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/15 bg-wisdom-dark/50 px-3 py-2 text-sm text-white"
              />
            </label>
            <label className="block text-xs text-wisdom-muted sm:col-span-2">
              Includes (one per line)
              <textarea
                value={editing.includes.join("\n")}
                onChange={(e) => setField("includes", e.target.value.split("\n"))}
                rows={4}
                className="mt-1 w-full rounded-xl border border-white/15 bg-wisdom-dark/50 px-3 py-2 text-sm text-white"
              />
            </label>
            <label className="block text-xs text-wisdom-muted">
              Enrolled label
              <input
                value={editing.enrolledLabel}
                onChange={(e) => setField("enrolledLabel", e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/15 bg-wisdom-dark/50 px-3 py-2 text-sm text-white"
              />
            </label>
            <label className="block text-xs text-wisdom-muted">
              Sort order
              <input
                type="number"
                value={editing.sortOrder}
                onChange={(e) => setField("sortOrder", Number(e.target.value) || 0)}
                className="mt-1 w-full rounded-xl border border-white/15 bg-wisdom-dark/50 px-3 py-2 text-sm text-white"
              />
            </label>
            <label className="flex items-center gap-2 text-sm text-white mt-6">
              <input
                type="checkbox"
                checked={editing.active}
                onChange={(e) => setField("active", e.target.checked)}
              />
              Active (sellable)
            </label>
          </div>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-wisdom-dark disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving…" : "Save package"}
          </button>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-wisdom-muted">Loading catalog…</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-wisdom-muted">
          No catalog rows yet. Seed from static packages or add one.
        </p>
      ) : (
        <ul className="space-y-2">
          {rows.map((row) => (
            <li
              key={row.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-wisdom-card/80 px-4 py-3"
            >
              <div className="min-w-0">
                <p className="font-semibold text-white truncate">
                  {row.name}{" "}
                  <span className="text-xs text-wisdom-muted font-normal">({row.id})</span>
                </p>
                <p className="text-xs text-amber-300 font-bold">{formatEtb(Number(row.price_etb))}</p>
                {row.description && (
                  <p className="text-xs text-wisdom-muted mt-1 line-clamp-2">{row.description}</p>
                )}
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => openEdit(row)}
                  className="p-2 rounded-lg border border-white/10 text-cyan-300 hover:border-cyan-400/40"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => remove(row.id)}
                  disabled={busyId === row.id}
                  className="p-2 rounded-lg border border-white/10 text-rose-300 hover:border-rose-400/40"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className="text-[11px] text-wisdom-muted">
        Static fallback list has {academyPackages.length} packages. DB rows override prices when
        present.
      </p>
    </div>
  );
}
