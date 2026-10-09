"use client";

import { useMemo } from "react";
import { EnemyUnit, TowerState } from "@/lib/games/tower-defense/types";
import { Shield, ShieldAlert, Snowflake, Zap, Skull } from "lucide-react";
import MathText from "@/components/MathText";

interface Props {
  currentEnemy: EnemyUnit | null;
  tower: TowerState;
  isFrozen: boolean;
  freezeSecondsRemaining: number;
  marchProgressPct: number; // 0 (far away) to 100 (breached)
  waveNumber: number;
}

export default function BattlefieldRadar({
  currentEnemy,
  tower,
  isFrozen,
  freezeSecondsRemaining,
  marchProgressPct,
  waveNumber,
}: Props) {
  const enemyTypeDetails = useMemo(() => {
    if (!currentEnemy) return null;
    switch (currentEnemy.type) {
      case "boss":
        return {
          label: "Grand Inquisitor",
          badge: "Final Boss Node",
          badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/40",
          icon: <Skull className="w-4 h-4 text-rose-400" />,
        };
      case "tank":
        return {
          label: "Armored Problem Set",
          badge: "Heavy Armor (2 HP)",
          badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
          icon: <Shield className="w-4 h-4 text-amber-400" />,
        };
      case "fast":
        return {
          label: "Speed Incursion",
          badge: "Rapid Cadence",
          badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
          icon: <Zap className="w-4 h-4 text-cyan-400" />,
        };
      default:
        return {
          label: "Standard Question Node",
          badge: "Core Problem",
          badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
          icon: <ShieldAlert className="w-4 h-4 text-emerald-400" />,
        };
    }
  }, [currentEnemy]);

  const clampedProgress = Math.min(100, Math.max(0, marchProgressPct));
  const isDangerZone = clampedProgress > 75;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950/80 p-4 sm:p-5 shadow-2xl backdrop-blur-md">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />

      {/* Top Status Bar: Threat Level & Freeze Status */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 relative">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isDangerZone ? "bg-rose-400" : "bg-cyan-400"} opacity-75`} />
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isDangerZone ? "bg-rose-500" : "bg-cyan-500"}`} />
          </span>
          <span className="text-xs font-mono font-bold tracking-wider uppercase text-slate-300">
            Sector Defense Wave {waveNumber}
          </span>
        </div>

        {isFrozen && (
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-200 text-xs font-semibold animate-pulse">
            <Snowflake className="w-3.5 h-3.5 text-cyan-300" />
            <span>Chronos Stasis: {freezeSecondsRemaining}s</span>
          </div>
        )}

        <div className="text-xs font-mono text-slate-400">
          Breach Proximity:{" "}
          <span className={`font-bold ${isDangerZone ? "text-rose-400 animate-pulse" : "text-cyan-300"}`}>
            {Math.round(clampedProgress)}%
          </span>
        </div>
      </div>

      {/* Active Battlefield Corridor */}
      <div className="relative py-2 px-1">
        {/* Progress Track Line */}
        <div className="relative h-3 w-full rounded-full bg-slate-900 border border-white/10 overflow-hidden">
          {/* Laser Warning Track */}
          <div
            className={`h-full transition-all duration-300 ease-linear rounded-full ${
              isFrozen
                ? "bg-cyan-400/60"
                : isDangerZone
                ? "bg-gradient-to-r from-amber-500 via-rose-500 to-rose-600 animate-pulse"
                : "bg-gradient-to-r from-emerald-500 to-cyan-500"
            }`}
            style={{ width: `${clampedProgress}%` }}
          />

          {/* Stasis Ice Overlay */}
          {isFrozen && (
            <div className="absolute inset-0 bg-cyan-300/30 backdrop-blur-[1px] animate-pulse" />
          )}
        </div>

        {/* Dynamic Marching Units Representation */}
        <div className="relative mt-3 flex items-center justify-between">
          {/* Enemy Node Marker */}
          <div
            className="flex items-center gap-2 transition-all duration-300"
            style={{ marginLeft: `${Math.min(85, clampedProgress * 0.85)}%` }}
          >
            {currentEnemy && enemyTypeDetails ? (
              <div
                className={`relative flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs shadow-lg transition-transform ${
                  isFrozen
                    ? "border-cyan-400 bg-cyan-950/90 text-cyan-200 shadow-cyan-500/30"
                    : isDangerZone
                    ? "border-rose-400 bg-rose-950/90 text-rose-100 animate-bounce shadow-rose-500/40"
                    : "border-slate-700 bg-slate-900 text-slate-200"
                }`}
              >
                {enemyTypeDetails.icon}
                <div className="flex flex-col">
                  <span className="font-bold tracking-tight">{enemyTypeDetails.label}</span>
                  {currentEnemy.maxHp > 1 && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <div className="h-1.5 w-12 rounded-full bg-slate-800 overflow-hidden border border-white/10">
                        <div
                          className="h-full bg-amber-400 transition-all"
                          style={{
                            width: `${(currentEnemy.hp / currentEnemy.maxHp) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-[10px] font-mono text-amber-300">
                        {currentEnemy.hp}/{currentEnemy.maxHp}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-500 italic">Deploying next threat...</div>
            )}
          </div>

          {/* The Knowledge Citadel (Tower) on the Far Right */}
          <div
            className={`flex flex-col items-center justify-center p-2 rounded-2xl border transition-all ${
              tower.hp <= 1
                ? "border-rose-500 bg-rose-950/80 text-rose-200 shadow-lg shadow-rose-500/30 animate-pulse"
                : tower.hp <= 2
                ? "border-amber-500 bg-amber-950/70 text-amber-200"
                : "border-cyan-500/50 bg-slate-900/90 text-cyan-100 shadow-lg shadow-cyan-500/20"
            }`}
          >
            <div className="flex items-center gap-1 font-bold text-xs uppercase tracking-wider">
              <Shield className="w-4 h-4 text-cyan-400" />
              <span>Citadel</span>
            </div>
            <div className="flex items-center gap-1 mt-1">
              {Array.from({ length: tower.maxHp }).map((_, i) => (
                <div
                  key={i}
                  className={`h-2.5 w-2 rounded-sm transition-all ${
                    i < tower.hp
                      ? "bg-gradient-to-t from-cyan-500 to-emerald-400 shadow-sm shadow-cyan-400"
                      : "bg-slate-800 border border-slate-700 opacity-40"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Target Question Sneak-Peek in Tactical Frame */}
      {currentEnemy && (
        <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2 truncate pr-2">
            <span className="text-slate-500 font-mono">Exam Source:</span>
            <span className="text-slate-300 font-medium truncate max-w-[240px] sm:max-w-md">
              {currentEnemy.question.examTitle}
            </span>
          </div>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${enemyTypeDetails?.badgeColor}`}>
            {currentEnemy.question.difficulty || "medium"}
          </span>
        </div>
      )}
    </div>
  );
}
