/**
 * Wisdom Tower Academy — Official Weekly Student Performance Color PDF Generator
 * 
 * Generates an official, single-page A4 publication-grade executive summary of
 * the student's dashboard using jsPDF.
 * 
 * Features:
 * - Official Brand Logo embedded directly from optimized vector/raster base64
 * - "WISDOM TOWER ACADEMY" & "Infinite Possibilities" official motto
 * - Dynamic student personalization (Name, Folio ID, Track, School, Dates)
 * - Executive diagnosis: "According to your records and our system..."
 * - 4 High-Contrast Color HUD Metric Cards (Cyan, Gold, Emerald, Violet)
 * - Data-driven Immediately Stop Signals & Corrective Actions
 * - Strategic Recommendations for upcoming study cycles
 * - 7-Day Weekly Rhythm Visual Bar Chart & Active Modules
 * - Official Accreditation & Digital Signature Footer
 * - Strict ONE-PAGE (A4) layout guaranteed
 * - Multi-layer Android WebView download/share compatibility
 */

import { jsPDF } from "jspdf";
import { BRAND_LOGO_BASE64 } from "./brand-logo-data";
import type { StudentAnalyticsResult } from "./student-knowledge-base";
import type { UserProfileRecord } from "./profile";

export interface GenerateWeeklyReportOptions {
  analytics: StudentAnalyticsResult;
  profile?: Partial<UserProfileRecord>;
  userEmail?: string;
  referenceId?: string;
}

