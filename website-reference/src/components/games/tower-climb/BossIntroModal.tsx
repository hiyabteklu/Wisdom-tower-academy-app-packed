"use client";

import { TowerFloor } from "@/lib/games/tower-climb/types";
import { Skull, ShieldAlert, ArrowRight, X } from "lucide-react";
import OwlMascot from "./OwlMascot";

interface Props {
  isOpen: boolean;
  floor: TowerFloor;
  onEnterBoss: () => void;
  onCancel: () => void;
}

export default function BossIntroModal({
  isOpen,
  floor,
  onEnterBoss,
  onCancel,
}: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-rose-500/40 bg-slate-900 p-6 sm:p-8 shadow-2xl shadow-rose-950/60 text-center">
        {/* Glow */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-amber-400 to-rose-500" />

        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Skull Icon */}
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-rose-500/15 border border-rose-500/30 text-rose-400 shadow-xl shadow-rose-950/40 animate-pulse">
          <Skull className="w-8 h-8 text-rose-400" />
        </div>

        <p className="text-xs font-mono uppercase tracking-[0.2em] text-rose-300 mb-1">
          Zone Milestone Boss Encounter
        </p>
        <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight mb-3">
          Floor {floor.floorNumber} Boss Test
        </h2>

        <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed mb-6">
          A cumulative examination synthesizing problems from all chapters cleared so far.
          Prepare for an intense trial of your academic mastery.
        </p>

        {/* Boss Rules Grid */}
        <div className="grid grid-cols-3 gap-2.5 mb-6 text-center text-xs font-mono">
          <div className="p-3 rounded-2xl border border-rose-500/20 bg-rose-950/20 text-rose-300">
            <span className="block text-[10px] text-slate-400 uppercase">Questions</span>
            <span className="text-base font-bold">12 Problems</span>
          </div>
          <div className="p-3 rounded-2xl border border-rose-500/20 bg-rose-950/20 text-rose-300">
            <span className="block text-[10px] text-slate-400 uppercase">Perimeter</span>
            <span className="text-base font-bold">4 Hearts</span>
          </div>
          <div className="p-3 rounded-2xl border border-rose-500/20 bg-rose-950/20 text-rose-300">
            <span className="block text-[10px] text-slate-400 uppercase">Supplies</span>
            <span className="text-base font-bold">No Power-Ups</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={onCancel}
            className="px-5 py-3 rounded-2xl border border-white/10 bg-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Review First
          </button>
          <button
            onClick={onEnterBoss}
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 px-7 py-3 text-xs sm:text-sm font-bold text-white shadow-lg shadow-rose-950/50 hover:brightness-110 active:scale-95 transition-all font-display cursor-pointer"
          >
            <span>Engage Boss Trial</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
