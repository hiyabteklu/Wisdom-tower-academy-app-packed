"use client";

import { useState } from "react";
import { PowerUpType } from "@/lib/games/tower-defense/types";
import { Snowflake, SplitSquareVertical, Heart, FastForward, Trophy, ArrowRight, Check } from "lucide-react";

interface Props {
  isOpen: boolean;
  waveNumber: number;
  waveScore: number;
  currentCombo: number;
  accuracyPct: number;
  onDeployNextWave: (chosenPowerUp: PowerUpType) => void;
}

const POWER_UP_REWARDS: {
  type: PowerUpType;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  accent: string;
}[] = [
  {
    type: "freeze",
    title: "Chronos Stasis",
    subtitle: "Halts enemy march and question timer for 12 seconds",
    icon: <Snowflake className="w-5 h-5 text-cyan-400" />,
    accent: "border-cyan-500/30 hover:border-cyan-400 bg-cyan-950/20 hover:bg-cyan-950/40",
  },
  {
    type: "fiftyFifty",
    title: "Logic Filter (50/50)",
    subtitle: "Eliminates 2 incorrect answer choices immediately",
    icon: <SplitSquareVertical className="w-5 h-5 text-emerald-400" />,
    accent: "border-emerald-500/30 hover:border-emerald-400 bg-emerald-950/20 hover:bg-emerald-950/40",
  },
  {
    type: "extraHeart",
    title: "Fortify Core (+1 HP)",
    subtitle: "Repairs the Knowledge Citadel by +1 health point",
    icon: <Heart className="w-5 h-5 text-rose-400" />,
    accent: "border-rose-500/30 hover:border-rose-400 bg-rose-950/20 hover:bg-rose-950/40",
  },
  {
    type: "skip",
    title: "Tactical Deflection",
    subtitle: "Bypasses any high-threat question without taking damage",
    icon: <FastForward className="w-5 h-5 text-amber-400" />,
    accent: "border-amber-500/30 hover:border-amber-400 bg-amber-950/20 hover:bg-amber-950/40",
  },
];

export default function WaveClearedModal({
  isOpen,
  waveNumber,
  waveScore,
  currentCombo,
  accuracyPct,
  onDeployNextWave,
}: Props) {
  const [selectedReward, setSelectedReward] = useState<PowerUpType>("freeze");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-cyan-500/30 bg-slate-900 p-6 sm:p-8 shadow-2xl shadow-cyan-950/50">
        {/* Glow */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-emerald-400 to-cyan-400" />

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300">
            <Trophy className="w-6 h-6 text-cyan-300" />
          </div>
          <div>
            <h2 className="text-xl font-display font-extrabold text-white tracking-tight">
              Wave {waveNumber} Defended
            </h2>
            <p className="text-xs text-cyan-300/80 font-mono">
              Sector Securing Successful | Reinforcements Available
            </p>
          </div>
        </div>

        {/* Performance Statistics Grid */}
        <div className="grid grid-cols-3 gap-2.5 mb-6 text-center">
          <div className="rounded-2xl border border-white/5 bg-slate-950/50 p-3">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-0.5">
              Score Earned
            </span>
            <span className="text-base sm:text-lg font-bold text-white font-mono">
              +{waveScore}
            </span>
          </div>

          <div className="rounded-2xl border border-white/5 bg-slate-950/50 p-3">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-0.5">
              Accuracy
            </span>
            <span className="text-base sm:text-lg font-bold text-emerald-400 font-mono">
              {accuracyPct}%
            </span>
          </div>

          <div className="rounded-2xl border border-white/5 bg-slate-950/50 p-3">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-0.5">
              Active Streak
            </span>
            <span className="text-base sm:text-lg font-bold text-amber-400 font-mono">
              {currentCombo}x
            </span>
          </div>
        </div>

        {/* Power-up Choice Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Select 1 Tactical Supply Reward
            </span>
            <span className="text-[10px] font-mono text-cyan-400">
              Earned for Academic Valor
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {POWER_UP_REWARDS.map((item) => {
              const isChosen = selectedReward === item.type;
              return (
                <button
                  key={item.type}
                  onClick={() => setSelectedReward(item.type)}
                  className={`group relative flex items-start gap-3 rounded-2xl border p-3.5 text-left transition-all ${
                    item.accent
                  } ${
                    isChosen
                      ? "ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-900 border-transparent shadow-lg shadow-cyan-500/20"
                      : "opacity-80 hover:opacity-100"
                  }`}
                >
                  <div className="mt-0.5 flex-shrink-0">{item.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white tracking-tight">
                        {item.title}
                      </span>
                      {isChosen && (
                        <Check className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                      {item.subtitle}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Deploy Action */}
        <div className="flex justify-end">
          <button
            onClick={() => onDeployNextWave(selectedReward)}
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-6 py-3 font-semibold text-slate-950 shadow-lg shadow-cyan-950/50 hover:brightness-110 active:scale-95 transition-all text-sm font-display tracking-wide"
          >
            <span>Deploy Wave {waveNumber + 1}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
