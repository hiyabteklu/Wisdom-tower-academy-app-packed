"use client";

interface Props {
  className?: string;
  size?: number;
  mood?: "idle" | "climbing" | "celebrating" | "worried" | "reading";
}

export default function OwlMascot({
  className = "",
  size = 56,
  mood = "idle",
}: Props) {
  const isWorried = mood === "worried";
  const isCelebrating = mood === "celebrating";
  const isClimbing = mood === "climbing";

  return (
    <div
      className={`relative inline-flex items-center justify-center transition-transform ${className} ${
        isClimbing ? "animate-bounce" : isCelebrating ? "scale-110" : ""
      }`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
      >
        <defs>
          {/* Feather Plumage Gradient */}
          <linearGradient id="owlBody" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          {/* Chest Vest Gradient */}
          <linearGradient id="owlChest" x1="50" y1="40" x2="50" y2="85" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>

          {/* Lantern Brass Gradient */}
          <linearGradient id="lanternBrass" x1="0" y1="0" x2="20" y2="30" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>

          {/* Lantern Glow */}
          <radialGradient id="lanternGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fef08a" stopOpacity="1" />
            <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </radialGradient>

          {/* Beak & Eyes */}
          <linearGradient id="beakGold" x1="0" y1="0" x2="10" y2="10" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
        </defs>

        {/* Ambient Lantern Glow Halo */}
        <circle cx="82" cy="62" r="18" fill="url(#lanternGlow)" className="animate-pulse opacity-80" />

        {/* Tail Feathers */}
        <path d="M45 80 L50 92 L55 80 Z" fill="#0f172a" />
        <path d="M38 78 L44 89 L48 78 Z" fill="#090d16" />

        {/* Main Body */}
        <path
          d="M25 45 C25 25, 75 25, 75 45 C75 75, 65 85, 50 85 C35 85, 25 75, 25 45 Z"
          fill="url(#owlBody)"
          stroke="#475569"
          strokeWidth="1.5"
        />

        {/* Ear Tufts / Scholarly Horn Feathers */}
        <path d="M26 35 L18 16 L34 26 Z" fill="#1e293b" stroke="#334155" strokeWidth="1" />
        <path d="M74 35 L82 16 L66 26 Z" fill="#1e293b" stroke="#334155" strokeWidth="1" />

        {/* Chest Plumage */}
        <path
          d="M36 48 C36 40, 64 40, 64 48 C64 74, 58 78, 50 78 C42 78, 36 74, 36 48 Z"
          fill="url(#owlChest)"
        />

        {/* Delicate Feather Chevrons on Chest */}
        <path d="M44 54 Q50 58 56 54" stroke="#64748b" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        <path d="M42 62 Q50 66 58 62" stroke="#64748b" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        <path d="M45 70 Q50 73 55 70" stroke="#64748b" strokeWidth="1.2" fill="none" strokeLinecap="round" />

        {/* Left Wing (Resting) */}
        <path
          d="M24 45 C20 58, 22 72, 32 78 C28 72, 28 55, 30 45 Z"
          fill="#0f172a"
          stroke="#334155"
          strokeWidth="1"
        />

        {/* Right Wing (Holding Lantern Staff) */}
        <path
          d="M72 45 C80 50, 84 62, 75 72 C70 65, 70 54, 68 45 Z"
          fill="#0f172a"
          stroke="#334155"
          strokeWidth="1"
        />

        {/* Scholarly Spectacle Frames (Bronze/Amber Wire) */}
        <circle cx="40" cy="38" r="9" stroke="#f59e0b" strokeWidth="1.5" fill="#090d16" />
        <circle cx="60" cy="38" r="9" stroke="#f59e0b" strokeWidth="1.5" fill="#090d16" />
        <line x1="49" y1="38" x2="51" y2="38" stroke="#f59e0b" strokeWidth="1.8" />

        {/* Keen Eyes */}
        <circle cx="40" cy="38" r="6" fill="#fbbf24" />
        <circle cx="60" cy="38" r="6" fill="#fbbf24" />

        {/* Pupils */}
        {isWorried ? (
          <>
            <circle cx="40" cy="37" r="2.5" fill="#0f172a" />
            <circle cx="60" cy="37" r="2.5" fill="#0f172a" />
          </>
        ) : (
          <>
            <circle cx="41" cy="38" r="3.2" fill="#0f172a" />
            <circle cx="61" cy="38" r="3.2" fill="#0f172a" />
            <circle cx="43" cy="36" r="1.2" fill="#ffffff" />
            <circle cx="63" cy="36" r="1.2" fill="#ffffff" />
          </>
        )}

        {/* Sharp Golden Beak */}
        <path d="M47 43 L53 43 L50 51 Z" fill="url(#beakGold)" />

        {/* Small Scholarly Mortarboard Cap when celebrating */}
        {isCelebrating && (
          <g transform="translate(0, -6)">
            <polygon points="50,14 74,21 50,28 26,21" fill="#090d16" stroke="#f59e0b" strokeWidth="1" />
            <rect x="42" y="24" width="16" height="5" rx="2" fill="#0f172a" />
            <line x1="70" y1="22" x2="72" y2="32" stroke="#fbbf24" strokeWidth="1.5" />
            <circle cx="72" cy="33" r="1.5" fill="#fbbf24" />
          </g>
        )}

        {/* The Lantern Staff held by right talon/wing */}
        {/* Chain */}
        <line x1="75" y1="48" x2="82" y2="54" stroke="#d97706" strokeWidth="1.5" strokeDasharray="1 1" />

        {/* Brass Lantern Housing */}
        <polygon points="78,54 86,54 84,52 80,52" fill="#b45309" />
        <rect x="77" y="55" width="10" height="13" rx="1.5" fill="none" stroke="url(#lanternBrass)" strokeWidth="1.5" />

        {/* Glass & Flame */}
        <rect x="78.5" y="56.5" width="7" height="10" fill="#fef08a" opacity="0.9" />
        <ellipse cx="82" cy="62" rx="2" ry="3" fill="#ea580c" />
        <ellipse cx="82" cy="62" rx="1.2" ry="2" fill="#fde047" />

        {/* Base */}
        <rect x="76.5" y="68" width="11" height="2" rx="0.5" fill="#b45309" />

        {/* Feet / Talons */}
        <path d="M42 84 L40 88 M44 84 L44 88 M46 84 L48 88" stroke="#d97706" strokeWidth="2" strokeLinecap="round" />
        <path d="M54 84 L52 88 M56 84 L56 88 M58 84 L60 88" stroke="#d97706" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </div>
  );
}
