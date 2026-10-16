package com.wisdomtower.academy.ui.study

import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.DashPathEffect
import android.graphics.Paint
import android.graphics.Path
import android.graphics.RectF
import android.graphics.Typeface
import android.graphics.pdf.PdfDocument
import android.text.Layout
import android.text.StaticLayout
import android.text.TextPaint
import android.text.TextUtils
import java.io.OutputStream
import kotlin.math.max
import kotlin.math.min

/**
 * Cover Page Generator, drawing code (owner order 2026-10-16: 5 A4 templates, logo, university, department,
 * group or individual, members, submitted to, submission date, download as PDF).
 *
 * ONE drawing function ([drawCoverPage]) paints a page on an android.graphics.Canvas. The same function feeds the
 * on-screen preview (a Bitmap) and the PDF (android.graphics.pdf.PdfDocument, built into Android: no new dependency,
 * no permission), so the PDF is exactly what the preview shows. The page is A4 at 72 dpi: 595 x 842 points.
 *
 * Rules followed: no text is invented. In the PREVIEW an empty field shows a faint grey hint ("University name");
 * in the PDF an empty field is simply left out. Labels (SUBMITTED TO, SUBMISSION DATE, GROUP MEMBERS, ...) appear
 * only when their field has a value.
 *
 * Status: written, NOT compiled by the author, not seen on a device.
 */
const val COVER_PAGE_W = 595
const val COVER_PAGE_H = 842

data class CoverMember(val name: String = "", val id: String = "")

data class CoverPageData(
    val universityName: String = "",
    val department: String = "",
    val title: String = "",
    val isGroup: Boolean = true,
    val groupName: String = "",
    val members: List<CoverMember> = emptyList(),
    val submittedTo: String = "",
    val submissionDate: String = ""
)

data class CoverTemplate(val name: String)

val COVER_TEMPLATES = listOf(
    CoverTemplate("Classic"),
    CoverTemplate("Banner"),
    CoverTemplate("Sidebar"),
    CoverTemplate("Elegant"),
    CoverTemplate("Bold")
)

data class CoverAccent(val name: String, val color: Int)

val COVER_ACCENTS = listOf(
    CoverAccent("Navy", Color.parseColor("#1E3A8A")),
    CoverAccent("Emerald", Color.parseColor("#047857")),
    CoverAccent("Crimson", Color.parseColor("#B91C1C")),
    CoverAccent("Purple", Color.parseColor("#6D28D9")),
    CoverAccent("Teal", Color.parseColor("#0E7490")),
    CoverAccent("Charcoal", Color.parseColor("#1F2937"))
)

private val INK = Color.parseColor("#111827")
private val MUTED = Color.parseColor("#4B5563")
private val CREAM = Color.parseColor("#FFFBF2")
private val SOFT_GRAY = Color.parseColor("#F3F4F6")

// ---------------------------------------------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------------------------------------------

/** Paints one A4 page (595 x 842 points) on [c]. [preview] = true draws grey hints for empty fields. */
fun drawCoverPage(c: Canvas, data: CoverPageData, logo: Bitmap?, template: Int, accent: Int, preview: Boolean) {
    val d = resolve(data, preview)
    when (template) {
        1 -> tplBanner(c, d, logo, accent, preview)
        2 -> tplSidebar(c, d, logo, accent, preview)
        3 -> tplElegant(c, d, logo, accent, preview)
        4 -> tplBold(c, d, logo, accent, preview)
        else -> tplClassic(c, d, logo, accent, preview)
    }
}

/** Renders the page to a Bitmap (scale 1.0 = 595 x 842 px). Used for the preview and the template thumbnails. */
fun renderCoverBitmap(data: CoverPageData, logo: Bitmap?, template: Int, accent: Int, scale: Float): Bitmap {
    val bmp = Bitmap.createBitmap(
        max(1, (COVER_PAGE_W * scale).toInt()),
        max(1, (COVER_PAGE_H * scale).toInt()),
        Bitmap.Config.ARGB_8888
    )
    val canvas = Canvas(bmp)
    canvas.scale(scale, scale)
    drawCoverPage(canvas, data, logo, template, accent, true)
    return bmp
}

