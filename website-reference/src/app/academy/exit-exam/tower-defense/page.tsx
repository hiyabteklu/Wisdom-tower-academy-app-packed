import { Metadata } from "next";
import CategoryBackButton from "@/components/CategoryBackButton";
import TowerDefenseGame from "@/components/games/tower-defense/TowerDefenseGame";

export const metadata: Metadata = {
  title: "Exit Exam Tower Defense | Wisdom Tower Academy",
  description:
    "Defend your Knowledge Citadel using authentic university exit exam and national leaving questions.",
};

export default function ExitExamTowerDefensePage() {
  return (
    <div className="relative min-h-[90vh]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
        <CategoryBackButton fallback="/academy/exit-exam" />
      </div>
      <TowerDefenseGame />
    </div>
  );
}
