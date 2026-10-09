"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Bell,
  Send,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Trash2,
  ExternalLink,
  RefreshCw,
  Layers,
  BookOpen,
  Info,
  Radio,
  User,
  Clock,
} from "lucide-react";
import type { NotificationItem, NotificationType } from "@/lib/notifications";

type Preset = {
  label: string;
  type: NotificationType;
  title: string;
  body: string;
  url: string;
};

const PRESETS: Preset[] = [
  {
    label: "New Material Release",
    type: "material",
    title: "New Lecture Notes & Question Bank Released",
    body: "Fresh chapter summaries and practice questions are now published in your track.",
    url: "/learning",
  },
  {
    label: "Model Exam Solutions",
    type: "material",
    title: "Official Model Exam Step-by-Step Solutions Ready",
    body: "Worked solutions with AI explanation support have just been added to the Exam Hub.",
    url: "/learning",
  },
  {
    label: "Admin Announcement",
    type: "admin",
    title: "Important Academy Academic Update",
    body: "Please review the updated syllabus milestones and study planner recommendations.",
    url: "/learning",
  },
  {
    label: "Full Access Active",
    type: "general",
    title: "Full Scholar Access is Active",
    body: "Explore all learning tracks, solved questions, and exams with your account.",
    url: "/packages",
  },
];

