"use client";

import { useRef, useState } from "react";
import { Mic, Pause, Play } from "lucide-react";

type Props = {
  name: string;
  program: string;
  duration: string;
  /** Optional real audio URL: leave empty until you upload */
  audioSrc?: string;
  accent?: string;
};

export default function VoiceMessageCard({
  name,
  program,
  duration,
  audioSrc,
  accent = "text-amber-400",
}: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  const toggle = () => {
    if (!audioSrc) return;
    const el = audioRef.current;
    if (!el) return;
    if (playing) {
      el.pause();
      setPlaying(false);
    } else {
      void el.play();
      setPlaying(true);
    }
  };

  return (
    <div className="rounded-2xl border border-white/12 bg-wisdom-card p-5 flex flex-col gap-4 hover:border-amber-400/30 transition-colors">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/15 bg-wisdom-dark font-display font-bold text-lg ${accent}`}
        >
          {name.charAt(0)}
        </div>
        <div className="min-w-0">
          <p className="font-semibold truncate">{name}</p>
          <p className="text-xs text-wisdom-muted">{program}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={toggle}
        disabled={!audioSrc}
        className={`flex items-center gap-3 rounded-xl border border-white/10 bg-wisdom-dark/70 px-3 py-3 text-left transition-colors ${
          audioSrc ? "hover:border-amber-400/40 cursor-pointer" : "opacity-80 cursor-default"
        }`}
      >
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${accent} bg-white/5 border border-white/10`}
        >
          {playing ? <Pause className="w-4 h-4" /> : audioSrc ? <Play className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-end gap-0.5 h-8 opacity-80">
            {[4, 7, 5, 9, 6, 8, 4, 10, 6, 7, 5, 8, 4, 6, 9, 5].map((h, i) => (
              <span
                key={i}
                className={`w-1 rounded-full ${playing ? "bg-amber-400 animate-pulse" : "bg-white/25"}`}
                style={{ height: `${h * 3}px` }}
              />
            ))}
          </div>
          <p className="text-[10px] text-wisdom-muted mt-1">
            {audioSrc ? (playing ? "Playing…" : "Tap to play voice note") : "Voice note coming soon"} · {duration}
          </p>
        </div>
      </button>

      {audioSrc && (
        <audio
          ref={audioRef}
          src={audioSrc}
          preload="none"
          onEnded={() => setPlaying(false)}
          className="hidden"
        />
      )}
    </div>
  );
}
