package com.wisdomtower.academy.data.model

import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale

data class AuthUser(
    val id: String,
    val email: String? = null,
    val fullName: String? = null,
    val accessToken: String? = null,
    val refreshToken: String? = null,
    val createdAt: String? = null
)

data class UserProfile(
    val id: String,
    val email: String? = null,
    val fullName: String? = null,
    val firstName: String? = null,
    val lastName: String? = null,
    val phone: String? = null,
    val educationLevel: String? = null,
    val schoolName: String? = null,
    val townRegion: String? = null,
    val stream: String? = null,
    val bio: String? = null,
    val targetExam: String? = null,
    val targetScore: String? = null,
    val dailyStudyGoalMinutes: Int = 45,
    val avatarPreset: String? = null,
    val avatarUrl: String? = null,
    val studentIdNumber: String? = null,
    val createdAt: String? = null
)

data class StudentIdData(
    val idNumber: String,
    val numericId: String,
    val folioNumber: String,
    val issueDateFull: String,
    val expiryDateFull: String,
    val status: String,
    val academicTrack: String,
    val institutionName: String
)

object StudentIdGenerator {
    private val MONTH_NAMES = arrayOf(
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    )

    private fun formatDateFull(date: Date): String {
        val cal = Calendar.getInstance().apply { time = date }
        val day = cal.get(Calendar.DAY_OF_MONTH)
        val month = MONTH_NAMES[cal.get(Calendar.MONTH)]
        val year = cal.get(Calendar.YEAR)
        return "$day $month $year"
    }

    fun generateDeterministicNumber(userId: String): String {
        if (userId.isBlank()) return "01001"
        var hash = 0
        for (ch in userId) {
            hash = (hash shl 5) - hash + ch.code
        }
        val positive = if (hash == Int.MIN_VALUE) 0 else Math.abs(hash)
        val num = (positive % 19000) + 1001
        return String.format(Locale.US, "%05d", num)
    }

    fun computeStudentId(
        userId: String?,
        profile: UserProfile?,
        createdAtStr: String? = null
    ): StudentIdData {
        val uid = userId ?: profile?.id ?: "student"
        var numeric = ""
        val dbNumber = profile?.studentIdNumber
        if (!dbNumber.isNullOrBlank()) {
            val digits = dbNumber.filter { it.isDigit() }
            if (digits.isNotBlank()) {
                numeric = digits.takeLast(5).padStart(5, '0')
            }
        }
        if (numeric.isBlank() || numeric == "00000") {
            numeric = generateDeterministicNumber(uid)
        }

        val idNumber = "WTA-$numeric"
        val currentYear = Calendar.getInstance().get(Calendar.YEAR)
        val folioNumber = "REG-$currentYear/$numeric"

        val issueDate: Date = try {
            val dateStr = profile?.createdAt ?: createdAtStr
            if (!dateStr.isNullOrBlank()) {
                val format = SimpleDateFormat("yyyy-MM-dd", Locale.US)
                format.parse(dateStr.substring(0, 10)) ?: Date()
            } else {
                Date()
            }
        } catch (_: Exception) {
            Date()
        }

        val expiryCal = Calendar.getInstance().apply {
            time = issueDate
            add(Calendar.YEAR, 1)
        }
        val expiryDate = expiryCal.time
        val isActive = Date().before(expiryDate)

        return StudentIdData(
            idNumber = idNumber,
            numericId = numeric,
            folioNumber = folioNumber,
            issueDateFull = formatDateFull(issueDate),
            expiryDateFull = formatDateFull(expiryDate),
            status = if (isActive) "ACTIVE" else "RENEWAL REQUIRED",
            academicTrack = profile?.educationLevel?.ifBlank { null } ?: "Freshman Academic Track",
            institutionName = profile?.schoolName?.ifBlank { null } ?: "Wisdom Tower Academy"
        )
    }
}
