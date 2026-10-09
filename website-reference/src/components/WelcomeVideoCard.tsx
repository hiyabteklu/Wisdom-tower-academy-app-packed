"use client";

import CleanVideoPlayer from "@/components/CleanVideoPlayer";

type Props = {
  /** Clean section title, e.g. "What you'll find here" */
  title: string;
  /** Short supporting line under the title */
  subtitle?: string;
  /**
   * Direct video file (mp4/webm URL): recommended for a fully clean, on-brand player.
   * Host on Supabase Storage, R2, Bunny, etc.
   */
  src?: string;
  /** YouTube id: custom cover first; YouTube UI only after the user presses play */
  youtubeId?: string;
  /** Optional cover image */
  poster?: string;
  /** Visual accent: academy (amber) | digital (cyan) */
  variant?: "academy" | "digital";
};

/**
 * 16:9 welcome video in a framed card.
 * Prefer `src` for zero YouTube branding.
 */
export default function WelcomeVideoCard({
  title,
  subtitle,
  src,
  youtubeId,
  poster,
  variant = "academy",
}: Props) {
  const isAcademy = variant === "academy";
  const accent = isAcademy
    ? {
        label: "text-amber-400/90",
        border: "border-amber-400/25",
        glow: "from-amber-500/15 via-transparent to-transparent",
        play: "bg-amber-500/20 border-amber-400/40 text-amber-200",
      }
    : {
        label: "text-cyan-400/90",
        border: "border-cyan-400/25",
        glow: "from-cyan-500/15 via-transparent to-transparent",
        play: "bg-cyan-500/20 border-cyan-400/40 text-cyan-200",
      };

  return (
    <section className="w-full max-w-3xl mx-auto" aria-label={title}>
      <div
        className={`rounded-3xl border ${accent.border} bg-wisdom-card overflow-hidden shadow-card-3d`}
      >
        <div className={`px-5 sm:px-6 py-4 border-b border-white/10 bg-gradient-to-r ${accent.glow}`}>
          <p className={`text-[11px] font-bold uppercase tracking-[0.18em] ${accent.label} mb-1`}>
            Welcome
          </p>
          <h2 className="font-display text-lg sm:text-xl font-bold text-white tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-1 text-sm text-wisdom-muted leading-relaxed">{subtitle}</p>
          )}
        </div>

        <CleanVideoPlayer
          src={src}
          youtubeId={youtubeId}
          poster={poster}
          title={title}
          playButtonClassName={accent.play}
        />
      </div>
    </section>
  );
}