/** Writes a one-page A4 PDF to [out]. Empty fields are left out (no hints). The caller closes [out]. */
fun writeCoverPdf(out: OutputStream, data: CoverPageData, logo: Bitmap?, template: Int, accent: Int) {
    val doc = PdfDocument()
    try {
        val info = PdfDocument.PageInfo.Builder(COVER_PAGE_W, COVER_PAGE_H, 1).create()
        val page = doc.startPage(info)
        drawCoverPage(page.canvas, data, logo, template, accent, false)
        doc.finishPage(page)
        doc.writeTo(out)
    } finally {
        doc.close()
    }
}

// ---------------------------------------------------------------------------------------------------------------
// Resolved fields (value or grey hint)
// ---------------------------------------------------------------------------------------------------------------

private class Fld(val text: String, val hint: Boolean) {
    val blank: Boolean get() = text.isBlank()
    fun up(): Fld = Fld(text.uppercase(), hint)
}

private class Mem(val name: String, val id: String, val hint: Boolean)

private class Doc(
    val uni: Fld,
    val dept: Fld,
    val title: Fld,
    val group: Fld,
    val to: Fld,
    val date: Fld,
    val isGroup: Boolean,
    val members: List<Mem>
)

private fun fld(value: String, hint: String, preview: Boolean): Fld {
    val v = value.trim()
    return if (v.isNotEmpty()) Fld(v, false) else if (preview) Fld(hint, true) else Fld("", false)
}

private fun resolve(d: CoverPageData, preview: Boolean): Doc {
    val filled = d.members.filter { it.name.isNotBlank() || it.id.isNotBlank() }
    val used = if (d.isGroup) filled else filled.take(1)
    val mem: List<Mem> = if (used.isNotEmpty()) {
        used.map { Mem(it.name.trim(), it.id.trim(), false) }
    } else if (preview) {
        if (d.isGroup) {
            listOf(
                Mem("Member full name", "ID number", true),
                Mem("Member full name", "ID number", true),
                Mem("Member full name", "ID number", true)
            )
        } else {
            listOf(Mem("Student full name", "ID number", true))
        }
    } else {
        emptyList()
    }
    return Doc(
        uni = fld(d.universityName, "University name", preview),
        dept = fld(d.department, "Department", preview),
        title = fld(d.title, "Assignment or course title", preview),
        group = fld(d.groupName, "Group name or number", preview),
        to = fld(d.submittedTo, "Instructor name", preview),
        date = fld(d.submissionDate, "Submission date", preview),
        isGroup = d.isGroup,
        members = mem
    )
}

// ---------------------------------------------------------------------------------------------------------------
// Drawing helpers
// ---------------------------------------------------------------------------------------------------------------

private fun tp(
    size: Float,
    color: Int,
    bold: Boolean = false,
    serif: Boolean = false,
    italic: Boolean = false,
    spacing: Float = 0f,
    black: Boolean = false
): TextPaint {
    val p = TextPaint(Paint.ANTI_ALIAS_FLAG)
    p.textSize = size
    p.color = color
    val family = if (black) "sans-serif-black" else if (serif) "serif" else "sans-serif"
    val style = if (bold && italic) Typeface.BOLD_ITALIC else if (bold) Typeface.BOLD else if (italic) Typeface.ITALIC else Typeface.NORMAL
    p.typeface = Typeface.create(family, style)
    p.letterSpacing = spacing
    return p
}

private fun fillPaint(color: Int): Paint {
    val p = Paint(Paint.ANTI_ALIAS_FLAG)
    p.style = Paint.Style.FILL
    p.color = color
    return p
}

private fun strokePaint(color: Int, width: Float): Paint {
    val p = Paint(Paint.ANTI_ALIAS_FLAG)
    p.style = Paint.Style.STROKE
    p.strokeWidth = width
    p.color = color
    return p
}

private fun strokeRect(c: Canvas, l: Float, t: Float, r: Float, b: Float, color: Int, width: Float) {
    c.drawRect(l, t, r, b, strokePaint(color, width))
}

private fun hRule(c: Canvas, x1: Float, x2: Float, y: Float, color: Int, width: Float) {
    c.drawLine(x1, y, x2, y, strokePaint(color, width))
}

