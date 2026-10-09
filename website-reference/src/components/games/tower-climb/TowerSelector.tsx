"use client";

import { useEffect, useState } from "react";
import { CourseTower } from "@/lib/games/tower-climb/types";
import { getPlayableCourseTowers } from "@/lib/games/tower-climb/tower-courses";
import { loadClimbProfile } from "@/lib/games/tower-climb/store";
import OwlMascot from "./OwlMascot";
import {
  Compass,
  Star,
  Lock,
  ArrowRight,
  Flame,
  Sparkles,
  BookOpen,
} from "lucide-react";
import Link from "next/link";

interface Props {
  onSelectTower: (tower: CourseTower) => void;
  onOpenDailyClimb: () => void;
  onOpenReviewAttic: () => void;
}

export default function TowerSelector({
  onSelectTower,
  onOpenDailyClimb,
  onOpenReviewAttic,
}: Props) {
  const [towers, setTowers] = useState<CourseTower[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(() => loadClimbProfile());

  useEffect(() => {
    let cancelled = false;
    getPlayableCourseTowers().then((res) => {
      if (!cancelled) {
        setTowers(res);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="relative min-h-[85vh] py-10 sm:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Hero Header */}
        <div className="text-center mb-10 sm:mb-14">
          <div className="flex justify-center mb-3">
            <OwlMascot size={68} mood="idle" />
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/25 text-amber-300 text-xs font-semibold uppercase tracking-[0.2em] mb-4">
            <Compass className="w-4 h-4 text-amber-400" />
            <span>Academic Progression Ascent</span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            Tower Climb
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed mb-6">
            Ascend towering courses floor by floor. Each floor represents one chapter of question-bank drills.
            Solve accurately, unlock new zones, and light the way with your scholarly owl.
          </p>

          {/* Player Mini Strip (Level, XP, Streak, Attic) */}
          <div className="inline-flex flex-wrap items-center justify-center gap-3 p-2 rounded-2xl bg-slate-900/90 border border-white/10 shadow-lg text-xs font-mono">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-950 text-cyan-300 font-bold">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Level {profile.level} ({profile.totalXp} XP)</span>
            </span>

            <button
              onClick={onOpenDailyClimb}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-300 hover:bg-orange-500/20 transition-colors cursor-pointer"
            >
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span>Streak: {profile.streakDays}d</span>
            </button>

            <button
              onClick={onOpenReviewAttic}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-950 border border-white/5 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>Attic: {profile.reviewAttic.length} Qs</span>
            </button>
          </div>
        </div>

        {/* Towers List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
            <p className="mt-4 text-xs font-mono text-slate-400">
              Summoning Course Towers & Chapter Records...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            {towers.map((tower) => {
              return (
                <div
                  key={tower.id}
                  className="group relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-7 shadow-xl hover:border-amber-400/50 hover:bg-slate-900 transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Top Row: Subject Badge & Total Stars */}
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <span className="text-[11px] font-mono uppercase tracking-wider font-bold px-2.5 py-1 rounded-full bg-slate-800 border border-white/5 text-slate-300">
                        {tower.subject} · {tower.level}
                      </span>

                      <div className="flex items-center gap-1 text-xs font-mono text-amber-300 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>
                          {tower.totalStarsEarned}/{tower.maxPossibleStars}
                        </span>
                      </div>
                    </div>

                    <h2 className="text-xl font-display font-extrabold text-white tracking-tight mb-2 group-hover:text-amber-300 transition-colors">
                      {tower.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-6">
                      Ascend through 10 chapter floors of pure curriculum drills. Defeat the Chapter 5 and Chapter 10 Bosses.
                    </p>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
                        <span>Ascension Progress</span>
                        <span>
                          Floor {tower.highestUnlockedFloor} / {tower.totalFloors}
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-slate-950 overflow-hidden border border-white/5">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-400 to-amber-400 transition-all"
                          style={{
                            width: `${(tower.highestUnlockedFloor / tower.totalFloors) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom CTA */}
                  <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-400">
                      {tower.courseName}
                    </span>

                    <button
                      onClick={() => onSelectTower(tower)}
                      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 px-4 py-2 text-xs font-bold text-slate-950 shadow-md transition-all cursor-pointer font-display"
                    >
                      <span>Enter Tower</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer Guidance */}
        <div className="mt-12 text-center text-xs text-slate-500 max-w-lg mx-auto leading-relaxed">
          <p>
            Tower Climb questions are exclusively extracted from your course Question Banks.
            Every 5th floor features a Boss Floor testing cumulative recall across all previous chapters.
          </p>
        </div>
      </div>
    </div>
  );
}
