"use client";

import { useState } from "react";
import Link from "next/link";
import { Send, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    service: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");

    try {
      const { error } = await supabase.from("inquiries").insert({
        name: formData.name.trim(),
        email: formData.email.trim(),
        service: formData.service || null,
        message: formData.message.trim(),
        status: "new",
      });

      if (error) {
        console.error("Supabase insert error:", error);
        setErrorMsg(error.message || "Failed to submit. Please try again.");
        setStatus("error");
        return;
      }

      setStatus("success");
      setFormData({ name: "", email: "", service: "", message: "" });
    } catch (err: unknown) {
      console.error("Unexpected error:", err);
      setErrorMsg("Something went wrong. Please try again.");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="py-10 md:py-16 pb-28">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="mx-auto w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-400/40 flex items-center justify-center mb-4">
            <CheckCircle2 className="w-7 h-7 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Message received</h1>
          <p className="text-wisdom-muted text-sm leading-relaxed mb-6">
            Thanks for reaching out. We aim to reply within 24 hours. You can also explore Academy
            packages while you wait.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => setStatus("idle")}
              className="px-4 py-2.5 rounded-xl border border-white/15 text-sm font-semibold text-white/90 hover:bg-white/5"
            >
              Send another
            </button>
            <Link
              href="/packages"
              className="px-4 py-2.5 rounded-xl bg-wisdom-cyan text-wisdom-dark text-sm font-semibold"
            >
              Browse packages
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-10 md:py-16 pb-28">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Academy</h1>
          <p className="text-wisdom-muted text-lg">
            Questions about pathways, packages, or your account? Send a message; we aim to reply
            within 24 hours.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-wisdom-card border border-white/10 focus:border-wisdom-cyan focus:outline-none focus:ring-1 focus:ring-wisdom-cyan transition-colors"
              placeholder="Your name"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-wisdom-card border border-white/10 focus:border-wisdom-cyan focus:outline-none focus:ring-1 focus:ring-wisdom-cyan transition-colors"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="service" className="block text-sm font-medium mb-2">
              Topic (optional)
            </label>
            <select
              id="service"
              value={formData.service}
              onChange={(e) => setFormData({ ...formData, service: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-[#0f172a] border border-white/10 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-colors text-white"
            >
              <option value="">Select a topic…</option>
              <option value="packages">Packages & pricing</option>
              <option value="grades-9-12">Grades 9–12</option>
              <option value="freshman">Freshman</option>
              <option value="exit-exam">Exit Exam</option>
              <option value="gat">GAT</option>
              <option value="account-access">Account / login help</option>
              <option value="payment">Payment & access</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium mb-2">
              Message
            </label>
            <textarea
              id="message"
              required
              rows={5}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-wisdom-card border border-white/10 focus:border-wisdom-cyan focus:outline-none focus:ring-1 focus:ring-wisdom-cyan transition-colors resize-none"
              placeholder="How can we help? Include your grade/level if relevant."
            />
          </div>

          <button
            type="submit"
            disabled={status === "sending"}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-wisdom-cyan text-wisdom-dark font-medium hover:bg-wisdom-cyan-dark transition-colors disabled:opacity-60"
          >
            {status === "sending" ? (
              "Sending..."
            ) : (
              <>
                Send Message
                <Send className="w-4 h-4" />
              </>
            )}
          </button>

          {status === "error" && (
            <p className="text-center text-red-400 text-sm">
              {errorMsg || "Something went wrong. Please try again."}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
