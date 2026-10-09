"use client";

import confetti from "canvas-confetti";
import { isAndroidWebView } from "@/lib/native-app";

let reusableCanvas: HTMLCanvasElement | null = null;
let confettiInstance: confetti.CreateTypes | null = null;
let secondaryBurstTimer: ReturnType<typeof setTimeout> | null = null;
let cleanupTimer: ReturnType<typeof setTimeout> | null = null;

function getOrCreateConfettiInstance(): confetti.CreateTypes | null {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return null;
  }

  if (confettiInstance && reusableCanvas && reusableCanvas.isConnected) {
    return confettiInstance;
  }

  try {
    let canvas = document.getElementById("wta-confetti-canvas") as HTMLCanvasElement | null;
    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.id = "wta-confetti-canvas";
      canvas.setAttribute("aria-hidden", "true");
      canvas.style.position = "fixed";
      canvas.style.top = "0";
      canvas.style.left = "0";
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      canvas.style.margin = "0";
      canvas.style.padding = "0";
      canvas.style.border = "none";
      canvas.style.outline = "none";
      canvas.style.background = "transparent";
      canvas.style.backgroundColor = "transparent";
      canvas.style.pointerEvents = "none";
      canvas.style.zIndex = "9999";

      // Clear 2D context immediately so the surface is transparent prior to mounting
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width || 300, canvas.height || 150);
      }

      document.body.appendChild(canvas);
    }

    reusableCanvas = canvas;
    // useWorker: false is crucial to prevent OffscreenCanvas transfer white flash on Android WebView
    confettiInstance = confetti.create(canvas, {
      resize: true,
      useWorker: false,
      disableForReducedMotion: true,
    });

    return confettiInstance;
  } catch (err) {
    console.warn("Failed to initialize confetti canvas:", err);
    return null;
  }
}

/**
 * Resets any active confetti animation and clears the persistent canvas.
 */
export function resetConfetti() {
  if (secondaryBurstTimer) {
    clearTimeout(secondaryBurstTimer);
    secondaryBurstTimer = null;
  }
  if (cleanupTimer) {
    clearTimeout(cleanupTimer);
    cleanupTimer = null;
  }
  if (confettiInstance) {
    try {
      confettiInstance.reset();
      if (reusableCanvas) {
        const ctx = reusableCanvas.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, reusableCanvas.width, reusableCanvas.height);
        }
      }
    } catch {
      // Safe fallback
    }
  }
}

/**
 * Confetti burst effect that triggers immediately when a user selects the correct answer.
 * Uses a single persistent transparent canvas with useWorker: false to completely prevent
 * any white screen flash in Android WebViews while preserving vibrant celebration particles.
 */
export function triggerCorrectConfetti(sourceElement?: HTMLElement | null) {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  // Honor reduced motion immediately
  if (
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ||
    document.documentElement.classList.contains("force-reduced-motion")
  ) {
    return;
  }

  const fire = getOrCreateConfettiInstance();
  if (!fire) return;

  // Clear any existing timers and previous active animation to prevent stacking
  if (secondaryBurstTimer) {
    clearTimeout(secondaryBurstTimer);
    secondaryBurstTimer = null;
  }
  if (cleanupTimer) {
    clearTimeout(cleanupTimer);
    cleanupTimer = null;
  }

  // Detect Android WebView / native container
  const isNative =
    document.documentElement.classList.contains("wta-native-app") ||
    document.body?.classList.contains("wta-native-app") ||
    isAndroidWebView();

  let originX = 0.5;
  let originY = 0.6;

  if (sourceElement && typeof sourceElement.getBoundingClientRect === "function") {
    try {
      const rect = sourceElement.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        originX = Math.max(0.1, Math.min(0.9, (rect.left + rect.width / 2) / window.innerWidth));
        originY = Math.max(0.1, Math.min(0.9, (rect.top + rect.height / 2) / window.innerHeight));
      }
    } catch {
      // Fallback to screen center-lower
    }
  }

  // Vibrant academic and victory palette
  const colors = [
    "#22e0ff", // Bright cyan
    "#38bdf8", // Sky blue
    "#34d399", // Emerald
    "#10b981", // Deep green
    "#fbbf24", // Amber gold
    "#f59e0b", // Warm gold
    "#a855f7", // Violet
    "#f43f5e", // Rose
  ];

  // In native Android WebView, use lighter particle counts and shorter ticks
  // to avoid compositing stalls and maintain high 60/120fps smoothness without flicker.
  const burst1Count = isNative ? 28 : 55;
  const burst1Ticks = isNative ? 140 : 230;
  const burst2Count = isNative ? 20 : 45;
  const burst2Ticks = isNative ? 150 : 260;

  try {
    // Primary upward burst
    fire({
      particleCount: burst1Count,
      angle: 90,
      spread: 70,
      startVelocity: 42,
      decay: 0.92,
      gravity: 0.8,
      ticks: burst1Ticks,
      origin: { x: originX, y: originY },
      colors,
      disableForReducedMotion: true,
    });

    // Secondary lighter burst for nice float-down effect
    secondaryBurstTimer = setTimeout(() => {
      try {
        fire({
          particleCount: burst2Count,
          angle: 90,
          spread: 110,
          startVelocity: 36,
          decay: 0.94,
          gravity: 0.65,
          ticks: burst2Ticks,
          origin: { x: originX, y: Math.max(0.05, originY - 0.04) },
          colors,
          disableForReducedMotion: true,
        });
      } catch {
        // Safe fallback
      }
    }, 80);

    // After animation finishes (~950ms), reset and ensure canvas context is completely transparent
    cleanupTimer = setTimeout(() => {
      try {
        fire.reset();
        if (reusableCanvas) {
          const ctx = reusableCanvas.getContext("2d");
          if (ctx) {
            ctx.clearRect(0, 0, reusableCanvas.width, reusableCanvas.height);
          }
        }
      } catch {
        // Safe fallback
      }
    }, 950);
  } catch (err) {
    console.warn("Confetti burst error:", err);
  }
}

