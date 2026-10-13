package com.wisdomtower.academy.ui.settings

import com.wisdomtower.academy.data.content.ProgressRow
import com.wisdomtower.academy.data.content.SubjectKey
import com.wisdomtower.academy.ui.packages.ECE_SEM1_COURSES
import com.wisdomtower.academy.ui.packages.ECE_SEM2_COURSES
import com.wisdomtower.academy.ui.packages.FRESHMAN_NATURAL_IDS
import com.wisdomtower.academy.ui.packages.FRESHMAN_SEM1_IDS
import com.wisdomtower.academy.ui.packages.FRESHMAN_SEM2_IDS
import com.wisdomtower.academy.ui.packages.FRESHMAN_SOCIAL_IDS
import com.wisdomtower.academy.ui.packages.FRESHMAN_SUBJECTS
import com.wisdomtower.academy.ui.packages.GRADE_10_SUBJECTS
import com.wisdomtower.academy.ui.packages.GRADE_11_SUBJECTS
import com.wisdomtower.academy.ui.packages.GRADE_12_SUBJECTS
import com.wisdomtower.academy.ui.packages.GRADE_9_SUBJECTS

/**
 * T8 "My Subjects": what the picker offers and how "Your status" uses the choice. Names and lists come from
 * `ui/packages/PackagesData.kt` (copied from the website); nothing is invented. Only groups that have content rows are
 * offered (docs/T8_MY_SUBJECTS_PLAN.md section 3): Remedial, UAT, GAT, COC, Exit Exam and Entrance have none yet.
 *
 * STATUS: written, NOT compiled, NOT tested on a device.
 */
data class SubjectOption(val slug: String, val name: String)

data class SubjectGroup(val id: String, val label: String, val subjects: List<SubjectOption>)

val MY_SUBJECT_GROUPS: List<SubjectGroup> = listOf(
    SubjectGroup("freshman", "Freshman", FRESHMAN_SUBJECTS.map { SubjectOption(it.id, it.name) }),
    SubjectGroup("ece", "ECE Year 3", (ECE_SEM1_COURSES + ECE_SEM2_COURSES).map { SubjectOption(it.slug, it.title) }),
    SubjectGroup("grade-9", "Grade 9", GRADE_9_SUBJECTS.map { SubjectOption(it.id, it.name) }),
    SubjectGroup("grade-10", "Grade 10", GRADE_10_SUBJECTS.map { SubjectOption(it.id, it.name) }),
    SubjectGroup("grade-11", "Grade 11", GRADE_11_SUBJECTS.map { SubjectOption(it.id, it.name) }),
    SubjectGroup("grade-12", "Grade 12", GRADE_12_SUBJECTS.map { SubjectOption(it.id, it.name) })
)

/** "Quick fill" pills for Freshman, built from the website's own lists. They only pre-select; the student edits. */
val FRESHMAN_QUICK_FILLS: List<Pair<String, Set<String>>> = listOf(
    "Natural stream" to FRESHMAN_NATURAL_IDS,
    "Social stream" to FRESHMAN_SOCIAL_IDS,
    "Semester 1" to FRESHMAN_SEM1_IDS,
    "Semester 2" to FRESHMAN_SEM2_IDS
)

/** Where the subjects that "Your status" counts come from. */
enum class SubjectsSource { CHOSEN, FROM_LEVEL, NONE }

data class ActiveSubjects(val picks: Map<String, Set<String>>, val source: SubjectsSource)

/**
 * The picker group that matches the Academic Level text of the profile, or null (Remedial, Other, empty). Same keyword
 * order as `resolveStatusTrack`, but without its Freshman default, so an unknown level is not guessed.
 */
fun groupIdForLevel(educationLevel: String?): String? {
    val edu = (educationLevel ?: "").lowercase().trim()
    return when {
        edu.contains("12") || edu.contains("matric") -> "grade-12"
        edu.contains("11") -> "grade-11"
        edu.contains("10") -> "grade-10"
        edu.contains("9") -> "grade-9"
        edu.contains("remedial") -> null
        edu.contains("ece") || edu.contains("electrical") || edu.contains("engineering") -> "ece"
        edu.contains("freshman") -> "freshman"
        else -> null
    }
}

/**
 * What "Your status" counts (owner answer A, 2026-10-14): the student's own picks; before any pick, every subject of
 * the package that matches the Academic Level; if there is no such package, everything (source NONE).
 */
fun resolveActiveSubjects(choice: Map<String, Set<String>>, educationLevel: String?): ActiveSubjects {
    val chosen = choice.filterValues { it.isNotEmpty() }
    if (chosen.isNotEmpty()) return ActiveSubjects(chosen, SubjectsSource.CHOSEN)
    val groupId = groupIdForLevel(educationLevel)
    val group = MY_SUBJECT_GROUPS.firstOrNull { it.id == groupId }
    if (group != null) {
        return ActiveSubjects(mapOf(group.id to group.subjects.map { it.slug }.toSet()), SubjectsSource.FROM_LEVEL)
    }
    return ActiveSubjects(emptyMap(), SubjectsSource.NONE)
}

/** "Counting 6 subjects: Freshman" (group names in picker order). */
fun countedSubjectsLabel(active: ActiveSubjects): String {
    val total = active.picks.values.sumOf { it.size }
    val labels = MY_SUBJECT_GROUPS.filter { active.picks.containsKey(it.id) }.joinToString(", ") { it.label }
    val noun = if (total == 1) "subject" else "subjects"
    return "Counting $total $noun: $labels"
}

/**
 * Keeps only the progress rows whose resource belongs to a picked subject. A row whose resource is not in [index]
 * (for example an unpublished resource) cannot be placed, so it is not counted.
 */
fun filterRowsBySubjects(
    rows: List<ProgressRow>,
    index: Map<String, SubjectKey>,
    picks: Map<String, Set<String>>
): List<ProgressRow> = rows.filter { row ->
    val key = index[row.resourceId]
    key != null && picks[key.group]?.contains(key.slug) == true
}
