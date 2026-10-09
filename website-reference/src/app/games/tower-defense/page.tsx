import { Metadata } from "next";
import TowerDefenseGame from "@/components/games/tower-defense/TowerDefenseGame";

export const metadata: Metadata = {
  title: "Tower Defense of Knowledge | Wisdom Tower Academy",
  description:
    "Survive academic waves and defend your Knowledge Citadel using authentic national entrance and exit exam questions.",
};

export default function TowerDefensePage() {
  return (
    <div className="w-full h-full overflow-hidden">
      <TowerDefenseGame />
    </div>
  );
}

