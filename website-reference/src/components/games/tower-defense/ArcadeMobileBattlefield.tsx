"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import {
  EnemyUnit,
  TowerState,
  PowerUpInventory,
  FlyingArrow,
} from "@/lib/games/tower-defense/types";
import { GameDifficulty } from "@/lib/games/tower-defense/config";
import MathText from "@/components/MathText";
import {
  Heart,
  Volume2,
  VolumeX,
  Pause,
  Play,
  Crosshair,
  Snowflake,
  SplitSquareVertical,
  FastForward,
  ArrowLeft,
  Shield,
  Zap,
  Target,
  Skull,
  Bot,
  Sparkles,
} from "lucide-react";
import { playShotSound, playRicochetSound } from "@/lib/sound-haptics";

interface Props {
  currentEnemy: EnemyUnit | null;
  upcomingEnemies: EnemyUnit[];
  tower: TowerState;
  score: number;
  combo: number;
  waveNumber: number;
  timeRemainingSec: number;
  totalTimeSec: number;
  isFrozen: boolean;
  freezeRemainingSec: number;
  inventory: PowerUpInventory;
  soundMuted: boolean;
  isPaused: boolean;
  difficulty?: GameDifficulty;
  onSelectChoice: (choiceIndex: number) => void;
  onToggleMute: () => void;
  onTogglePause: () => void;
  onActivateFreeze: () => void;
  onActivateFiftyFifty: () => void;
  onActivateExtraHeart: () => void;
  onActivateSkip: () => void;
  marchProgressPct: number; // 0 to 100%
  onArrowImpactResolved: (isCorrect: boolean) => void;
  onExit?: () => void;
}

const CHOICE_LETTERS = ["A", "B", "C", "D"];

const BUTTON_THEMES = [
  {
    bg: "from-cyan-600 via-cyan-500 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-slate-950 shadow-cyan-500/40 border-cyan-300",
    arrowGrad: "from-cyan-300 via-sky-400 to-blue-600",
    glow: "#38bdf8",
  },
  {
    bg: "from-emerald-600 via-emerald-500 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-slate-950 shadow-emerald-500/40 border-emerald-300",
    arrowGrad: "from-emerald-300 via-teal-400 to-emerald-600",
    glow: "#34d399",
  },
  {
    bg: "from-amber-500 via-amber-400 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 shadow-amber-500/40 border-amber-300",
    arrowGrad: "from-amber-300 via-yellow-400 to-orange-600",
    glow: "#fbbf24",
  },
  {
    bg: "from-fuchsia-600 via-fuchsia-500 to-pink-700 hover:from-fuchsia-500 hover:to-pink-600 text-slate-950 shadow-fuchsia-500/40 border-fuchsia-300",
    arrowGrad: "from-fuchsia-300 via-pink-400 to-purple-600",
    glow: "#f472b6",
  },
];