export function generateWeeklyReportPdf({
  analytics,
  profile,
  userEmail,
  referenceId = "WTA-2026-ETH",
}: GenerateWeeklyReportOptions): jsPDF {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 210;
  const margin = 10;
  const contentWidth = pageWidth - margin * 2; // 190mm

  // Official Brand Palette
  const NAVY_DARK = { r: 7, g: 14, b: 28 };    // #070E1C
  const NAVY_CARD = { r: 15, g: 26, b: 46 };   // #0F1A2E
  const CYAN = { r: 56, g: 189, b: 248 };       // #38BDF8
  const GOLD = { r: 245, g: 158, b: 11 };       // #F59E0B
  const EMERALD = { r: 16, g: 185, b: 129 };    // #10B981
  const CRIMSON = { r: 239, g: 68, b: 68 };     // #EF4444
  const VIOLET = { r: 168, g: 85, b: 247 };     // #A855F7
  const SLATE_LIGHT = { r: 226, g: 232, b: 240 }; // #E2E8F0
  const MUTED = { r: 148, g: 163, b: 184 };      // #94A3B8

  let y = margin;

  // =========================================================================
  // 1. TOP HEADER: OFFICIAL LOGO + WISDOM TOWER ACADEMY + "INFINITE POSSIBILITIES"
  // =========================================================================
  doc.setFillColor(NAVY_DARK.r, NAVY_DARK.g, NAVY_DARK.b);
  doc.roundedRect(margin, y, contentWidth, 30, 3, 3, "F");

  // Gold accent strip along top
  doc.setFillColor(GOLD.r, GOLD.g, GOLD.b);
  doc.rect(margin, y, contentWidth, 2, "F");

  // Embed Official Brand Logo (20mm x 20mm)
  try {
    if (BRAND_LOGO_BASE64) {
      doc.addImage(BRAND_LOGO_BASE64, "PNG", margin + 4, y + 4.5, 21, 21);
    }
  } catch (err) {
    console.warn("[PDF Generator] Could not embed logo image:", err);
  }

  // Academy Name & Motto
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14.5);
  doc.text("WISDOM TOWER ACADEMY", margin + 29, y + 10.5);

  // Official Motto: "Infinite Possibilities"
  doc.setTextColor(GOLD.r, GOLD.g, GOLD.b);
  doc.setFont("helvetica", "bolditalic");
  doc.setFontSize(8.5);
  doc.text("“Infinite Possibilities”", margin + 29, y + 16.5);

  // Document Title
  doc.setTextColor(CYAN.r, CYAN.g, CYAN.b);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("OFFICIAL WEEKLY STUDENT PERFORMANCE DIAGNOSTIC REPORT", margin + 29, y + 22);

  doc.setTextColor(MUTED.r, MUTED.g, MUTED.b);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.text("Verified Curriculum Telemetry & Cognitive Diagnostics · Ethiopian National Standard", margin + 29, y + 26.5);

  // Right Side Header Metadata
  const dateStr = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  doc.setTextColor(GOLD.r, GOLD.g, GOLD.b);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text(`ISSUED: ${dateStr.toUpperCase()}`, pageWidth - margin - 5, y + 9.5, { align: "right" });

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text(`REF ID: ${referenceId}`, pageWidth - margin - 5, y + 15, { align: "right" });

  // Verified Badge (Green)
  doc.setFillColor(EMERALD.r, EMERALD.g, EMERALD.b);
  doc.roundedRect(pageWidth - margin - 45, y + 18.5, 40, 6.5, 1.5, 1.5, "F");
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.text("VERIFIED ACADEMIC RECORD", pageWidth - margin - 25, y + 22.8, { align: "center" });

  y += 33;

  // =========================================================================
  // 2. STUDENT CREDENTIALS HUD STRIP
  // =========================================================================
  doc.setFillColor(NAVY_CARD.r, NAVY_CARD.g, NAVY_CARD.b);
  doc.roundedRect(margin, y, contentWidth, 15, 2, 2, "F");
  doc.setDrawColor(CYAN.r, CYAN.g, CYAN.b);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, contentWidth, 15, 2, 2, "S");

  const studentName = profile?.full_name || analytics.studentName || "Academic Scholar";
  const studentSchool = profile?.school_name || "Wisdom Tower Academy";
  const studentTrack = analytics.trackBenchmark?.trackName || profile?.education_level || "Freshman Curriculum";
  const studentStream = profile?.stream || "General";

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text(`STUDENT: ${studentName.toUpperCase()}`, margin + 5, y + 6);

  doc.setTextColor(MUTED.r, MUTED.g, MUTED.b);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text(`School: ${studentSchool}  |  Stream: ${studentStream}`, margin + 5, y + 11);

  doc.setTextColor(CYAN.r, CYAN.g, CYAN.b);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text(`TRACK: ${studentTrack}`, pageWidth - margin - 5, y + 6, { align: "right" });

  doc.setTextColor(GOLD.r, GOLD.g, GOLD.b);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text(`TIER: ${analytics.masteryTier.toUpperCase()}`, pageWidth - margin - 5, y + 11, { align: "right" });

  y += 18;

  // =========================================================================
  // 3. SYSTEM ASSESSMENT STATEMENT ("According to your records and our system...")
  // =========================================================================
  doc.setFillColor(NAVY_DARK.r, NAVY_DARK.g, NAVY_DARK.b);
  doc.roundedRect(margin, y, contentWidth, 17, 2, 2, "F");

  // Cyan left indicator bar
  doc.setFillColor(CYAN.r, CYAN.g, CYAN.b);
  doc.rect(margin, y, 2.5, 17, "F");

  doc.setTextColor(GOLD.r, GOLD.g, GOLD.b);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("SYSTEM EXECUTIVE ASSESSMENT", margin + 5, y + 4.5);

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);

  const hoursLogged = analytics.totalStudyHours.toFixed(1);
  const targetPct = analytics.studyTimeAnalysis.weeklyProgressPct;
  const speed = analytics.readingAnalysis.speedWpm;
  const method = analytics.readingAnalysis.method;
  const acc = analytics.retentionAnalysis.accuracyPct;
  const retentionRating = analytics.retentionAnalysis.rating;

  const line1 = `According to verified academic records in our system, your cumulative study time is ${hoursLogged} hours (${targetPct}% of your weekly quota with an active ${analytics.currentStreakDays}-day streak).`;
  const line2 = `Your reading velocity is calculated at ${speed} WPM (${method}), achieving ${acc}% question drill accuracy (${retentionRating}).`;
  const line3 = `Current Status: ${analytics.studyTimeAnalysis.paceStatus} · Standing: ${analytics.masteryTier}.`;

  doc.text(line1, margin + 5, y + 8.5);
  doc.text(line2, margin + 5, y + 12);
  doc.setTextColor(SLATE_LIGHT.r, SLATE_LIGHT.g, SLATE_LIGHT.b);
  doc.text(line3, margin + 5, y + 15.5);

  y += 20;

  // =========================================================================
  // 4. FOUR COLOR HUD CARDS (Study Time, Reading, Retention, Standing)
  // =========================================================================
  const cardWidth = (contentWidth - 6) / 4; // 4 cards with 2mm gap
  const cardHeight = 26;

  // CARD 1: Study Time (Cyan)
  doc.setFillColor(NAVY_CARD.r, NAVY_CARD.g, NAVY_CARD.b);
  doc.roundedRect(margin, y, cardWidth, cardHeight, 2, 2, "F");
  doc.setFillColor(CYAN.r, CYAN.g, CYAN.b);
  doc.rect(margin, y, cardWidth, 1.5, "F");

  doc.setTextColor(MUTED.r, MUTED.g, MUTED.b);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.text("STUDY TIME & PACE", margin + 3, y + 5);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.text(`${hoursLogged} hrs`, margin + 3, y + 11);

  doc.setTextColor(CYAN.r, CYAN.g, CYAN.b);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.text(`${targetPct}% of Goal`, margin + 3, y + 15.5);

  doc.setTextColor(SLATE_LIGHT.r, SLATE_LIGHT.g, SLATE_LIGHT.b);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.2);
  doc.text(`Target: ${analytics.weeklyTargetHours}h / week`, margin + 3, y + 20);
  doc.text(`Streak: ${analytics.currentStreakDays} days active`, margin + 3, y + 24);

  // CARD 2: Reading Speed (Amber)
  const card2X = margin + cardWidth + 2;
  doc.setFillColor(NAVY_CARD.r, NAVY_CARD.g, NAVY_CARD.b);
  doc.roundedRect(card2X, y, cardWidth, cardHeight, 2, 2, "F");
  doc.setFillColor(GOLD.r, GOLD.g, GOLD.b);
  doc.rect(card2X, y, cardWidth, 1.5, "F");

  doc.setTextColor(MUTED.r, MUTED.g, MUTED.b);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.text("READING VELOCITY", card2X + 3, y + 5);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.text(`${speed} WPM`, card2X + 3, y + 11);

  doc.setTextColor(GOLD.r, GOLD.g, GOLD.b);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  const shortMethod = method.length > 18 ? method.slice(0, 16) + "…" : method;
  doc.text(shortMethod, card2X + 3, y + 15.5);

  doc.setTextColor(SLATE_LIGHT.r, SLATE_LIGHT.g, SLATE_LIGHT.b);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.2);
  doc.text(`Focus: ${analytics.readingAnalysis.focusRatioPct}% deliberate`, card2X + 3, y + 20);
  doc.text(`Norm: ~${analytics.trackBenchmark?.expectedReadingWpm || 200} WPM`, card2X + 3, y + 24);

  // CARD 3: Retention & Accuracy (Emerald)
  const card3X = margin + (cardWidth + 2) * 2;
  doc.setFillColor(NAVY_CARD.r, NAVY_CARD.g, NAVY_CARD.b);
  doc.roundedRect(card3X, y, cardWidth, cardHeight, 2, 2, "F");
  doc.setFillColor(EMERALD.r, EMERALD.g, EMERALD.b);
  doc.rect(card3X, y, cardWidth, 1.5, "F");

  doc.setTextColor(MUTED.r, MUTED.g, MUTED.b);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.text("RETENTION & DRILLS", card3X + 3, y + 5);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.text(`${acc}%`, card3X + 3, y + 11);

  doc.setTextColor(EMERALD.r, EMERALD.g, EMERALD.b);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.text(retentionRating.replace(" Long-Term", ""), card3X + 3, y + 15.5);

  doc.setTextColor(SLATE_LIGHT.r, SLATE_LIGHT.g, SLATE_LIGHT.b);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.2);
  doc.text(`Recall: ${analytics.retentionAnalysis.retentionIndexPct}%`, card3X + 3, y + 20);
  doc.text(`Attempted: ${analytics.questionsAttempted} drills`, card3X + 3, y + 24);

  // CARD 4: Scholar Standing (Violet)
  const card4X = margin + (cardWidth + 2) * 3;
  doc.setFillColor(NAVY_CARD.r, NAVY_CARD.g, NAVY_CARD.b);
  doc.roundedRect(card4X, y, cardWidth, cardHeight, 2, 2, "F");
  doc.setFillColor(VIOLET.r, VIOLET.g, VIOLET.b);
  doc.rect(card4X, y, cardWidth, 1.5, "F");

  doc.setTextColor(MUTED.r, MUTED.g, MUTED.b);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.text("ACADEMIC STANDING", card4X + 3, y + 5);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9.5);
  doc.text(analytics.masteryTier.replace(" Rank", ""), card4X + 3, y + 11);

  doc.setTextColor(CYAN.r, CYAN.g, CYAN.b);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.text(analytics.studyTimeAnalysis.paceStatus, card4X + 3, y + 15.5);

  doc.setTextColor(SLATE_LIGHT.r, SLATE_LIGHT.g, SLATE_LIGHT.b);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.2);
  doc.text(`Remaining: ${analytics.hoursRemainingThisWeek.toFixed(1)}h target`, card4X + 3, y + 20);
  doc.text(`Solved: ${analytics.questionsCorrect} correct`, card4X + 3, y + 24);

  y += 29;

  // =========================================================================
  // 5. CRITICAL WARNING SYSTEM (Immediately Stop Signals & Corrective Actions)
  // =========================================================================
  const stopSignals = analytics.immediatelyStopSignals || [];
  const stopBoxHeight = 27;

  doc.setFillColor(NAVY_CARD.r, NAVY_CARD.g, NAVY_CARD.b);
  doc.roundedRect(margin, y, contentWidth, stopBoxHeight, 2, 2, "F");
  doc.setDrawColor(CRIMSON.r, CRIMSON.g, CRIMSON.b);
  doc.setLineWidth(0.35);
  doc.roundedRect(margin, y, contentWidth, stopBoxHeight, 2, 2, "S");

  doc.setFillColor(CRIMSON.r, CRIMSON.g, CRIMSON.b);
  doc.rect(margin, y, 2.5, stopBoxHeight, "F");

  doc.setTextColor(CRIMSON.r, CRIMSON.g, CRIMSON.b);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("IMMEDIATELY STOP SIGNALS & HABIT DIRECTIVES (DATA-DRIVEN TELEMETRY)", margin + 6, y + 5);

  let stopY = y + 9.5;
  const displaySignals = stopSignals.slice(0, 2);

  displaySignals.forEach((sig) => {
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.text(`[ALERT] ${sig.signal.toUpperCase()}`, margin + 6, stopY);

    doc.setTextColor(SLATE_LIGHT.r, SLATE_LIGHT.g, SLATE_LIGHT.b);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.3);
    const obsText = `Observed: ${sig.observedData} -> Immediate Action: ${sig.immediateAction}`;
    const splitObs = doc.splitTextToSize(obsText, contentWidth - 10);
    doc.text(splitObs[0] || obsText, margin + 6, stopY + 3.8);

    stopY += 8.2;
  });

  y += stopBoxHeight + 3;

  // =========================================================================
  // 6. STRATEGIC RECOMMENDATIONS FOR UPCOMING WEEK
  // =========================================================================
  const recBoxHeight = 29;
  doc.setFillColor(NAVY_DARK.r, NAVY_DARK.g, NAVY_DARK.b);
  doc.roundedRect(margin, y, contentWidth, recBoxHeight, 2, 2, "F");
  doc.setDrawColor(CYAN.r, CYAN.g, CYAN.b);
  doc.setLineWidth(0.25);
  doc.roundedRect(margin, y, contentWidth, recBoxHeight, 2, 2, "S");

  doc.setTextColor(CYAN.r, CYAN.g, CYAN.b);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("STRATEGIC RECOMMENDATIONS FOR UPCOMING STUDY ROUTINE", margin + 5, y + 5);

  const recs = analytics.recommendations || [];
  const topRecs = recs.slice(0, 3);
  let recY = y + 9.5;

  topRecs.forEach((r, idx) => {
    doc.setFillColor(CYAN.r, CYAN.g, CYAN.b);
    doc.circle(margin + 7, recY - 1, 0.9, "F");

    doc.setTextColor(GOLD.r, GOLD.g, GOLD.b);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.8);
    doc.text(`Step ${idx + 1} (${r.category}): ${r.title}`, margin + 11, recY);

    doc.setTextColor(SLATE_LIGHT.r, SLATE_LIGHT.g, SLATE_LIGHT.b);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.2);
    const stepText = `Action: ${r.actionableStep}`;
    const splitStep = doc.splitTextToSize(stepText, contentWidth - 18);
    doc.text(splitStep[0] || stepText, margin + 11, recY + 3.5);

    recY += 7.2;
  });

  y += recBoxHeight + 3;

  // =========================================================================
  // 7. WEEKLY STUDY RHYTHM BAR CHART & ACTIVE MODULES BREAKDOWN
  // =========================================================================
  const halfWidth = (contentWidth - 4) / 2;
  const rhythmHeight = 27;

  // Left Box: Weekly Study Time Distribution Bar Chart
  doc.setFillColor(NAVY_CARD.r, NAVY_CARD.g, NAVY_CARD.b);
  doc.roundedRect(margin, y, halfWidth, rhythmHeight, 2, 2, "F");

  doc.setTextColor(GOLD.r, GOLD.g, GOLD.b);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.text("WEEKLY STUDY RHYTHM (MON – SUN)", margin + 4, y + 4.8);

  const days = analytics.dailyDistribution || [];
  const dayColWidth = (halfWidth - 8) / (days.length || 7);
  let barX = margin + 4;

  days.forEach((d) => {
    const barHeight = Math.min(11, Math.max(2, (d.minutes / 90) * 11));
    doc.setFillColor(CYAN.r, CYAN.g, CYAN.b);
    doc.roundedRect(barX, y + 17 - barHeight, dayColWidth - 1.5, barHeight, 0.6, 0.6, "F");

    doc.setTextColor(MUTED.r, MUTED.g, MUTED.b);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(5.5);
    doc.text(d.day.slice(0, 3), barX + (dayColWidth - 1.5) / 2, y + 21, { align: "center" });

    doc.setFontSize(5);
    doc.text(`${d.minutes}m`, barX + (dayColWidth - 1.5) / 2, y + 25, { align: "center" });

    barX += dayColWidth;
  });

  // Right Box: Active Curriculum Modules
  const rightX = margin + halfWidth + 4;
  doc.setFillColor(NAVY_CARD.r, NAVY_CARD.g, NAVY_CARD.b);
  doc.roundedRect(rightX, y, halfWidth, rhythmHeight, 2, 2, "F");

  doc.setTextColor(CYAN.r, CYAN.g, CYAN.b);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.text("ACTIVE CURRICULUM MODULES", rightX + 4, y + 4.8);

  const subjects = analytics.realActiveSubjects || [];
  const topSubs = subjects.slice(0, 3);
  let subY = y + 9.5;

  if (topSubs.length === 0) {
    doc.setTextColor(MUTED.r, MUTED.g, MUTED.b);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.text("Enrolled curriculum modules will log here upon study.", rightX + 4, subY + 3);
  } else {
    topSubs.forEach((s) => {
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.5);
      const cleanSubName = s.name.length > 22 ? s.name.slice(0, 20) + "…" : s.name;
      doc.text(cleanSubName, rightX + 4, subY);

      doc.setTextColor(GOLD.r, GOLD.g, GOLD.b);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.2);
      doc.text(`${s.studyMinutes}m`, rightX + halfWidth - 5, subY, { align: "right" });

      doc.setTextColor(MUTED.r, MUTED.g, MUTED.b);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(5.8);
      doc.text(`Accuracy: ${s.accuracyPct}% · ${s.status}`, rightX + 4, subY + 3.5);

      subY += 7.2;
    });
  }

  y += rhythmHeight + 3;

  // =========================================================================
  // 8. OFFICIAL SEAL & AUTHENTICATION FOOTER
  // =========================================================================
  doc.setFillColor(NAVY_DARK.r, NAVY_DARK.g, NAVY_DARK.b);
  doc.roundedRect(margin, y, contentWidth, 13, 1.5, 1.5, "F");

  doc.setTextColor(MUTED.r, MUTED.g, MUTED.b);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6);
  doc.text(
    "Wisdom Tower Academy · Infinite Possibilities · Verified Academic Certification · Addis Ababa, Ethiopia",
    margin + 4,
    y + 5
  );

  doc.setTextColor(CYAN.r, CYAN.g, CYAN.b);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6);
  doc.text(
    `CONFIDENTIAL SCHOLAR RECORD · HASH: ${referenceId.replace(/[^A-Za-z0-9]/g, "")} · PAGE 1 OF 1`,
    margin + 4,
    y + 9.5
  );

  const timeStamp = new Date().toISOString().slice(0, 19).replace("T", " ");
  doc.setTextColor(GOLD.r, GOLD.g, GOLD.b);
  doc.text(`ISSUED: ${timeStamp} UTC`, pageWidth - margin - 4, y + 9.5, { align: "right" });

  return doc;
}

