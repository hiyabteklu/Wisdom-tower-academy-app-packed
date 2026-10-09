"use client";

import { useState, useCallback, useEffect } from "react";
import { CourseTower, TowerFloor } from "@/lib/games/tower-climb/types";
import {
  loadClimbProfile,
  recordDailyClimbCompleted,
} from "@/lib/games/tower-climb/store";
import { getPlayableCourseTowers } from "@/lib/games/tower-climb/tower-courses";
import TowerSelector from "./TowerSelector";
import TowerMap from "./TowerMap";
import FloorPlayView from "./FloorPlayView";
import BossIntroModal from "./BossIntroModal";
import ReviewAtticModal from "./ReviewAtticModal";
import DailyClimbModal from "./DailyClimbModal";

export default function TowerClimbApp() {
  const [view, setView] = useState<"select-tower" | "tower-map" | "playing-floor">("select-tower");
  const [selectedTower, setSelectedTower] = useState<CourseTower | null>(null);
  const [activeFloor, setActiveFloor] = useState<TowerFloor | null>(null);
  const [bossIntroFloor, setBossIntroFloor] = useState<TowerFloor | null>(null);

  // Profile & Meta Modals
  const [profile, setProfile] = useState(() => loadClimbProfile());
  const [isAtticOpen, setIsAtticOpen] = useState(false);
  const [isDailyClimbOpen, setIsDailyClimbOpen] = useState(false);

  // Sync profile from local storage on view changes
  const refreshProfile = useCallback(() => {
    setProfile(loadClimbProfile());
  }, []);

  // When a student picks a course tower
  const handleSelectTower = useCallback((tower: CourseTower) => {
    setSelectedTower(tower);
    setView("tower-map");
  }, []);

  // When a student clicks a floor on the map
  const handleSelectFloor = useCallback((floor: TowerFloor) => {
    if (floor.isBoss) {
      setBossIntroFloor(floor);
    } else {
      setActiveFloor(floor);
      setView("playing-floor");
    }
  }, []);

  // Launch Boss Floor after confirming
  const handleConfirmBoss = useCallback(() => {
    if (bossIntroFloor) {
      setActiveFloor(bossIntroFloor);
      setBossIntroFloor(null);
      setView("playing-floor");
    }
  }, [bossIntroFloor]);

  // When floor is cleared, update local tower floor state and refresh towers list
  const handleFloorCleared = useCallback(
    (stars: number, score: number) => {
      refreshProfile();
      // Reload towers so new stars and unlocked floors reflect immediately
      getPlayableCourseTowers().then((res) => {
        if (selectedTower) {
          const updated = res.find((t) => t.id === selectedTower.id);
          if (updated) setSelectedTower(updated);
        }
      });
    },
    [refreshProfile, selectedTower]
  );

  // Start Daily Climb trial
  const handleStartDailyClimb = useCallback(() => {
    if (!selectedTower && !profile) return;
    // Build a mock daily floor from existing questions
    const dailyQuestions = selectedTower
      ? selectedTower.floors.flatMap((f) => f.questions).slice(0, 8)
      : [];

    if (dailyQuestions.length > 0) {
      const dailyFloor: TowerFloor = {
        floorNumber: 0,
        chapterNumber: 0,
        title: "Daily Expedition Climb",
        subtitle: "8 Mixed Chapter Questions · Daily Flame Trial",
        isBoss: false,
        zone: "stone-foundation",
        state: "playable",
        stars: 0,
        bestScore: 0,
        questions: dailyQuestions,
        isFreePreview: true,
      };

      setActiveFloor(dailyFloor);
      setView("playing-floor");
    }
  }, [selectedTower, profile]);

  return (
    <div className="relative min-h-[85vh]">
      {/* View 1: Select Course Tower */}
      {view === "select-tower" && (
        <TowerSelector
          onSelectTower={handleSelectTower}
          onOpenDailyClimb={() => setIsDailyClimbOpen(true)}
          onOpenReviewAttic={() => setIsAtticOpen(true)}
        />
      )}

      {/* View 2: Tower Map */}
      {view === "tower-map" && selectedTower && (
        <div>
          {/* Top Breadcrumb to return to tower selector */}
          <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-4">
            <button
              onClick={() => {
                refreshProfile();
                setView("select-tower");
              }}
              className="inline-flex items-center gap-1.5 text-xs font-mono text-cyan-300 hover:text-cyan-200 transition-colors cursor-pointer"
            >
              <span>← Select Another Course Tower</span>
            </button>
          </div>

          <TowerMap
            tower={selectedTower}
            onSelectFloor={handleSelectFloor}
            onOpenReviewAttic={() => setIsAtticOpen(true)}
            onOpenDailyClimb={() => setIsDailyClimbOpen(true)}
            reviewAtticCount={profile.reviewAttic.length}
            dailyClimbCompleted={profile.dailyClimb?.isCompletedToday || false}
            totalXp={profile.totalXp}
            streakDays={profile.streakDays}
          />
        </div>
      )}

      {/* View 3: Active Floor Gameplay */}
      {view === "playing-floor" && activeFloor && (
        <FloorPlayView
          floor={activeFloor}
          courseId={selectedTower?.id || "daily-climb"}
          onFloorCleared={handleFloorCleared}
          onExitFloor={() => {
            refreshProfile();
            setView(selectedTower ? "tower-map" : "select-tower");
          }}
        />
      )}

      {/* Boss Intro Modal */}
      {bossIntroFloor && (
        <BossIntroModal
          isOpen={Boolean(bossIntroFloor)}
          floor={bossIntroFloor}
          onEnterBoss={handleConfirmBoss}
          onCancel={() => setBossIntroFloor(null)}
        />
      )}

      {/* Review Attic Modal */}
      <ReviewAtticModal
        isOpen={isAtticOpen}
        items={profile.reviewAttic}
        onClose={() => {
          refreshProfile();
          setIsAtticOpen(false);
        }}
        onItemResolved={refreshProfile}
      />

      {/* Daily Climb Modal */}
      <DailyClimbModal
        isOpen={isDailyClimbOpen}
        isCompletedToday={profile.dailyClimb?.isCompletedToday || false}
        currentStreak={profile.dailyClimb?.currentStreak || 0}
        bestStreak={profile.dailyClimb?.bestStreak || 0}
        onStartDailyClimb={() => {
          // If no tower chosen, pick first available
          if (!selectedTower) {
            getPlayableCourseTowers().then((res) => {
              if (res.length > 0) {
                setSelectedTower(res[0]);
                handleStartDailyClimb();
              }
            });
          } else {
            handleStartDailyClimb();
          }
        }}
        onClose={() => {
          refreshProfile();
          setIsDailyClimbOpen(false);
        }}
      />
    </div>
  );
}
