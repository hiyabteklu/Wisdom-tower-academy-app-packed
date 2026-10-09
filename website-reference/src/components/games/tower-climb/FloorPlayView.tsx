"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  TowerFloor,
  ChapterQuestion,
  ClimbPowerUps,
} from "@/lib/games/tower-climb/types";
import {
  STANDARD_FLOOR_HEARTS,
  BOSS_FLOOR_HEARTS,
  STANDARD_QUESTION_TIME_SEC,
  BOSS_QUESTION_TIME_SEC,
  getClimbComboMultiplier,
  calculateStars,
  BASE_QUESTION_XP,
  STAR_BONUS_XP,
  FREEZE_DURATION_SEC,
  POWERUP_STREAK_REWARD_INTERVAL,
} from "@/lib/games/tower-climb/config";
import { fairShuffleChoices } from "@/lib/games/tower-defense/fair-shuffle";
import {
  saveFloorCompletion,
  addMissedQuestionToAttic,
} from "@/lib/games/tower-climb/store";
import MathText from "@/components/MathText";
import OwlMascot from "./OwlMascot";
import SolutionSheet from "./SolutionSheet";
import FloorResultModal from "./FloorResultModal";
import {
  playCorrectSound,
  playWrongSound,
  playFiftyPercentSound,
  playCelebrationSound,
  triggerHaptic,
} from "@/lib/sound-haptics";
import { triggerCorrectConfetti } from "@/lib/confetti";
import {
  Heart,
  Clock,
  SplitSquareVertical,
  Snowflake,
  FastForward,
  Pause,
  Play,
  Volume2,
  VolumeX,
  X,
  Sparkles,
  Shield,
  HelpCircle,
} from "lucide-react";

interface Props {
  floor: TowerFloor;
  courseId: string;
  onFloorCleared: (stars: number, score: number) => void;
  onExitFloor: () => void;
}

const CHOICE_LETTERS = ["A", "B", "C", "D", "E"];

