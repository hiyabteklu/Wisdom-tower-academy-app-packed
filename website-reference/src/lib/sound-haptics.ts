"use client";

import { loadPreferences, savePreferences } from "@/lib/preferences";

/**
 * High-Fidelity Web Audio API Sound Synthesizer & Haptics Engine
 * Provides instant, zero-latency feedback without external audio assets.
 * Respects student volume preferences (defaults to 50% sound).
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!audioCtx || audioCtx.state === "closed") {
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === "suspended") {
      void audioCtx.resume();
    }
    return audioCtx;
  } catch (err) {
    console.warn("[SoundHaptics] Could not initialize AudioContext:", err);
    return null;
  }
}

/**
 * Haptic Vibration Trigger
 */
export function triggerHaptic(type: "correct" | "wrong" | "celebrate" | "light") {
  if (typeof window === "undefined" || typeof navigator === "undefined") return;
  try {
    const prefs = loadPreferences();
    if (prefs.hapticFeedback === false) return;

    if ("vibrate" in navigator && typeof navigator.vibrate === "function") {
      switch (type) {
        case "correct":
          navigator.vibrate([45]);
          break;
        case "wrong":
          // Sharp double-pulse tactile vibration (similar to iOS UINotificationFeedbackType.error):
          // Two quick, heavy vibrations in rapid succession to instantly signal a mistake
          navigator.vibrate([70, 50, 90]);
          break;
        case "celebrate":
          navigator.vibrate([40, 40, 40, 40, 100]);
          break;
        case "light":
          navigator.vibrate(20);
          break;
      }
    }
  } catch {
    // Graceful fallback on devices with vibration disabled or desktop
  }
}

/**
 * Play a sparkling, harmonic chime for correct answers
 * Scaled by 50% default volume (customizable in settings)
 */
export function playCorrectSound(customVolume?: number) {
  const prefs = loadPreferences();
  if (prefs.soundEffects === false) {
    triggerHaptic("correct");
    return;
  }

  const ctx = getAudioContext();
  if (!ctx) {
    triggerHaptic("correct");
    return;
  }

  try {
    triggerHaptic("correct");

    // Default volume is 50% (0.5), or customized
    const baseVol = customVolume !== undefined ? customVolume : prefs.soundVolume ?? 0.5;
    const now = ctx.currentTime;

    // Harmonic bell sequence: C5 (523Hz) -> E5 (659Hz) -> G5 (784Hz) -> C6 (1046Hz)
    const notes = [
      { freq: 523.25, time: 0.0, dur: 0.35, gain: 0.35 },
      { freq: 659.25, time: 0.06, dur: 0.4, gain: 0.4 },
      { freq: 783.99, time: 0.12, dur: 0.45, gain: 0.45 },
      { freq: 1046.5, time: 0.18, dur: 0.6, gain: 0.5 },
    ];

    notes.forEach(({ freq, time, dur, gain: noteGain }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + time);

      // Smooth attack & sweet exponential chime decay
      const peak = baseVol * noteGain;
      gain.gain.setValueAtTime(0.0001, now + time);
      gain.gain.exponentialRampToValueAtTime(peak, now + time + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + time + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + time);
      osc.stop(now + time + dur);
    });
  } catch (err) {
    console.warn("[SoundHaptics] Error playing correct sound:", err);
  }
}

/**
 * Play a gentle, soft low-frequency double thud for incorrect answers
 * Clear feedback without harsh or punishing discordance.
 */
export function playWrongSound(customVolume?: number) {
  const prefs = loadPreferences();
  if (prefs.soundEffects === false) {
    triggerHaptic("wrong");
    return;
  }

  const ctx = getAudioContext();
  if (!ctx) {
    triggerHaptic("wrong");
    return;
  }

  try {
    triggerHaptic("wrong");

    const baseVol = customVolume !== undefined ? customVolume : prefs.soundVolume ?? 0.5;
    const now = ctx.currentTime;

    // Two soft pulses: 180Hz -> 130Hz
    const pulses = [
      { startFreq: 185, endFreq: 130, time: 0.0, dur: 0.18, gain: 0.35 },
      { startFreq: 155, endFreq: 110, time: 0.14, dur: 0.22, gain: 0.38 },
    ];

    pulses.forEach(({ startFreq, endFreq, time, dur, gain: pGain }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(startFreq, now + time);
      osc.frequency.exponentialRampToValueAtTime(endFreq, now + time + dur);

      // Low pass to ensure velvety, non-harsh tone
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(450, now + time);

      const peak = baseVol * pGain;
      gain.gain.setValueAtTime(0.0001, now + time);
      gain.gain.linearRampToValueAtTime(peak, now + time + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + time + dur);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + time);
      osc.stop(now + time + dur);
    });
  } catch (err) {
    console.warn("[SoundHaptics] Error playing wrong sound:", err);
  }
}

/**
 * Play an amazing, bright 50% sound (Curious harmonic bell chime)
 * Ideal for 50-50 lifelines, hints, and partial milestone progress.
 * Respects 50% default volume preference.
 */