private fun withAlpha(color: Int, alpha: Int): Int {
    return Color.argb(alpha, Color.red(color), Color.green(color), Color.blue(color))
}

private fun diamond(c: Canvas, cx: Float, cy: Float, r: Float, color: Int) {
    val path = Path()
    path.moveTo(cx, cy - r)
    path.lineTo(cx + r, cy)
    path.lineTo(cx, cy + r)
    path.lineTo(cx - r, cy)
    path.close()
    c.drawPath(path, fillPaint(color))
}

private fun diamondRule(c: Canvas, cx: Float, y: Float, half: Float, color: Int) {
    hRule(c, cx - half, cx - 10f, y, color, 0.9f)
    hRule(c, cx + 10f, cx + half, y, color, 0.9f)
    diamond(c, cx, y, 4.5f, color)
}

/** Draws wrapped text at (x, y) inside width w; returns the y below the text. Blank fields draw nothing. */
private fun drawBlock(c: Canvas, f: Fld, x: Float, y: Float, w: Float, p: TextPaint, align: Layout.Alignment): Float {
    if (f.blank) return y
    val saved = p.alpha
    if (f.hint) p.alpha = 110
    val layout = StaticLayout.Builder.obtain(f.text, 0, f.text.length, p, max(w.toInt(), 1))
        .setAlignment(align)
        .setLineSpacing(0f, 1.12f)
        .setIncludePad(false)
        .build()
    c.save()
    c.translate(x, y)
    layout.draw(c)
    c.restore()
    p.alpha = saved
    return y + layout.height
}

/** One line of text inside a table cell (cut with an ellipsis when too long). */
private fun cell(c: Canvas, text: String, hint: Boolean, x: Float, baseline: Float, maxW: Float, p: TextPaint) {
    if (text.isEmpty()) return
    val saved = p.alpha
    if (hint) p.alpha = 110
    val cs = TextUtils.ellipsize(text, p, max(maxW, 1f), TextUtils.TruncateAt.END)
    c.drawText(cs, 0, cs.length, x, baseline, p)
    p.alpha = saved
}

/** Draws the logo scaled to fit the box. With no logo, the preview shows a dashed LOGO placeholder; the PDF shows nothing. */
private fun drawLogo(
    c: Canvas,
    logo: Bitmap?,
    left: Float,
    top: Float,
    boxW: Float,
    boxH: Float,
    preview: Boolean,
    hAlign: Float
): Boolean {
    if (logo == null) {
        if (!preview) return false
        val s = min(boxW, boxH)
        val l = left + (boxW - s) * hAlign
        val t = top + (boxH - s) / 2f
        val tone = Color.argb(120, 110, 118, 135)
        val edge = strokePaint(tone, 1.2f)
        edge.pathEffect = DashPathEffect(floatArrayOf(5f, 4f), 0f)
        c.drawRoundRect(RectF(l, t, l + s, t + s), 12f, 12f, edge)
        val label = tp(s * 0.2f, tone, bold = true)
        c.drawText("LOGO", l + s / 2f - label.measureText("LOGO") / 2f, t + s / 2f + s * 0.07f, label)
        return true
    }
    val scale = min(boxW / logo.width, boxH / logo.height)
    val w = logo.width * scale
    val h = logo.height * scale
    val l = left + (boxW - w) * hAlign
    val t = top + (boxH - h) / 2f
    val paint = Paint(Paint.ANTI_ALIAS_FLAG or Paint.FILTER_BITMAP_FLAG)
    c.drawBitmap(logo, null, RectF(l, t, l + w, t + h), paint)
    return true
}