export default function FloorPlayView({
  floor,
  courseId,
  onFloorCleared,
  onExitFloor,
}: Props) {
  // Gameplay Session Setup
  const isBoss = floor.isBoss;
  const initialHearts = isBoss ? BOSS_FLOOR_HEARTS : STANDARD_FLOOR_HEARTS;
  const questionBaseTime = isBoss ? BOSS_QUESTION_TIME_SEC : STANDARD_QUESTION_TIME_SEC;

  // Questions queue
  const questionsQueue = useMemo(() => {
    return [...floor.questions].sort(() => Math.random() - 0.5);
  }, [floor.questions]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [hearts, setHearts] = useState(initialHearts);
  const [timeRemainingSec, setTimeRemainingSec] = useState(questionBaseTime);
  const [isPaused, setIsPaused] = useState(false);
  const [soundMuted, setSoundMuted] = useState(false);

  // Power-up Inventory
  const [powerUps, setPowerUps] = useState<ClimbPowerUps>({
    fiftyFifty: isBoss ? 0 : 1,
    freeze: isBoss ? 0 : 1,
    skip: isBoss ? 0 : 1,
  });
  const [eliminatedChoices, setEliminatedChoices] = useState<number[]>([]);

  // Scoring & Metrics
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);

  // Modals & Sheets
  const [solutionSheetQuestion, setSolutionSheetQuestion] = useState<{
    question: ChapterQuestion;
    selectedText?: string;
    correctText: string;
  } | null>(null);

  const [resultState, setResultState] = useState<{
    isOpen: boolean;
    isVictory: boolean;
    stars: number;
    xpEarned: number;
    newBadges: string[];
  } | null>(null);

  const currentQ = questionsQueue[currentIndex] || null;

  // Active question choices permutation
  const { shuffledChoices, shuffledCorrectIndex } = useMemo(() => {
    if (!currentQ) return { shuffledChoices: [], shuffledCorrectIndex: 0 };
    return fairShuffleChoices(currentQ.choices, currentQ.correctIndex);
  }, [currentQ]);

  // Reset timer on question change
  useEffect(() => {
    setTimeRemainingSec(questionBaseTime);
    setEliminatedChoices([]);
  }, [currentIndex, questionBaseTime]);

  // Advance question or complete floor
  const advanceQuestion = useCallback(() => {
    setSolutionSheetQuestion(null);

    if (currentIndex + 1 < questionsQueue.length) {
      setCurrentIndex((idx) => idx + 1);
    } else {
      // Completed all questions in floor!
      const stars = calculateStars(wrongCount, false);
      const starXp = STAR_BONUS_XP[stars as 1 | 2 | 3] || 50;
      const totalXp = score + starXp;

      const { newBadges } = saveFloorCompletion({
        courseId,
        floorNumber: floor.floorNumber,
        stars,
        score,
        xpEarned: totalXp,
      });

      if (!soundMuted) playCelebrationSound();
      triggerHaptic("celebrate");
      triggerCorrectConfetti();

      setResultState({
        isOpen: true,
        isVictory: true,
        stars,
        xpEarned: totalXp,
        newBadges,
      });

      onFloorCleared(stars, score);
    }
  }, [
    currentIndex,
    questionsQueue.length,
    wrongCount,
    score,
    courseId,
    floor.floorNumber,
    soundMuted,
    onFloorCleared,
  ]);

  // Handle wrong answer or timeout
  const handleMistake = useCallback(
    (selectedChoiceIndex?: number) => {
      if (!currentQ) return;

      const nextHearts = Math.max(0, hearts - 1);
      setHearts(nextHearts);
      setCombo(0);
      setWrongCount((w) => w + 1);

      if (!soundMuted) playWrongSound();
      triggerHaptic("wrong");

      const selectedText =
        selectedChoiceIndex != null ? shuffledChoices[selectedChoiceIndex] : undefined;
      const correctText = shuffledChoices[shuffledCorrectIndex] || "Correct Answer";

      // Record to Review Attic
      addMissedQuestionToAttic({
        question: currentQ,
        selectedText,
        correctText,
        solution: currentQ.solution,
      });

      // Show solution sheet
      setSolutionSheetQuestion({
        question: currentQ,
        selectedText,
        correctText,
      });

      if (nextHearts <= 0) {
        // Failed floor
        setResultState({
          isOpen: true,
          isVictory: false,
          stars: 0,
          xpEarned: Math.round(score / 2),
          newBadges: [],
        });
      }
    },
    [
      currentQ,
      hearts,
      soundMuted,
      shuffledChoices,
      shuffledCorrectIndex,
      score,
    ]
  );

  // Main countdown timer loop
  useEffect(() => {
    if (isPaused || solutionSheetQuestion || resultState?.isOpen || !currentQ) return;

    const timer = setInterval(() => {
      setTimeRemainingSec((t) => {
        if (t <= 0.2) {
          clearInterval(timer);
          handleMistake(undefined); // Timeout
          return 0;
        }
        return t - 0.1;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [isPaused, solutionSheetQuestion, resultState, currentQ, handleMistake]);

  // Choice selection
  const handleSelectChoice = useCallback(
    (choiceIndex: number) => {
      if (solutionSheetQuestion || resultState?.isOpen || isPaused) return;

      const isCorrect = choiceIndex === shuffledCorrectIndex;

      if (isCorrect) {
        const nextCombo = combo + 1;
        setCombo(nextCombo);
        if (nextCombo > maxCombo) setMaxCombo(nextCombo);

        const multiplier = getClimbComboMultiplier(nextCombo);
        const earned = BASE_QUESTION_XP * multiplier;
        setScore((s) => s + earned);

        if (!soundMuted) playCorrectSound();
        triggerHaptic("correct");

        // Reward power-up every 5-streak (except on Boss floors)
        if (!isBoss && nextCombo % POWERUP_STREAK_REWARD_INTERVAL === 0) {
          setPowerUps((p) => ({
            ...p,
            fiftyFifty: p.fiftyFifty + 1,
          }));
          triggerCorrectConfetti();
        }

        advanceQuestion();
      } else {
        handleMistake(choiceIndex);
      }
    },
    [
      solutionSheetQuestion,
      resultState,
      isPaused,
      shuffledCorrectIndex,
      combo,
      maxCombo,
      soundMuted,
      isBoss,
      advanceQuestion,
      handleMistake,
    ]
  );

  // Keyboard navigation [1-4] or [A-D]
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (solutionSheetQuestion || resultState?.isOpen || isPaused) return;
      const key = e.key.toUpperCase();

      if (["1", "2", "3", "4", "5"].includes(key)) {
        const idx = parseInt(key, 10) - 1;
        if (idx < shuffledChoices.length && !eliminatedChoices.includes(idx)) {
          handleSelectChoice(idx);
        }
      } else if (["A", "B", "C", "D", "E"].includes(key)) {
        const idx = key.charCodeAt(0) - 65;
        if (idx < shuffledChoices.length && !eliminatedChoices.includes(idx)) {
          handleSelectChoice(idx);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    solutionSheetQuestion,
    resultState,
    isPaused,
    shuffledChoices.length,
    eliminatedChoices,
    handleSelectChoice,
  ]);

  // Power-up triggers
  const activateFiftyFifty = useCallback(() => {
    if (isBoss || powerUps.fiftyFifty <= 0 || eliminatedChoices.length > 0) return;
    const wrongIndices = shuffledChoices
      .map((_, i) => i)
      .filter((i) => i !== shuffledCorrectIndex);

    const shuffled = [...wrongIndices].sort(() => Math.random() - 0.5);
    setEliminatedChoices(shuffled.slice(0, 2));
    setPowerUps((p) => ({ ...p, fiftyFifty: p.fiftyFifty - 1 }));

    if (!soundMuted) playFiftyPercentSound();
    triggerHaptic("light");
  }, [
    isBoss,
    powerUps.fiftyFifty,
    eliminatedChoices.length,
    shuffledChoices,
    shuffledCorrectIndex,
    soundMuted,
  ]);

  const activateFreeze = useCallback(() => {
    if (isBoss || powerUps.freeze <= 0) return;
    setTimeRemainingSec((t) => t + FREEZE_DURATION_SEC);
    setPowerUps((p) => ({ ...p, freeze: p.freeze - 1 }));

    if (!soundMuted) playFiftyPercentSound();
    triggerHaptic("light");
  }, [isBoss, powerUps.freeze, soundMuted]);

  const activateSkip = useCallback(() => {
    if (isBoss || powerUps.skip <= 0) return;
    setPowerUps((p) => ({ ...p, skip: p.skip - 1 }));
    if (!soundMuted) playFiftyPercentSound();
    triggerHaptic("light");
    advanceQuestion();
  }, [isBoss, powerUps.skip, soundMuted, advanceQuestion]);

  if (!currentQ) return null;

  const timePct = Math.max(0, Math.min(100, (timeRemainingSec / questionBaseTime) * 100));
  const isTimeUrgent = timeRemainingSec <= 5;
  const comboMultiplier = getClimbComboMultiplier(combo);

  return (
    <div className="relative min-h-[85vh] py-4 sm:py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Top HUD: Hearts, Floor Indicator, Owl, Timer, Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5 rounded-3xl border border-white/10 bg-slate-950/80 shadow-2xl backdrop-blur-xl mb-6">
          {/* Hearts */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {Array.from({ length: initialHearts }).map((_, i) => (
                <Heart
                  key={i}
                  className={`w-5 h-5 transition-transform ${
                    i < hearts
                      ? "text-rose-400 fill-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]"
                      : "text-slate-800 opacity-40"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-mono font-bold text-slate-300 ml-1">
              {hearts}/{initialHearts}
            </span>
          </div>

          {/* Floor & Question Badge */}
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/20 text-cyan-300 text-xs font-mono font-bold">
              Floor {floor.floorNumber} · Q{currentIndex + 1}/{questionsQueue.length}
            </span>
            {combo >= 2 && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-mono font-bold border border-amber-400/30">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>{comboMultiplier}x</span>
              </span>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundMuted(!soundMuted)}
              className="p-2 rounded-xl bg-slate-900 border border-white/5 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              {soundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setIsPaused(!isPaused)}
              className="p-2 rounded-xl bg-slate-900 border border-white/5 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              {isPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4" />}
            </button>

            <button
              onClick={onExitFloor}
              className="p-2 rounded-xl bg-slate-900 border border-white/5 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mascot & Timer Strip */}
        <div className="mb-6 flex items-center justify-between gap-4 p-4 rounded-2xl border border-white/5 bg-slate-900/60 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <OwlMascot size={46} mood={hearts <= 1 ? "worried" : "idle"} />
            <div>
              <p className="text-xs font-bold text-white tracking-wide">
                {floor.isBoss ? "Boss Floor Trial" : `Chapter ${floor.chapterNumber} Ascent`}
              </p>
              <p className="text-[11px] text-slate-400">
                {hearts <= 1 ? "Perimeter low, steady your calculations!" : "Illuminate the next step"}
              </p>
            </div>
          </div>

          {/* Timer Display */}
          <div className="flex flex-col items-end w-36 sm:w-48">
            <div className="flex items-center gap-1.5 text-xs font-mono text-slate-300 mb-1">
              <Clock className={`w-3.5 h-3.5 ${isTimeUrgent ? "text-rose-400 animate-spin" : "text-cyan-400"}`} />
              <span className={`font-bold ${isTimeUrgent ? "text-rose-400 animate-pulse" : "text-white"}`}>
                {timeRemainingSec.toFixed(1)}s
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-950 overflow-hidden border border-white/5">
              <div
                className={`h-full transition-all duration-100 ease-linear rounded-full ${
                  isTimeUrgent ? "bg-rose-500" : "bg-gradient-to-r from-cyan-400 to-amber-400"
                }`}
                style={{ width: `${timePct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Tactical Power-Ups Bar (Disabled on Boss Floors) */}
        {!isBoss ? (
          <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-6">
            <button
              onClick={activateFiftyFifty}
              disabled={powerUps.fiftyFifty <= 0 || eliminatedChoices.length > 0 || isPaused}
              className={`flex items-center justify-between p-2.5 sm:p-3 rounded-2xl border text-xs transition-all ${
                powerUps.fiftyFifty > 0 && eliminatedChoices.length === 0
                  ? "border-emerald-500/40 bg-emerald-950/30 text-emerald-200 hover:bg-emerald-950/60 active:scale-95 cursor-pointer"
                  : "border-slate-800 bg-slate-950/30 text-slate-600 opacity-40 cursor-not-allowed"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <SplitSquareVertical className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-semibold hidden sm:inline">50 / 50</span>
              </div>
              <span className="font-mono font-bold bg-slate-900 px-2 py-0.5 rounded text-[11px]">
                {powerUps.fiftyFifty}
              </span>
            </button>

            <button
              onClick={activateFreeze}
              disabled={powerUps.freeze <= 0 || isPaused}
              className={`flex items-center justify-between p-2.5 sm:p-3 rounded-2xl border text-xs transition-all ${
                powerUps.freeze > 0
                  ? "border-cyan-500/40 bg-cyan-950/30 text-cyan-200 hover:bg-cyan-950/60 active:scale-95 cursor-pointer"
                  : "border-slate-800 bg-slate-950/30 text-slate-600 opacity-40 cursor-not-allowed"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Snowflake className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-semibold hidden sm:inline">+10s Freeze</span>
              </div>
              <span className="font-mono font-bold bg-slate-900 px-2 py-0.5 rounded text-[11px]">
                {powerUps.freeze}
              </span>
            </button>

            <button
              onClick={activateSkip}
              disabled={powerUps.skip <= 0 || isPaused}
              className={`flex items-center justify-between p-2.5 sm:p-3 rounded-2xl border text-xs transition-all ${
                powerUps.skip > 0
                  ? "border-amber-500/40 bg-amber-950/30 text-amber-200 hover:bg-amber-950/60 active:scale-95 cursor-pointer"
                  : "border-slate-800 bg-slate-950/30 text-slate-600 opacity-40 cursor-not-allowed"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <FastForward className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-semibold hidden sm:inline">Skip</span>
              </div>
              <span className="font-mono font-bold bg-slate-900 px-2 py-0.5 rounded text-[11px]">
                {powerUps.skip}
              </span>
            </button>
          </div>
        ) : (
          <div className="mb-6 p-2.5 rounded-2xl border border-rose-500/30 bg-rose-950/20 text-center text-xs font-mono text-rose-300 font-bold flex items-center justify-center gap-2">
            <Shield className="w-4 h-4 text-rose-400" />
            <span>Boss Floor Active: Tactical Power-Ups Suppressed</span>
          </div>
        )}

        {/* Big Question Card */}
        <div className="relative rounded-3xl border border-white/12 bg-slate-900/95 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          {/* Pause Overlay */}
          {isPaused && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-3xl bg-slate-950/90 backdrop-blur-md">
              <p className="text-xl font-display font-bold text-white mb-4">
                Climb Paused
              </p>
              <button
                onClick={() => setIsPaused(false)}
                className="inline-flex items-center gap-2 rounded-2xl bg-cyan-400 px-6 py-2.5 text-sm font-bold text-slate-950 hover:bg-cyan-300 transition-colors cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Resume Climb</span>
              </button>
            </div>
          )}

          {/* Question Prompt */}
          <div className="mb-8">
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 mt-1 inline-flex h-7 w-7 items-center justify-center rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-bold font-mono">
                {currentIndex + 1}
              </span>
              <div className="text-base sm:text-lg md:text-xl font-medium text-white leading-relaxed tracking-wide">
                <MathText text={currentQ.prompt} />
              </div>
            </div>
          </div>

          {/* Choices Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6">
            {shuffledChoices.map((choice, index) => {
              const letter = CHOICE_LETTERS[index] || String(index + 1);
              const isEliminated = eliminatedChoices.includes(index);

              return (
                <button
                  key={index}
                  disabled={isEliminated || isPaused}
                  onClick={() => handleSelectChoice(index)}
                  className={`group relative flex items-start gap-3 rounded-2xl border p-4 text-left transition-all cursor-pointer ${
                    isEliminated
                      ? "border-slate-800 bg-slate-950/30 opacity-25 cursor-not-allowed line-through"
                      : "border-slate-700/80 bg-slate-800/70 hover:border-amber-400/80 hover:bg-slate-800 active:scale-[0.98] shadow-sm"
                  }`}
                >
                  <span
                    className={`inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl font-mono text-xs font-bold transition-colors ${
                      isEliminated
                        ? "bg-slate-900 text-slate-600 border border-slate-800"
                        : "bg-slate-900 text-amber-300 border border-amber-400/30 group-hover:bg-amber-400 group-hover:text-slate-950"
                    }`}
                  >
                    {letter}
                  </span>

                  <div className="flex-1 text-sm sm:text-base font-normal text-slate-200 leading-snug pt-1">
                    <MathText text={choice} />
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-white/5">
            <div className="flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
              <span>Keyboard active: press [A-D] or [1-4]</span>
            </div>
            <span className="font-mono text-[11px]">
              Question Bank: Chapter {floor.chapterNumber}
            </span>
          </div>
        </div>

        {/* Pedagogical Solution Sheet (Triggered on Mistake/Timeout) */}
        {solutionSheetQuestion && (
          <SolutionSheet
            isOpen={Boolean(solutionSheetQuestion)}
            question={solutionSheetQuestion.question}
            selectedChoiceText={solutionSheetQuestion.selectedText}
            correctChoiceText={solutionSheetQuestion.correctText}
            heartsRemaining={hearts}
            onAcknowledge={advanceQuestion}
          />
        )}

        {/* Floor Result Celebration Modal */}
        {resultState && (
          <FloorResultModal
            isOpen={resultState.isOpen}
            floor={floor}
            starsEarned={resultState.stars}
            xpEarned={resultState.xpEarned}
            heartsRemaining={hearts}
            totalQuestions={questionsQueue.length}
            wrongCount={wrongCount}
            maxCombo={maxCombo}
            isVictory={resultState.isVictory}
            newBadges={resultState.newBadges}
            onNextFloor={resultState.isVictory ? () => onFloorCleared(resultState.stars, score) : undefined}
            onRetry={() => {
              setResultState(null);
              setHearts(initialHearts);
              setCurrentIndex(0);
              setScore(0);
              setCombo(0);
              setWrongCount(0);
              setTimeRemainingSec(questionBaseTime);
            }}
            onReturnToMap={onExitFloor}
          />
        )}
      </div>
    </div>
  );
}