export default function NotificationsPanel() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [type, setType] = useState<NotificationType>("material");
  const [targetType, setTargetType] = useState<"all" | "user">("all");
  const [targetUser, setTargetUser] = useState("");
  const [url, setUrl] = useState("/learning");

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications?admin=true");
      const data = await res.json();
      if (data.ok && Array.isArray(data.notifications)) {
        setNotifications(data.notifications);
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  function applyPreset(p: Preset) {
    setTitle(p.title);
    setBody(p.body);
    setType(p.type);
    setUrl(p.url);
    setTargetType("all");
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      setFeedback({ type: "error", message: "Please fill in title and message." });
      return;
    }

    setSending(true);
    setFeedback(null);

    try {
      const target = targetType === "all" ? "all" : targetUser.trim();
      const res = await fetch("/api/notifications/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          body: body.trim(),
          type,
          target: target || "all",
          url: url.trim() || "/learning",
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        setFeedback({
          type: "error",
          message: data.error || "Failed to send notification.",
        });
      } else {
        const fcm = data.fcm || {};
        let fcmNote = "";
        if (fcm.skipped) {
          fcmNote = "Saved to DB & Web (FCM push queued or credentials pending).";
        } else {
          fcmNote = `Pushed via FCM to ${fcm.sentCount || 0} device(s).`;
        }

        setFeedback({
          type: "success",
          message: `Notification published! ${fcmNote}`,
        });

        // Reset form
        setTitle("");
        setBody("");
        setUrl("/learning");
        setTargetUser("");

        // Refresh list
        void loadNotifications();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network error";
      setFeedback({ type: "error", message: msg });
    } finally {
      setSending(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await fetch(`/api/notifications?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch {
      /* ignore */
    }
  }

  const getTypeBadge = (t: NotificationType) => {
    switch (t) {
      case "material":
        return "bg-sky-500/15 text-sky-300 border-sky-400/30";
      case "admin":
        return "bg-amber-500/15 text-amber-300 border-amber-400/30";
      case "payment":
        return "bg-emerald-500/15 text-emerald-300 border-emerald-400/30";
      default:
        return "bg-indigo-500/15 text-indigo-300 border-indigo-400/30";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-sky-500/15 text-sky-300 border border-sky-400/30">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              FCM Broadcast System
            </span>
          </div>
          <h2 className="font-display text-2xl font-bold text-white tracking-tight">
            Push Notifications & Announcements
          </h2>
          <p className="text-xs sm:text-sm text-wisdom-muted mt-1">
            Publish real-time announcements, content releases, and study alerts directly to the Android app and website.
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadNotifications()}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Quick Presets */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-wisdom-muted mb-3 flex items-center gap-1.5">
          <Bell className="w-3.5 h-3.5 text-cyan-400" />
          <span>Quick Broadcast Presets</span>
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => applyPreset(p)}
              className="text-left p-3.5 rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] hover:border-sky-400/40 transition-all cursor-pointer group"
            >
              <span className="text-xs font-bold text-white group-hover:text-sky-300 block mb-1">
                {p.label}
              </span>
              <span className="text-[11px] text-wisdom-muted line-clamp-2 block leading-relaxed">
                {p.title}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Compose Form */}
      <form
        onSubmit={handleSend}
        className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#0c1626] to-[#070e1a] p-5 sm:p-7 shadow-xl space-y-5"
      >
        <div className="flex items-center gap-2 border-b border-white/8 pb-4">
          <div className="p-2 rounded-xl bg-sky-500/15 border border-sky-400/30 text-sky-300">
            <Send className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Create New Notification</h3>
            <p className="text-[11px] text-wisdom-muted">
              Stores in database, displays on /notifications, and triggers Android system notification.
            </p>
          </div>
        </div>

        {feedback && (
          <div
            className={`p-4 rounded-2xl border text-xs sm:text-sm flex items-start gap-2.5 ${
              feedback.type === "success"
                ? "bg-emerald-500/10 border-emerald-400/30 text-emerald-300"
                : feedback.type === "error"
                ? "bg-rose-500/10 border-rose-400/30 text-rose-300"
                : "bg-sky-500/10 border-sky-400/30 text-sky-300"
            }`}
          >
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Title */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-semibold text-slate-300">
              Notification Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Chapter 4 Physics Lecture Notes Published"
              className="w-full px-4 py-2.5 rounded-xl bg-[#050b14] border border-white/12 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 transition-colors"
            />
          </div>

          {/* Body */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-semibold text-slate-300">
              Message Body <span className="text-rose-400">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Short description visible on lockscreen / notifications list..."
              className="w-full px-4 py-2.5 rounded-xl bg-[#050b14] border border-white/12 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 transition-colors resize-none"
            />
          </div>

          {/* Type */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Category / Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as NotificationType)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#050b14] border border-white/12 text-sm text-white focus:outline-none focus:border-sky-400 transition-colors"
            >
              <option value="material">Material Release (Books, Notes, Exams)</option>
              <option value="admin">Admin Announcement</option>
              <option value="payment">Payment & Access Update</option>
              <option value="general">General Notification</option>
            </select>
          </div>

          {/* Deep Link URL */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Deep Link / Target Path
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="/learning or /academy/freshman"
              className="w-full px-4 py-2.5 rounded-xl bg-[#050b14] border border-white/12 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 transition-colors"
            />
          </div>

          {/* Target Audience */}
          <div className="space-y-2 md:col-span-2 pt-1">
            <label className="text-xs font-semibold text-slate-300">Target Audience</label>
            <div className="flex flex-wrap gap-4">
              <label className="inline-flex items-center gap-2 cursor-pointer text-xs sm:text-sm text-white">
                <input
                  type="radio"
                  name="targetType"
                  checked={targetType === "all"}
                  onChange={() => setTargetType("all")}
                  className="accent-sky-400"
                />
                <span>Broadcast to All Scholars (Recommended)</span>
              </label>

              <label className="inline-flex items-center gap-2 cursor-pointer text-xs sm:text-sm text-white">
                <input
                  type="radio"
                  name="targetType"
                  checked={targetType === "user"}
                  onChange={() => setTargetType("user")}
                  className="accent-sky-400"
                />
                <span>Specific User ID or Email</span>
              </label>
            </div>

            {targetType === "user" && (
              <div className="pt-2">
                <input
                  type="text"
                  required
                  value={targetUser}
                  onChange={(e) => setTargetUser(e.target.value)}
                  placeholder="Enter user UUID or user email address"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#050b14] border border-white/12 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 transition-colors"
                />
              </div>
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="pt-3 flex justify-end">
          <button
            type="submit"
            disabled={sending}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 font-bold text-sm shadow-lg shadow-sky-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{sending ? "Broadcasting..." : "Publish & Send Push"}</span>
          </button>
        </div>
      </form>

      {/* History Table */}
      <div className="rounded-3xl border border-white/10 bg-[#08101e] p-5 sm:p-6 shadow-xl">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-sky-400" />
            <span>Notification Broadcast History ({notifications.length})</span>
          </h3>
        </div>

        {loading ? (
          <p className="text-xs text-wisdom-muted py-8 text-center">Loading broadcasts...</p>
        ) : notifications.length === 0 ? (
          <p className="text-xs text-wisdom-muted py-8 text-center">No notifications broadcasted yet.</p>
        ) : (
          <div className="divide-y divide-white/8">
            {notifications.map((n) => (
              <div
                key={n.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${getTypeBadge(
                        n.type
                      )}`}
                    >
                      {n.type}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      Target: {n.target === "all" ? "All Users" : n.target}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      • {new Date(n.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white">{n.title}</h4>
                  <p className="text-xs text-wisdom-muted line-clamp-2 mt-0.5">
                    {n.body}
                  </p>
                  {n.url && (
                    <a
                      href={n.url}
                      className="inline-flex items-center gap-1 text-[11px] text-sky-400 hover:underline mt-1"
                    >
                      <span>Link: {n.url}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleDelete(n.id)}
                    title="Delete notification"
                    className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Android FCM Integration Guide */}
      <div className="rounded-2xl border border-sky-400/20 bg-sky-950/20 p-5 space-y-2.5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-sky-300 flex items-center gap-2">
          <Smartphone className="w-4 h-4" />
          <span>Android App (Kotlin / Capacitor) FCM Endpoint</span>
        </h4>
        <p className="text-xs text-slate-300 leading-relaxed font-mono">
          Endpoint: <span className="text-amber-300">POST /api/notifications/register-device</span>
        </p>
        <p className="text-xs text-slate-400 leading-relaxed">
          The Android app registers device tokens by sending:
        </p>
        <pre className="p-3 rounded-xl bg-black/40 border border-white/10 text-[11px] text-slate-300 font-mono overflow-x-auto">
{`// Example Android HTTP Request on FCM token refresh
fetch("/api/notifications/register-device", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    token: fcmToken,
    userId: currentUserId, // optional
    platform: "android",
    deviceName: "Samsung Galaxy A54" // optional
  })
});`}
        </pre>
      </div>
    </div>
  );
}
