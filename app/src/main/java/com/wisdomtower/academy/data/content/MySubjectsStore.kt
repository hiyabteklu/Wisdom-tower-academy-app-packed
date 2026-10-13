package com.wisdomtower.academy.data.content

import android.content.Context
import com.wisdomtower.academy.ui.packages.ECE_SEM1_COURSES
import com.wisdomtower.academy.ui.packages.ECE_SEM2_COURSES
import com.wisdomtower.academy.ui.packages.FRESHMAN_SUBJECTS
import com.wisdomtower.academy.ui.packages.GRADE_10_SUBJECTS
import com.wisdomtower.academy.ui.packages.GRADE_11_SUBJECTS
import com.wisdomtower.academy.ui.packages.GRADE_12_SUBJECTS
import com.wisdomtower.academy.ui.packages.GRADE_9_SUBJECTS

/** One subject the student can pick. [key] is "<picker package id>/<subject slug>" (see [ResourceScopeIndex.subjectKey]). */
data class MySubjectsItem(val key: String, val name: String)

/** A package shown as a pill in "My Subjects", with all its subjects (names from the app's copy of the website lists). */
data class MySubjectsPackage(val id: String, val label: String, val subjects: List<MySubjectsItem>)

/**
 * The student's current picks.
 * [fromAcademicLevel] is true while the student has never saved a choice: the picks then come from the Academic Level
 * set on the Account screen (owner answer A, 2026-10-14). When that level has no package with content (Remedial,
 * Other, not set) [keys] is empty and Status keeps counting everything.
 */
data class SubjectPicks(val keys: Set<String>, val fromAcademicLevel: Boolean)

/**
 * T8 "My Subjects": which subjects the student studies. Stored ON THIS PHONE only, per signed-in user id
 * (owner answer D, 2026-10-14: no server copy for now). Nothing is deleted anywhere; the picks only decide what
 * "Your status" COUNTS.
 *
 * Package labels are the website's own Academic Level options (`academic-levels.ts`): "Freshman", "3rd Year (ECE)",
 * "Grade 9" to "Grade 12". Subject names come from [FRESHMAN_SUBJECTS], [ECE_SEM1_COURSES], [ECE_SEM2_COURSES] and
 * the grade lists (no invented names). ECE semesters are one picker package because the database stores both semesters
 * under one package id (docs/CONTENT_SHAPES.md).
 *
 * STATUS: written, NOT compiled, NOT tested on a device.
 */
object MySubjectsStore {
    const val FRESHMAN = "freshman"
    const val ECE = "ece"
    private const val PREFS = "wt_my_subjects"

    val packages: List<MySubjectsPackage> by lazy {
        listOf(
            MySubjectsPackage(FRESHMAN, "Freshman", FRESHMAN_SUBJECTS.map { MySubjectsItem("$FRESHMAN/${it.id}", it.name) }),
            MySubjectsPackage(
                ECE, "3rd Year (ECE)",
                (ECE_SEM1_COURSES + ECE_SEM2_COURSES).map { MySubjectsItem("$ECE/${it.slug.lowercase()}", it.title) }
            ),
            gradePackage("9", GRADE_9_SUBJECTS.map { it.id to it.name }),
            gradePackage("10", GRADE_10_SUBJECTS.map { it.id to it.name }),
            gradePackage("11", GRADE_11_SUBJECTS.map { it.id to it.name }),
            gradePackage("12", GRADE_12_SUBJECTS.map { it.id to it.name })
        )
    }

    private fun gradePackage(n: String, subjects: List<Pair<String, String>>) = MySubjectsPackage(
        id = "grade-$n",
        label = "Grade $n",
        subjects = subjects.map { (id, name) -> MySubjectsItem("grade-$n/${id.lowercase()}", name) }
    )

    fun packageOf(key: String): String = key.substringBefore('/')

    /** Picker package that matches the Academic Level text (same rules as `getDefaultPackagesForAcademicLevel`), or null. */
    fun packageForLevel(educationLevel: String?): String? {
        val t = (educationLevel ?: "").trim().lowercase()
        if (t.isEmpty()) return null
        return when {
            t == "grade 9" || t == "grade-9" || t == "g9" -> "grade-9"
            t == "grade 10" || t == "grade-10" || t == "g10" -> "grade-10"
            t == "grade 11" || t == "grade-11" || t == "g11" -> "grade-11"
            t == "grade 12" || t == "grade-12" || t == "g12" -> "grade-12"
            t.contains("freshman") -> FRESHMAN
            t.contains("ece") || t.contains("electrical") -> ECE
            else -> null
        }
    }

    fun allKeysOf(packageId: String): Set<String> =
        packages.firstOrNull { it.id == packageId }?.subjects?.map { it.key }?.toSet() ?: emptySet()

    fun load(context: Context, userId: String, educationLevel: String?): SubjectPicks {
        val prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
        if (prefs.getBoolean("saved_$userId", false)) {
            val stored = prefs.getStringSet("picked_$userId", emptySet()) ?: emptySet()
            return SubjectPicks(HashSet(stored), fromAcademicLevel = false)
        }
        val pkg = packageForLevel(educationLevel)
        return SubjectPicks(if (pkg != null) allKeysOf(pkg) else emptySet(), fromAcademicLevel = true)
    }

    fun save(context: Context, userId: String, keys: Set<String>) {
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit()
            .putStringSet("picked_$userId", HashSet(keys))
            .putBoolean("saved_$userId", true)
            .apply()
    }

    /** Keeps only the rows whose resource belongs to a picked subject. Rows not in [scopeMap] are not counted. */
    fun filterRows(rows: List<ProgressRow>, scopeMap: Map<String, String>, picks: Set<String>): List<ProgressRow> =
        rows.filter { scopeMap[it.resourceId] in picks }
}