/** Members table. Returns the y below it. Rows shrink so the table never goes below [maxBottom]. */
private fun drawMembers(
    c: Canvas,
    mem: List<Mem>,
    left: Float,
    top: Float,
    width: Float,
    maxBottom: Float,
    accent: Int,
    filledHeader: Boolean,
    serif: Boolean
): Float {
    if (mem.isEmpty()) return top
    val headerH = 22f
    val avail = maxBottom - top - headerH
    val rowH = min(26f, avail / mem.size).coerceAtLeast(13f)
    val fs = (rowH * 0.46f).coerceIn(7.5f, 11.5f)
    val noW = 34f
    val idW = 130f
    val nameW = width - noW - idW
    val line = strokePaint(Color.argb(150, 120, 126, 140), 0.7f)
    val head = tp(9.5f, if (filledHeader) Color.WHITE else accent, bold = true, serif = serif, spacing = 0.06f)
    val body = tp(fs, INK, serif = serif)
    var y = top
    if (filledHeader) {
        c.drawRect(left, y, left + width, y + headerH, fillPaint(accent))
    }
    val hb = y + headerH / 2f + 3.4f
    cell(c, "No.", false, left + 8f, hb, noW - 10f, head)
    cell(c, "FULL NAME", false, left + noW + 8f, hb, nameW - 12f, head)
    cell(c, "ID NUMBER", false, left + noW + nameW + 8f, hb, idW - 12f, head)
    y += headerH
    if (!filledHeader) {
        hRule(c, left, left + width, y, accent, 1.2f)
    }
    mem.forEachIndexed { i, m ->
        val bottom = y + rowH
        val base = y + rowH / 2f + fs * 0.35f
        cell(c, (i + 1).toString(), false, left + 8f, base, noW - 10f, body)
        cell(c, m.name, m.hint, left + noW + 8f, base, nameW - 12f, body)
        cell(c, m.id, m.hint, left + noW + nameW + 8f, base, idW - 12f, body)
        c.drawLine(left, bottom, left + width, bottom, line)
        y = bottom
    }
    c.drawLine(left, top, left, y, line)
    c.drawLine(left + width, top, left + width, y, line)
    c.drawLine(left + noW, top + headerH, left + noW, y, line)
    c.drawLine(left + noW + nameW, top + headerH, left + noW + nameW, y, line)
    return y
}

/** Group block (group name, GROUP MEMBERS label, table) or individual block (STUDENT, name, ID). Returns the y below. */
private fun drawPeople(
    c: Canvas,
    d: Doc,
    x: Float,
    top: Float,
    w: Float,
    maxBottom: Float,
    accent: Int,
    serif: Boolean,
    filledHeader: Boolean,
    centered: Boolean
): Float {
    val align = if (centered) Layout.Alignment.ALIGN_CENTER else Layout.Alignment.ALIGN_NORMAL
    val label = tp(9.5f, MUTED, bold = true, serif = serif, spacing = 0.14f)
    var y = top
    if (d.isGroup) {
        y = drawBlock(c, d.group, x, y, w, tp(16f, accent, bold = true, serif = serif), align)
        if (!d.group.blank) y += 10f
        if (d.members.isNotEmpty()) {
            y = drawBlock(c, Fld("GROUP MEMBERS", false), x, y, w, label, align)
            y += 7f
            y = drawMembers(c, d.members, x, y, w, maxBottom, accent, filledHeader, serif)
        }
    } else {
        val m = d.members.firstOrNull()
        if (m != null) {
            y = drawBlock(c, Fld("STUDENT", false), x, y, w, label, align)
            y += 5f
            y = drawBlock(c, Fld(m.name, m.hint), x, y, w, tp(18f, INK, bold = true, serif = serif), align)
            if (m.id.isNotEmpty()) {
                y += 4f
                val idText = if (m.hint) m.id else "ID: " + m.id
                y = drawBlock(c, Fld(idText, m.hint), x, y, w, tp(13f, MUTED, serif = serif), align)
            }
        }
    }
    return y
}

/** SUBMITTED TO on the left, SUBMISSION DATE on the right (each only when it has a value). */
private fun drawTwoCol(
    c: Canvas,
    d: Doc,
    x: Float,
    top: Float,
    w: Float,
    labelColor: Int,
    valueColor: Int,
    serif: Boolean,
    valueSize: Float
) {
    val gap = 24f
    val cw = (w - gap) / 2f
    val normal = Layout.Alignment.ALIGN_NORMAL
    if (!d.to.blank) {
        var y = drawBlock(c, Fld("SUBMITTED TO", false), x, top, cw, tp(9f, labelColor, bold = true, serif = serif, spacing = 0.14f), normal)
        y += 5f
        drawBlock(c, d.to, x, y, cw, tp(valueSize, valueColor, bold = true, serif = serif), normal)
    }
    if (!d.date.blank) {
        val rx = x + cw + gap
        var y = drawBlock(c, Fld("SUBMISSION DATE", false), rx, top, cw, tp(9f, labelColor, bold = true, serif = serif, spacing = 0.14f), normal)
        y += 5f
        drawBlock(c, d.date, rx, y, cw, tp(valueSize, valueColor, bold = true, serif = serif), normal)
    }
}

