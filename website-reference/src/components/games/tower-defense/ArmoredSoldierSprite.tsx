"use client";

import { useMemo } from "react";
import { EnemyType } from "@/lib/games/tower-defense/types";

interface Props {
  type: EnemyType;
  hp: number;
  maxHp: number;
  isTarget?: boolean;
  isFrozen?: boolean;
  isHit?: boolean;
  distanceMeters?: number;
  scale?: number;
  opacity?: number;
  walkingOffset?: number;
  className?: string;
}

export default function ArmoredSoldierSprite({
  type,
  hp,
  maxHp,
  isTarget = false,
  isFrozen = false,
  isHit = false,
  distanceMeters = 30,
  scale = 1,
  opacity = 1,
  walkingOffset = 0,
  className = "",
}: Props) {
  // Color palette and armor trims based on soldier rank/type
  const palette = useMemo(() => {
    switch (type) {
      case "boss":
        return {
          armorBase: "#1c1917", // Heavy black/gunmetal
          armorPlate: "#292524",
          plateHighlight: "#44403c",
          accent: "#ef4444", // Red command trim
          visor: "#f87171",
          glow: "rgba(239, 68, 68, 0.6)",
          camo: "#1e1b18",
          name: "JUGGERNAUT COMMANDER",
        };
      case "fast":
        return {
          armorBase: "#0f172a", // Dark tactical navy
          armorPlate: "#1e293b",
          plateHighlight: "#334155",
          accent: "#38bdf8", // Cyan scout trim
          visor: "#0ea5e9",
          glow: "rgba(56, 189, 248, 0.6)",
          camo: "#0d1b2a",
          name: "VANGUARD RECON",
        };
      default:
        return {
          armorBase: "#141d1a", // Tactical military olive / dark slate
          armorPlate: "#1f2923",
          plateHighlight: "#334139",
          accent: "#f59e0b", // Amber infantry trim
          visor: "#fbbf24",
          glow: "rgba(245, 158, 11, 0.6)",
          camo: "#16231c",
          name: "ARMORED INFANTRY",
        };
    }
  }, [type]);

  const legSway = Math.sin(walkingOffset) * 4;
  const armSway = Math.cos(walkingOffset) * 3;

  return (
    <div
      className={`relative flex flex-col items-center select-none transition-transform duration-100 ${className}`}
      style={{
        transform: `scale(${scale})`,
        opacity,
      }}
    >
      {/* =================================================================== */}
      {/* TACTICAL TARGET HUD (WHEN LOCKED-ON TO CURRENT ACTIVE QUESTION)     */}
      {/* =================================================================== */}
      {isTarget && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center pointer-events-none whitespace-nowrap">
          {/* Target Reticle Brackets */}
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-950/90 border border-cyan-400/60 shadow-[0_0_12px_rgba(56,189,248,0.5)] backdrop-blur-sm animate-pulse">
            <div className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping" />
            <span className="text-[9px] font-mono font-black tracking-widest text-cyan-300 uppercase">
              LOCK-ON [{distanceMeters}m]
            </span>
          </div>

          {/* Unit Name & Health Bar */}
          <div className="mt-1 flex items-center gap-1">
            <div className="h-1.5 w-16 bg-slate-900 border border-white/20 rounded-full overflow-hidden shadow-inner">
              <div
                className={`h-full transition-all duration-200 ${
                  type === "boss"
                    ? "bg-rose-500"
                    : type === "fast"
                    ? "bg-cyan-400"
                    : "bg-amber-400"
                }`}
                style={{ width: `${Math.max(5, (hp / maxHp) * 100)}%` }}
              />
            </div>
            {maxHp > 1 && (
              <span className="text-[8px] font-mono font-bold text-slate-300">
                {hp}/{maxHp}
              </span>
            )}
          </div>

          {/* Targeting Crosshair Lines */}
          <div className="absolute -bottom-8 w-16 h-16 pointer-events-none">
            <div className="absolute inset-0 border border-cyan-400/40 rounded-full animate-spin" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-2 bg-cyan-400" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0.5 h-2 bg-cyan-400" />
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-0.5 bg-cyan-400" />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-0.5 bg-cyan-400" />
          </div>
        </div>
      )}

      {/* Stasis Frost Overlay */}
      {isFrozen && (
        <div className="absolute -inset-2 z-20 rounded-2xl bg-cyan-400/20 border border-cyan-300/50 backdrop-blur-[1px] flex items-center justify-center animate-pulse pointer-events-none">
          <span className="text-xs">❄️</span>
        </div>
      )}

      {/* =================================================================== */}
      {/* REALISTIC ARMORED SOLDIER SVG VECTOR SPRITE                         */}
      {/* =================================================================== */}
      <svg
        viewBox="0 0 100 120"
        className={`w-20 h-24 sm:w-24 sm:h-28 drop-shadow-[0_10px_15px_rgba(0,0,0,0.8)] transition-all ${
          isHit ? "brightness-200 contrast-125 filter drop-shadow-[0_0_20px_#ef4444]" : ""
        }`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={`helmetGrad-${type}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={palette.plateHighlight} />
            <stop offset="60%" stopColor={palette.armorPlate} />
            <stop offset="100%" stopColor={palette.armorBase} />
          </linearGradient>

          <linearGradient id={`plateGrad-${type}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={palette.plateHighlight} />
            <stop offset="50%" stopColor={palette.armorPlate} />
            <stop offset="100%" stopColor={palette.armorBase} />
          </linearGradient>

          <linearGradient id={`visorGlow-${type}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={palette.visor} />
            <stop offset="50%" stopColor="#ffffff" />
            <stop offset="100%" stopColor={palette.visor} />
          </linearGradient>

          <filter id={`shadowFilter-${type}`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.8" />
          </filter>
        </defs>

        {/* Dynamic Shadow on Ground beneath soldier */}
        <ellipse cx="50" cy="114" rx="28" ry="6" fill="#000000" fillOpacity="0.75" />

        {/* ── 1. LEGS & COMBAT BOOTS ── */}
        <g id="legs" filter={`url(#shadowFilter-${type})`}>
          {/* Left Leg & Knee Pad */}
          <path
            d={`M36 78 L33 ${98 + legSway} L29 ${110 + legSway} L43 ${110 + legSway} L42 ${98 + legSway} L43 78 Z`}
            fill={palette.camo}
            stroke="#0a0a0a"
            strokeWidth="1.2"
          />
          {/* Left Knee Armor Plate */}
          <rect
            x="31"
            y={88 + legSway * 0.5}
            width="11"
            height="9"
            rx="2.5"
            fill={palette.armorPlate}
            stroke={palette.plateHighlight}
            strokeWidth="1"
          />
          {/* Left Combat Boot */}
          <path
            d={`M27 ${108 + legSway} L44 ${108 + legSway} L45 ${114 + legSway} L26 ${114 + legSway} Z`}
            fill="#09090b"
            stroke="#18181b"
            strokeWidth="1"
          />

          {/* Right Leg & Knee Pad */}
          <path
            d={`M57 78 L58 ${98 - legSway} L57 ${110 - legSway} L71 ${110 - legSway} L67 ${98 - legSway} L64 78 Z`}
            fill={palette.camo}
            stroke="#0a0a0a"
            strokeWidth="1.2"
          />
          {/* Right Knee Armor Plate */}
          <rect
            x="58"
            y={88 - legSway * 0.5}
            width="11"
            height="9"
            rx="2.5"
            fill={palette.armorPlate}
            stroke={palette.plateHighlight}
            strokeWidth="1"
          />
          {/* Right Combat Boot */}
          <path
            d={`M56 ${108 - legSway} L73 ${108 - legSway} L74 ${114 - legSway} L55 ${114 - legSway} Z`}
            fill="#09090b"
            stroke="#18181b"
            strokeWidth="1"
          />
        </g>

        {/* ── 2. TORSO & TACTICAL BALLISTIC VEST ── */}
        <g id="torso" filter={`url(#shadowFilter-${type})`}>
          {/* Undershirt / Fatigues */}
          <path d="M30 40 L70 40 L66 82 L34 82 Z" fill={palette.camo} />

          {/* Heavy Tactical Vest Body */}
          <path
            d="M32 42 L68 42 L64 78 L36 78 Z"
            fill={`url(#plateGrad-${type})`}
            stroke="#050505"
            strokeWidth="1.5"
          />

          {/* Chest Ballistic Armor Plate (Ceramic SAPI Plate) */}
          <path
            d="M36 46 L64 46 L61 68 L39 68 Z"
            fill={palette.armorPlate}
            stroke={palette.accent}
            strokeWidth="1.2"
          />

          {/* Armor Ridge Lines / MOLLE Webbing straps */}
          <line x1="38" y1="52" x2="62" y2="52" stroke="#000000" strokeWidth="1.5" />
          <line x1="38" y1="58" x2="62" y2="58" stroke="#000000" strokeWidth="1.5" />
          <line x1="39" y1="64" x2="61" y2="64" stroke="#000000" strokeWidth="1.5" />

          {/* Tactical Ammo Pouches on lower vest */}
          <rect x="37" y="70" width="7" height="9" rx="1.5" fill="#09090b" stroke="#27272a" strokeWidth="1" />
          <rect x="46" y="70" width="8" height="9" rx="1.5" fill="#09090b" stroke="#27272a" strokeWidth="1" />
          <rect x="56" y="70" width="7" height="9" rx="1.5" fill="#09090b" stroke="#27272a" strokeWidth="1" />

          {/* Unit Identification Patch */}
          <rect x="44" y="47" width="12" height="3" rx="0.5" fill={palette.accent} />
        </g>

        {/* ── 3. ARMS, PAULDRONS & ASSAULT RIFLE ── */}
        <g id="arms" filter={`url(#shadowFilter-${type})`}>
          {/* Left Arm & Pauldron */}
          <path d="M28 42 L18 64 L26 68 L34 46 Z" fill={palette.camo} />
          {/* Left Shoulder Pauldron Plate */}
          <path
            d="M26 40 L16 48 L22 60 L32 52 Z"
            fill={palette.armorPlate}
            stroke={palette.accent}
            strokeWidth="1.2"
          />

          {/* Right Arm & Pauldron */}
          <path d="M72 42 L82 64 L74 68 L66 46 Z" fill={palette.camo} />
          {/* Right Shoulder Pauldron Plate */}
          <path
            d="M74 40 L84 48 L78 60 L68 52 Z"
            fill={palette.armorPlate}
            stroke={palette.accent}
            strokeWidth="1.2"
          />

          {/* Tactical Low-Ready Military Assault Rifle */}
          <g id="weapon" transform={`translate(0, ${armSway * 0.5})`}>
            {/* Rifle Body */}
            <path
              d="M20 62 L78 54 L79 60 L24 68 Z"
              fill="#09090b"
              stroke="#27272a"
              strokeWidth="1.2"
            />
            {/* Rifle Barrel & Flash Hider */}
            <rect x="76" y="55" width="14" height="3" fill="#18181b" stroke="#27272a" strokeWidth="0.8" />
            <rect x="88" y="54" width="3" height="5" fill="#000000" />

            {/* Tactical Optical Scope */}
            <rect x="44" y="50" width="16" height="4.5" rx="1" fill="#18181b" stroke="#3f3f46" strokeWidth="0.8" />
            <circle cx="58" cy="52" r="1.5" fill="#38bdf8" />

            {/* Curved Magazine */}
            <path d="M46 64 L42 74 L47 75 L50 64 Z" fill="#18181b" stroke="#27272a" strokeWidth="1" />

            {/* Tactical Hands gripping the weapon */}
            <circle cx="34" cy="64" r="3.5" fill="#27272a" stroke="#000000" strokeWidth="1" />
            <circle cx="66" cy="58" r="3.5" fill="#27272a" stroke="#000000" strokeWidth="1" />
          </g>

          {/* Heavy Boss Shield for Juggernaut Commander */}
          {type === "boss" && (
            <g id="riot-shield" transform="translate(10, 36)">
              <path
                d="M4 0 L24 0 L22 46 L2 42 Z"
                fill="#18181b"
                stroke="#ef4444"
                strokeWidth="2"
                opacity="0.95"
              />
              <rect x="6" y="6" width="14" height="6" fill="#0369a1" fillOpacity="0.8" stroke="#38bdf8" />
              <line x1="4" y1="20" x2="22" y2="20" stroke="#ef4444" strokeWidth="1" />
              <line x1="4" y1="28" x2="22" y2="28" stroke="#ef4444" strokeWidth="1" />
            </g>
          )}
        </g>

        {/* ── 4. TACTICAL BALLISTIC COMBAT HELMET & VISOR ── */}
        <g id="head" filter={`url(#shadowFilter-${type})`}>
          {/* Neck & Balaclava */}
          <rect x="44" y="34" width="12" height="10" fill="#09090b" />

          {/* Ballistic Helmet Shell */}
          <path
            d="M32 26 C32 12 40 8 50 8 C60 8 68 12 68 26 C68 34 66 38 64 38 L36 38 C34 38 32 34 32 26 Z"
            fill={`url(#helmetGrad-${type})`}
            stroke="#050505"
            strokeWidth="1.5"
          />

          {/* Helmet Front Brow Rim */}
          <path d="M33 25 L67 25 L66 28 L34 28 Z" fill={palette.plateHighlight} />

          {/* Tactical Helmet Mount / NVG Shroud */}
          <rect x="47" y="12" width="6" height="7" rx="1" fill="#09090b" stroke="#3f3f46" strokeWidth="0.8" />

          {/* Tactical Radio Antenna on left ear */}
          <line x1="33" y1="26" x2="28" y2="10" stroke="#3f3f46" strokeWidth="1.5" />
          <circle cx="28" cy="10" r="1.5" fill={palette.accent} />

          {/* Face Mask / Lower Jaw Guard */}
          <path d="M37 28 L63 28 L59 38 L41 38 Z" fill="#0c0a09" stroke="#1c1917" strokeWidth="1" />

          {/* Glowing Tactical HUD Eye Visor */}
          <path
            d="M37 23 L63 23 L62 28 L38 28 Z"
            fill={`url(#visorGlow-${type})`}
            stroke="#000000"
            strokeWidth="0.8"
            style={{
              filter: `drop-shadow(0 0 6px ${palette.glow})`,
            }}
          />

          {/* Visor Glare Specular Highlight */}
          <line x1="40" y1="24.5" x2="48" y2="24.5" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  );
}
