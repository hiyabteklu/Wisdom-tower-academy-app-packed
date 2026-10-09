"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  listProfiles,
  getStudentDetail,
  downloadCsv,
  type ProfileRow,
} from "@/lib/admin-data";
import {
  grantAccess,
  grantAllPackages,
  ALL_PACKAGES_ID,
} from "@/lib/access-grants";
import { academyPackages, formatEtb } from "@/data/packages";
import BrandLoader from "@/components/BrandLoader";
import {
  Users,
  Search,
  Filter,
  Download,
  Mail,
  Phone,
  GraduationCap,
  Building2,
  MapPin,
  Calendar,
  KeyRound,
  CheckCircle2,
  X,
  Copy,
  Check,
  RefreshCw,
  Award,
  BookOpen,
  ArrowRight,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";

type Props = {
  adminEmail?: string;
};

export default function UsersPanel({ adminEmail = "admin@wisdomtower.tech" }: Props) {
  const [users, setUsers] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [streamFilter, setStreamFilter] = useState<string>("all");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [toast, setToast] = useState("");

  // Inspect Student Modal State
  const [inspectStudent, setInspectStudent] = useState<ProfileRow | null>(null);
  const [inspectDetail, setInspectDetail] = useState<{
    academicResults: Record<string, unknown>[];
    enrollments: Record<string, unknown>[];
    accessGrants: Record<string, unknown>[];
    orders: Record<string, unknown>[];
  } | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Quick Grant Modal State
  const [grantModalUser, setGrantModalUser] = useState<ProfileRow | null>(null);
  const [selectedPackageId, setSelectedPackageId] = useState<string>(ALL_PACKAGES_ID);
  const [grantNote, setGrantNote] = useState("Direct scholar grant");
  const [grantBusy, setGrantBusy] = useState(false);

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await listProfiles();
    setUsers(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  // Load detailed history when inspecting student
  useEffect(() => {
    if (!inspectStudent) {
      setInspectDetail(null);
      return;
    }
    let cancelled = false;
    setLoadingDetail(true);
    getStudentDetail(inspectStudent.id, inspectStudent.email).then((detail) => {
      if (!cancelled) {
        setInspectDetail(detail);
        setLoadingDetail(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [inspectStudent]);

  const handleCopy = (text: string, id: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleExportCsv = () => {
    if (users.length === 0) return;
    const headers = [
      "Student ID",
      "Full Name",
      "Email",
      "Phone",
      "School Name",
      "Town/Region",
      "Stream",
      "Education Level",
      "Target Exam",
      "Joined Date",
    ];
    const rows = users.map((u) => [
      u.student_id_number || "WTA-UNASSIGNED",
      u.full_name || "Scholar",
      u.email || "",
      u.phone || "",
      u.school_name || "",
      u.town_region || "",
      u.stream || "",
      u.education_level || "",
      u.target_exam || "",
      u.created_at ? new Date(u.created_at).toLocaleDateString() : "",
    ]);
    downloadCsv(`wisdom_tower_scholars_${new Date().toISOString().slice(0, 10)}`, headers, rows);
  };

  const handleExecuteGrant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grantModalUser?.email) {
      setToast("User has no email associated with account");
      return;
    }
    setGrantBusy(true);

    if (selectedPackageId === ALL_PACKAGES_ID) {
      const res = await grantAllPackages({
        email: grantModalUser.email,
        grantedBy: adminEmail,
        note: grantNote || "Direct Admin Grant",
      });
      setGrantBusy(false);
      if (res.ok) {
        setToast(`Granted full platform pass to ${grantModalUser.email} (${res.count} packages)`);
        setGrantModalUser(null);
      } else {
        setToast(res.error || "Failed to grant all packages");
      }
    } else {
      const pkg = academyPackages.find((p) => p.id === selectedPackageId);
      const res = await grantAccess({
        email: grantModalUser.email,
        packageId: selectedPackageId,
        grantedBy: adminEmail,
        note: grantNote || "Direct Admin Grant",
      });
      setGrantBusy(false);
      if (res.ok) {
        setToast(`Granted ${pkg?.name || selectedPackageId} to ${grantModalUser.email}`);
        setGrantModalUser(null);
      } else {
        setToast(res.error || "Failed to grant package");
      }
    }
  };

  // Filtered scholars list
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // Search matching
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        (u.full_name || "").toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q) ||
        (u.student_id_number || "").toLowerCase().includes(q) ||
        (u.school_name || "").toLowerCase().includes(q) ||
        (u.town_region || "").toLowerCase().includes(q);

      // Stream matching
      const streamVal = (u.stream || "").toLowerCase();
      let matchStream = true;
      if (streamFilter === "natural") {
        matchStream = streamVal.includes("nat");
      } else if (streamFilter === "social") {
        matchStream = streamVal.includes("soc");
      }

      // Level matching
      let matchLevel = true;
      if (levelFilter !== "all") {
        matchLevel = (u.education_level || "").toLowerCase() === levelFilter.toLowerCase();
      }

      return matchSearch && matchStream && matchLevel;
    });
  }, [users, searchQuery, streamFilter, levelFilter]);

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-2xl border border-cyan-400/40 bg-wisdom-card p-4 text-sm font-semibold text-cyan-300 shadow-2xl animate-fade-in flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-cyan-400" />
          {toast}
        </div>
      )}

      {/* Header and Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/8 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-400" />
            Scholar Directory & User Management
          </h2>
          <p className="text-xs sm:text-sm text-wisdom-muted mt-0.5">
            Registered students, digital matriculation records, school demographics, and direct access controls
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={users.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-white/12 text-sm font-semibold text-white/90 hover:bg-white/5 disabled:opacity-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV ({users.length})
          </button>
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600/20 text-purple-300 border border-purple-400/30 text-sm font-semibold hover:bg-purple-600/30 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Search and Filters Strip */}
      <div className="flex flex-wrap items-center gap-3 bg-wisdom-card/60 p-3.5 rounded-2xl border border-white/8">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-wisdom-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, student ID (WTA-...), school, or town..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-wisdom-dark border border-white/10 text-sm text-white placeholder-wisdom-muted focus:outline-none focus:border-purple-400 transition-colors"
          />
        </div>

        {/* Stream Filter */}
        <select
          value={streamFilter}
          onChange={(e) => setStreamFilter(e.target.value)}
          className="px-3.5 py-2 rounded-xl bg-wisdom-dark border border-white/10 text-xs font-semibold text-white focus:outline-none focus:border-purple-400"
        >
          <option value="all">All Academic Streams</option>
          <option value="natural">Natural Science</option>
          <option value="social">Social Science</option>
        </select>

        {/* Level Filter */}
        <select
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value)}
          className="px-3.5 py-2 rounded-xl bg-wisdom-dark border border-white/10 text-xs font-semibold text-white focus:outline-none focus:border-purple-400"
        >
          <option value="all">All Education Levels</option>
          <option value="grade-12">Grade 12</option>
          <option value="grade-11">Grade 11</option>
          <option value="freshman">University Freshman</option>
          <option value="remedial">Remedial</option>
        </select>

        <span className="text-xs text-wisdom-muted tabular-nums ml-auto shrink-0">
          Showing {filteredUsers.length} of {users.length}
        </span>
      </div>

      {/* Scholars List */}
      {loading && users.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <BrandLoader size="md" label="Loading scholars directory..." />
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 p-12 text-center text-wisdom-muted">
          <Users className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="font-medium text-white mb-1">No matching scholars found</p>
          <p className="text-sm">Try adjusting your search criteria or stream filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredUsers.map((u) => (
            <div
              key={u.id}
              className="rounded-2xl border border-white/10 bg-wisdom-card p-4 sm:p-5 flex flex-col justify-between hover:border-purple-400/30 transition-all group"
            >
              <div>
                {/* Top Row: Avatar, Name, Student ID */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-purple-400/30 overflow-hidden flex items-center justify-center font-bold text-sm text-purple-300 shrink-0">
                      {u.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={u.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        (u.full_name || u.email || "S").slice(0, 2).toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-white text-base truncate group-hover:text-purple-200 transition-colors">
                        {u.full_name || "Scholar Scholar"}
                      </h4>
                      <p className="text-xs text-wisdom-muted truncate flex items-center gap-1">
                        <Mail className="w-3 h-3 shrink-0" />
                        {u.email || "No email"}
                      </p>
                    </div>
                  </div>

                  {u.student_id_number && (
                    <button
                      type="button"
                      onClick={() => handleCopy(u.student_id_number!, `id-${u.id}`)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold bg-purple-500/15 text-purple-300 border border-purple-400/30 hover:bg-purple-500/25 shrink-0 transition-colors"
                      title="Copy Student ID"
                    >
                      {copiedId === `id-${u.id}` ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <span>{u.student_id_number}</span>
                          <Copy className="w-3 h-3 opacity-60" />
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Secondary Academic Details */}
                <div className="grid grid-cols-2 gap-2 text-xs text-wisdom-muted py-2.5 border-t border-b border-white/6 mb-3">
                  <div className="truncate flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-cyan-400/70 shrink-0" />
                    <span className="truncate">{u.school_name || "School: Not specified"}</span>
                  </div>
                  <div className="truncate flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-400/70 shrink-0" />
                    <span className="truncate">{u.town_region || "Region: Not set"}</span>
                  </div>
                  <div className="truncate flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-purple-400/70 shrink-0" />
                    <span className="truncate">{u.stream || "General Stream"}</span>
                  </div>
                  <div className="truncate flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-wisdom-muted/70 shrink-0" />
                    <span>Joined {new Date(u.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Quick Controls */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setInspectStudent(u)}
                  className="text-xs font-semibold text-wisdom-muted hover:text-white inline-flex items-center gap-1 py-1 px-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                  Inspect History & Scores
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setGrantModalUser(u);
                    setSelectedPackageId(ALL_PACKAGES_ID);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-400/40 hover:bg-purple-500/30 transition-colors"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  Grant Package
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: INSPECT STUDENT MODAL                            */}
      {/* ========================================================= */}
      {inspectStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/15 bg-wisdom-card p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/8 pb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-purple-300">
                  Student Scholar Profile
                </p>
                <h3 className="text-xl font-bold text-white mt-0.5">
                  {inspectStudent.full_name || "Scholar Scholar"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setInspectStudent(null)}
                className="p-2 rounded-xl text-wisdom-muted hover:text-white hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Profile Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-white/[0.03] border border-white/8 text-xs">
              <div>
                <p className="text-wisdom-muted">Student ID</p>
                <p className="font-mono font-bold text-cyan-300 text-sm mt-0.5">
                  {inspectStudent.student_id_number || "WTA-01042"}
                </p>
              </div>
              <div>
                <p className="text-wisdom-muted">Email</p>
                <p className="font-semibold text-white mt-0.5 truncate">{inspectStudent.email || "-"}</p>
              </div>
              <div>
                <p className="text-wisdom-muted">Phone</p>
                <p className="font-semibold text-white mt-0.5">{inspectStudent.phone || "-"}</p>
              </div>
              <div>
                <p className="text-wisdom-muted">School</p>
                <p className="font-semibold text-white mt-0.5">{inspectStudent.school_name || "-"}</p>
              </div>
              <div>
                <p className="text-wisdom-muted">Stream</p>
                <p className="font-semibold text-white mt-0.5">{inspectStudent.stream || "-"}</p>
              </div>
              <div>
                <p className="text-wisdom-muted">Town / Region</p>
                <p className="font-semibold text-white mt-0.5">{inspectStudent.town_region || "-"}</p>
              </div>
            </div>

            {loadingDetail ? (
              <div className="py-12 flex justify-center">
                <BrandLoader size="sm" label="Fetching academic history & enrollments..." />
              </div>
            ) : (
              <div className="space-y-4">
                {/* Active Enrollments & Grants */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-wisdom-muted mb-2 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-purple-400" />
                    Unlocked Packages & Access Grants (
                    {(inspectDetail?.enrollments.length || 0) + (inspectDetail?.accessGrants.length || 0)})
                  </h4>
                  {(inspectDetail?.enrollments.length || 0) === 0 &&
                  (inspectDetail?.accessGrants.length || 0) === 0 ? (
                    <p className="text-xs text-wisdom-muted p-3 rounded-xl border border-white/6 bg-white/[0.02]">
                      No active packages unlocked yet.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {inspectDetail?.enrollments.map((enr, i) => (
                        <span
                          key={`enr-${i}`}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-400/30"
                        >
                          {String(enr.package_name || enr.package_id)} (Verified Order)
                        </span>
                      ))}
                      {inspectDetail?.accessGrants.map((grant, i) => (
                        <span
                          key={`grant-${i}`}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-500/15 text-purple-300 border border-purple-400/30"
                        >
                          {String(grant.package_name || grant.package_id)} (Manual Grant)
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Academic Results History */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-wisdom-muted mb-2 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-cyan-400" />
                    Recent Test & Examination Scores ({inspectDetail?.academicResults.length || 0})
                  </h4>
                  {(inspectDetail?.academicResults.length || 0) === 0 ? (
                    <p className="text-xs text-wisdom-muted p-3 rounded-xl border border-white/6 bg-white/[0.02]">
                      No recorded quiz or test submissions yet.
                    </p>
                  ) : (
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {inspectDetail?.academicResults.map((r, i) => (
                        <div
                          key={`score-${i}`}
                          className="flex items-center justify-between p-2.5 rounded-xl border border-white/6 bg-white/[0.02] text-xs"
                        >
                          <div>
                            <span className="font-semibold text-white">{String(r.title || r.scope_id)}</span>
                            <span className="text-wisdom-muted ml-2">
                              {r.created_at ? new Date(String(r.created_at)).toLocaleDateString() : ""}
                            </span>
                          </div>
                          <span className="font-bold text-cyan-300 tabular-nums">
                            {String(r.correct)}/{String(r.total)} ({String(r.percent)}%)
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-white/8 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setInspectStudent(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-wisdom-muted hover:text-white"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const u = inspectStudent;
                  setInspectStudent(null);
                  setGrantModalUser(u);
                  setSelectedPackageId(ALL_PACKAGES_ID);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-500 text-white hover:bg-purple-400 transition-colors"
              >
                Grant New Package
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: DIRECT QUICK GRANT MODAL                         */}
      {/* ========================================================= */}
      {grantModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg rounded-3xl border border-white/15 bg-wisdom-card p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/8 pb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-purple-300">
                  Direct Scholar Access Grant
                </p>
                <h3 className="text-xl font-bold text-white mt-0.5">
                  Unlock Materials for {grantModalUser.full_name || grantModalUser.email}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setGrantModalUser(null)}
                className="p-2 rounded-xl text-wisdom-muted hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteGrant} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-wisdom-muted mb-1.5">
                  Recipient Scholar
                </label>
                <input
                  type="text"
                  disabled
                  value={`${grantModalUser.full_name || "Scholar"} (${grantModalUser.email || "No email"})`}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-wisdom-dark border border-white/10 text-white font-medium opacity-80"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-wisdom-muted mb-1.5">
                  Package to Unlock
                </label>
                <select
                  value={selectedPackageId}
                  onChange={(e) => setSelectedPackageId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-wisdom-dark border border-white/10 text-white font-semibold focus:outline-none focus:border-purple-400"
                >
                  <option value={ALL_PACKAGES_ID}>★ All Packages (Full Academy Access)</option>
                  {academyPackages.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({formatEtb(p.priceEtb)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-wisdom-muted mb-1.5">
                  Administrative Note
                </label>
                <input
                  type="text"
                  value={grantNote}
                  onChange={(e) => setGrantNote(e.target.value)}
                  placeholder="e.g. Scholarship award, beta tester, payment verified"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-wisdom-dark border border-white/10 text-white placeholder-wisdom-muted focus:outline-none focus:border-purple-400"
                />
              </div>

              <div className="pt-3 border-t border-white/8 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setGrantModalUser(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-wisdom-muted hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={grantBusy}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-purple-500 text-white hover:bg-purple-400 disabled:opacity-50 transition-colors shadow-lg shadow-purple-500/20"
                >
                  {grantBusy ? "Granting..." : "Confirm & Unlock Package"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
