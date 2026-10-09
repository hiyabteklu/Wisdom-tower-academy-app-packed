package com.wisdomtower.academy.ui.packages

import androidx.compose.ui.graphics.Color
import com.wisdomtower.academy.ui.theme.WisdomAccentAmber
import com.wisdomtower.academy.ui.theme.WisdomAccentEmerald
import com.wisdomtower.academy.ui.theme.WisdomAccentFuchsia
import com.wisdomtower.academy.ui.theme.WisdomAccentIndigo
import com.wisdomtower.academy.ui.theme.WisdomAccentPurple
import com.wisdomtower.academy.ui.theme.WisdomAccentRose
import com.wisdomtower.academy.ui.theme.WisdomAccentSky
import com.wisdomtower.academy.ui.theme.WisdomAccentViolet

/**
 * Seed data mirroring website reference:
 * - src/data/packages.ts
 * - src/data/freshman.ts
 * - src/data/special-packages.ts
 */

data class NativePackage(
    val id: String,
    val name: String,
    val shortName: String,
    val description: String,
    val priceEtb: Int,
    val path: String,
    val assetImage: String,
    val enrolledLabel: String,
    val group: String, // "grades" | "branch" | "special"
    val accentColor: Color,
    val includes: List<String>
)

data class NativeSubject(
    val id: String,
    val name: String,
    val description: String,
    val assetImage: String,
    val path: String
)

val CORE_INCLUDES = listOf(
    "Official Textbooks & Reference Books",
    "Chapter-by-Chapter Short Notes & Summaries",
    "Extensive Chapter Question Banks",
    "Mock & Model Practice Exams with Solutions",
    "Explain with AI Tutor Integration",
    "Flashcards for Rapid Active Recall"
)