// ---------------------------------------------------------------------------------------------------------------
// Template 1: Classic (framed, centred, serif)
// ---------------------------------------------------------------------------------------------------------------

private fun tplClassic(c: Canvas, d: Doc, logo: Bitmap?, accent: Int, preview: Boolean) {
    val W = COVER_PAGE_W.toFloat()
    val H = COVER_PAGE_H.toFloat()
    val center = Layout.Alignment.ALIGN_CENTER
    c.drawColor(Color.WHITE)
    strokeRect(c, 26f, 26f, W - 26f, H - 26f, accent, 2.6f)
    strokeRect(c, 34f, 34f, W - 34f, H - 34f, accent, 0.8f)
    val x = 72f
    val w = W - 144f
    var y = 66f
    if (drawLogo(c, logo, x, y, w, 96f, preview, 0.5f)) y += 96f + 16f
    y = drawBlock(c, d.uni.up(), x, y, w, tp(21f, accent, bold = true, serif = true, spacing = 0.06f), center)
    y += 8f
    hRule(c, W / 2f - 35f, W / 2f + 35f, y, accent, 1.4f)
    y += 12f
    y = drawBlock(c, d.dept, x, y, w, tp(15f, INK, serif = true), center)
    y += 40f
    y = drawBlock(c, d.title, x, y, w, tp(25f, INK, bold = true, serif = true), center)
    y += 26f
    drawPeople(c, d, x, y, w, H - 190f, accent, true, false, true)
    if (!d.to.blank || !d.date.blank) {
        hRule(c, x, x + w, H - 166f, accent, 1f)
        drawTwoCol(c, d, x, H - 150f, w, MUTED, INK, true, 14f)
    }
}

// ---------------------------------------------------------------------------------------------------------------
// Template 2: Banner (colour header with the logo on a white badge)
// ---------------------------------------------------------------------------------------------------------------

private fun tplBanner(c: Canvas, d: Doc, logo: Bitmap?, accent: Int, preview: Boolean) {
    val W = COVER_PAGE_W.toFloat()
    val H = COVER_PAGE_H.toFloat()
    val normal = Layout.Alignment.ALIGN_NORMAL
    c.drawColor(Color.WHITE)
    val band = Path()
    band.moveTo(0f, 0f)
    band.lineTo(W, 0f)
    band.lineTo(W, 178f)
    band.lineTo(0f, 214f)
    band.close()
    c.drawPath(band, fillPaint(accent))
    val stripe = Path()
    stripe.moveTo(0f, 214f)
    stripe.lineTo(W, 178f)
    stripe.lineTo(W, 190f)
    stripe.lineTo(0f, 226f)
    stripe.close()
    c.drawPath(stripe, fillPaint(withAlpha(accent, 90)))
    c.drawRect(0f, H - 10f, W, H, fillPaint(accent))

    val hasBadge = logo != null || preview
    val bs = 86f
    val bx = 40f
    val by = 46f
    if (hasBadge) {
        c.drawCircle(bx + bs / 2f, by + bs / 2f, bs / 2f, fillPaint(Color.WHITE))
        drawLogo(c, logo, bx + 11f, by + 11f, bs - 22f, bs - 22f, preview, 0.5f)
    }
    val tx = if (hasBadge) bx + bs + 20f else 40f
    val tw = W - tx - 36f
    var ty = 58f
    ty = drawBlock(c, d.uni.up(), tx, ty, tw, tp(18f, Color.WHITE, bold = true, spacing = 0.05f), normal)
    ty += 6f
    drawBlock(c, d.dept, tx, ty, tw, tp(12.5f, Color.argb(230, 255, 255, 255)), normal)

    val x = 46f
    val w = W - 92f
    var y = 258f
    c.drawRect(x, y, x + 54f, y + 5f, fillPaint(accent))
    y += 20f
    y = drawBlock(c, d.title, x, y, w, tp(30f, INK, bold = true), normal)
    y += 24f
    drawPeople(c, d, x, y, w, H - 168f, accent, false, true, false)
    if (!d.to.blank || !d.date.blank) {
        c.drawRoundRect(RectF(x, H - 150f, W - 46f, H - 54f), 14f, 14f, fillPaint(SOFT_GRAY))
        drawTwoCol(c, d, x + 22f, H - 132f, w - 44f, MUTED, INK, false, 14f)
    }
}