export default function ArcadeMobileBattlefield({
  currentEnemy,
  upcomingEnemies,
  tower,
  score,
  combo,
  waveNumber,
  timeRemainingSec,
  totalTimeSec,
  isFrozen,
  freezeRemainingSec,
  inventory,
  soundMuted,
  isPaused,
  difficulty = "medium",
  onSelectChoice,
  onToggleMute,
  onTogglePause,
  onActivateFreeze,
  onActivateFiftyFifty,
  onActivateExtraHeart,
  onActivateSkip,
  marchProgressPct,
  onArrowImpactResolved,
  onExit,
}: Props) {
  // Animation states
  const [activeArrows, setActiveArrows] = useState<FlyingArrow[]>([]);
  const [turretRecoil, setTurretRecoil] = useState(false);
  const [screenShake, setScreenShake] = useState(false);
  const [targetShattered, setTargetShattered] = useState(false);
  const [targetDeflected, setTargetDeflected] = useState(false);
  const [floatingTexts, setFloatingTexts] = useState<
    { id: string; text: string; x: number; y: number; color: string }[]
  >([]);

  // Machine Gun Turret Position (Center bottom)
  const gunX = 50; // 50%
  const gunY = 88; // 88%

  // Enemy Position: KEPT FAR from the machine gun at the top horizon (17% to 22%)
  const targetX = 50;
  const targetY = 18 + (marchProgressPct / 100) * 4; // strictly between 18% and 22%

  // Real-time distance in meters (counts down from 95m down to 70m)
  const distanceMeters = Math.max(
    70,
    Math.round(95 - (marchProgressPct / 100) * 25)
  );

  // Turret aim angle directly pointing to target enemy's center
  const aimAngleDeg = useMemo(() => {
    const dx = targetX - gunX;
    const dy = targetY - gunY;
    const rad = Math.atan2(dy, dx);
    return rad * (180 / Math.PI) + 90; // 0deg is straight up
  }, [targetX, targetY]);

  // Shoot arrow handler when player taps A, B, C, or D
  const handleShootOption = useCallback(
    (choiceIndex: number) => {
      if (!currentEnemy || isPaused || activeArrows.length > 0) return;

      const isCorrect = choiceIndex === currentEnemy.shuffledCorrectIndex;
      const letter = CHOICE_LETTERS[choiceIndex] || "A";

      // Trigger crisp gun recoil
      setTurretRecoil(true);
      setTimeout(() => setTurretRecoil(false), 160);

      if (!soundMuted) {
        playShotSound();
      }

      // Create new ultra-fast ballistic projectile
      const newArrow: FlyingArrow = {
        id: `arrow-${Date.now()}`,
        letter,
        startX: gunX,
        startY: gunY,
        currentX: gunX,
        currentY: gunY,
        targetX,
        targetY,
        vx: (targetX - gunX) * 0.15,
        vy: (targetY - gunY) * 0.15,
        progress: 0,
        isCorrect,
        state: "flying",
        rotation: aimAngleDeg,
        createdAt: Date.now(),
      };

      setActiveArrows([newArrow]);
      onSelectChoice(choiceIndex);
    },
    [
      currentEnemy,
      isPaused,
      activeArrows.length,
      soundMuted,
      gunX,
      gunY,
      targetX,
      targetY,
      aimAngleDeg,
      onSelectChoice,
    ]
  );

  // Fast ballistic bullet flight loop (fast speed + shatter resolution)
  useEffect(() => {
    let animFrame: number;

    const update = () => {
      setActiveArrows((prevArrows) => {
        return prevArrows
          .map((arrow) => {
            if (arrow.state === "flying") {
              // Ultra-fast bullet speed: increments by 0.28 per tick (hits in ~80ms)
              const nextProgress = arrow.progress + 0.28;
              if (nextProgress >= 1) {
                if (arrow.isCorrect) {
                  // Direct hit: Shatter the target!
                  setTargetShattered(true);
                  setTimeout(() => setTargetShattered(false), 380);

                  const hitPts = 100 * (combo >= 2 ? combo : 1);
                  setFloatingTexts((ft) => [
                    ...ft,
                    {
                      id: `ft-${Date.now()}`,
                      text: `🎯 SHATTERED! +${hitPts}`,
                      x: arrow.targetX,
                      y: arrow.targetY - 5,
                      color: "#38bdf8",
                    },
                  ]);

                  onArrowImpactResolved(true);
                  return null as unknown as FlyingArrow;
                } else {
                  // Deflection (Wrong answer)
                  if (!soundMuted) {
                    playRicochetSound();
                  }
                  setTargetDeflected(true);
                  setTimeout(() => setTargetDeflected(false), 350);

                  setScreenShake(true);
                  setTimeout(() => setScreenShake(false), 250);

                  setFloatingTexts((ft) => [
                    ...ft,
                    {
                      id: `ft-${Date.now()}`,
                      text: "🛡️ DEFLECTED (-1 HP)",
                      x: arrow.targetX,
                      y: arrow.targetY - 5,
                      color: "#f43f5e",
                    },
                  ]);

                  onArrowImpactResolved(false);

                  return {
                    ...arrow,
                    state: "bouncing" as const,
                    currentX: arrow.targetX,
                    currentY: arrow.targetY,
                    vx: (Math.random() - 0.5) * 6,
                    vy: 2.5,
                    rotation: arrow.rotation + 150,
                  };
                }
              }

              const curX = arrow.startX + (arrow.targetX - arrow.startX) * nextProgress;
              const curY = arrow.startY + (arrow.targetY - arrow.startY) * nextProgress;
              return {
                ...arrow,
                progress: nextProgress,
                currentX: curX,
                currentY: curY,
              };
            } else if (arrow.state === "bouncing") {
              const nextY = arrow.currentY + arrow.vy;
              const nextX = arrow.currentX + arrow.vx;
              if (nextY > 105) return null as unknown as FlyingArrow;
              return {
                ...arrow,
                currentX: nextX,
                currentY: nextY,
                vy: arrow.vy + 0.6,
              };
            }
            return arrow;
          })
          .filter(Boolean) as FlyingArrow[];
      });

      // Float texts upward
      setFloatingTexts((prev) =>
        prev
          .map((t) => ({ ...t, y: t.y - 0.35 }))
          .filter((t) => t.y > 2)
      );

      animFrame = requestAnimationFrame(update);
    };

    animFrame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animFrame);
  }, [onArrowImpactResolved, combo, soundMuted]);

  // Keyboard shortcut listener (1-4 or A-D)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isPaused) return;
      const key = e.key.toUpperCase();

      if (["1", "2", "3", "4"].includes(key)) {
        const idx = parseInt(key, 10) - 1;
        if (idx < (currentEnemy?.shuffledChoices.length || 0)) {
          handleShootOption(idx);
        }
      } else if (["A", "B", "C", "D"].includes(key)) {
        const idx = key.charCodeAt(0) - 65;
        if (idx < (currentEnemy?.shuffledChoices.length || 0)) {
          handleShootOption(idx);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPaused, currentEnemy, handleShootOption]);

  const choices = currentEnemy?.shuffledChoices || [];
  const timePct = Math.max(0, Math.min(100, (timeRemainingSec / totalTimeSec) * 100));
  const isTimeLow = timeRemainingSec <= 5;

  return (
    <div
      className={`fixed inset-0 z-50 w-screen h-screen overflow-hidden bg-[#030712] text-slate-100 flex flex-col justify-between select-none touch-none overscroll-none ${
        screenShake ? "animate-wiggle" : ""
      }`}
      style={{
        WebkitTouchCallout: "none",
        WebkitUserSelect: "none",
      }}
    >
      {/* Top Laser Line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-amber-400 to-rose-500 z-50" />

      {/* ── 1. TOP MILITARY HUD ── */}
      <div className="relative z-40 w-full max-w-lg mx-auto pt-2 sm:pt-3 px-3 sm:px-4 bg-gradient-to-b from-slate-950/95 via-slate-950/85 to-transparent backdrop-blur-md">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between text-xs mb-1.5 gap-2">
          {/* Exit / Back Button */}
          {onExit && (
            <button
              onClick={onExit}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-900 border border-white/10 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors shadow-sm"
              title="Exit Battle"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="text-[11px] font-mono font-bold">Exit</span>
            </button>
          )}

          {/* Armor Plates & Allowed Misses */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 px-3 py-1 rounded-xl border border-white/10 shadow-inner">
            <Shield className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400/30" />
            <span className="text-[11px] font-mono font-black text-cyan-300">
              {tower.hp}/{tower.maxHp} HP
            </span>
            <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-bold border border-white/5">
              {difficulty}
            </span>
          </div>

          {/* Wave & Streak */}
          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded-full bg-slate-900 text-[10px] font-mono text-cyan-300 font-bold border border-cyan-400/20 shadow-sm">
              WAVE {waveNumber}
            </span>
            {combo >= 2 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-[10px] font-mono text-amber-300 font-bold border border-amber-400/40">
                {combo}x
              </span>
            )}
          </div>

          {/* Score & Audio/Pause */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-mono font-black text-white px-2 py-0.5 rounded-lg bg-slate-900/80 border border-white/5">
              {score.toLocaleString()}
            </span>

            <button
              onClick={onToggleMute}
              title={soundMuted ? "Unmute" : "Mute"}
              className="p-1 rounded-lg bg-slate-900 border border-white/10 text-slate-400 hover:text-white"
            >
              {soundMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={onTogglePause}
              title={isPaused ? "Resume" : "Pause"}
              className="p-1 rounded-lg bg-slate-900 border border-white/10 text-slate-400 hover:text-white"
            >
              {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Smooth Countdown Timer Bar */}
        <div className="h-1.5 w-full rounded-full bg-slate-950 overflow-hidden mb-2 border border-white/5">
          <div
            className={`h-full transition-all duration-100 ease-linear rounded-full ${
              isTimeLow
                ? "bg-rose-500 shadow-[0_0_8px_#f43f5e]"
                : isFrozen
                ? "bg-cyan-300 animate-pulse shadow-[0_0_8px_#38bdf8]"
                : "bg-gradient-to-r from-cyan-400 via-amber-400 to-rose-400"
            }`}
            style={{ width: `${timePct}%` }}
          />
        </div>

        {/* Compact Question Prompt & Choices Header */}
        {currentEnemy && (
          <div className="rounded-2xl border border-cyan-400/25 bg-slate-950/95 p-2.5 shadow-2xl backdrop-blur-md">
            <div className="text-[11px] sm:text-xs text-white font-medium leading-snug line-clamp-3 mb-1.5">
              <MathText text={currentEnemy.question.prompt} />
            </div>

            <div className="grid grid-cols-2 gap-1.5 text-[10px]">
              {choices.map((choice, idx) => {
                const letter = CHOICE_LETTERS[idx] || String(idx + 1);
                const isEliminated = currentEnemy.eliminatedChoiceIndices.includes(idx);

                return (
                  <div
                    key={idx}
                    className={`flex items-start gap-1 p-1 rounded-lg border leading-tight ${
                      isEliminated
                        ? "border-slate-800 bg-slate-950/40 text-slate-600 line-through opacity-40"
                        : "border-slate-800/80 bg-slate-900/60 text-slate-200"
                    }`}
                  >
                    <span className="font-mono font-bold text-cyan-400 shrink-0">
                      {letter}:
                    </span>
                    <span className="truncate">
                      <MathText text={choice} />
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── 2. LONG-RANGE BATTLEFIELD (LIGHTWEIGHT & ENEMIES FAR FROM GUN) ── */}
      <div className="relative flex-1 w-full max-w-lg mx-auto overflow-hidden">
        {/* Receding Perspective Warzone Ground */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#060a14] via-[#040710] to-[#02040a] pointer-events-none" />

        {/* Perspective Runway Laser Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
          <line x1="50%" y1="10%" x2="15%" y2="100%" stroke="#38bdf8" strokeWidth="1" strokeDasharray="4 4" />
          <line x1="50%" y1="10%" x2="35%" y2="100%" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="50%" y1="10%" x2="65%" y2="100%" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="50%" y1="10%" x2="85%" y2="100%" stroke="#38bdf8" strokeWidth="1" strokeDasharray="4 4" />
          <line x1="30%" y1="20%" x2="70%" y2="20%" stroke="#38bdf8" strokeWidth="1" />
        </svg>

        {/* Long Range Distance Indicator */}
        <div className="absolute top-[16%] left-3 text-[9px] font-mono text-cyan-400/80 pointer-events-none uppercase tracking-wider font-bold">
          LONG RANGE HORIZON [{distanceMeters}m]
        </div>

        {/* Stasis Chronos Freeze Overlay */}
        {isFrozen && (
          <div className="absolute inset-0 z-20 bg-cyan-400/10 backdrop-blur-[1px] flex items-center justify-center pointer-events-none animate-pulse">
            <span className="px-3.5 py-1 rounded-full bg-cyan-950/90 border border-cyan-400/60 text-cyan-200 text-xs font-mono font-bold shadow-lg">
              ❄️ CHRONOS STASIS ACTIVE ({Math.ceil(freezeRemainingSec)}s)
            </span>
          </div>
        )}

        {/* Tactical Pause Overlay */}
        {isPaused && (
          <div className="absolute inset-0 z-40 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-4">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest mb-1">
              WISDOM TOWER DEFENSE
            </span>
            <p className="text-xl font-display font-bold text-white mb-4">
              Tactical Engagement Paused
            </p>
            <button
              onClick={onTogglePause}
              className="inline-flex items-center gap-2 rounded-2xl bg-cyan-500 px-6 py-3 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition-colors shadow-lg shadow-cyan-500/30"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Resume Combat</span>
            </button>
          </div>
        )}

        {/* Targeting Reticle Laser Line from Gun to Target */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
          <line
            x1={`${gunX}%`}
            y1={`${gunY}%`}
            x2={`${targetX}%`}
            y2={`${targetY}%`}
            stroke="rgba(56, 189, 248, 0.4)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
        </svg>

        {/* ── ACTIVE TARGET ADVERSARY: PLACED FAR AT THE HORIZON (TOP 18%) ── */}
        {currentEnemy && (
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2 z-25 pointer-events-none transition-all duration-300"
            style={{
              left: `${targetX}%`,
              top: `${targetY}%`,
            }}
          >
            {/* Target Reticle Hud */}
            <div className="relative flex flex-col items-center">
              {/* Distance Tag */}
              <div className="mb-1 flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-950/90 border border-cyan-400/50 shadow-md">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                <span className="text-[9px] font-mono font-black text-cyan-300 uppercase tracking-wider">
                  TARGET {distanceMeters}m
                </span>
              </div>

              {/* Lightweight Icon-based Enemy Core (Smooth, zero GPU lag) */}
              <div
                className={`relative flex items-center justify-center w-16 h-16 rounded-2xl border-2 transition-all duration-200 shadow-2xl ${
                  targetShattered
                    ? "scale-125 border-cyan-300 bg-cyan-400/40 shadow-cyan-400/80"
                    : targetDeflected
                    ? "scale-90 border-rose-500 bg-rose-950/80 shadow-rose-500/50"
                    : currentEnemy.type === "boss"
                    ? "border-rose-500 bg-rose-950/60 shadow-rose-500/40"
                    : currentEnemy.type === "fast"
                    ? "border-cyan-400 bg-cyan-950/60 shadow-cyan-500/40"
                    : currentEnemy.type === "tank"
                    ? "border-amber-400 bg-amber-950/60 shadow-amber-500/40"
                    : "border-sky-400 bg-slate-900/80 shadow-sky-500/30"
                }`}
              >
                {/* Clean Simple Icon based on enemy type */}
                {currentEnemy.type === "boss" ? (
                  <Skull className="w-8 h-8 text-rose-400 animate-pulse" />
                ) : currentEnemy.type === "fast" ? (
                  <Zap className="w-8 h-8 text-cyan-300" />
                ) : currentEnemy.type === "tank" ? (
                  <Shield className="w-8 h-8 text-amber-400" />
                ) : (
                  <Target className="w-8 h-8 text-sky-400" />
                )}

                {/* Rotating Corner Crosshair Reticle */}
                <div className="absolute -inset-1.5 border border-cyan-400/30 rounded-2xl pointer-events-none" />

                {/* Shatter Fracture Shards Burst Effect on hit */}
                {targetShattered && (
                  <div className="absolute inset-0 pointer-events-none">
                    <span className="absolute -top-3 -left-3 w-4 h-4 bg-cyan-300 rotate-45 animate-ping shadow-[0_0_10px_#38bdf8]" />
                    <span className="absolute -top-3 -right-3 w-4 h-4 bg-amber-300 -rotate-45 animate-ping shadow-[0_0_10px_#fbbf24]" />
                    <span className="absolute -bottom-3 -left-3 w-4 h-4 bg-white rotate-12 animate-ping shadow-[0_0_10px_#ffffff]" />
                    <span className="absolute -bottom-3 -right-3 w-4 h-4 bg-sky-400 -rotate-12 animate-ping shadow-[0_0_10px_#38bdf8]" />
                  </div>
                )}
              </div>

              {/* Label below core */}
              <span className="mt-1 text-[9px] font-mono font-bold text-slate-300 uppercase tracking-wider">
                {currentEnemy.type === "boss" ? "Commander" : currentEnemy.loreLabel}
              </span>
            </div>
          </div>
        )}

        {/* ── FAST FLYING BALLISTIC PROJECTILES ── */}
        {activeArrows.map((arrow) => {
          const letterIdx = CHOICE_LETTERS.indexOf(arrow.letter);
          const theme = BUTTON_THEMES[letterIdx] || BUTTON_THEMES[0];

          return (
            <div
              key={arrow.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-none"
              style={{
                left: `${arrow.currentX}%`,
                top: `${arrow.currentY}%`,
                transform: `translate(-50%, -50%) rotate(${arrow.rotation}deg)`,
              }}
            >
              <div
                className={`relative flex flex-col items-center justify-center px-2 py-3 rounded-full font-mono font-black text-xs shadow-2xl transition-transform ${
                  arrow.state === "bouncing"
                    ? "bg-rose-500 text-white shadow-rose-500/80 scale-95"
                    : `bg-gradient-to-t ${theme.arrowGrad} text-slate-950 shadow-[0_0_15px_${theme.glow}] scale-110`
                }`}
              >
                <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[8px] border-b-white -mt-1" />
                <span className="font-black text-[12px] drop-shadow-md">
                  {arrow.letter}
                </span>
                <div className="w-1.5 h-4 bg-gradient-to-b from-amber-300 via-orange-500 to-transparent rounded-full -mb-2 animate-pulse" />
              </div>
            </div>
          );
        })}

        {/* Floating Combat Texts */}
        {floatingTexts.map((ft) => (
          <div
            key={ft.id}
            className="absolute -translate-x-1/2 z-50 pointer-events-none font-mono font-black text-xs px-3 py-1 rounded-full bg-slate-950/95 border border-white/20 shadow-2xl"
            style={{ left: `${ft.x}%`, top: `${ft.y}%`, color: ft.color }}
          >
            {ft.text}
          </div>
        ))}

        {/* ── 3. MACHINE GUN TURRET AT BOTTOM (88%) ── */}
        <div
          className="absolute left-1/2 -translate-x-1/2 bottom-1 z-35 flex flex-col items-center pointer-events-none"
          style={{
            transform: `translate(-50%, 0) rotate(${aimAngleDeg * 0.4}deg) ${
              turretRecoil ? "translateY(6px)" : ""
            }`,
            transition: "transform 0.08s ease-out",
          }}
        >
          {turretRecoil && (
            <div className="flex gap-2 -mb-2.5 z-40">
              <div className="h-5 w-2.5 bg-amber-300 rounded-full animate-ping shadow-[0_0_16px_#f59e0b]" />
              <div className="h-5 w-2.5 bg-amber-300 rounded-full animate-ping shadow-[0_0_16px_#f59e0b]" />
            </div>
          )}

          <div className="flex gap-2 mb-1">
            <div className="h-8 w-2 bg-gradient-to-t from-slate-800 via-slate-700 to-cyan-400 rounded-t-sm border-x border-slate-600 shadow-md" />
            <div className="h-8 w-2 bg-gradient-to-t from-slate-800 via-slate-700 to-cyan-400 rounded-t-sm border-x border-slate-600 shadow-md" />
          </div>

          <div className="h-9 w-14 rounded-xl bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 border border-cyan-400/50 shadow-2xl flex items-center justify-center relative">
            <div className="h-2.5 w-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#38bdf8] animate-pulse" />
          </div>

          <div className="h-3 w-18 bg-slate-900 border-t border-white/30 rounded-t-xl shadow-lg" />
        </div>
      </div>

      {/* ── 3. BOTTOM FIRING BUTTONS & POWERUPS ── */}
      <div className="relative z-40 w-full max-w-lg mx-auto p-2 sm:p-2.5 pt-1.5 bg-slate-950/95 border-t border-white/10 backdrop-blur-md">
        {/* Tactical Power-Ups Bar */}
        <div className="flex items-center justify-between gap-1.5 mb-1.5">
          <button
            onClick={onActivateFreeze}
            disabled={inventory.freeze <= 0 || isFrozen || isPaused}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-mono border transition-all ${
              inventory.freeze > 0 && !isFrozen
                ? "border-cyan-400/50 bg-cyan-950/40 text-cyan-200 active:scale-95"
                : "border-slate-800 bg-slate-900/40 text-slate-600 opacity-40 cursor-not-allowed"
            }`}
          >
            <Snowflake className="w-3 h-3 text-cyan-400" />
            <span>STASIS ({inventory.freeze})</span>
          </button>

          <button
            onClick={onActivateFiftyFifty}
            disabled={
              inventory.fiftyFifty <= 0 ||
              (currentEnemy?.eliminatedChoiceIndices.length ?? 0) > 0 ||
              isPaused
            }
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-mono border transition-all ${
              inventory.fiftyFifty > 0 &&
              (currentEnemy?.eliminatedChoiceIndices.length ?? 0) === 0
                ? "border-emerald-400/50 bg-emerald-950/40 text-emerald-200 active:scale-95"
                : "border-slate-800 bg-slate-900/40 text-slate-600 opacity-40 cursor-not-allowed"
            }`}
          >
            <SplitSquareVertical className="w-3 h-3 text-emerald-400" />
            <span>50/50 ({inventory.fiftyFifty})</span>
          </button>

          <button
            onClick={onActivateExtraHeart}
            disabled={inventory.extraHeart <= 0 || tower.hp >= tower.maxHp || isPaused}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-mono border transition-all ${
              inventory.extraHeart > 0 && tower.hp < tower.maxHp
                ? "border-rose-400/50 bg-rose-950/40 text-rose-200 active:scale-95"
                : "border-slate-800 bg-slate-900/40 text-slate-600 opacity-40 cursor-not-allowed"
            }`}
          >
            <Shield className="w-3 h-3 text-rose-400" />
            <span>REPAIR ({inventory.extraHeart})</span>
          </button>

          <button
            onClick={onActivateSkip}
            disabled={inventory.skip <= 0 || isPaused}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-mono border transition-all ${
              inventory.skip > 0
                ? "border-amber-400/50 bg-amber-950/40 text-amber-200 active:scale-95"
                : "border-slate-800 bg-slate-900/40 text-slate-600 opacity-40 cursor-not-allowed"
            }`}
          >
            <FastForward className="w-3 h-3 text-amber-400" />
            <span>SKIP ({inventory.skip})</span>
          </button>
        </div>

        {/* 4 Large Mobile Thumb Firing Buttons: [ A ], [ B ], [ C ], [ D ] */}
        <div className="grid grid-cols-4 gap-2">
          {CHOICE_LETTERS.map((letter, idx) => {
            const isEliminated = currentEnemy?.eliminatedChoiceIndices.includes(idx);
            const theme = BUTTON_THEMES[idx] || BUTTON_THEMES[0];

            return (
              <button
                key={letter}
                disabled={isEliminated || isPaused || activeArrows.length > 0}
                onClick={() => handleShootOption(idx)}
                className={`group relative flex flex-col items-center justify-center py-2.5 sm:py-3 rounded-2xl font-mono font-black text-lg transition-all cursor-pointer shadow-lg active:scale-90 border ${
                  isEliminated
                    ? "border-slate-800 bg-slate-900 text-slate-700 opacity-30 cursor-not-allowed"
                    : isPaused || activeArrows.length > 0
                    ? "border-slate-800 bg-slate-800 text-slate-400 opacity-60 cursor-default"
                    : `bg-gradient-to-b ${theme.bg} active:brightness-125`
                }`}
              >
                <span className="leading-none drop-shadow-md text-xl sm:text-2xl font-black">
                  {letter}
                </span>
                <span className="text-[9px] font-sans font-bold tracking-widest uppercase opacity-85 mt-0.5">
                  FIRE
                </span>
              </button>
            );
          })}
        </div>

        <p className="text-center text-[10px] font-mono text-slate-500 mt-1">
          Tap [A, B, C, D] or press keys 1–4 to fire at locked-on adversary
        </p>
      </div>
    </div>
  );
}
