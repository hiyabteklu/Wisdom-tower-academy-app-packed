package com.wisdomtower.academy.ui.study

import android.content.ClipData
import androidx.activity.compose.BackHandler
import android.content.ClipboardManager
import android.content.Context
import android.widget.Toast
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Folder
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.wisdomtower.academy.ui.theme.AtmosphereBackground
import com.wisdomtower.academy.ui.theme.ContentQuestionStyle
import kotlinx.coroutines.delay

/**
 * Native port of the "Notebook" tool of `website-reference/src/app/learning/LearningContent.tsx`
 * (`activeFeature === "notes"`): header "Notebook" / "Study notes, formulas, and chapter summaries." with the buttons
 * "New Folder", "Add Sheet" and Close; one tab per folder (name + sheet count, a delete button when there is more than
 * one folder); the list "<folder> Sheets" (title, date, delete button when the folder has more than one sheet); the
 * editor (sheet title, "Copy Notes" / "Copied", the text area with the website's placeholder, "Auto-saved locally" and
 * the character count). Same rules: at least one folder is kept ("You must keep at least one notes folder."), a folder
 * keeps at least one sheet ("A folder must keep at least one sheet."), deleting a folder asks first ("Delete this folder
 * and all its sheets?"), a new folder starts with one sheet "New Sheet", "Add Sheet" puts "Untitled Sheet" at the top of
 * the folder, every change is saved at once.
 *
 * Differences: starts EMPTY (the website's two sample folders with sample notes are invented, owner rule); the website
 * asks for the folder name with the browser's prompt box, here a small dialog with the same text; the phone layout
 * stacks the sheet list above the editor (the website has two columns on wide screens); a Close button is the way back;
 * when there is no folder yet a short line tells the student to tap New Folder (text not on the website).
 *
 * STATUS: written, NOT compiled, NOT tested on a device.
 */