// ---------------------------------------------------------------------------------------------------------------
// Template 3: Sidebar (colour band on the left)
// ---------------------------------------------------------------------------------------------------------------

private fun tplSidebar(c: Canvas, d: Doc, logo: Bitmap?, accent: Int, preview: Boolean) {
    val W = COVER_PAGE_W.toFloat()
    val H = COVER_PAGE_H.toFloat()
    val normal = Layout.Alignment.ALIGN_NORMAL
    val center = Layout.Alignment.ALIGN_CENTER
    c.drawColor(Color.WHITE)
    val bw = 176f
    c.drawRect(0f, 0f, bw, H, fillPaint(accent))
    c.drawRect(bw - 6f, 0f, bw, H, fillPaint(Color.argb(45, 0, 0, 0)))

    var y = 60f
    if (logo != null || preview) {
        val bs = 100f
        c.drawCircle(bw / 2f, y + bs / 2f, bs / 2f, fillPaint(Color.WHITE))
        drawLogo(c, logo, (bw - bs) / 2f + 12f, y + 12f, bs - 24f, bs - 24f, preview, 0.5f)
        y += bs + 24f
    }
    y = drawBlock(c, d.uni.up(), 18f, y, bw - 36f, tp(12.5f, Color.WHITE, bold = true, spacing = 0.06f), center)
    y += 10f
    hRule(c, bw / 2f - 22f, bw / 2f + 22f, y, Color.argb(190, 255, 255, 255), 1.2f)
    y += 12f
    drawBlock(c, d.dept, 18f, y, bw - 36f, tp(10.5f, Color.argb(230, 255, 255, 255)), center)
    if (!d.date.blank) {
        var dy = H - 96f
        dy = drawBlock(c, Fld("SUBMISSION DATE", false), 18f, dy, bw - 36f, tp(8.5f, Color.argb(210, 255, 255, 255), bold = true, spacing = 0.14f), center)
        dy += 4f
        drawBlock(c, d.date, 18f, dy, bw - 36f, tp(12.5f, Color.WHITE, bold = true), center)
    }

    val mx = bw + 34f
    val mw = W - mx - 40f
    var my = 90f
    c.drawRect(mx, my, mx + 50f, my + 4f, fillPaint(accent))
    my += 18f
    my = drawBlock(c, d.title, mx, my, mw, tp(27f, INK, bold = true), normal)
    my += 26f
    drawPeople(c, d, mx, my, mw, H - 160f, accent, false, false, false)
    if (!d.to.blank) {
        hRule(c, mx, mx + mw, H - 132f, accent, 1f)
        var fy = H - 116f
        fy = drawBlock(c, Fld("SUBMITTED TO", false), mx, fy, mw, tp(9f, MUTED, bold = true, spacing = 0.14f), normal)
        fy += 5f
        drawBlock(c, d.to, mx, fy, mw, tp(15f, INK, bold = true), normal)
    }
}

// ---------------------------------------------------------------------------------------------------------------
// Template 4: Elegant (cream paper, triple border, diamonds, serif italics)
// ---------------------------------------------------------------------------------------------------------------

