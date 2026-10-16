package com.wisdomtower.academy.ui.study

import android.app.DatePickerDialog
import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.net.Uri
import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.Icon
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardCapitalization
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.wisdomtower.academy.ui.theme.AtmosphereBackground
import com.wisdomtower.academy.ui.theme.WisdomCyan
import com.wisdomtower.academy.ui.theme.WisdomGlassBorder
import com.wisdomtower.academy.ui.theme.WisdomGlassCard
import com.wisdomtower.academy.ui.theme.WisdomGlassFill
import com.wisdomtower.academy.ui.theme.WisdomMuted
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale

/**
 * Cover Page Generator (owner order 2026-10-16: replaces the "Courses" tile of the Study Tools dock).
 *
 * The student picks one of 5 A4 templates and a colour, fills in: logo, university name, department, group or
 * individual (group name and a members list with ID numbers, or one student), submitted to, submission date, and
 * downloads the page as a PDF. The drawing code is in CoverPageRenderer.kt: the preview and the PDF come from the
 * same function, so they match. No new dependency, no permission: the logo comes from the system picker
 * (GetContent) and the PDF is saved where the student chooses (CreateDocument, the system "Save as" screen).
 *
 * What is typed stays in [CoverForm] until the app is closed (so Back and reopen keep it). The Clear button empties it.
 * Added by the agent beyond the owner's list: an optional "Assignment or course title" field and the colour choice.
 * Status: written, NOT compiled by the author, not seen on a device.
 */
object CoverForm {
    var logo by mutableStateOf<Bitmap?>(null)
    var university by mutableStateOf("")
    var department by mutableStateOf("")
    var title by mutableStateOf("")
    var isGroup by mutableStateOf(true)
    var groupName by mutableStateOf("")
    val members = mutableStateListOf(CoverMember())
    var studentName by mutableStateOf("")
    var studentId by mutableStateOf("")
    var submittedTo by mutableStateOf("")
    var dateText by mutableStateOf(todayText())
    var templateIndex by mutableIntStateOf(0)
    var accentIndex by mutableIntStateOf(0)
    var borderIndex by mutableIntStateOf(0) // 0 = the template's own default border

    fun clear() {
        logo = null
        university = ""
        department = ""
        title = ""
        isGroup = true
        groupName = ""
        members.clear()
        members.add(CoverMember())
        studentName = ""
        studentId = ""
        submittedTo = ""
        dateText = todayText()
    }
}

private const val MAX_MEMBERS = 20

private fun todayText(): String = SimpleDateFormat("d MMMM yyyy", Locale.ENGLISH).format(Date())

private fun showDatePicker(context: Context, onPicked: (String) -> Unit) {
    val now = Calendar.getInstance()
    DatePickerDialog(
        context,
        { _, year, month, day ->
            val picked = Calendar.getInstance()
            picked.set(year, month, day)
            onPicked(SimpleDateFormat("d MMMM yyyy", Locale.ENGLISH).format(picked.time))
        },
        now.get(Calendar.YEAR),
        now.get(Calendar.MONTH),
        now.get(Calendar.DAY_OF_MONTH)
    ).show()
}

/** Reads the chosen logo and shrinks it (longest side about 900 px at most) so the PDF stays small. */
private suspend fun loadLogoBitmap(context: Context, uri: Uri): Bitmap? = withContext(Dispatchers.IO) {
    try {
        val bounds = BitmapFactory.Options()
        bounds.inJustDecodeBounds = true
        context.contentResolver.openInputStream(uri)?.use { BitmapFactory.decodeStream(it, null, bounds) }
        var sample = 1
        val longest = maxOf(bounds.outWidth, bounds.outHeight)
        while (longest / sample > 900) sample *= 2
        val opts = BitmapFactory.Options()
        opts.inSampleSize = sample
        context.contentResolver.openInputStream(uri)?.use { BitmapFactory.decodeStream(it, null, opts) }
    } catch (e: Exception) {
        null
    }
}

private fun pdfFileName(title: String, department: String): String {
    val base = (if (title.isNotBlank()) title else department)
        .trim()
        .replace(Regex("[^A-Za-z0-9]+"), "_")
        .trim('_')
        .take(30)
    return if (base.isEmpty()) "Cover_Page.pdf" else "Cover_Page_$base.pdf"
}

