/**
 * Persistent focus timer — survives route changes via localStorage.
 */

export const FOCUS_STORAGE_KEY = "wt_focus_timer_v1";
export const FOCUS_EVENT = "wt-focus-timer";

export type FocusState = {
  totalSec: number;
  /** Absolute end timestamp (ms). null when paused/stopped */
  endAt: number | null;
  /** Remaining seconds when paused */
  leftWhenPaused: number;
  running: boolean;
};

const DEFAULT: FocusState = {
  totalSec: 25 * 60,
  endAt: null,
  leftWhenPaused: 25 * 60,
  running: false,
};

export function readFocusState(): FocusState {
  if (typeof window === "undefined") return { ...DEFAULT };
  try {
    const raw = localStorage.getItem(FOCUS_STORAGE_KEY);
    if (!raw) return { ...DEFAULT };
    const p = JSON.parse(raw) as Partial<FocusState>;
    return {
      totalSec: Number(p.totalSec) || DEFAULT.totalSec,
      endAt: typeof p.endAt === "number" ? p.endAt : null,
      leftWhenPaused: Number(p.leftWhenPaused) || DEFAULT.leftWhenPaused,
      running: Boolean(p.running && p.endAt),
    };
  } catch {
    return { ...DEFAULT };
  }
}

export function writeFocusState(state: FocusState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(FOCUS_STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new CustomEvent(FOCUS_EVENT));
}

export function remainingSec(state: FocusState, now = Date.now()): number {
  if (state.running && state.endAt) {
    return Math.max(0, Math.ceil((state.endAt - now) / 1000));
  }
  return Math.max(0, state.leftWhenPaused);
}

export function startFocus(totalOrLeft?: number) {
  const cur = readFocusState();
  const left = totalOrLeft ?? remainingSec(cur);
  if (left <= 0) return;
  const next: FocusState = {
    totalSec: totalOrLeft && totalOrLeft === cur.totalSec ? cur.totalSec : cur.totalSec,
    endAt: Date.now() + left * 1000,
    leftWhenPaused: left,
    running: true,
  };
  if (totalOrLeft && !cur.running && left === totalOrLeft) {
    next.totalSec = totalOrLeft;
  }
  writeFocusState(next);
}

export function pauseFocus() {
  const cur = readFocusState();
  const left = remainingSec(cur);
  writeFocusState({
    ...cur,
    endAt: null,
    leftWhenPaused: left,
    running: false,
  });
}

export function resetFocus(sec?: number) {
  const total = sec ?? readFocusState().totalSec;
  writeFocusState({
    totalSec: total,
    endAt: null,
    leftWhenPaused: total,
    running: false,
  });
}

export function setPreset(sec: number) {
  writeFocusState({
    totalSec: sec,
    endAt: null,
    leftWhenPaused: sec,
    running: false,
  });
}

export const FOCUS_START_LINES = [
  "One block of focus now beats a whole evening of half-work.",
  "Stay with this session. Future you will thank you.",
  "Quiet phone. Open notes. This hour is yours.",
  "You already started. That is the hard part.",
  "Small steady work beats last-minute panic.",
  "This is practice for the person you want to become.",
  "Keep going. Clarity comes after you sit with the work.",
  "Your classmates are studying too. Match their effort.",
];

/** Shown when user tries to stop or leave mid-session — roast + smile + push to stay */
export const FOCUS_NUDGE_LINES = [
  {
    face: "😤",
    title: "Already quitting?",
    body: "You set a timer, then tried to ghost it. Finish the block. Your future self is watching.",
  },
  {
    face: "😔",
    title: "Walking away early",
    body: "The notes did not insult you. Sit back down and make them useful.",
  },
  {
    face: "🫠",
    title: "Procrastination in a nice outfit",
    body: "Calling this a break does not make it one. The work is still on the desk.",
  },
  {
    face: "👀",
    title: "Still time on the clock",
    body: "TikTok will be there in twenty minutes. Your exam will not reschedule for you.",
  },
  {
    face: "😕",
    title: "Almost there",
    body: "You already paid the start cost. Stopping now is paying twice for half the result.",
  },
  {
    face: "🤨",
    title: "Bold strategy",
    body: "Set a focus timer, then leave. Historians will call this peak procrastination.",
  },
  {
    face: "😅",
    title: "The phone is not a study partner",
    body: "It will still be full of notifications after you finish this session. The chapter will not.",
  },
  {
    face: "😴",
    title: "Sudden fatigue detected",
    body: "Funny how tired only shows up when the notes open. Stay. Energy returns after page two.",
  },
  {
    face: "🧐",
    title: "Checking the time again?",
    body: "The timer is fine. Your attention is the one wandering. Bring it back.",
  },
  {
    face: "😬",
    title: "This is the hard minute",
    body: "Everyone wants to quit right here. The ones who pass are the ones who do not.",
  },
  {
    face: "🫡",
    title: "Discipline check",
    body: "Motivation left the chat. Good. Discipline is what finishes timers.",
  },
  {
    face: "🙃",
    title: "Nice try",
    body: "You cannot negotiate with a countdown. Either finish it or admit you were never serious.",
  },
  {
    face: "😤",
    title: "Respect the timer",
    body: "It is a short session, not a prison sentence. Hold the line.",
  },
  {
    face: "🫣",
    title: "Sneaking out?",
    body: "We see you. The progress bar sees you. Stay and make this session count.",
  },
  {
    face: "😌",
    title: "Rest is earned",
    body: "Breaks feel better after real work. Finish this block, then rest without the guilt.",
  },
  {
    face: "🧠",
    title: "Brain wants comfort",
    body: "Comfort is free. Competence is not. One more solid stretch before you leave.",
  },
  {
    face: "🔥",
    title: "Do not cool off now",
    body: "You finally got into the work. Walking away resets the engine. Keep the heat.",
  },
  {
    face: "😏",
    title: "Classic move",
    body: "Start strong, quit mid-way, regret at night. Skip step two this time.",
  },
  {
    face: "📱",
    title: "The scroll can wait",
    body: "Nothing urgent is happening on your phone. Something urgent is happening on this page.",
  },
  {
    face: "🏆",
    title: "Small win available",
    body: "Finishing this timer is a win you can actually feel. Quitting is free and empty.",
  },
  {
    face: "🫠",
    title: "Future you is unimpressed",
    body: "Tonight-you wants ease. Exam-you wants this work done. Pick a side.",
  },
  {
    face: "😤",
    title: "Not this again",
    body: "Same timer, same early exit, same score later. Break the pattern today.",
  },
  {
    face: "😄",
    title: "Laugh, then stay",
    body: "Yes, studying is annoying. So is failing. Choose the temporary annoyance.",
  },
  {
    face: "💪",
    title: "One more push",
    body: "You are closer to done than to the start. Do not waste the distance you already covered.",
  },
];

export function pickStartLine() {
  return FOCUS_START_LINES[Math.floor(Math.random() * FOCUS_START_LINES.length)]!;
}

export function pickNudge() {
  return FOCUS_NUDGE_LINES[Math.floor(Math.random() * FOCUS_NUDGE_LINES.length)]!;
}

export function pad2(n: number) {
  return String(n).padStart(2, "0");
}

export function formatFocusClock(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${pad2(m)}:${pad2(s)}`;
}
