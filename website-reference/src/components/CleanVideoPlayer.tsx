"use client";

import { useCallback, useRef, useState } from "react";
import { Play, Pause, Maximize2, Volume2, VolumeX } from "lucide-react";

type Props = {
  /** Direct file URL (mp4/webm): fully custom player, no YouTube branding */
  src?: string;
  /** YouTube video id: custom cover until play; then YouTube iframe (their UI after click) */
  youtubeId?: string;
  /** Poster / cover image URL */
  poster?: string;
  title?: string;
  /** Accent classes for the play button */
  playButtonClassName?: string;
  className?: string;
};

/**
 * Clean 16:9 player.
 * - Prefer `src` (self-hosted or CDN mp4) for a fully branded HTML5 experience.
 * - `youtubeId` uses a custom facade (no red button until user presses play).
 */
export default function CleanVideoPlayer({
  src,
  youtubeId,
  poster,
  title = "Video",
  playButtonClassName = "bg-white/15 border-white/30 text-white",
  className = "",
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);

  const startHtml5 = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    setStarted(true);
    void v.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  }, []);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      void v.play().then(() => setPlaying(true));
    } else {
      v.pause();
      setPlaying(false);
    }
  }, []);

  const toggleMute = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  }, []);

  const fullScreen = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.requestFullscreen) void v.requestFullscreen();
    else if ((v as HTMLVideoElement & { webkitEnterFullscreen?: () => void }).webkitEnterFullscreen) {
      (v as HTMLVideoElement & { webkitEnterFullscreen: () => void }).webkitEnterFullscreen();
    }
  }, []);

  // --- Self-hosted / direct file (fully clean) ---
  if (src) {
    return (
      <div className={`relative w-full aspect-video bg-black group ${className}`}>
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-contain"
          src={src}
          poster={poster}
          playsInline
          preload="metadata"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
          controls={started}
          controlsList="nodownload"
        />

        {!started && (
          <button
            type="button"
            onClick={startHtml5}
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-t from-black/70 via-black/30 to-black/40 transition-opacity"
            aria-label={`Play ${title}`}
          >
            {poster && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={poster}
                alt=""
                className="absolute inset-0 h-full w-full object-cover opacity-60 pointer-events-none"
              />
            )}
            <span
              className={`relative z-10 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full border backdrop-blur-md shadow-lg ${playButtonClassName}`}
            >
              <Play className="h-6 w-6 sm:h-7 sm:w-7 fill-current ml-0.5" />
            </span>
            <span className="relative z-10 text-xs font-medium text-white/80">Play</span>
          </button>
        )}

        {started && (
          <div className="absolute bottom-0 inset-x-0 p-2 sm:p-3 flex items-center gap-2 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={togglePlay}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white"
              aria-label={playing ? "Pause" : "Play"}
            >
              {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
            </button>
            <button
              type="button"
              onClick={toggleMute}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white"
              aria-label={muted ? "Unmute" : "Mute"}
            >
              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <div className="flex-1" />
            <button
              type="button"
              onClick={fullScreen}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white"
              aria-label="Fullscreen"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    );
  }

  // --- YouTube with custom facade (clean until click) ---
  if (youtubeId) {
    const thumb =
      poster || `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`;

    if (!started) {
      return (
        <div className={`relative w-full aspect-video bg-black ${className}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={thumb}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <button
            type="button"
            onClick={() => setStarted(true)}
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/45 hover:bg-black/35 transition-colors"
            aria-label={`Play ${title}`}
          >
            <span
              className={`flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full border backdrop-blur-md shadow-lg ${playButtonClassName}`}
            >
              <Play className="h-6 w-6 sm:h-7 sm:w-7 fill-current ml-0.5" />
            </span>
            <span className="text-xs font-medium text-white/85">Play</span>
          </button>
        </div>
      );
    }

    return (
      <div className={`relative w-full aspect-video bg-black ${className}`}>
        <iframe
          className="absolute inset-0 h-full w-full"
          src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    );
  }

  // --- Empty placeholder ---
  return (
    <div
      className={`relative w-full aspect-video flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-wisdom-navy via-wisdom-dark to-black/80 ${className}`}
    >
      <span
        className={`flex h-14 w-14 items-center justify-center rounded-full border ${playButtonClassName}`}
      >
        <Play className="h-6 w-6 fill-current ml-0.5" />
      </span>
      <p className="text-sm font-medium text-white/80">Video coming soon</p>
    </div>
  );
}