@Composable
fun NativeCoverPageScreen(
    onBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()

    val accent = COVER_ACCENTS[CoverForm.accentIndex].color
    val template = CoverForm.templateIndex
    val logoBmp = CoverForm.logo
    val data = CoverPageData(
        universityName = CoverForm.university,
        department = CoverForm.department,
        title = CoverForm.title,
        isGroup = CoverForm.isGroup,
        groupName = CoverForm.groupName,
        members = if (CoverForm.isGroup) {
            CoverForm.members.toList()
        } else {
            listOf(CoverMember(CoverForm.studentName, CoverForm.studentId))
        },
        submittedTo = CoverForm.submittedTo,
        submissionDate = CoverForm.dateText
    )

    // Live preview and the template thumbnails are redrawn a moment after the last change (off the main thread).
    var preview by remember { mutableStateOf<Bitmap?>(null) }
    var thumbs by remember { mutableStateOf<List<Bitmap>>(emptyList()) }
    LaunchedEffect(data, logoBmp, template, CoverForm.accentIndex, CoverForm.borderIndex) {
        delay(140)
        val border = CoverForm.borderIndex
        val big = withContext(Dispatchers.Default) { renderCoverBitmap(data, logoBmp, template, accent, 1.6f, border) }
        val small = withContext(Dispatchers.Default) {
            COVER_TEMPLATES.indices.map { renderCoverBitmap(data, logoBmp, it, accent, 0.34f, border) }
        }
        preview = big
        thumbs = small
    }

    val logoLauncher = rememberLauncherForActivityResult(ActivityResultContracts.GetContent()) { uri: Uri? ->
        if (uri != null) {
            scope.launch {
                val bmp = loadLogoBitmap(context, uri)
                if (bmp != null) {
                    CoverForm.logo = bmp
                } else {
                    Toast.makeText(context, "Could not open that picture", Toast.LENGTH_SHORT).show()
                }
            }
        }
    }

    val saveLauncher = rememberLauncherForActivityResult(ActivityResultContracts.CreateDocument("application/pdf")) { uri: Uri? ->
        if (uri != null) {
            scope.launch {
                val ok = withContext(Dispatchers.IO) {
                    try {
                        context.contentResolver.openOutputStream(uri)?.use { out ->
                            writeCoverPdf(out, data, logoBmp, template, accent, CoverForm.borderIndex)
                            true
                        } ?: false
                    } catch (e: Exception) {
                        false
                    }
                }
                Toast.makeText(
                    context,
                    if (ok) "Cover page saved as PDF" else "Could not save the PDF",
                    Toast.LENGTH_LONG
                ).show()
            }
        }
    }

    Box(modifier = modifier.fillMaxSize()) {
        AtmosphereBackground(modifier = Modifier.fillMaxSize())
        Column(modifier = Modifier.fillMaxSize()) {
            // Top bar
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 12.dp, vertical = 8.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                ScreenBackButton(onClick = onBack)
                Column {
                    Text(
                        text = "Cover Page Generator",
                        fontSize = 17.sp,
                        fontWeight = FontWeight.Black,
                        color = Color.White
                    )
                    Text(
                        text = "${COVER_TEMPLATES.size} A4 templates, ${COVER_BORDERS.size} page borders, download as PDF",
                        fontSize = 11.sp,
                        color = WisdomMuted
                    )
                }
            }

            LazyColumn(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth(),
                contentPadding = PaddingValues(start = 16.dp, end = 16.dp, top = 6.dp, bottom = 16.dp),
                verticalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                // 1. Template, colour and page border
                item(key = "cover_templates") {
                    CoverSection("TEMPLATE") {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .horizontalScroll(rememberScrollState()),
                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            COVER_TEMPLATES.forEachIndexed { index, t ->
                                TemplateThumb(
                                    name = t.name,
                                    bmp = thumbs.getOrNull(index),
                                    selected = index == template,
                                    onClick = { CoverForm.templateIndex = index }
                                )
                            }
                        }
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            Text(text = "Colour", fontSize = 12.sp, color = WisdomMuted)
                            COVER_ACCENTS.forEachIndexed { index, a ->
                                val selected = index == CoverForm.accentIndex
                                Box(
                                    modifier = Modifier
                                        .size(30.dp)
                                        .clip(CircleShape)
                                        .background(Color(a.color))
                                        .border(
                                            BorderStroke(if (selected) 2.5.dp else 1.dp, if (selected) Color.White else WisdomGlassBorder),
                                            CircleShape
                                        )
                                        .clickable { CoverForm.accentIndex = index }
                                )
                            }
                        }
                        Text(text = "Page border", fontSize = 12.sp, color = WisdomMuted)
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .horizontalScroll(rememberScrollState()),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            COVER_BORDERS.forEachIndexed { index, name ->
                                CoverPill(
                                    text = name,
                                    filled = index == CoverForm.borderIndex,
                                    modifier = Modifier.width(100.dp),
                                    onClick = { CoverForm.borderIndex = index }
                                )
                            }
                        }
                    }
                }

                // 2. Live preview
                item(key = "cover_preview") {
                    CoverSection("PREVIEW") {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .aspectRatio(COVER_PAGE_W.toFloat() / COVER_PAGE_H.toFloat())
                                .clip(RoundedCornerShape(6.dp))
                                .background(Color.White)
                        ) {
                            val pb = preview
                            if (pb != null) {
                                Image(
                                    bitmap = pb.asImageBitmap(),
                                    contentDescription = "Cover page preview",
                                    contentScale = ContentScale.FillBounds,
                                    modifier = Modifier.fillMaxSize()
                                )
                            }
                        }
                    }
                }

                // 3. Logo
                item(key = "cover_logo") {
                    CoverSection("LOGO") {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(64.dp)
                                    .clip(RoundedCornerShape(14.dp))
                                    .background(Color.White.copy(alpha = 0.08f))
                                    .border(BorderStroke(1.dp, WisdomGlassBorder), RoundedCornerShape(14.dp)),
                                contentAlignment = Alignment.Center
                            ) {
                                val lb = CoverForm.logo
                                if (lb != null) {
                                    Image(
                                        bitmap = lb.asImageBitmap(),
                                        contentDescription = "Logo",
                                        contentScale = ContentScale.Fit,
                                        modifier = Modifier
                                            .fillMaxSize()
                                            .padding(6.dp)
                                    )
                                } else {
                                    Text(text = "LOGO", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = WisdomMuted)
                                }
                            }
                            Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                                CoverPill(
                                    text = if (CoverForm.logo == null) "Choose logo" else "Change logo",
                                    filled = true,
                                    modifier = Modifier.width(150.dp),
                                    onClick = { logoLauncher.launch("image/*") }
                                )
                                if (CoverForm.logo != null) {
                                    CoverPill(
                                        text = "Remove",
                                        filled = false,
                                        modifier = Modifier.width(150.dp),
                                        onClick = { CoverForm.logo = null }
                                    )
                                }
                            }
                        }
                        Text(
                            text = "A PNG with a transparent background looks best.",
                            fontSize = 11.sp,
                            color = WisdomMuted
                        )
                    }
                }

                // 4. Institution and title
                item(key = "cover_institution") {
                    CoverSection("INSTITUTION") {
                        CoverField(CoverForm.university, { CoverForm.university = it }, "University name")
                        CoverField(CoverForm.department, { CoverForm.department = it }, "Department")
                        CoverField(CoverForm.title, { CoverForm.title = it }, "Assignment or course title (optional)")
                    }
                }

                // 5. Group or individual
                item(key = "cover_people") {
                    CoverSection("SUBMITTED BY") {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            CoverPill(
                                text = "Group",
                                filled = CoverForm.isGroup,
                                modifier = Modifier.weight(1f),
                                onClick = { CoverForm.isGroup = true }
                            )
                            CoverPill(
                                text = "Individual",
                                filled = !CoverForm.isGroup,
                                modifier = Modifier.weight(1f),
                                onClick = { CoverForm.isGroup = false }
                            )
                        }
                        if (CoverForm.isGroup) {
                            CoverField(CoverForm.groupName, { CoverForm.groupName = it }, "Group name or number")
                            Text(text = "Group members", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = Color.White)
                            CoverForm.members.forEachIndexed { index, m ->
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                                ) {
                                    Text(
                                        text = (index + 1).toString(),
                                        fontSize = 12.sp,
                                        color = WisdomMuted,
                                        modifier = Modifier.width(16.dp)
                                    )
                                    CoverField(
                                        value = m.name,
                                        onValueChange = { v -> CoverForm.members[index] = CoverForm.members[index].copy(name = v) },
                                        label = "Full name",
                                        modifier = Modifier.weight(1.4f)
                                    )
                                    CoverField(
                                        value = m.id,
                                        onValueChange = { v -> CoverForm.members[index] = CoverForm.members[index].copy(id = v) },
                                        label = "ID number",
                                        modifier = Modifier.weight(1f),
                                        capitalize = false
                                    )
                                    if (CoverForm.members.size > 1) {
                                        Box(
                                            modifier = Modifier
                                                .size(32.dp)
                                                .clip(CircleShape)
                                                .clickable { CoverForm.members.removeAt(index) },
                                            contentAlignment = Alignment.Center
                                        ) {
                                            Icon(
                                                imageVector = Icons.Default.Close,
                                                contentDescription = "Remove member",
                                                tint = WisdomMuted,
                                                modifier = Modifier.size(18.dp)
                                            )
                                        }
                                    }
                                }
                            }
                            if (CoverForm.members.size < MAX_MEMBERS) {
                                CoverPill(
                                    text = "+ Add member",
                                    filled = false,
                                    modifier = Modifier.fillMaxWidth(),
                                    onClick = { CoverForm.members.add(CoverMember()) }
                                )
                            }
                        } else {
                            CoverField(CoverForm.studentName, { CoverForm.studentName = it }, "Student full name")
                            CoverField(CoverForm.studentId, { CoverForm.studentId = it }, "ID number", capitalize = false)
                        }
                    }
                }

                // 6. Submitted to and date
                item(key = "cover_submission") {
                    CoverSection("SUBMISSION") {
                        CoverField(CoverForm.submittedTo, { CoverForm.submittedTo = it }, "Submitted to (instructor)")
                        CoverField(
                            value = CoverForm.dateText,
                            onValueChange = { CoverForm.dateText = it },
                            label = "Submission date",
                            trailing = {
                                Icon(
                                    imageVector = Icons.Default.CalendarMonth,
                                    contentDescription = "Pick a date",
                                    tint = WisdomCyan,
                                    modifier = Modifier
                                        .size(24.dp)
                                        .clickable { showDatePicker(context) { picked -> CoverForm.dateText = picked } }
                                )
                            }
                        )
                    }
                }

                item(key = "cover_bottom_spacer") {
                    Spacer(modifier = Modifier.height(8.dp))
                }
            }

            // Bottom bar
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 10.dp),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                CoverPill(
                    text = "Clear",
                    filled = false,
                    modifier = Modifier.weight(0.45f),
                    onClick = { CoverForm.clear() }
                )
                CoverPill(
                    text = "Download PDF",
                    filled = true,
                    modifier = Modifier.weight(1f),
                    onClick = { saveLauncher.launch(pdfFileName(CoverForm.title, CoverForm.department)) }
                )
            }
        }
    }
}