@Composable
fun NativeNotebookScreen(onBack: () -> Unit, modifier: Modifier = Modifier) {
    val context = LocalContext.current
    LaunchedEffect(Unit) { NativeNotebookState.init(context) }
    val folders = NativeNotebookState.folders

    var selectedFolderId by remember { mutableStateOf("") }
    var selectedSheetId by remember { mutableStateOf("") }
    var copied by remember { mutableStateOf(false) }
    var newFolderOpen by remember { mutableStateOf(false) }
    var newFolderName by remember { mutableStateOf("") }
    var deleteFolderId by remember { mutableStateOf<String?>(null) }

    val currentFolder = folders.firstOrNull { it.id == selectedFolderId } ?: folders.firstOrNull()
    val currentSheet = currentFolder?.sheets?.firstOrNull { it.id == selectedSheetId } ?: currentFolder?.sheets?.firstOrNull()

    LaunchedEffect(copied) {
        if (copied) {
            delay(2000L)
            copied = false
        }
    }

    fun addFolder() {
        val name = newFolderName.trim()
        newFolderOpen = false
        newFolderName = ""
        if (name.isEmpty()) return
        val sheet = NativeNoteSheet(NativeNotebookState.newId("s"), "New Sheet", "", NativeNotebookState.isoNow())
        val folder = NativeNoteFolder(NativeNotebookState.newId("f"), name, listOf(sheet))
        NativeNotebookState.save(folders + folder)
        selectedFolderId = folder.id
        selectedSheetId = sheet.id
    }

    fun deleteFolder(folderId: String) {
        if (folders.size <= 1) {
            Toast.makeText(context, "You must keep at least one notes folder.", Toast.LENGTH_SHORT).show()
            return
        }
        val next = folders.filter { it.id != folderId }
        NativeNotebookState.save(next)
        if (selectedFolderId == folderId || currentFolder?.id == folderId) {
            selectedFolderId = next[0].id
            selectedSheetId = next[0].sheets.firstOrNull()?.id ?: ""
        }
    }

    fun addSheet() {
        val folder = currentFolder ?: return
        val sheet = NativeNoteSheet(NativeNotebookState.newId("s"), "Untitled Sheet", "", NativeNotebookState.isoNow())
        NativeNotebookState.save(folders.map { if (it.id == folder.id) it.copy(sheets = listOf(sheet) + it.sheets) else it })
        selectedFolderId = folder.id
        selectedSheetId = sheet.id
    }

    fun deleteSheet(sheetId: String) {
        val folder = currentFolder ?: return
        if (folder.sheets.size <= 1) {
            Toast.makeText(context, "A folder must keep at least one sheet.", Toast.LENGTH_SHORT).show()
            return
        }
        val remaining = folder.sheets.filter { it.id != sheetId }
        NativeNotebookState.save(folders.map { if (it.id == folder.id) it.copy(sheets = remaining) else it })
        if (selectedSheetId == sheetId || currentSheet?.id == sheetId) {
            selectedSheetId = remaining.firstOrNull()?.id ?: ""
        }
    }

    fun updateSheet(title: String? = null, content: String? = null) {
        val folder = currentFolder ?: return
        val sheet = currentSheet ?: return
        val updated = sheet.copy(
            title = title ?: sheet.title,
            content = content ?: sheet.content,
            updatedAt = NativeNotebookState.isoNow()
        )
        NativeNotebookState.save(
            folders.map { f ->
                if (f.id == folder.id) f.copy(sheets = f.sheets.map { s -> if (s.id == sheet.id) updated else s }) else f
            }
        )
    }

    fun copySheet() {
        val sheet = currentSheet ?: return
        val cm = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
        cm.setPrimaryClip(ClipData.newPlainText("Notes", "${sheet.title}\n\n${sheet.content}"))
        copied = true
    }

    BackHandler(enabled = true) { onBack() }

    Box(modifier = modifier.fillMaxSize()) {
        AtmosphereBackground(modifier = Modifier.fillMaxSize())

        Column(modifier = Modifier.fillMaxSize().imePadding()) {
            // Shared top toolbar: back arrow + title (48dp touch target, top-left)
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 12.dp, vertical = 8.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                ScreenBackButton(onBack)
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    modifier = Modifier.weight(1f)
                ) {
                    Icon(Icons.Filled.Folder, contentDescription = null, tint = Color(0xFF38BDF8), modifier = Modifier.size(20.dp))
                    Column {
                        Text("Notebook", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = Color.White)
                        Text("Study notes, formulas, and chapter summaries.", fontSize = 11.sp, color = Color(0xFF94A3B8))
                    }
                }
            }

            Column(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState())
                    .padding(horizontal = 12.dp, vertical = 8.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                // Header action buttons
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(24.dp))
                        .background(Color(0xFF0C1626).copy(alpha = 0.85f))
                        .border(BorderStroke(1.dp, Color.White.copy(alpha = 0.08f)), RoundedCornerShape(24.dp))
                        .padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        NbButton("New Folder", Icons.Filled.Add, Color.White.copy(alpha = 0.06f), Color(0xFFE2E8F0), Color.White.copy(alpha = 0.08f)) {
                            newFolderName = ""
                            newFolderOpen = true
                        }
                        NbButton("Add Sheet", Icons.Filled.Add, Color.White, Color(0xFF020617), Color.White) { addSheet() }
                    }
                }

            if (folders.isEmpty()) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(24.dp))
                        .border(BorderStroke(1.dp, Color.White.copy(alpha = 0.10f)), RoundedCornerShape(24.dp))
                        .background(Color.White.copy(alpha = 0.02f))
                        .padding(28.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text("No folders yet. Tap New Folder to begin.", fontSize = 14.sp, color = Color(0xFF94A3B8))
                }
            } else {
                // Folder tabs
                Row(
                    modifier = Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    folders.forEach { folder ->
                        val active = folder.id == currentFolder?.id
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Row(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(50))
                                    .background(if (active) Color.White else Color.White.copy(alpha = 0.04f))
                                    .border(BorderStroke(1.dp, if (active) Color.White else Color.White.copy(alpha = 0.08f)), RoundedCornerShape(50))
                                    .clickable {
                                        selectedFolderId = folder.id
                                        selectedSheetId = folder.sheets.firstOrNull()?.id ?: ""
                                    }
                                    .padding(horizontal = 14.dp, vertical = 7.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                Text(
                                    folder.name,
                                    fontSize = 12.sp,
                                    fontWeight = if (active) FontWeight.Bold else FontWeight.SemiBold,
                                    color = if (active) Color(0xFF020617) else Color(0xFFCBD5E1),
                                    maxLines = 1
                                )
                                Box(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(50))
                                        .background(if (active) Color(0xFFE2E8F0) else Color.Black.copy(alpha = 0.40f))
                                        .padding(horizontal = 6.dp, vertical = 1.dp)
                                ) {
                                    Text(
                                        "${folder.sheets.size}",
                                        fontSize = 10.sp,
                                        color = if (active) Color(0xFF0F172A) else Color(0xFF94A3B8)
                                    )
                                }
                            }
                            if (folders.size > 1) {
                                Box(
                                    modifier = Modifier
                                        .padding(start = 2.dp)
                                        .clip(CircleShape)
                                        .clickable { deleteFolderId = folder.id }
                                        .padding(6.dp)
                                ) {
                                    Icon(Icons.Filled.Delete, contentDescription = "Delete folder", tint = Color(0xFF64748B), modifier = Modifier.size(14.dp))
                                }
                            }
                        }
                    }
                }

                // Sheets of the current folder
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(24.dp))
                        .background(Color(0xFF0C1626).copy(alpha = 0.85f))
                        .border(BorderStroke(1.dp, Color.White.copy(alpha = 0.08f)), RoundedCornerShape(24.dp))
                        .padding(14.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(
                            "${currentFolder?.name ?: ""} Sheets",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = Color(0xFFCBD5E1),
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis,
                            modifier = Modifier.weight(1f)
                        )
                        Row(
                            modifier = Modifier
                                .padding(start = 8.dp)
                                .clip(RoundedCornerShape(50))
                                .background(Color.White.copy(alpha = 0.04f))
                                .border(BorderStroke(1.dp, Color.White.copy(alpha = 0.08f)), RoundedCornerShape(50))
                                .clickable { addSheet() }
                                .padding(horizontal = 10.dp, vertical = 5.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            Icon(Icons.Filled.Add, contentDescription = null, tint = Color(0xFF38BDF8), modifier = Modifier.size(12.dp))
                            Text("Add", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = Color(0xFF38BDF8))
                        }
                    }
                    Box(modifier = Modifier.fillMaxWidth().padding(top = 0.dp).heightIn(max = 1.dp).background(Color.White.copy(alpha = 0.08f)))

                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .heightIn(max = 300.dp)
                            .verticalScroll(rememberScrollState()),
                        verticalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        currentFolder?.sheets?.forEach { sheet ->
                            val selected = sheet.id == currentSheet?.id
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clip(RoundedCornerShape(16.dp))
                                    .background(if (selected) Color.White.copy(alpha = 0.12f) else Color.White.copy(alpha = 0.02f))
                                    .border(
                                        BorderStroke(1.dp, if (selected) Color.White.copy(alpha = 0.30f) else Color.White.copy(alpha = 0.06f)),
                                        RoundedCornerShape(16.dp)
                                    )
                                    .clickable { selectedSheetId = sheet.id }
                                    .padding(horizontal = 12.dp, vertical = 10.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Column(modifier = Modifier.weight(1f).padding(end = 8.dp)) {
                                    Text(
                                        if (sheet.title.isEmpty()) "Untitled Sheet" else sheet.title,
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.SemiBold,
                                        color = Color.White,
                                        maxLines = 1,
                                        overflow = TextOverflow.Ellipsis
                                    )
                                    Text(NativeNotebookState.displayDate(sheet.updatedAt), fontSize = 10.sp, color = Color(0xFF94A3B8))
                                }
                                if ((currentFolder?.sheets?.size ?: 0) > 1) {
                                    Box(
                                        modifier = Modifier
                                            .clip(CircleShape)
                                            .clickable { deleteSheet(sheet.id) }
                                            .padding(6.dp)
                                    ) {
                                        Icon(Icons.Filled.Delete, contentDescription = "Delete sheet", tint = Color(0xFF64748B), modifier = Modifier.size(16.dp))
                                    }
                                }
                            }
                        }
                    }
                }

                // Editor
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(24.dp))
                        .background(Color(0xFF0C1626).copy(alpha = 0.85f))
                        .border(BorderStroke(1.dp, Color.White.copy(alpha = 0.08f)), RoundedCornerShape(24.dp))
                        .padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    if (currentSheet != null) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Box(modifier = Modifier.weight(1f).padding(end = 8.dp)) {
                                BasicTextField(
                                    value = currentSheet.title,
                                    onValueChange = { updateSheet(title = it) },
                                    singleLine = true,
                                    textStyle = TextStyle(color = Color.White, fontSize = 17.sp, fontWeight = FontWeight.Bold),
                                    cursorBrush = SolidColor(Color(0xFF22D3EE)),
                                    modifier = Modifier.fillMaxWidth()
                                )
                                if (currentSheet.title.isEmpty()) {
                                    Text("Sheet Title...", fontSize = 17.sp, fontWeight = FontWeight.Bold, color = Color(0xFF64748B))
                                }
                            }
                            Row(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(50))
                                    .background(Color.White.copy(alpha = 0.06f))
                                    .border(BorderStroke(1.dp, Color.White.copy(alpha = 0.08f)), RoundedCornerShape(50))
                                    .clickable { copySheet() }
                                    .padding(horizontal = 12.dp, vertical = 6.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(5.dp)
                            ) {
                                Icon(
                                    if (copied) Icons.Filled.Check else Icons.Filled.ContentCopy,
                                    contentDescription = null,
                                    tint = if (copied) Color(0xFF34D399) else Color(0xFFE2E8F0),
                                    modifier = Modifier.size(14.dp)
                                )
                                Text(if (copied) "Copied" else "Copy Notes", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = Color(0xFFE2E8F0))
                            }
                        }
                        Box(modifier = Modifier.fillMaxWidth().heightIn(max = 1.dp).background(Color.White.copy(alpha = 0.08f)))

                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(16.dp))
                                .background(Color.Black.copy(alpha = 0.40f))
                                .border(BorderStroke(1.dp, Color.White.copy(alpha = 0.08f)), RoundedCornerShape(16.dp))
                                .padding(14.dp)
                        ) {
                            BasicTextField(
                                value = currentSheet.content,
                                onValueChange = { updateSheet(content = it) },
                                textStyle = ContentQuestionStyle.copy(
                                    color = Color(0xFFF1F5F9),
                                    fontSize = 17.sp,
                                    lineHeight = 26.sp
                                ),
                                cursorBrush = SolidColor(Color(0xFF22D3EE)),
                                modifier = Modifier.fillMaxWidth().heightIn(min = 280.dp)
                            )
                            if (currentSheet.content.isEmpty()) {
                                Text(
                                    "Start typing your study notes, formulas, or summaries here...",
                                    fontSize = 14.sp,
                                    color = Color(0xFF64748B)
                                )
                            }
                        }

                        Box(modifier = Modifier.fillMaxWidth().heightIn(max = 1.dp).background(Color.White.copy(alpha = 0.08f)))
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                Box(modifier = Modifier.size(8.dp).clip(CircleShape).background(Color(0xFF34D399)))
                                Text("Auto-saved locally", fontSize = 12.sp, color = Color(0xFF94A3B8))
                            }
                            Text("${currentSheet.content.length} characters", fontSize = 12.sp, color = Color(0xFF94A3B8))
                        }
                    } else {
                        Box(modifier = Modifier.fillMaxWidth().padding(24.dp), contentAlignment = Alignment.Center) {
                            Text("No sheet selected. Click \"Add Sheet\" to begin.", fontSize = 14.sp, color = Color(0xFF94A3B8))
                        }
                    }
                }
            }
        }
    }

    // New folder (the website uses the browser's prompt box with this text)
    if (newFolderOpen) {
        Dialog(
            onDismissRequest = { newFolderOpen = false },
            properties = DialogProperties(usePlatformDefaultWidth = false)
        ) {
            Column(
                modifier = Modifier
                    .padding(16.dp)
                    .imePadding()
                    .widthIn(max = 400.dp)
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(24.dp))
                    .background(Color(0xFF0B1528))
                    .border(BorderStroke(1.dp, Color.White.copy(alpha = 0.20f)), RoundedCornerShape(24.dp))
                    .padding(18.dp),
                verticalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                Text("Enter folder title (e.g. Physics):", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = Color.White)
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(12.dp))
                        .background(Color(0xFF020617).copy(alpha = 0.80f))
                        .border(BorderStroke(1.dp, Color.White.copy(alpha = 0.20f)), RoundedCornerShape(12.dp))
                        .padding(horizontal = 14.dp, vertical = 11.dp)
                ) {
                    BasicTextField(
                        value = newFolderName,
                        onValueChange = { newFolderName = it },
                        singleLine = true,
                        textStyle = TextStyle(color = Color.White, fontSize = 14.sp),
                        cursorBrush = SolidColor(Color(0xFF22D3EE)),
                        modifier = Modifier.fillMaxWidth()
                    )
                }
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp, Alignment.End),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(50))
                            .border(BorderStroke(1.dp, Color.White.copy(alpha = 0.15f)), RoundedCornerShape(50))
                            .clickable { newFolderOpen = false }
                            .padding(horizontal = 14.dp, vertical = 8.dp)
                    ) {
                        Text("Cancel", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = Color(0xFFCBD5E1))
                    }
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(50))
                            .background(Color.White)
                            .clickable { addFolder() }
                            .padding(horizontal = 18.dp, vertical = 8.dp)
                    ) {
                        Text("OK", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = Color(0xFF020617))
                    }
                }
            }
        }
    }

    // Delete folder: asks first, like the website
    val askDelete = deleteFolderId
    if (askDelete != null) {
        Dialog(
            onDismissRequest = { deleteFolderId = null },
            properties = DialogProperties(usePlatformDefaultWidth = false)
        ) {
            Column(
                modifier = Modifier
                    .padding(16.dp)
                    .widthIn(max = 400.dp)
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(24.dp))
                    .background(Color(0xFF0B1528))
                    .border(BorderStroke(1.dp, Color.White.copy(alpha = 0.20f)), RoundedCornerShape(24.dp))
                    .padding(18.dp),
                verticalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                Text("Delete this folder and all its sheets?", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = Color.White)
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp, Alignment.End),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(50))
                            .border(BorderStroke(1.dp, Color.White.copy(alpha = 0.15f)), RoundedCornerShape(50))
                            .clickable { deleteFolderId = null }
                            .padding(horizontal = 14.dp, vertical = 8.dp)
                    ) {
                        Text("Cancel", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = Color(0xFFCBD5E1))
                    }
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(50))
                            .background(Color(0xFFF43F5E))
                            .clickable {
                                deleteFolderId = null
                                deleteFolder(askDelete)
                            }
                            .padding(horizontal = 18.dp, vertical = 8.dp)
                    ) {
                        Text("Delete", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = Color.White)
                    }
                }
            }
        }
    }
}
}

@Composable
private fun NbButton(
    label: String,
    icon: ImageVector,
    background: Color,
    content: Color,
    border: Color,
    onClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .clip(RoundedCornerShape(50))
            .background(background)
            .border(BorderStroke(1.dp, border), RoundedCornerShape(50))
            .clickable { onClick() }
            .padding(horizontal = 14.dp, vertical = 7.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(5.dp)
    ) {
        Icon(icon, contentDescription = null, tint = content, modifier = Modifier.size(14.dp))
        Text(label, fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = content, maxLines = 1)
    }
}
