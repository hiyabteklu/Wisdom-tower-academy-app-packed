package com.wisdomtower.academy.ui.study

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.KeyboardArrowDown
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
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
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.wisdomtower.academy.ui.theme.AtmosphereBackground
import kotlin.math.roundToInt

/**
 * Native port of the "Targets" tool of `website-reference/src/app/learning/LearningContent.tsx`
 * (`activeFeature === "goals"`): header "Targets" / "Track and complete your daily study milestones.", the
 * "{n} of {m} Done" text with the percent pill, the add form (text field with the website's placeholder, priority
 * selector High / Medium / Low Priority, "Add" button), and the list (round check button, text struck through when done,
 * priority tag in capitals, delete button). New targets go to the top of the list, like the website.
 *
 * Differences: starts EMPTY (the website's 3 sample targets are invented, owner rule); a Close button is the way back
 * (full screen); a long target wraps over up to 3 lines instead of being cut to one line (phone width).
 *
 * STATUS: written, NOT compiled, NOT tested on a device.
 */
@Composable
fun NativeTargetsScreen(onBack: () -> Unit, modifier: Modifier = Modifier) {
    val context = LocalContext.current
    LaunchedEffect(Unit) { NativeTargetsState.init(context) }
    val goals = NativeTargetsState.goals

    var newText by remember { mutableStateOf("") }
    var newPriority by remember { mutableStateOf("high") }
    var menuOpen by remember { mutableStateOf(false) }

    val done = goals.count { it.completed }
    val percent = if (goals.isNotEmpty()) (done * 100f / goals.size).roundToInt() else 0

    fun addGoal() {
        val t = newText.trim()
        if (t.isEmpty()) return
        NativeTargetsState.save(listOf(NativeGoal(NativeTargetsState.newId(), t, false, newPriority)) + goals)
        newText = ""
    }

    val priorityOptions = listOf("high" to "High Priority", "medium" to "Medium Priority", "low" to "Low Priority")
    val priorityLabel = priorityOptions.firstOrNull { it.first == newPriority }?.second ?: "High Priority"

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
                    Icon(Icons.Filled.CheckCircle, contentDescription = null, tint = Color(0xFF38BDF8), modifier = Modifier.size(20.dp))
                    Column {
                        Text("Targets", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = Color.White)
                        Text("Track and complete your daily study milestones.", fontSize = 11.sp, color = Color(0xFF94A3B8))
                    }
                }
            }

            Column(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState())
                    .padding(horizontal = 12.dp, vertical = 8.dp),
                verticalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                // Header progress summary
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(24.dp))
                        .background(Color(0xFF0C1626).copy(alpha = 0.85f))
                        .border(BorderStroke(1.dp, Color.White.copy(alpha = 0.08f)), RoundedCornerShape(24.dp))
                        .padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("$done of ${goals.size} Done", fontSize = 12.sp, color = Color(0xFF94A3B8))
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(50))
                            .background(Color.White.copy(alpha = 0.06f))
                            .border(BorderStroke(1.dp, Color.White.copy(alpha = 0.08f)), RoundedCornerShape(50))
                            .padding(horizontal = 14.dp, vertical = 6.dp)
                    ) {
                        Text("$percent%", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Color.White)
                    }
                }
            }

            // Add target form
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(24.dp))
                    .background(Color.White.copy(alpha = 0.04f))
                    .border(BorderStroke(1.dp, Color.White.copy(alpha = 0.08f)), RoundedCornerShape(24.dp))
                    .padding(horizontal = 14.dp, vertical = 10.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Box(modifier = Modifier.fillMaxWidth().padding(vertical = 6.dp)) {
                    BasicTextField(
                        value = newText,
                        onValueChange = { newText = it },
                        singleLine = true,
                        textStyle = TextStyle(color = Color.White, fontSize = 14.sp),
                        cursorBrush = SolidColor(Color(0xFF22D3EE)),
                        keyboardOptions = KeyboardOptions(imeAction = ImeAction.Done),
                        keyboardActions = KeyboardActions(onDone = { addGoal() }),
                        modifier = Modifier.fillMaxWidth()
                    )
                    if (newText.isEmpty()) {
                        Text(
                            "What is your study target? (e.g. Solve 20 Physics questions)",
                            fontSize = 14.sp,
                            color = Color(0xFF64748B),
                            maxLines = 2,
                            overflow = TextOverflow.Ellipsis
                        )
                    }
                }
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Box {
                        Row(
                            modifier = Modifier
                                .clip(RoundedCornerShape(50))
                                .background(Color.White.copy(alpha = 0.06f))
                                .border(BorderStroke(1.dp, Color.White.copy(alpha = 0.08f)), RoundedCornerShape(50))
                                .clickable { menuOpen = true }
                                .padding(horizontal = 14.dp, vertical = 8.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            Text(priorityLabel, fontSize = 12.sp, color = Color(0xFFE2E8F0))
                            Icon(Icons.Filled.KeyboardArrowDown, contentDescription = null, tint = Color(0xFF94A3B8), modifier = Modifier.size(16.dp))
                        }
                        DropdownMenu(expanded = menuOpen, onDismissRequest = { menuOpen = false }) {
                            priorityOptions.forEach { (value, label) ->
                                DropdownMenuItem(
                                    text = { Text(label) },
                                    onClick = {
                                        newPriority = value
                                        menuOpen = false
                                    }
                                )
                            }
                        }
                    }
                    Row(
                        modifier = Modifier
                            .clip(RoundedCornerShape(50))
                            .background(Color.White)
                            .clickable { addGoal() }
                            .padding(horizontal = 20.dp, vertical = 8.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(5.dp)
                    ) {
                        Icon(Icons.Filled.Add, contentDescription = null, tint = Color(0xFF020617), modifier = Modifier.size(16.dp))
                        Text("Add", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = Color(0xFF020617))
                    }
                }
            }

            // List
            if (goals.isEmpty()) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(24.dp))
                        .border(BorderStroke(1.dp, Color.White.copy(alpha = 0.10f)), RoundedCornerShape(24.dp))
                        .background(Color.White.copy(alpha = 0.02f))
                        .padding(28.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        "No targets added yet. Add your first study goal above.",
                        fontSize = 14.sp,
                        color = Color(0xFF94A3B8)
                    )
                }
            } else {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    goals.forEach { goal ->
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .alpha(if (goal.completed) 0.70f else 1f)
                                .clip(RoundedCornerShape(16.dp))
                                .background(Color.White.copy(alpha = if (goal.completed) 0.02f else 0.04f))
                                .border(
                                    BorderStroke(1.dp, Color.White.copy(alpha = if (goal.completed) 0.04f else 0.08f)),
                                    RoundedCornerShape(16.dp)
                                )
                                .padding(horizontal = 12.dp, vertical = 12.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(26.dp)
                                    .clip(CircleShape)
                                    .background(if (goal.completed) Color.White else Color.White.copy(alpha = 0.04f))
                                    .border(
                                        BorderStroke(1.dp, if (goal.completed) Color.White else Color.White.copy(alpha = 0.30f)),
                                        CircleShape
                                    )
                                    .clickable {
                                        NativeTargetsState.save(
                                            goals.map { if (it.id == goal.id) it.copy(completed = !it.completed) else it }
                                        )
                                    },
                                contentAlignment = Alignment.Center
                            ) {
                                if (goal.completed) {
                                    Icon(Icons.Filled.Check, contentDescription = "Done", tint = Color(0xFF020617), modifier = Modifier.size(15.dp))
                                }
                            }
                            Text(
                                goal.text,
                                fontSize = 14.sp,
                                fontWeight = if (goal.completed) FontWeight.Normal else FontWeight.Medium,
                                color = if (goal.completed) Color(0xFF94A3B8) else Color.White,
                                textDecoration = if (goal.completed) TextDecoration.LineThrough else TextDecoration.None,
                                maxLines = 3,
                                overflow = TextOverflow.Ellipsis,
                                modifier = Modifier.weight(1f).padding(horizontal = 12.dp)
                            )
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(50))
                                    .background(Color.White.copy(alpha = 0.06f))
                                    .border(BorderStroke(1.dp, Color.White.copy(alpha = 0.08f)), RoundedCornerShape(50))
                                    .padding(horizontal = 10.dp, vertical = 3.dp)
                            ) {
                                Text(
                                    goal.priority.uppercase(),
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = Color(0xFFCBD5E1),
                                    maxLines = 1
                                )
                            }
                            Box(
                                modifier = Modifier
                                    .padding(start = 6.dp)
                                    .clip(CircleShape)
                                    .clickable { NativeTargetsState.save(goals.filter { it.id != goal.id }) }
                                    .padding(6.dp)
                            ) {
                                Icon(Icons.Filled.Delete, contentDescription = "Delete target", tint = Color(0xFF94A3B8), modifier = Modifier.size(18.dp))
                            }
                        }
                    }
                }
            }
        }
    }
}
}
