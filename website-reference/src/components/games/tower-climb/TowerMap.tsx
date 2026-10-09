"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { CourseTower, TowerFloor } from "@/lib/games/tower-climb/types";
import { ZONE_DETAILS } from "@/lib/games/tower-climb/config";
import OwlMascot from "./OwlMascot";
import {
  Star,
  Lock,
  Skull,
  Compass,
  ArrowUp,
  DownloadCloud,
  ChevronRight,
  Flame,
  Award,
  BookOpen,
} from "lucide-react";

interface Props {
  tower: CourseTower;
  onSelectFloor: (floor: TowerFloor) => void;
  onOpenReviewAttic: () => void;
  onOpenDailyClimb: () => void;
  reviewAtticCount: number;
  dailyClimbCompleted: boolean;
  totalXp: number;
  streakDays: number;
}

export default function TowerMap({
  tower,
  onSelectFloor,
  onOpenReviewAttic,
  onOpenDailyClimb,
  reviewAtticCount,
  dailyClimbCompleted,
  totalXp,
  streakDays,
}: Props) {
  const currentFloorRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [showJumpToMe, setShowJumpToMe] = useState(false);

  // Reverse floors so Floor 1 is at bottom, Floor 10 at top (vertical climb!)
  const reversedFloors = useMemo(() => {
    return [...tower.floors].reverse();
  }, [tower.floors]);

  // Current active floor (playable or highest unlocked)
  const currentFloor = useMemo(() => {
    return (
      tower.floors.find((f) => f.state === "playable") ||
      tower.floors[tower.floors.length - 1]
    );
  }, [tower.floors]);

  // Auto-scroll to current floor on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentFloorRef.current) {
        currentFloorRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [currentFloor]);

  // Detect scroll away from current floor to show "Jump to Me" button
  const handleScroll = () => {
    if (!scrollContainerRef.current || !currentFloorRef.current) return;
    const container = scrollContainerRef.current;
    const target = currentFloorRef.current;

    const containerRect = container.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();

    const isVisible =
      targetRect.top >= containerRect.top &&
      targetRect.bottom <= containerRect.bottom;

    setShowJumpToMe(!isVisible);
  };

  const jumpToMe = () => {
    if (currentFloorRef.current) {
      currentFloorRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  };

  return (
    <div className="relative min-h-[90vh] flex flex-col justify-between py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 w-full">
        {/* Top Header Strip: Course Title, Progress Stars, Review Attic & Daily Climb */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5 rounded-3xl border border-white/10 bg-slate-900/90 shadow-2xl backdrop-blur-xl mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-md shadow-amber-500/10">
              <Compass className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-display font-extrabold text-white tracking-tight">
                {tower.title}
              </h1>
              <p className="text-xs text-slate-400">
                {tower.level} · {tower.subject}
              </p>
            </div>
          </div>

          {/* Quick Action Badges */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Stars Count */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-slate-950 border border-white/5 text-amber-300 font-mono text-xs font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>
                {tower.totalStarsEarned}/{tower.maxPossibleStars}
              </span>
            </div>

            {/* Daily Climb Button */}
            <button
              onClick={onOpenDailyClimb}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border text-xs font-semibold transition-all cursor-pointer ${
                dailyClimbCompleted
                  ? "bg-slate-950 border-white/5 text-slate-400"
                  : "bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-400/40 text-amber-300 animate-pulse hover:bg-amber-500/30"
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span>Daily Climb ({streakDays}d)</span>
            </button>

            {/* Review Attic Button */}
            <button
              onClick={onOpenReviewAttic}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-slate-950 border border-white/5 text-slate-300 hover:text-white hover:border-cyan-400/30 text-xs font-semibold transition-all cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
              <span>Attic</span>
              {reviewAtticCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-mono font-bold">
                  {reviewAtticCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Vertical Tower Map Corridor */}
        <div className="relative rounded-3xl border border-white/10 bg-slate-950/90 shadow-2xl p-4 sm:p-8 backdrop-blur-2xl overflow-hidden">
          {/* Subtle Ambient Radial Glows */}
          <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-cyan-500/5 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-96 h-96 rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />

          {/* Central Vertical Climb Axis (Path Cable) */}
          <div className="absolute top-8 bottom-8 left-1/2 -translate-x-1/2 w-1.5 bg-gradient-to-b from-rose-500 via-amber-400 to-cyan-500 opacity-25 rounded-full pointer-events-none hidden sm:block" />

          {/* Scrollable Container */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="relative space-y-6 max-h-[68vh] overflow-y-auto pr-1 py-4 scroll-smooth"
          >
            {reversedFloors.map((fl) => {
              const isCurrent = fl.floorNumber === currentFloor.floorNumber;
              const isCleared = fl.state === "cleared";
              const isPlayable = fl.state === "playable";
              const isLocked = fl.state === "locked";
              const isNeedsDownload = fl.state === "needs-download";
              const zoneMeta = ZONE_DETAILS[fl.zone];

              return (
                <div
                  key={fl.floorNumber}
                  ref={isCurrent ? currentFloorRef : null}
                  className={`relative transition-all duration-300 ${
                    isCurrent ? "scale-[1.02] z-10" : ""
                  }`}
                >
                  {/* Floor Card Container */}
                  <div
                    onClick={() => {
                      if (!isLocked && !isNeedsDownload) {
                        onSelectFloor(fl);
                      }
                    }}
                    className={`relative overflow-hidden rounded-2xl border p-4 sm:p-5 transition-all duration-200 cursor-pointer ${
                      isCurrent
                        ? "border-amber-400/80 bg-slate-900 shadow-xl shadow-amber-500/10 ring-2 ring-amber-400/30"
                        : isCleared
                        ? "border-emerald-500/30 bg-slate-900/80 hover:border-emerald-400/60"
                        : isPlayable
                        ? "border-cyan-400/50 bg-slate-900/80 hover:border-cyan-400"
                        : isNeedsDownload
                        ? "border-amber-500/20 bg-slate-950/70 opacity-70"
                        : "border-slate-800 bg-slate-950/40 opacity-50 cursor-not-allowed"
                    }`}
                  >
                    {/* Left Accent Bar by Zone */}
                    <div
                      className="absolute top-0 bottom-0 left-0 w-1.5"
                      style={{ backgroundColor: zoneMeta.accentHex }}
                    />

                    <div className="flex items-center justify-between gap-4">
                      {/* Left: Floor Icon & Info */}
                      <div className="flex items-center gap-3.5 min-w-0">
                        {/* Floor Waypoint Badge */}
                        <div
                          className={`relative flex items-center justify-center h-12 w-12 rounded-2xl border text-sm font-mono font-bold shrink-0 transition-transform ${
                            fl.isBoss
                              ? "bg-rose-500/20 border-rose-500/40 text-rose-300"
                              : isCurrent
                              ? "bg-amber-400/20 border-amber-400 text-amber-300 animate-pulse"
                              : isCleared
                              ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                              : "bg-slate-900 border-white/5 text-slate-400"
                          }`}
                        >
                          {fl.isBoss ? (
                            <Skull className="w-5 h-5 text-rose-400" />
                          ) : isLocked ? (
                            <Lock className="w-4 h-4 text-slate-500" />
                          ) : isNeedsDownload ? (
                            <DownloadCloud className="w-4 h-4 text-amber-400" />
                          ) : (
                            <span>{fl.floorNumber}</span>
                          )}
                        </div>

                        {/* Text Metadata */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                              {zoneMeta.name}
                            </span>
                            {fl.isBoss && (
                              <span className="text-[9px] font-mono uppercase font-bold px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                Boss Floor
                              </span>
                            )}
                          </div>

                          <h3 className="font-display font-bold text-sm sm:text-base text-white tracking-tight truncate">
                            {fl.title}
                          </h3>
                          <p className="text-xs text-slate-400 truncate">
                            {fl.subtitle}
                          </p>
                        </div>
                      </div>

                      {/* Right: Stars, Owl Mascot on Current Floor, or Lock Status */}
                      <div className="flex items-center gap-3 shrink-0">
                        {/* Owl Mascot indicator sitting on the current floor! */}
                        {isCurrent && (
                          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-mono font-bold animate-pulse">
                            <OwlMascot size={28} mood="idle" />
                            <span>Current Level</span>
                          </div>
                        )}

                        {/* Stars earned for this floor */}
                        {isCleared && (
                          <div className="flex items-center gap-1">
                            {[1, 2, 3].map((starIdx) => (
                              <Star
                                key={starIdx}
                                className={`w-4 h-4 ${
                                  starIdx <= fl.stars
                                    ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]"
                                    : "text-slate-800"
                                }`}
                              />
                            ))}
                          </div>
                        )}

                        {isPlayable && (
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold text-xs shadow-md font-display cursor-pointer hover:brightness-110 active:scale-95 transition-all">
                            <span>Climb</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        )}

                        {isLocked && (
                          <span className="text-xs font-mono text-slate-500 flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            <span>Floor {fl.floorNumber}</span>
                          </span>
                        )}

                        {isNeedsDownload && (
                          <span className="text-xs font-mono text-amber-400 flex items-center gap-1">
                            <DownloadCloud className="w-3.5 h-3.5" />
                            <span>Cached online</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* "Jump to Me" Floating Button when scrolled away */}
          {showJumpToMe && (
            <button
              onClick={jumpToMe}
              className="absolute bottom-6 right-6 z-20 flex items-center gap-2 px-4 py-2.5 rounded-full bg-amber-400 text-slate-950 text-xs font-bold font-display shadow-2xl shadow-amber-950/80 hover:bg-amber-300 active:scale-95 transition-all cursor-pointer animate-fade-in"
            >
              <OwlMascot size={22} mood="idle" />
              <span>Jump to Me (Floor {currentFloor.floorNumber})</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