@Composable
private fun CoverSection(title: String, content: @Composable ColumnScope.() -> Unit) {
    WisdomGlassCard(modifier = Modifier.fillMaxWidth(), cornerRadius = 20.dp) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            Text(
                text = title,
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                color = WisdomMuted,
                letterSpacing = 0.8.sp
            )
            content()
        }
    }
}

@Composable
private fun TemplateThumb(name: String, bmp: Bitmap?, selected: Boolean, onClick: () -> Unit) {
    Column(
        modifier = Modifier
            .width(96.dp)
            .clickable(onClick = onClick),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        val shape = RoundedCornerShape(8.dp)
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .aspectRatio(COVER_PAGE_W.toFloat() / COVER_PAGE_H.toFloat())
                .clip(shape)
                .background(Color.White)
                .border(
                    BorderStroke(if (selected) 2.5.dp else 1.dp, if (selected) WisdomCyan else WisdomGlassBorder),
                    shape
                )
        ) {
            if (bmp != null) {
                Image(
                    bitmap = bmp.asImageBitmap(),
                    contentDescription = name,
                    contentScale = ContentScale.FillBounds,
                    modifier = Modifier.fillMaxSize()
                )
            }
        }
        Spacer(modifier = Modifier.height(6.dp))
        Text(
            text = name,
            fontSize = 11.sp,
            fontWeight = FontWeight.SemiBold,
            color = if (selected) WisdomCyan else Color.White
        )
    }
}

