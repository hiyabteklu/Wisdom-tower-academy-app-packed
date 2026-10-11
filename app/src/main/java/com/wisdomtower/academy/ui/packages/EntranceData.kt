package com.wisdomtower.academy.ui.packages

/**
 * Entrance Questions package. Copied from the website file src/data/entrance-questions.ts
 * (commit ce89c43 of hiyabteklu/Wisdom-tower-academy):
 *   Entrance Questions -> Natural / Social -> Subject -> Year -> Exams
 * The exams themselves are NOT stored in the app: a year opens the website page
 *   /academy/entrance-questions/{stream}/{subject}/{year}
 * which reads the published `exams` rows from Supabase (scope `entrance/{stream}/{subject}/{year}`).
 *
 * Pictures: packed from website-reference by the Gradle task `copyWebsiteImages` (app/build.gradle.kts).
 */

const val ENTRANCE_PACKAGE_ID = "entrance-questions"
const val ENTRANCE_BASE_PATH = "/academy/entrance-questions"

const val ENTRANCE_IMAGE_ASSET = "file:///android_asset/images/web/entrance/entrance-questions.jpeg"

val ENTRANCE_YEARS = listOf("2014", "2015", "2016", "2017", "2018", "2019")

data class NativeEntranceSubject(
    val id: String,
    val name: String
)

data class NativeEntranceStream(
    val id: String,
    val label: String,
    val image: String,
    val subjects: List<NativeEntranceSubject>
)

private val ENTRANCE_ENGLISH = NativeEntranceSubject("english", "English")
private val ENTRANCE_MATH = NativeEntranceSubject("mathematics", "Mathematics")
private val ENTRANCE_SAT = NativeEntranceSubject("sat", "Scholastic Aptitude Test (SAT)")

val ENTRANCE_STREAMS = listOf(
    NativeEntranceStream(
        id = "natural",
        label = "Natural Science",
        image = "file:///android_asset/images/web/entrance/natural.jpeg",
        subjects = listOf(
            ENTRANCE_ENGLISH,
            ENTRANCE_MATH,
            ENTRANCE_SAT,
            NativeEntranceSubject("physics", "Physics"),
            NativeEntranceSubject("chemistry", "Chemistry"),
            NativeEntranceSubject("biology", "Biology")
        )
    ),
    NativeEntranceStream(
        id = "social",
        label = "Social Science",
        image = "file:///android_asset/images/web/entrance/social.jpeg",
        subjects = listOf(
            ENTRANCE_ENGLISH,
            ENTRANCE_MATH,
            ENTRANCE_SAT,
            NativeEntranceSubject("geography", "Geography"),
            NativeEntranceSubject("history", "History"),
            NativeEntranceSubject("economics", "Economics")
        )
    )
)

/** Same shape as the website helper `entranceScope`, but for the page address. */
fun entranceYearPath(streamId: String, subjectId: String, year: String): String =
    "$ENTRANCE_BASE_PATH/$streamId/$subjectId/$year"