export function playFiftyPercentSound(customVolume?: number) {
  const prefs = loadPreferences();
  if (prefs.soundEffects === false) {
    triggerHaptic("light");
    return;
  }

  const ctx = getAudioContext();
  if (!ctx) {
    triggerHaptic("light");
    return;
  }

  try {
    triggerHaptic("light");

    const baseVol = customVolume !== undefined ? customVolume : prefs.soundVolume ?? 0.5;
    const now = ctx.currentTime;

    // Dual rising crystal chimes: F5 (698Hz) -> C6 (1046Hz) with harmonic shimmer
    const bells = [
      { freq: 698.46, time: 0.0, dur: 0.38, gain: 0.42 },
      { freq: 1046.5, time: 0.1, dur: 0.55, gain: 0.48 },
      { freq: 1396.9, time: 0.12, dur: 0.4, gain: 0.22 }, // Upper shimmer harmonic
    ];

    bells.forEach(({ freq, time, dur, gain: bGain }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = prefs.soundPreset === "arcade" ? "square" : "sine";
      osc.frequency.setValueAtTime(freq, now + time);

      const peak = baseVol * bGain;
      gain.gain.setValueAtTime(0.0001, now + time);
      gain.gain.exponentialRampToValueAtTime(peak, now + time + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + time + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + time);
      osc.stop(now + time + dur);
    });
  } catch (err) {
    console.warn("[SoundHaptics] Error playing 50% sound:", err);
  }
}

/**
 * Grand Celebration Sound (Fanfare chord with sparkle)
 */
export function playCelebrationSound(customVolume?: number) {
  const prefs = loadPreferences();
  if (prefs.soundEffects === false) {
    triggerHaptic("celebrate");
    return;
  }

  const ctx = getAudioContext();
  if (!ctx) {
    triggerHaptic("celebrate");
    return;
  }

  try {
    triggerHaptic("celebrate");

    const baseVol = customVolume !== undefined ? customVolume : prefs.soundVolume ?? 0.5;
    const now = ctx.currentTime;

    const chords = [
      { freq: 523.25, time: 0.0, dur: 0.4 }, // C5
      { freq: 659.25, time: 0.08, dur: 0.45 }, // E5
      { freq: 783.99, time: 0.16, dur: 0.5 }, // G5
      { freq: 1046.5, time: 0.24, dur: 0.8 }, // C6
      { freq: 1318.51, time: 0.32, dur: 1.1 }, // E6
    ];

    chords.forEach(({ freq, time, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + time);

      gain.gain.setValueAtTime(0.0001, now + time);
      gain.gain.exponentialRampToValueAtTime(baseVol * 0.45, now + time + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + time + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + time);
      osc.stop(now + time + dur);
    });
  } catch (err) {
    console.warn("[SoundHaptics] Error playing celebration sound:", err);
  }
}

/**
 * Unified Feedback Dispatcher
 * Plays sound & vibration for question answering, except in full exam mode.
 */
export function triggerAnswerFeedback(isCorrect: boolean, isExam: boolean = false) {
  // Respect user specification: "For all questions (except exam)"
  if (isExam) return;

  if (isCorrect) {
    playCorrectSound();
  } else {
    playWrongSound();
  }
}

/**
 * Arcade Machine Gun / Arrow Launch Sound
 * Sharp laser/pneumatic launch whoosh
 */
export function playShotSound(customVolume?: number) {
  const prefs = loadPreferences();
  if (prefs.soundEffects === false) {
    triggerHaptic("light");
    return;
  }
  const ctx = getAudioContext();
  if (!ctx) {
    triggerHaptic("light");
    return;
  }
  try {
    triggerHaptic("light");
    const baseVol = customVolume !== undefined ? customVolume : prefs.soundVolume ?? 0.5;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.12);

    gain.gain.setValueAtTime(baseVol * 0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.12);
  } catch (err) {
    console.warn("[SoundHaptics] Error playing shot sound:", err);
  }
}

/**
 * Metallic Ricochet / Shield Deflection Sound
 * High-pitched metallic clang followed by ping
 */
export function playRicochetSound(customVolume?: number) {
  const prefs = loadPreferences();
  if (prefs.soundEffects === false) {
    triggerHaptic("wrong");
    return;
  }
  const ctx = getAudioContext();
  if (!ctx) {
    triggerHaptic("wrong");
    return;
  }
  try {
    triggerHaptic("wrong");
    const baseVol = customVolume !== undefined ? customVolume : prefs.soundVolume ?? 0.5;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(1400, now);
    osc.frequency.exponentialRampToValueAtTime(2400, now + 0.04);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.22);

    gain.gain.setValueAtTime(baseVol * 0.45, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.22);
  } catch (err) {
    console.warn("[SoundHaptics] Error playing ricochet sound:", err);
  }
}

/**
 * 50% Lifeline / Hint Feedback Trigger
 * Suppressed in exam mode.
 */
export function triggerFiftyFeedback(isExam: boolean = false) {
  if (isExam) return;
  playFiftyPercentSound();
}