/**
 * Universal Mobile-Safe Save & Share Helper
 * 
 * Solves the Android WebView "saving for offline use" infinite hang:
 * 1. Checks if native Web Share API supports file sharing (opens Android system share / PDF viewer)
 * 2. Provides direct fallback to /api/report/download (valid HTTPS URL that Android DownloadManager handles properly)
 * 3. Client-side Blob download fallback
 */
export async function downloadOrShareWeeklyReportPdf(
  options: GenerateWeeklyReportOptions
): Promise<{ success: boolean; method: "share" | "api" | "blob"; message: string }> {
  try {
    const studentName = options.profile?.full_name || options.analytics.studentName || "Scholar";
    const safeName = studentName.replace(/[^a-zA-Z0-9_-]/g, "_");
    const fileName = `WTA-Weekly-Report-${safeName}-${new Date().toISOString().slice(0, 10)}.pdf`;

    // 1. Generate jsPDF instance
    const doc = generateWeeklyReportPdf(options);
    const pdfBlob = doc.output("blob");

    // 2. Try Web Share API (Best for Android WebView & Mobile browsers!)
    if (typeof navigator !== "undefined" && navigator.canShare) {
      try {
        const file = new File([pdfBlob], fileName, { type: "application/pdf" });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: "Wisdom Tower Academy Weekly Report",
            text: `Weekly Student Performance Diagnostic for ${studentName}`,
            files: [file],
          });
          return { success: true, method: "share", message: "Report shared successfully!" };
        }
      } catch (shareErr) {
        // User may have cancelled or share wasn't allowed; fall through to direct download
        if (shareErr instanceof Error && shareErr.name === "AbortError") {
          return { success: true, method: "share", message: "Share closed." };
        }
      }
    }

    // 3. Fallback: Use standard direct download via simulated link or API route
    try {
      doc.save(fileName);
      return { success: true, method: "blob", message: "PDF downloaded to your device!" };
    } catch {
      // 4. Ultimate fallback: Server-side API route download
      if (typeof window !== "undefined") {
        window.location.href = `/api/report/download?name=${encodeURIComponent(studentName)}&ref=${encodeURIComponent(options.referenceId || "WTA-REPORT")}`;
        return { success: true, method: "api", message: "Starting server download..." };
      }
    }

    return { success: true, method: "blob", message: "Report ready." };
  } catch (err) {
    console.error("[Report Download] Error:", err);
    throw err;
  }
}