@Composable
private fun CoverPill(text: String, filled: Boolean, modifier: Modifier, onClick: () -> Unit) {
    val shape = RoundedCornerShape(50)
    Box(
        modifier = modifier
            .height(42.dp)
            .clip(shape)
            .background(if (filled) WisdomCyan else WisdomGlassFill)
            .border(BorderStroke(1.dp, if (filled) WisdomCyan else WisdomGlassBorder), shape)
            .clickable(onClick = onClick),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = text,
            fontSize = 13.sp,
            fontWeight = FontWeight.Bold,
            color = if (filled) Color(0xFF04121F) else Color.White,
            maxLines = 1
        )
    }
}

@Composable
private fun CoverField(
    value: String,
    onValueChange: (String) -> Unit,
    label: String,
    modifier: Modifier = Modifier,
    capitalize: Boolean = true,
    trailing: (@Composable () -> Unit)? = null
) {
    OutlinedTextField(
        value = value,
        onValueChange = onValueChange,
        label = { Text(text = label, fontSize = 12.sp, maxLines = 1) },
        singleLine = true,
        shape = RoundedCornerShape(14.dp),
        textStyle = TextStyle(fontSize = 14.sp, color = Color.White),
        keyboardOptions = KeyboardOptions(
            capitalization = if (capitalize) KeyboardCapitalization.Words else KeyboardCapitalization.None
        ),
        trailingIcon = trailing,
        colors = OutlinedTextFieldDefaults.colors(
            focusedTextColor = Color.White,
            unfocusedTextColor = Color.White,
            focusedBorderColor = WisdomCyan,
            unfocusedBorderColor = WisdomGlassBorder,
            focusedLabelColor = WisdomCyan,
            unfocusedLabelColor = WisdomMuted,
            cursorColor = WisdomCyan,
            focusedContainerColor = Color.Transparent,
            unfocusedContainerColor = Color.Transparent
        ),
        modifier = modifier.fillMaxWidth()
    )
}