val CATALOG_PACKAGES = listOf(
    // Grades 9–12
    NativePackage(
        id = "grade-9",
        name = "Grade 9 Package",
        shortName = "G9",
        description = "Start secondary with material built for Grade 9. Clear explanations, chapter practice, and exam-style questions.",
        priceEtb = 250,
        path = "/academy/grades/9",
        assetImage = "file:///android_asset/images/packages/grade-9_67df27.jpeg",
        enrolledLabel = "320+ students",
        group = "grades",
        accentColor = WisdomAccentSky,
        includes = listOf("Complete Grade 9 syllabus & curriculum coverage") + CORE_INCLUDES
    ),
    NativePackage(
        id = "grade-10",
        name = "Grade 10 Package",
        shortName = "G10",
        description = "Structured notes, chapter question banks, and solved practice exams for Grade 10 national curricula.",
        priceEtb = 250,
        path = "/academy/grades/10",
        assetImage = "file:///android_asset/images/packages/grade-10_156767.jpeg",
        enrolledLabel = "410+ students",
        group = "grades",
        accentColor = WisdomAccentSky,
        includes = listOf("Complete Grade 10 curriculum & stream preparation") + CORE_INCLUDES
    ),
    NativePackage(
        id = "grade-11",
        name = "Grade 11 Package",
        shortName = "G11",
        description = "Dense practice by chapter and exams with full solutions for Natural & Social science streams.",
        priceEtb = 250,
        path = "/academy/grades/11",
        assetImage = "file:///android_asset/images/packages/grade-11_6309fc.jpeg",
        enrolledLabel = "480+ students",
        group = "grades",
        accentColor = WisdomAccentSky,
        includes = listOf("Complete Grade 11 Natural & Social science streams") + CORE_INCLUDES
    ),
    NativePackage(
        id = "grade-12",
        name = "Grade 12 Package",
        shortName = "G12",
        description = "The decisive matriculation year. Comprehensive exam prep, national model papers, and detailed solution banks.",
        priceEtb = 400,
        path = "/academy/grades/12",
        assetImage = "file:///android_asset/images/packages/grade-12_f1ddef.jpeg",
        enrolledLabel = "960+ students",
        group = "grades",
        accentColor = WisdomAccentSky,
        includes = listOf("National matriculation entrance exam mastery") + CORE_INCLUDES
    ),

    // University & Entrance (Branches)
    NativePackage(
        id = "freshman",
        name = "Freshman Package",
        shortName = "Freshman",
        description = "Every first-year university course in one place, Natural and Social streams included. 20+ courses with notes, questions, and solved exams.",
        priceEtb = 350,
        path = "/academy/freshman",
        assetImage = "file:///android_asset/images/packages/freshman_00241b.jpeg",
        enrolledLabel = "1,200+ students",
        group = "branch",
        accentColor = WisdomAccentPurple,
        includes = listOf(
            "All 20+ freshman courses (natural and social streams)",
            "Ethiopian university GPA calculator & leaderboard"
        ) + CORE_INCLUDES
    ),
    NativePackage(
        id = "uat",
        name = "UAT Admission Package",
        shortName = "UAT",
        description = "University Admission Test prep covering quantitative reasoning and verbal problem solving.",
        priceEtb = 300,
        path = "/academy/uat",
        assetImage = "file:///android_asset/images/packages/uat_56b257.jpeg",
        enrolledLabel = "280+ students",
        group = "branch",
        accentColor = WisdomAccentEmerald,
        includes = listOf("Comprehensive UAT quantitative & verbal entrance tracks") + CORE_INCLUDES
    ),
    NativePackage(
        id = "coc",
        name = "COC Certification Package",
        shortName = "COC",
        description = "Center of Competency prep with clear notes, chapter practice, and solved occupational assessment exams.",
        priceEtb = 250,
        path = "/academy/coc",
        assetImage = "file:///android_asset/images/packages/coc_e44a09.jpeg",
        enrolledLabel = "350+ students",
        group = "branch",
        accentColor = WisdomAccentIndigo,
        includes = listOf("Occupational standard competencies & evaluation prep") + CORE_INCLUDES
    ),
    NativePackage(
        id = "remedial",
        name = "Remedial Program Package",
        shortName = "Remedial",
        description = "Core prerequisite subject strengthening for university transition and university placement success.",
        priceEtb = 250,
        path = "/academy/remedial",
        assetImage = "file:///android_asset/images/packages/remedial.jpg",
        enrolledLabel = "210+ students",
        group = "branch",
        accentColor = WisdomAccentAmber,
        includes = listOf("All seven core remedial prerequisite subjects") + CORE_INCLUDES
    ),
    NativePackage(
        id = "gat",
        name = "GAT Graduate Admission",
        shortName = "GAT",
        description = "Graduate Admission Test practice sets, analytical reasoning drills, and timed simulations.",
        priceEtb = 0,
        path = "/academy/gat",
        assetImage = "file:///android_asset/images/packages/gat_46ddb1.jpeg",
        enrolledLabel = "Coming soon",
        group = "branch",
        accentColor = WisdomAccentRose,
        includes = listOf("Postgraduate GAT analytical & quantitative problem tracks") + CORE_INCLUDES
    ),
    NativePackage(
        id = "exit-exam",
        name = "University Exit Exam",
        shortName = "Exit Exam",
        description = "National university graduation exit exam review by department, with structured notes and practice.",
        priceEtb = 0,
        path = "/academy/exit-exam",
        assetImage = "file:///android_asset/images/packages/exit-exam_c32a43.jpeg",
        enrolledLabel = "Coming soon",
        group = "branch",
        accentColor = WisdomAccentFuchsia,
        includes = listOf("Department graduation exit exam comprehensive tracks") + CORE_INCLUDES
    ),

    // Special Department Tracks
    NativePackage(
        id = "ece-sem-1",
        name = "ECE Engineering Sem 1",
        shortName = "ECE S1",
        description = "Senior Electrical and Computer Engineering Year 3 Semester 1 courses with department-specific question banks and exams.",
        priceEtb = 300,
        path = "/academy/special-packages/electrical-computer-engineering",
        assetImage = "file:///android_asset/images/special-packages/ece.jpg",
        enrolledLabel = "190+ students",
        group = "special",
        accentColor = WisdomAccentViolet,
        includes = listOf("All 7 Year 3 Semester 1 engineering courses") + CORE_INCLUDES
    ),
    NativePackage(
        id = "ece-sem-2",
        name = "ECE Engineering Sem 2",
        shortName = "ECE S2",
        description = "Senior Electrical and Computer Engineering Year 3 Semester 2 courses with department-specific question banks and exams.",
        priceEtb = 300,
        path = "/academy/special-packages/electrical-computer-engineering",
        assetImage = "file:///android_asset/images/special-packages/ece.jpg",
        enrolledLabel = "180+ students",
        group = "special",
        accentColor = WisdomAccentViolet,
        includes = listOf("All 7 Year 3 Semester 2 engineering courses") + CORE_INCLUDES
    )
)

