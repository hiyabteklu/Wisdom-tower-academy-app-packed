"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, LogIn, Trash2 } from "lucide-react";
import { STORAGE_KEY, recoverSession, supabase } from "@/lib/supabase";

const PHONE_EMAIL_SUFFIX = "@phone.wisdomtower.app";

export default function DeleteAccountPanel() {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let active = true;
    recoverSession().then((session) => {
      if (!active) return;
      const hasToken = Boolean(session?.access_token);
      setSignedIn(hasToken);
      const e = session?.user?.email ?? null;
      setEmail(e && !e.endsWith(PHONE_EMAIL_SUFFIX) ? e : null);
    });
    return () => {
      active = false;
    };
  }, []);

  async function handleDelete() {
    if (busy || typed.trim() !== "DELETE") return;
    setBusy(true);
    setError(null);
    try {
      const session = await recoverSession();
      const token = session?.access_token;
      if (!token) {
        setError("Your session has expired. Please sign in again.");
        setSignedIn(false);
        return;
      }
      const res = await fetch("/api/account/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ confirm: "DELETE" }),
      });
      const json = (await res.json().catch(() => null)) as
        | { success?: boolean; error?: string }
        | null;
      if (!res.ok || !json?.success) {
        setError(
          json?.error ?? "Something went wrong. Please try again, or contact support."
        );
        return;
      }
      try {
        await supabase.auth.signOut({ scope: "local" });
      } catch {
        /* the account is already gone on the server */
      }
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {
        /* ignore */
      }
      setDone(true);
    } catch {
      setError("Check your internet connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/[0.06] p-5 sm:p-6">
        <h2 className="flex items-center gap-2 text-lg font-bold text-white mb-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-300" />
          Your account has been deleted
        </h2>
        <p className="text-sm text-slate-300">
          You have been signed out. If you used the app, you can also clear its
          data from your phone&apos;s settings.
        </p>
        <Link href="/" className="mt-4 inline-block text-sm text-cyan-300 hover:underline">
          Back to the home page
        </Link>
      </div>
    );
  }

  if (signedIn === null) {
    return <p className="text-sm text-slate-400">Checking your sign-in…</p>;
  }

  if (!signedIn) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
        <h2 className="text-lg font-bold text-white mb-2">Sign in to delete your account</h2>
        <p className="text-sm text-slate-300 mb-4">
          For your safety, only a signed-in student can delete their own account.
          If you cannot sign in, use the e-mail option below.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-2.5 text-sm font-bold text-slate-900 hover:bg-cyan-300"
        >
          <LogIn className="w-4 h-4" />
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-rose-400/30 bg-rose-500/[0.05] p-5 sm:p-6">
      <h2 className="flex items-center gap-2 text-lg font-bold text-white mb-2">
        <AlertTriangle className="w-5 h-5 text-rose-300" />
        Delete my account
      </h2>
      {email && (
        <p className="text-sm text-slate-300 mb-2">
          Signed in as <strong className="text-white">{email}</strong>
        </p>
      )}
      <p className="text-sm text-slate-300 mb-4">
        This is permanent and cannot be undone. Type <strong className="text-white">DELETE</strong>{" "}
        to confirm.
      </p>
      <input
        type="text"
        value={typed}
        onChange={(e) => setTyped(e.target.value)}
        autoCapitalize="characters"
        autoComplete="off"
        spellCheck={false}
        placeholder="DELETE"
        className="w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-rose-300"
      />
      {error && <p className="mt-3 text-sm text-rose-300">{error}</p>}
      <button
        type="button"
        onClick={handleDelete}
        disabled={busy || typed.trim() !== "DELETE"}
        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-rose-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-rose-400 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Trash2 className="w-4 h-4" />
        {busy ? "Deleting…" : "Permanently delete my account"}
      </button>
    </div>
  );
}