private fun tplElegant(c: Canvas, d: Doc, logo: Bitmap?, accent: Int, preview: Boolean) {
    val W = COVER_PAGE_W.toFloat()
    val H = COVER_PAGE_H.toFloat()
    val center = Layout.Alignment.ALIGN_CENTER
    c.drawColor(CREAM)
    strokeRect(c, 22f, 22f, W - 22f, H - 22f, accent, 1.2f)
    strokeRect(c, 29f, 29f, W - 29f, H - 29f, accent, 3.2f)
    strokeRect(c, 37f, 37f, W - 37f, H - 37f, accent, 0.8f)
    val corners = listOf(37f to 37f, (W - 37f) to 37f, 37f to (H - 37f), (W - 37f) to (H - 37f))
    for (pt in corners) {
        diamond(c, pt.first, pt.second, 6f, accent)
    }
    val x = 76f
    val w = W - 152f
    var y = 70f
    if (logo != null || preview) {
        c.drawCircle(W / 2f, y + 50f, 52f, strokePaint(accent, 1f))
        drawLogo(c, logo, W / 2f - 38f, y + 12f, 76f, 76f, preview, 0.5f)
        y += 116f
    }
    y = drawBlock(c, d.uni.up(), x, y, w, tp(17f, accent, bold = true, serif = true, spacing = 0.14f), center)
    y += 8f
    diamondRule(c, W / 2f, y + 6f, 90f, accent)
    y += 22f
    y = drawBlock(c, d.dept, x, y, w, tp(14.5f, INK, serif = true, italic = true), center)
    y += 38f
    y = drawBlock(c, d.title, x, y, w, tp(27f, INK, serif = true, italic = true), center)
    y += 26f
    drawPeople(c, d, x, y, w, H - 205f, accent, true, false, true)
    if (!d.to.blank || !d.date.blank) {
        var fy = H - 170f
        diamondRule(c, W / 2f, fy, 90f, accent)
        fy += 18f
        if (!d.to.blank) {
            fy = drawBlock(c, Fld("SUBMITTED TO", false), x, fy, w, tp(9f, MUTED, bold = true, serif = true, spacing = 0.14f), center)
            fy += 4f
            fy = drawBlock(c, d.to, x, fy, w, tp(14.5f, INK, serif = true, bold = true), center)
            fy += 14f
        }
        if (!d.date.blank) {
            fy = drawBlock(c, Fld("SUBMISSION DATE", false), x, fy, w, tp(9f, MUTED, bold = true, serif = true, spacing = 0.14f), center)
            fy += 4f
            drawBlock(c, d.date, x, fy, w, tp(14.5f, INK, serif = true, bold = true), center)
        }
    }
}

// ---------------------------------------------------------------------------------------------------------------
// Template 5: Bold (big heavy title, colour footer block)
// ---------------------------------------------------------------------------------------------------------------

private fun tplBold(c: Canvas, d: Doc, logo: Bitmap?, accent: Int, preview: Boolean) {
    val W = COVER_PAGE_W.toFloat()
    val H = COVER_PAGE_H.toFloat()
    val normal = Layout.Alignment.ALIGN_NORMAL
    c.drawColor(Color.WHITE)
    c.drawRect(0f, 0f, W, 16f, fillPaint(accent))
    val x = 50f
    val w = W - 100f
    var y = 52f
    val ls = 64f
    val drew = drawLogo(c, logo, x, y, ls, ls, preview, 0f)
    val tx = if (drew) x + ls + 16f else x
    val tw = W - 50f - tx
    var ty = y + 6f
    ty = drawBlock(c, d.uni.up(), tx, ty, tw, tp(13f, INK, bold = true, spacing = 0.1f), normal)
    ty += 4f
    ty = drawBlock(c, d.dept, tx, ty, tw, tp(11f, MUTED), normal)
    y = max(y + (if (drew) ls else 0f), ty) + 58f
    y = drawBlock(c, d.title, x, y, w, tp(38f, INK, black = true), normal)
    y += 14f
    c.drawRect(x, y, x + 96f, y + 8f, fillPaint(accent))
    y += 34f
    drawPeople(c, d, x, y, w, H - 150f, accent, false, false, false)
    if (!d.to.blank || !d.date.blank) {
        c.drawRect(0f, H - 118f, W, H, fillPaint(accent))
        drawTwoCol(c, d, x, H - 92f, w, Color.argb(200, 255, 255, 255), Color.WHITE, false, 14.5f)
    }
}