val FRESHMAN_SUBJECTS = listOf(
    NativeSubject("math-natural", "Math Natural", "Calculus, analytic geometry, vectors, matrices, and algebraic systems for STEM disciplines.", "file:///android_asset/images/freshman/math-natural.jpg", "/academy/freshman/math-natural"),
    NativeSubject("math-social", "Math Social", "Algebraic foundations, linear programming, financial mathematics, and inferential statistics.", "file:///android_asset/images/freshman/math-social.jpg", "/academy/freshman/math-social"),
    NativeSubject("physics", "Physics", "Classical mechanics, vectors, work-energy theorem, fluid dynamics, and thermodynamics.", "file:///android_asset/images/freshman/physics.jpg", "/academy/freshman/physics"),
    NativeSubject("chemistry", "Chemistry", "Atomic structure, chemical bonding, thermodynamics, kinetics, and chemical equilibrium.", "file:///android_asset/images/freshman/chemistry.jpg", "/academy/freshman/chemistry"),
    NativeSubject("biology", "Biology", "Cellular biology, genetics, molecular mechanisms, evolutionary principles, and ecology.", "file:///android_asset/images/freshman/biology.jpg", "/academy/freshman/biology"),
    NativeSubject("english-1", "English 1", "Academic reading strategies, complex grammatical structures, and expository writing mechanics.", "file:///android_asset/images/freshman/english-1.jpg", "/academy/freshman/english-1"),
    NativeSubject("english-2", "English 2", "Advanced academic synthesis, argumentative discourse, thesis structure, and research writing.", "file:///android_asset/images/freshman/english-2.jpg", "/academy/freshman/english-2"),
    NativeSubject("psychology", "Psychology", "Biological bases of behavior, cognitive psychology, learning theories, and motivation.", "file:///android_asset/images/freshman/psychology.jpg", "/academy/freshman/psychology"),
    NativeSubject("logic", "Logic", "Formal propositions, truth tables, categorical logic, and fallacies in argumentation.", "file:///android_asset/images/freshman/logic.jpg", "/academy/freshman/logic"),
    NativeSubject("geography", "Geography", "Physical landscape processes, climate dynamics, population distribution, and resource management.", "file:///android_asset/images/freshman/geography.jpg", "/academy/freshman/geography"),
    NativeSubject("history", "History", "Historiographical analysis, ancient civilizations, regional state formation, and trade networks.", "file:///android_asset/images/freshman/history.jpg", "/academy/freshman/history"),
    NativeSubject("civics", "Civics & Ethics", "Democratic governance principles, constitutional frameworks, human rights, and rule of law.", "file:///android_asset/images/freshman/civics.jpg", "/academy/freshman/civics"),
    NativeSubject("economics", "Economics", "Microeconomic supply-demand models, consumer utility, macroeconomic indicators, and monetary policy.", "file:///android_asset/images/freshman/economics.jpg", "/academy/freshman/economics"),
    NativeSubject("emerging-technology", "Emerging Technology", "Artificial intelligence, big data analytics, blockchain, cloud computing, and IoT architecture.", "file:///android_asset/images/freshman/emerging-technology.jpg", "/academy/freshman/emerging-technology"),
    NativeSubject("cpp-programming", "C++ Programming", "Procedural syntax, control structures, pointers, memory allocation, and OOP paradigms.", "file:///android_asset/images/freshman/cpp-programming.jpg", "/academy/freshman/cpp-programming"),
    NativeSubject("applied-math-1", "Applied Math 1", "Differential calculus, series expansions, Fourier transformations, and engineering applications.", "file:///android_asset/images/freshman/applied-math-1.jpg", "/academy/freshman/applied-math-1"),
    NativeSubject("anthropology", "Anthropology", "Human cultural evolution, kinship structures, ethnographical methodologies, and linguistic anthropology.", "file:///android_asset/images/freshman/anthropology.jpg", "/academy/freshman/anthropology"),
    NativeSubject("inclusiveness", "Inclusiveness", "Universal design for learning, accommodations, social equity frameworks, and barrier removal.", "file:///android_asset/images/freshman/inclusiveness.jpg", "/academy/freshman/inclusiveness"),
    NativeSubject("global-trends", "Global Trends", "Contemporary geopolitical relations, international governance bodies, and transnational security.", "file:///android_asset/images/freshman/global-trends.jpg", "/academy/freshman/global-trends"),
    NativeSubject("entrepreneurship", "Entrepreneurship", "Venture creation methodologies, business model canvas, market validation, and financial projections.", "file:///android_asset/images/freshman/entrepreneurship.jpg", "/academy/freshman/entrepreneurship"),
    NativeSubject("physical-fitness", "Physical Fitness", "Cardiovascular conditioning, musculoskeletal development, nutrition, and lifelong wellness principles.", "file:///android_asset/images/freshman/physical-fitness.jpg", "/academy/freshman/physical-fitness")
)
