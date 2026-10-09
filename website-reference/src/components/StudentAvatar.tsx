"use client";

import {
  GraduationCap,
  Cpu,
  Atom,
  HeartPulse,
  Code2,
  Compass,
  Scale,
  Zap,
  User,
  Crown,
} from "lucide-react";
import { AVATAR_PRESETS } from "@/lib/profile";

interface StudentAvatarProps {
  avatarPreset?: string | null;
  avatarUrl?: string | null;
  name?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
  showGlow?: boolean;
  hasCrown?: boolean;
}

const SIZE_MAP = {
  xs: { box: "w-7 h-7 text-[10px]", icon: "w-3.5 h-3.5", crown: "w-3.5 h-3.5 -top-2.5 -right-1" },
  sm: { box: "w-9 h-9 text-xs", icon: "w-4 h-4", crown: "w-4 h-4 -top-2.5 -right-1" },
  md: { box: "w-11 h-11 text-sm", icon: "w-5 h-5", crown: "w-4.5 h-4.5 -top-3 -right-1" },
  lg: { box: "w-14 h-14 text-base", icon: "w-6 h-6", crown: "w-5 h-5 -top-3.5 -right-1" },
  xl: { box: "w-20 h-20 text-xl", icon: "w-9 h-9", crown: "w-6 h-6 -top-4 -right-1.5" },
  "2xl": { box: "w-24 h-24 text-2xl", icon: "w-11 h-11", crown: "w-7 h-7 -top-4.5 -right-2" },
};

function renderPresetIcon(iconName: string, iconClass: string) {
  switch (iconName) {
    case "GraduationCap":
      return <GraduationCap className={iconClass} />;
    case "Cpu":
      return <Cpu className={iconClass} />;
    case "Atom":
    case "Sparkles":
      return <Atom className={iconClass} />;
    case "HeartPulse":
      return <HeartPulse className={iconClass} />;
    case "Code2":
      return <Code2 className={iconClass} />;
    case "Compass":
      return <Compass className={iconClass} />;
    case "Scale":
      return <Scale className={iconClass} />;
    case "Zap":
      return <Zap className={iconClass} />;
    default:
      return <User className={iconClass} />;
  }
}

export default function StudentAvatar({
  avatarPreset,
  avatarUrl,
  name,
  size = "md",
  className = "",
  showGlow = true,
  hasCrown = false,
}: StudentAvatarProps) {
  const s = SIZE_MAP[size] || SIZE_MAP.md;
  const preset = AVATAR_PRESETS.find((p) => p.id === avatarPreset);

  const crownElement = hasCrown ? (
    <div
      className={`absolute ${s.crown} z-30 pointer-events-none drop-shadow-[0_2px_8px_rgba(245,158,11,0.9)] animate-pulse`}
      title="Scholar Crown: Profile 100% Complete"
    >
      <Crown className="w-full h-full text-amber-300 fill-amber-400 stroke-amber-700" />
    </div>
  ) : null;

  // If a custom image URL is provided (e.g. from Google or uploaded photo)
  if (avatarUrl && !avatarPreset) {
    return (
      <div className={`relative shrink-0 ${s.box} ${className}`}>
        <div className="h-full w-full rounded-2xl overflow-hidden border border-white/20 bg-wisdom-card">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={avatarUrl}
            alt={name || "Student"}
            className="h-full w-full object-cover"
          />
        </div>
        {crownElement}
      </div>
    );
  }

  // If an academic avatar preset is chosen
  if (preset) {
    return (
      <div className={`relative shrink-0 ${s.box} ${className}`}>
        <div
          className={`h-full w-full rounded-2xl flex items-center justify-center font-bold text-white bg-gradient-to-br ${preset.gradient} border ${preset.border} ${
            showGlow ? preset.glow + " shadow-md" : ""
          }`}
        >
          {renderPresetIcon(preset.iconName, s.icon)}
        </div>
        {crownElement}
      </div>
    );
  }

  // Fallback to name initials
  const initials = (name || "Student")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div className={`relative shrink-0 ${s.box} ${className}`}>
      <div className="h-full w-full rounded-2xl flex items-center justify-center font-bold text-white bg-gradient-to-br from-cyan-600 via-sky-700 to-indigo-800 border border-cyan-400/40 shadow-sm">
        {initials || <User className={s.icon} />}
      </div>
      {crownElement}
    </div>
  );
}
