import { NextRequest, NextResponse } from "next/server";
import { generateWeeklyReportPdf } from "@/lib/pdf-report-generator";
import { computeStudentAnalytics } from "@/lib/student-knowledge-base";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const studentName = searchParams.get("name") || "Academic Scholar";
    const educationLevel = searchParams.get("level") || "freshman";
    const stream = searchParams.get("stream") || null;
    const schoolName = searchParams.get("school") || "Wisdom Tower Academy";
    const referenceId = searchParams.get("ref") || `WTA-${Date.now().toString(36).toUpperCase()}`;

    // Compute student analytics
    const analytics = computeStudentAnalytics([], studentName, educationLevel, stream);

    const doc = generateWeeklyReportPdf({
      analytics,
      profile: {
        full_name: studentName,
        education_level: educationLevel,
        stream,
        school_name: schoolName,
      },
      referenceId,
    });

    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
    const safeName = studentName.replace(/[^a-zA-Z0-9_-]/g, "_");
    const fileName = `WTA-Weekly-Report-${safeName}-${new Date().toISOString().slice(0, 10)}.pdf`;

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": pdfBuffer.length.toString(),
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (err) {
    console.error("[API Report Download] Error:", err);
    return NextResponse.json({ error: "Failed to generate report PDF" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { analytics, profile, referenceId } = body;

    const doc = generateWeeklyReportPdf({
      analytics,
      profile,
      referenceId: referenceId || `WTA-${Date.now().toString(36).toUpperCase()}`,
    });

    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
    const studentName = profile?.full_name || analytics?.studentName || "Scholar";
    const safeName = studentName.replace(/[^a-zA-Z0-9_-]/g, "_");
    const fileName = `WTA-Weekly-Report-${safeName}-${new Date().toISOString().slice(0, 10)}.pdf`;

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": pdfBuffer.length.toString(),
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (err) {
    console.error("[API Report Download POST] Error:", err);
    return NextResponse.json({ error: "Failed to generate report PDF" }, { status: 500 });
  }
}
