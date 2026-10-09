"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  EnemyUnit,
  TowerState,
  PowerUpInventory,
  PowerUpType,
  DefenseRunStats,
  TowerTrack,
  MissedQuestionReview,
  EnemyType,
} from "@/lib/games/tower-defense/types";
import {
  GameDifficulty,
  DIFFICULTY_MAX_MISSES,
  getMaxMissesForDifficulty,
  INITIAL_POWER_UPS,
  CHRONOS_STASIS_DURATION_SEC,
  getComboMultiplier,
  BASE_POINTS,
  getWaveConfig,
  calculateDefenseRank,
} from "@/lib/games/tower-defense/config";
import { fairShuffleChoices } from "@/lib/games/tower-defense/fair-shuffle";
import { saveDefenseRun } from "@/lib/games/tower-defense/high-scores";
import ArcadeMobileBattlefield from "./ArcadeMobileBattlefield";
import WaveClearedModal from "./WaveClearedModal";
import ResultsModal from "./ResultsModal";
import TowerSelector from "./TowerSelector";
import {
  playCorrectSound,
  playWrongSound,
  playFiftyPercentSound,
  playCelebrationSound,
  triggerHaptic,
} from "@/lib/sound-haptics";
import { triggerCorrectConfetti } from "@/lib/confetti";

type GamePhase =
  | "select-tower"
  | "playing"
  | "wave-clear"
  | "game-over";

interface Props {
  initialTowerId?: string;
  onExit?: () => void;
}

