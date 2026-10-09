"use client";

import { useState } from "react";
import Image from "next/image";
import StudentAvatar from "@/components/StudentAvatar";
import { type StudentIdData } from "@/lib/student-id";
import { RotateCw, ShieldCheck } from "lucide-react";
import { triggerHaptic } from "@/lib/sound-haptics";

interface StudentIdCardProps {
  idData: StudentIdData;
  studentName: string;
  avatarPreset?: string | null;
  avatarUrl?: string | null;
  educationLevel?: string | null;
  stream?: string | null;
  schoolName?: string | null;
  region?: string | null;
  hasCrown?: boolean;
  autoFlipOnMount?: boolean;
  className?: string;
}

export default function StudentIdCard({
  idData,
  studentName,
  avatarPreset,
  avatarUrl,
  educationLevel,
  stream,
  schoolName,
  region,
  hasCrown = false,
  className = "",
}: StudentIdCardProps) {
  const [flipped, setFlipped] = useState(false);

  const academicTrackDisplay = educationLevel || idData.academicTrack;
  const schoolDisplay = schoolName || idData.institutionName;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Clickable / Tappable 3D Card Container */}
      <div
        onClick={() => {
          setFlipped((prev) => !prev);
          triggerHaptic("light");
        }}
        role="button"
        tabIndex={0}
        aria-label="Tap card to flip between front and back sides"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setFlipped((prev) => !prev);
            triggerHaptic("light");
          }
        }}
        className="relative mx-auto max-w-[430px] aspect-[1.586/1] [perspective:1400px] cursor-pointer group select-none outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-2xl sm:rounded-3xl transition-transform duration-300 active:scale-[0.99]"
        title="Tap anywhere to flip card"
      >
        <div
          className={`relative z-10 w-full h-full duration-700 [transform-style:preserve-3d] transition-transform ease-[cubic-bezier(0.2,0.8,0.2,1)] ${
            flipped ? "[transform:rotateY(180deg)]" : ""
          }`}
        >
          {/* ========================================================= */}
          {/* FRONT FACE OF STUDENT ID CARD                            */}
          {/* ========================================================= */}
          <div className="absolute inset-0 w-full h-full rounded-2xl sm:rounded-3xl p-5 sm:p-6 [backface-visibility:hidden] overflow-hidden border border-white/12 bg-gradient-to-br from-[#121c32] via-[#0d1527] to-[#0a1020] shadow-xl flex flex-col justify-between text-white group-hover:border-white/20 transition-colors">
            {/* Subtle frosted glass specular highlight */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] via-transparent to-transparent pointer-events-none" />

            {/* Subtle Top Hairline Accent */}
            <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />

            {/* Top Institutional Header */}
            <div className="relative z-10 flex items-center justify-between gap-3 border-b border-white/8 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/10 p-1 flex items-center justify-center shrink-0">
                  <Image
                    src="/images/brand/logo.png"
                    alt="Wisdom Tower Academy Logo"
                    width={28}
                    height={28}
                    className="object-contain"
                    priority
                  />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/90 leading-tight">
                    Wisdom Tower Academy
                  </p>
                  <p className="text-[8.5px] font-medium text-slate-400 tracking-wider uppercase">
                    Official Student Credential
                  </p>
                </div>
              </div>

              {/* Status & Country Seal */}
              <div className="text-right">
                <div className="flex items-center gap-1.5 justify-end">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="text-[9px] font-semibold text-emerald-400 tracking-wider uppercase">
                    {idData.status}
                  </span>
                </div>
                <p className="text-[8px] font-mono text-slate-400 mt-0.5 tracking-wider">
                  ETHIOPIA
                </p>
              </div>
            </div>

            {/* Main Card Body */}
            <div className="relative z-10 grid grid-cols-[80px_1fr] sm:grid-cols-[92px_1fr] gap-3 sm:gap-4 items-center my-auto py-1">
              {/* Photo & ID Badge Box */}
              <div className="flex flex-col items-center">
                <div className="relative p-1 rounded-2xl border border-white/15 bg-white/[0.03] shadow-md">
                  <StudentAvatar
                    avatarPreset={avatarPreset}
                    avatarUrl={avatarUrl}
                    name={studentName}
                    size="xl"
                    className="rounded-xl"
                    showGlow={false}
                    hasCrown={hasCrown}
                  />
                  <div className="absolute -bottom-2 inset-x-0 flex justify-center">
                    <span className="px-2 py-0.5 rounded-full text-[7.5px] font-mono font-bold uppercase bg-slate-900/90 text-cyan-300 border border-white/15 shadow-sm flex items-center gap-1">
                      <ShieldCheck className="w-2.5 h-2.5 text-cyan-400" />
                      VERIFIED
                    </span>
                  </div>
                </div>
              </div>

              {/* Student Metadata Information */}
              <div className="min-w-0 space-y-1">
                <div>
                  <p className="text-[8.5px] font-semibold uppercase tracking-wider text-slate-400">
                    Full Legal Name
                  </p>
                  <h3 className="font-display text-sm sm:text-base font-bold text-white truncate leading-tight tracking-tight">
                    {studentName}
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-0.5">
                  <div>
                    <p className="text-[8px] font-semibold uppercase tracking-wider text-slate-400">
                      Student ID No.
                    </p>
                    <p className="font-mono text-xs sm:text-sm font-bold text-cyan-300 tracking-wide">
                      {idData.idNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-[8px] font-semibold uppercase tracking-wider text-slate-400">
                      Registry Folio
                    </p>
                    <p className="font-mono text-[11px] sm:text-xs font-semibold text-slate-300 truncate">
                      {idData.folioNumber}
                    </p>
                  </div>
                </div>

                <div className="pt-0.5">
                  <p className="text-[8px] font-semibold uppercase tracking-wider text-slate-400">
                    Academic Scope & Level
                  </p>
                  <p className="text-[11px] sm:text-xs font-medium text-slate-200 truncate">
                    {academicTrackDisplay}
                    {stream ? ` · ${stream}` : ""}
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Validity Bar with Barcode */}
            <div className="relative z-10 pt-2.5 border-t border-white/8 flex items-end justify-between gap-3 text-[9px]">
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-2 text-slate-400 text-[8.5px] sm:text-[9.5px]">
                  <span>
                    <strong className="text-slate-300 uppercase tracking-wider font-medium">Issued:</strong>{" "}
                    {idData.issueDateFull}
                  </span>
                  <span>·</span>
                  <span>
                    <strong className="text-slate-300 uppercase tracking-wider font-medium">Valid Until:</strong>{" "}
                    {idData.expiryDateFull}
                  </span>
                </div>
                <p className="text-[8.5px] text-slate-400 truncate">
                  {schoolDisplay} {region ? `(${region})` : ""}
                </p>
              </div>

              {/* Realistic Barcode Graphic */}
              <div className="text-right shrink-0">
                <div className="flex items-center gap-0.5 h-4.5 px-1 bg-white/90 rounded">
                  <span className="w-0.5 h-3.5 bg-black" />
                  <span className="w-1 h-3.5 bg-black" />
                  <span className="w-0.5 h-3.5 bg-black" />
                  <span className="w-1.5 h-3.5 bg-black" />
                  <span className="w-0.5 h-3.5 bg-black" />
                  <span className="w-2 h-3.5 bg-black" />
                  <span className="w-0.5 h-3.5 bg-black" />
                  <span className="w-1 h-3.5 bg-black" />
                  <span className="w-1.5 h-3.5 bg-black" />
                  <span className="w-0.5 h-3.5 bg-black" />
                </div>
                <span className="font-mono text-[7.5px] text-slate-400 tracking-widest block mt-0.5">
                  {idData.numericId}
                </span>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* BACK FACE OF STUDENT ID CARD                             */}
          {/* ========================================================= */}
          <div className="absolute inset-0 w-full h-full rounded-2xl sm:rounded-3xl p-5 sm:p-6 [backface-visibility:hidden] [transform:rotateY(180deg)] overflow-hidden border border-white/12 bg-gradient-to-br from-[#121c32] via-[#0d1527] to-[#0a1020] shadow-xl flex flex-col justify-between text-white group-hover:border-white/20 transition-colors">
            {/* Subtle frosted glass specular highlight */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] via-transparent to-transparent pointer-events-none" />

            {/* Subtle Top Hairline Accent */}
            <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />

            <div className="pt-2 space-y-3 relative z-10 text-[10px] text-slate-300 leading-relaxed">
              <div className="space-y-1">
                <p className="font-bold text-white uppercase tracking-wider text-[9px]">
                  Institutional Terms & Conditions
                </p>
                <p className="text-[9px] text-slate-400 leading-tight">
                  This digital credential certifies active enrollment in Wisdom Tower Academy. It
                  authorizes the named scholar to access designated curriculum repositories, examination
                  simulations, and academic resource hubs.
                </p>
              </div>

              <div className="rounded-xl border border-white/8 bg-white/[0.03] p-2.5 grid grid-cols-2 gap-2 text-[9px]">
                <div>
                  <span className="text-slate-400 block uppercase text-[8px]">
                    Academic Registry
                  </span>
                  <span className="font-semibold text-white">Wisdom Tower Academy</span>
                </div>
                <div>
                  <span className="text-slate-400 block uppercase text-[8px]">
                    Validity Period
                  </span>
                  <span className="font-semibold text-cyan-300">1 Academic Year</span>
                </div>
                <div>
                  <span className="text-slate-400 block uppercase text-[8px]">
                    Official Support
                  </span>
                  <span className="text-cyan-300 font-mono">support@wisdomtower.tech</span>
                </div>
                <div>
                  <span className="text-slate-400 block uppercase text-[8px]">
                    Credential Verification
                  </span>
                  <span className="text-white font-mono">wisdomtower.tech/verify</span>
                </div>
              </div>
            </div>

            {/* Registrar Signature & Seal */}
            <div className="relative z-10 border-t border-white/8 pt-2.5 flex items-center justify-between text-[9px]">
              <div>
                <p className="font-mono text-[8px] text-slate-400">AUTHORIZATION SEAL</p>
                <p className="font-serif italic text-cyan-300 font-medium text-xs">
                  Academic Affairs Registrar
                </p>
              </div>
              <div className="text-right">
                <span className="font-mono text-[9px] text-slate-400">
                  REF: {idData.idNumber}
                </span>
                <p className="text-[8.5px] text-emerald-400 font-semibold">
                  DIGITALLY SIGNED & VERIFIED
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tap to Flip Notice Button */}
      <div className="flex justify-center pt-1">
        <button
          type="button"
          onClick={() => setFlipped((prev) => !prev)}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-bold text-slate-300 hover:text-cyan-300 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-cyan-400/30 transition-all shadow-sm cursor-pointer"
        >
          <RotateCw className="w-3.5 h-3.5 text-cyan-400 transition-transform duration-500 group-hover:rotate-180" />
          <span>{flipped ? "View front side" : "Tap card to flip"}</span>
        </button>
      </div>
    </div>
  );
}
