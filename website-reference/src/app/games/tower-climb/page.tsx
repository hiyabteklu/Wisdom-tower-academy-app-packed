import { Metadata } from "next";
import CategoryBackButton from "@/components/CategoryBackButton";
import TowerClimbApp from "@/components/games/tower-climb/TowerClimbApp";

export const metadata: Metadata = {
  title: "Tower Climb | Wisdom Tower Academy",
  description:
    "Ascend vertical course towers chapter by chapter. Solve question-bank drills, unlock zones with your scholarly owl, and conquer boss floors.",
};

export default function TowerClimbPage() {
  return (
    <div className="relative min-h-[90vh]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
        <CategoryBackButton fallback="/academy" />
      </div>
      <TowerClimbApp />
    </div>
  );
}