export default function TowerDefenseGame({ initialTowerId, onExit }: Props) {
  const router = useRouter();

  const handleExit = useCallback(() => {
    if (onExit) {
      onExit();
    } else {
      router.push("/learning");
    }
  }, [onExit, router]);

  // Navigation & High-level State
  const [phase, setPhase] = useState<GamePhase>("select-tower");
  const [selectedTrack, setSelectedTrack] = useState<TowerTrack | null>(null);
  const [difficulty, setDifficulty] = useState<GameDifficulty>("medium");

  // Core Game Session State
  const [currentWave, setCurrentWave] = useState(1);
  const [tower, setTower] = useState<TowerState>({
    maxHp: 10,
    hp: 10,
    isBreached: false,
  });
  const [inventory, setInventory] = useState<PowerUpInventory>(INITIAL_POWER_UPS);

  // Active Combat State
  const [enemiesQueue, setEnemiesQueue] = useState<EnemyUnit[]>([]);
  const [currentEnemy, setCurrentEnemy] = useState<EnemyUnit | null>(null);
  const [timeRemainingSec, setTimeRemainingSec] = useState<number>(25);
  const [totalQuestionTimeSec, setTotalQuestionTimeSec] = useState<number>(25);
  const [isFrozen, setIsFrozen] = useState<boolean>(false);
  const [freezeRemainingSec, setFreezeRemainingSec] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [soundMuted, setSoundMuted] = useState<boolean>(false);

  // Scoring & Metrics
  const [score, setScore] = useState(0);
  const [waveStartScore, setWaveStartScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [attemptedCount, setAttemptedCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [missedQuestions, setMissedQuestions] = useState<MissedQuestionReview[]>([]);
  const [finalStats, setFinalStats] = useState<DefenseRunStats | null>(null);

  // Staged choice selection ref for flying arrow
  const pendingChoiceRef = useRef<number | null>(null);

  // Question pool cycling index
  const questionPoolIndexRef = useRef(0);

  // Generate Enemy Unit from Exam Questions
  const createEnemyUnit = useCallback(
    (type: EnemyType, timeLimitSec: number): EnemyUnit => {
      if (!selectedTrack || selectedTrack.questions.length === 0) {
        throw new Error("No exam questions available in track");
      }

      const qIndex = questionPoolIndexRef.current % selectedTrack.questions.length;
      questionPoolIndexRef.current += 1;
      const baseQuestion = selectedTrack.questions[qIndex];

      const { shuffledChoices, shuffledCorrectIndex } = fairShuffleChoices(
        baseQuestion.choices,
        baseQuestion.correctIndex
      );

      const isTankOrBoss = type === "tank" || type === "boss";
      const maxHp = isTankOrBoss ? 2 : 1;

      return {
        id: `enemy-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        question: baseQuestion,
        shuffledChoices,
        shuffledCorrectIndex,
        eliminatedChoiceIndices: [],
        type,
        maxHp,
        hp: maxHp,
        speedMultiplier: type === "fast" ? 1.3 : 1.0,
        timeLimitSec,
        title: baseQuestion.examTitle,
        loreLabel: type === "boss" ? "Grand Inquisitor" : "Academic Adversary",
      };
    },
    [selectedTrack]
  );

  // End the game session and record local statistics
  const triggerGameOver = useCallback(
    (clearedWaves: number) => {
      if (!selectedTrack) return;
      const acc = attemptedCount > 0 ? Math.round((correctCount / attemptedCount) * 100) : 0;
      const defenseRank = calculateDefenseRank(clearedWaves, acc);
      const earnedXp = score + clearedWaves * 250;

      const stats: DefenseRunStats = {
        towerId: selectedTrack.id,
        towerTitle: selectedTrack.title,
        subject: selectedTrack.subject,
        score,
        waveReached: currentWave,
        wavesCleared: clearedWaves,
        totalQuestions: attemptedCount,
        correctAnswers: correctCount,
        accuracyPct: acc,
        maxCombo,
        defenseXp: earnedXp,
        defenseRank,
        dateIso: new Date().toISOString(),
        missedQuestions,
      };

      saveDefenseRun(stats);
      setFinalStats(stats);
      setPhase("game-over");
    },
    [
      selectedTrack,
      attemptedCount,
      correctCount,
      score,
      currentWave,
      maxCombo,
      missedQuestions,
    ]
  );

  // Advance to next enemy in wave or trigger wave completion
  const advanceToNextEnemy = useCallback(() => {
    if (enemiesQueue.length > 0) {
      const next = enemiesQueue[0];
      setEnemiesQueue((prev) => prev.slice(1));
      setCurrentEnemy(next);
      setTimeRemainingSec(next.timeLimitSec);
      setTotalQuestionTimeSec(next.timeLimitSec);
      setIsFrozen(false);
      setFreezeRemainingSec(0);
      setPhase("playing");
    } else {
      // Wave cleared!
      if (!soundMuted) playCelebrationSound();
      triggerHaptic("celebrate");
      triggerCorrectConfetti();
      setPhase("wave-clear");
    }
  }, [enemiesQueue, soundMuted]);

  // Handle Timeout (Enemy breaches citadel)
  const handleTimeout = useCallback(() => {
    if (!currentEnemy) return;

    setAttemptedCount((a) => a + 1);
    setCombo(0);

    const newHp = Math.max(0, tower.hp - 1);
    setTower((prev) => ({ ...prev, hp: newHp }));

    if (!soundMuted) playWrongSound();
    triggerHaptic("wrong");

    const correctChoiceText =
      currentEnemy.shuffledChoices[currentEnemy.shuffledCorrectIndex] || "Correct Choice";

    const missedItem: MissedQuestionReview = {
      question: currentEnemy.question,
      correctChoiceText,
      solution: currentEnemy.question.solution,
      timestamp: Date.now(),
    };
    setMissedQuestions((prev) => [...prev, missedItem]);

    // Check if player has run out of attempts (Game ends after 5 hard, 10 medium, 15 easy)
    if (newHp <= 0) {
      setTimeout(() => {
        triggerGameOver(currentWave - 1);
      }, 300);
    } else {
      // Answer does NOT pop up mid-game! Advance immediately
      advanceToNextEnemy();
    }
  }, [currentEnemy, tower.hp, soundMuted, currentWave, triggerGameOver, advanceToNextEnemy]);

  // Main countdown timer
  useEffect(() => {
    if (phase !== "playing" || isPaused || !currentEnemy) return;

    const interval = setInterval(() => {
      if (isFrozen) {
        setFreezeRemainingSec((sec) => {
          if (sec <= 1) {
            setIsFrozen(false);
            return 0;
          }
          return sec - 0.1;
        });
      } else {
        setTimeRemainingSec((prev) => {
          const next = prev - 0.1;
          if (next <= 0) {
            clearInterval(interval);
            handleTimeout();
            return 0;
          }
          return next;
        });
      }
    }, 100);

    return () => clearInterval(interval);
  }, [phase, isPaused, isFrozen, currentEnemy, handleTimeout]);

  // Player clicks choice / fires machine gun arrow
  const handleSelectChoice = useCallback(
    (choiceIndex: number) => {
      if (!currentEnemy || phase !== "playing" || isPaused) return;
      pendingChoiceRef.current = choiceIndex;
      setAttemptedCount((a) => a + 1);
    },
    [currentEnemy, phase, isPaused]
  );

  // Arrow impacts target enemy
  const handleArrowImpactResolved = useCallback(
    (isCorrect: boolean) => {
      if (!currentEnemy) return;
      const choiceIndex = pendingChoiceRef.current ?? 0;

      if (isCorrect) {
        // Correct answer!
        if (currentEnemy.hp > 1) {
          setCurrentEnemy((prev) => (prev ? { ...prev, hp: prev.hp - 1 } : null));
          if (!soundMuted) playFiftyPercentSound();
          triggerHaptic("light");
          setScore((s) => s + 50);
        } else {
          // Enemy destroyed!
          const nextCombo = combo + 1;
          setCombo(nextCombo);
          if (nextCombo > maxCombo) setMaxCombo(nextCombo);

          const multiplier = getComboMultiplier(nextCombo);
          const points = (BASE_POINTS[currentEnemy.type] || 100) * multiplier;
          setScore((s) => s + points);
          setCorrectCount((c) => c + 1);

          if (!soundMuted) playCorrectSound();
          triggerHaptic("correct");

          if (nextCombo >= 5) {
            triggerCorrectConfetti();
          }

          advanceToNextEnemy();
        }
      } else {
        // Wrong answer: deduct attempt, NO mid-game popup, answer reviewed at the end!
        const newHp = Math.max(0, tower.hp - 1);
        setTower((prev) => ({ ...prev, hp: newHp }));
        setCombo(0);

        if (!soundMuted) playWrongSound();
        triggerHaptic("wrong");

        const selectedText = currentEnemy.shuffledChoices[choiceIndex];
        const correctChoiceText =
          currentEnemy.shuffledChoices[currentEnemy.shuffledCorrectIndex] || "Correct Choice";

        const missedItem: MissedQuestionReview = {
          question: currentEnemy.question,
          selectedChoiceIndex: choiceIndex,
          selectedChoiceText: selectedText,
          correctChoiceText,
          solution: currentEnemy.question.solution,
          timestamp: Date.now(),
        };
        setMissedQuestions((prev) => [...prev, missedItem]);

        // Check if game over threshold reached (5 hard, 10 medium, 15 easy)
        if (newHp <= 0) {
          setTimeout(() => {
            triggerGameOver(currentWave - 1);
          }, 350);
        } else {
          // Advance immediately to next question without interrupting popup!
          setTimeout(() => {
            advanceToNextEnemy();
          }, 200);
        }
      }
    },
    [
      currentEnemy,
      combo,
      maxCombo,
      soundMuted,
      tower.hp,
      currentWave,
      advanceToNextEnemy,
      triggerGameOver,
    ]
  );

  // Initialize Wave Enemies
  const startWave = useCallback(
    (waveNum: number) => {
      if (!selectedTrack) return;
      const config = getWaveConfig(waveNum);
      const newEnemies: EnemyUnit[] = [];

      for (let i = 0; i < config.enemyCount; i++) {
        let type: EnemyType = "basic";
        if (config.hasBoss && i === config.enemyCount - 1) {
          type = "boss";
        } else if (waveNum >= 2 && i % 3 === 1) {
          type = "fast";
        } else if (waveNum >= 3 && i === config.enemyCount - 2) {
          type = "tank";
        }
        newEnemies.push(createEnemyUnit(type, config.timePerQuestionSec));
      }

      setWaveStartScore(score);
      setEnemiesQueue(newEnemies.slice(1));
      setCurrentEnemy(newEnemies[0]);
      setTimeRemainingSec(config.timePerQuestionSec);
      setTotalQuestionTimeSec(config.timePerQuestionSec);
      setIsFrozen(false);
      setFreezeRemainingSec(0);
      setPhase("playing");
    },
    [selectedTrack, createEnemyUnit, score]
  );

  // Start a new Run with chosen Citadel & chosen difficulty
  const handleSelectTrack = useCallback(
    (track: TowerTrack, chosenDifficulty?: GameDifficulty) => {
      const activeDiff = chosenDifficulty || difficulty;
      const allowedMisses = getMaxMissesForDifficulty(activeDiff);

      setSelectedTrack(track);
      setDifficulty(activeDiff);
      questionPoolIndexRef.current = 0;
      setCurrentWave(1);
      setTower({ maxHp: allowedMisses, hp: allowedMisses, isBreached: false });
      setInventory(INITIAL_POWER_UPS);
      setScore(0);
      setCombo(0);
      setMaxCombo(0);
      setAttemptedCount(0);
      setCorrectCount(0);
      setMissedQuestions([]);
      setFinalStats(null);
      setIsPaused(false);

      // Start wave 1
      setTimeout(() => {
        const config = getWaveConfig(1);
        const enemies: EnemyUnit[] = [];
        for (let i = 0; i < config.enemyCount; i++) {
          let type: EnemyType = "basic";
          if (i === 1) type = "fast";
          const qIndex = i % track.questions.length;
          const q = track.questions[qIndex];
          const { shuffledChoices, shuffledCorrectIndex } = fairShuffleChoices(
            q.choices,
            q.correctIndex
          );
          enemies.push({
            id: `enemy-${Date.now()}-${i}`,
            question: q,
            shuffledChoices,
            shuffledCorrectIndex,
            eliminatedChoiceIndices: [],
            type,
            maxHp: 1,
            hp: 1,
            speedMultiplier: type === "fast" ? 1.3 : 1.0,
            timeLimitSec: config.timePerQuestionSec,
            title: q.examTitle,
            loreLabel: "Academic Adversary",
          });
        }
        questionPoolIndexRef.current = config.enemyCount;
        setEnemiesQueue(enemies.slice(1));
        setCurrentEnemy(enemies[0]);
        setTimeRemainingSec(config.timePerQuestionSec);
        setTotalQuestionTimeSec(config.timePerQuestionSec);
        setPhase("playing");
      }, 50);
    },
    [difficulty]
  );

  // Next Wave deploy
  const handleDeployNextWave = useCallback(() => {
    const nextWaveNum = currentWave + 1;
    setCurrentWave(nextWaveNum);
    startWave(nextWaveNum);
  }, [currentWave, startWave]);

  // Power-up activation handlers
  const activateFreeze = useCallback(() => {
    if (inventory.freeze <= 0 || isFrozen || isPaused) return;
    setInventory((inv) => ({ ...inv, freeze: inv.freeze - 1 }));
    setIsFrozen(true);
    setFreezeRemainingSec(CHRONOS_STASIS_DURATION_SEC);
    if (!soundMuted) playFiftyPercentSound();
    triggerHaptic("light");
  }, [inventory.freeze, isFrozen, isPaused, soundMuted]);

  const activateFiftyFifty = useCallback(() => {
    if (!currentEnemy || inventory.fiftyFifty <= 0 || isPaused) return;
    if (currentEnemy.eliminatedChoiceIndices.length > 0) return;

    const wrongIndices = currentEnemy.shuffledChoices
      .map((_, idx) => idx)
      .filter((idx) => idx !== currentEnemy.shuffledCorrectIndex);

    // Shuffle and pick 2 to eliminate
    const shuffledWrong = [...wrongIndices].sort(() => 0.5 - Math.random());
    const eliminated = shuffledWrong.slice(0, 2);

    setCurrentEnemy((prev) =>
      prev ? { ...prev, eliminatedChoiceIndices: eliminated } : null
    );
    setInventory((inv) => ({ ...inv, fiftyFifty: inv.fiftyFifty - 1 }));
    if (!soundMuted) playFiftyPercentSound();
    triggerHaptic("light");
  }, [currentEnemy, inventory.fiftyFifty, isPaused, soundMuted]);

  const activateExtraHeart = useCallback(() => {
    if (inventory.extraHeart <= 0 || tower.hp >= tower.maxHp || isPaused) return;
    setInventory((inv) => ({ ...inv, extraHeart: inv.extraHeart - 1 }));
    setTower((prev) => ({ ...prev, hp: Math.min(prev.maxHp, prev.hp + 1) }));
    if (!soundMuted) playCorrectSound();
    triggerHaptic("light");
  }, [inventory.extraHeart, tower.hp, tower.maxHp, isPaused, soundMuted]);

  const activateSkip = useCallback(() => {
    if (inventory.skip <= 0 || isPaused) return;
    setInventory((inv) => ({ ...inv, skip: inv.skip - 1 }));
    if (!soundMuted) playFiftyPercentSound();
    triggerHaptic("light");
    advanceToNextEnemy();
  }, [inventory.skip, isPaused, soundMuted, advanceToNextEnemy]);

  const marchProgressPct = totalQuestionTimeSec > 0
    ? Math.max(0, Math.min(100, ((totalQuestionTimeSec - timeRemainingSec) / totalQuestionTimeSec) * 100))
    : 0;

  // View: Tower Selection Screen
  if (phase === "select-tower") {
    return (
      <TowerSelector
        onSelectTower={handleSelectTrack}
        selectedDifficulty={difficulty}
        onDifficultyChange={setDifficulty}
      />
    );
  }

  // View: Game Over & Full Review Screen
  if (phase === "game-over" && finalStats) {
    return (
      <ResultsModal
        stats={finalStats}
        onRetry={() => {
          if (selectedTrack) handleSelectTrack(selectedTrack, difficulty);
        }}
        onSelectAnotherTower={() => setPhase("select-tower")}
      />
    );
  }

  return (
    <div className="relative w-full h-full">
      <ArcadeMobileBattlefield
        currentEnemy={currentEnemy}
        upcomingEnemies={enemiesQueue}
        tower={tower}
        score={score}
        combo={combo}
        waveNumber={currentWave}
        timeRemainingSec={timeRemainingSec}
        totalTimeSec={totalQuestionTimeSec}
        isFrozen={isFrozen}
        freezeRemainingSec={freezeRemainingSec}
        inventory={inventory}
        soundMuted={soundMuted}
        isPaused={isPaused}
        difficulty={difficulty}
        onSelectChoice={handleSelectChoice}
        onToggleMute={() => setSoundMuted(!soundMuted)}
        onTogglePause={() => setIsPaused(!isPaused)}
        onActivateFreeze={activateFreeze}
        onActivateFiftyFifty={activateFiftyFifty}
        onActivateExtraHeart={activateExtraHeart}
        onActivateSkip={activateSkip}
        marchProgressPct={marchProgressPct}
        onArrowImpactResolved={handleArrowImpactResolved}
        onExit={handleExit}
      />

      {/* Wave Cleared Reward Modal */}
      <WaveClearedModal
        isOpen={phase === "wave-clear"}
        waveNumber={currentWave}
        waveScore={score - waveStartScore}
        currentCombo={combo}
        accuracyPct={
          attemptedCount > 0 ? Math.round((correctCount / attemptedCount) * 100) : 100
        }
        onDeployNextWave={handleDeployNextWave}
      />
    </div>
  );
}
