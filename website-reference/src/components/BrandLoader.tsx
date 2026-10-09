"use client";

import { useEffect, useState } from "react";
import { isAndroidWebView } from "@/lib/native-app";

type Size = "sm" | "md" | "lg" | "xl";

const SIZE_MAP: Record<Size, string> = {
  sm: "w-6 h-6 border-2",
  md: "w-8 h-8 border-2",
  lg: "w-10 h-10 border-[3px]",
  xl: "w-12 h-12 border-[3px]",
};

/**
 * BrandLoader: Cyan circular spinner for waiting states.
 *
 * Normal browsers: Visible with smooth animations and labels.
 * Native Android app: Suppressed completely via CSS and client unmount so that
 * the native Jetpack Compose GIF animation remains the ONLY visible loading indicator.
 */
export default function BrandLoader({
  size = "lg",
  label,
  fullScreen = false,
  className = "",
}: {
  size?: Size;
  label?: string;
  fullScreen?: boolean;
  className?: string;
}) {
  const [isNative, setIsNative] = useState(false);

  useEffect(() => {
    if (isAndroidWebView()) {
      setIsNative(true);
    }
  }, []);

  // Suppress in native app (CSS also suppresses before hydration)
  if (isNative) {
    return null;
  }

  const body = (
    <div
      className={`wta-brand-loader flex flex-col items-center justify-center gap-3 ${className}`}
      role="status"
      aria-live="polite"
      aria-label={label || "Loading"}
      data-brand-loader="true"
      data-wta-spinner="true"
    >
      <div
        className={`${SIZE_MAP[size]} rounded-full border-cyan-400/25 border-t-cyan-400 animate-spin`}
      />
      {label ? (
        <p className="text-sm text-wisdom-muted font-medium tracking-wide">{label}</p>
      ) : null}
    </div>
  );

  if (fullScreen) {
    return (
      <div
        className="wta-fullscreen-loader fixed inset-0 z-[9999] flex items-center justify-center bg-[#0B1220]/90"
        data-brand-loader="true"
        data-wta-spinner="true"
      >
        {body}
      </div>
    );
  }

  return body;
}
