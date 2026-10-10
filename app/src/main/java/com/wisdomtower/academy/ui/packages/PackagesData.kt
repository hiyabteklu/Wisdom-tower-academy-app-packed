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
 * Seed data strictly mirroring website reference:
 * - src/data/packages.ts
 * - src/data/freshman.ts
 * - src/data/special-packages.ts
 */

data class NativePackage(
    val id: String,
    val name: String,
    val shortName: String,
    val description: String,
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
    "Official Textbooks & Comprehensive Reference Books",
    "Chapter-by-Chapter Short Notes & Key Summaries",
    "Extensive Chapter Question Banks",
    "Mock & Model Practice Exams with Solutions",
    "All worked with official step-by-step solutions + Explain with AI",
    "Flashcards for Rapid Active Recall"
)

val CATALOG_PACKAGES = listOf(
    // Grades 9–12
    NativePackage(
        id = "grade-9",
        name = "Grade 9 Package",
        shortName = "G9",
        description = "Start secondary with material built for Grade 9, not recycled general notes. Clear explanations, chapter practice, and exam-style questions so you build real confidence from the first term.",
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
        description = "Grade 10 is where depth matters. Structured notes, chapter question banks, and solved practice exams help you master concepts before they pile up.",
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
        description = "Grade 11 raises the standard. Get subject notes written for this level, dense practice by chapter, and exams with full solutions so you know exactly how answers are built.",
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
        description = "The year that counts most. Grade 12 material is organized for finals pace: precise notes, chapter drills, flashcards for fast review, and practice exams with solutions.",
        path = "/academy/grades/12",
        assetImage = "file:///android_asset/images/packages/grade-12_f1ddef.jpeg",
        enrolledLabel = "560+ students",
        group = "grades",
        accentColor = WisdomAccentSky,
        includes = listOf("Complete Grade 12 syllabus & national matriculation prep") + CORE_INCLUDES
    ),

    // Other branches
    NativePackage(
        id = "freshman",
        name = "Freshman Package",
        shortName = "Freshman",
        description = "Every first-year course in one place, natural and social streams included. Notes, chapter questions, flashcards, and solved practice exams for 20+ courses.",
        path = "/academy/freshman",
        assetImage = "file:///android_asset/images/packages/freshman_00241b.jpeg",
        enrolledLabel = "890+ students",
        group = "branch",
        accentColor = WisdomAccentPurple,
        includes = listOf(
            "All 20+ freshman courses (natural and social streams)",
            "Ethiopian university GPA calculator & field leaderboard"
        ) + CORE_INCLUDES
    ),
    NativePackage(
        id = "uat",
        name = "UAT Package",
        shortName = "UAT",
        description = "University Admission Test prep that respects how the exam is actually written. Focused notes, chapter question banks, flashcards for rapid recall, and practice exams with solutions.",
        path = "/academy/uat",
        assetImage = "file:///android_asset/images/packages/uat_56b257.jpeg",
        enrolledLabel = "610+ students",
        group = "branch",
        accentColor = WisdomAccentEmerald,
        includes = listOf("Comprehensive UAT quantitative & verbal entrance tracks") + CORE_INCLUDES
    ),
    NativePackage(
        id = "gat",
        name = "GAT Package",
        shortName = "GAT",
        description = "Graduate Admission Test resources organized the way the exam expects you to think. Notes on core GAT material, chapter questions, flashcards, and practice exams with solutions.",
        path = "/academy/gat",
        assetImage = "file:///android_asset/images/packages/gat_46ddb1.jpeg",
        enrolledLabel = "Coming soon",
        group = "branch",
        accentColor = WisdomAccentRose,
        includes = listOf("Postgraduate GAT analytical & quantitative problem tracks") + CORE_INCLUDES
    ),
    NativePackage(
        id = "coc",
        name = "COC Package",
        shortName = "COC",
        description = "Certificate of Competency prep with clear notes, chapter practice, flashcards, and solved exams. Material aimed at the skills and judgment the assessment rewards.",
        path = "/academy/coc",
        assetImage = "file:///android_asset/images/packages/coc_e44a09.jpeg",
        enrolledLabel = "380+ students",
        group = "branch",
        accentColor = WisdomAccentIndigo,
        includes = listOf("Occupational standard competencies & evaluation prep") + CORE_INCLUDES
    ),
    NativePackage(
        id = "exit-exam",
        name = "Exit Exam Package",
        shortName = "Exit Exam",
        description = "University exit exam review by department, with structured notes and practice when materials open. Designed for final-year students who need focused revision.",
        path = "/academy/exit-exam",
        assetImage = "file:///android_asset/images/packages/exit-exam_c32a43.jpeg",
        enrolledLabel = "Coming soon",
        group = "branch",
        accentColor = WisdomAccentFuchsia,
        includes = listOf("Department graduation exit exam comprehensive tracks") + CORE_INCLUDES
    ),
    NativePackage(
        id = "remedial",
        name = "Remedial Package",
        shortName = "Remedial",
        description = "Catch-up pathway for core subjects. Strengthen foundations in English, Maths, Physics, Chemistry, Biology, History and Geography with the same learning hubs used across the Academy.",
        path = "/academy/remedial",
        assetImage = "file:///android_asset/images/packages/remedial.jpg",
        enrolledLabel = "New pathway",
        group = "branch",
        accentColor = WisdomAccentAmber,
        includes = listOf("All seven core remedial prerequisite subjects") + CORE_INCLUDES
    ),

    // Special packages
    NativePackage(
        id = "ece-y3-sem-1",
        name = "ECE Year 3: Semester 1",
        shortName = "ECE S1",
        description = "Senior Electrical and Computer Engineering, Semester 1. Course material written for your department, not generic engineering notes.",
        path = "/academy/special-packages/electrical-computer-engineering/sem-1",
        assetImage = "file:///android_asset/images/special-packages/ece-sem-1.jpg",
        enrolledLabel = "Special track",
        group = "special",
        accentColor = WisdomAccentViolet,
        includes = listOf("All 7 Year 3 Semester 1 engineering courses") + CORE_INCLUDES
    ),
    NativePackage(
        id = "ece-y3-sem-2",
        name = "ECE Year 3: Semester 2",
        shortName = "ECE S2",
        description = "Senior Electrical and Computer Engineering, Semester 2. Same department standard as Semester 1: course-level notes, chapter questions, flashcards, and solved practice exams.",
        path = "/academy/special-packages/electrical-computer-engineering/sem-2",
        assetImage = "file:///android_asset/images/special-packages/ece-sem-2.jpg",
        enrolledLabel = "Special track",
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

val FRESHMAN_NATURAL_IDS = setOf(
    "math-natural", "physics", "chemistry", "biology", "emerging-technology",
    "cpp-programming", "applied-math-1", "physical-fitness", "english-1", "english-2", "logic"
)

val FRESHMAN_SOCIAL_IDS = setOf(
    "math-social", "economics", "geography", "history", "civics",
    "psychology", "anthropology", "inclusiveness", "global-trends", "entrepreneurship",
    "english-1", "english-2", "logic"
)

val FRESHMAN_SEM1_IDS = setOf(
    "math-natural", "math-social", "physics", "chemistry", "biology",
    "english-1", "psychology", "logic", "geography", "physical-fitness"
)

val FRESHMAN_SEM2_IDS = setOf(
    "anthropology", "civics", "economics", "emerging-technology", "cpp-programming",
    "applied-math-1", "english-2", "inclusiveness", "global-trends", "entrepreneurship"
)

data class NativeLearningHub(
    val id: String,
    val name: String,
    val description: String,
    val accentColor: Color,
    val assetImage: String
)

val NATIVE_LEARNING_HUBS = listOf(
    NativeLearningHub(
        id = "books",
        name = "Books",
        description = "Core textbooks and curated reading lists",
        accentColor = WisdomAccentSky,
        assetImage = "file:///android_asset/images/hubs/books.jpg"
    ),
    NativeLearningHub(
        id = "short-notes",
        name = "Short Notes",
        description = "Concise notes, summaries, and study guides",
        accentColor = WisdomAccentViolet,
        assetImage = "file:///android_asset/images/hubs/short-notes.jpg"
    ),
    NativeLearningHub(
        id = "flashcards",
        name = "Flashcards",
        description = "Quick recall decks for key concepts",
        accentColor = WisdomAccentAmber,
        assetImage = "file:///android_asset/images/hubs/flashcards.jpg"
    ),
    NativeLearningHub(
        id = "question-banks",
        name = "Question Banks",
        description = "Practice sets by topic and difficulty",
        accentColor = WisdomCyan,
        assetImage = "file:///android_asset/images/hubs/question-banks.jpg"
    ),
    NativeLearningHub(
        id = "exams",
        name = "Exams",
        description = "Past papers, mocks, and timed drills",
        accentColor = WisdomAccentEmerald,
        assetImage = "file:///android_asset/images/hubs/exams.jpg"
    ),
    NativeLearningHub(
        id = "life-savers",
        name = "Life Savers",
        description = "High-yield summaries, cheat sheets, and exam lifesavers",
        accentColor = WisdomAccentRose,
        assetImage = "file:///android_asset/images/hubs/life-savers.jpg"
    )
)

data class NativeSpecialCourse(
    val code: String,
    val title: String,
    val slug: String,
    val semester: String,
    val assetImage: String,
    val path: String
)

val ECE_SEM1_COURSES = listOf(
    NativeSpecialCourse("ECEg3071", "Applied Electronics II", "eceg3071", "sem-1", "file:///android_asset/images/special-packages/courses/eceg3071.jpg", "/academy/special-packages/electrical-computer-engineering/sem-1/eceg3071"),
    NativeSpecialCourse("Econ1011", "Economics", "econ1011", "sem-1", "file:///android_asset/images/special-packages/courses/econ1011.jpg", "/academy/special-packages/electrical-computer-engineering/sem-1/econ1011"),
    NativeSpecialCourse("ECEg3051", "Electromagnetic Fields", "eceg3051", "sem-1", "file:///android_asset/images/special-packages/courses/eceg3051.jpg", "/academy/special-packages/electrical-computer-engineering/sem-1/eceg3051"),
    NativeSpecialCourse("ECEg3081", "Signals and Systems Analysis", "eceg3081", "sem-1", "file:///android_asset/images/special-packages/courses/eceg3081.jpg", "/academy/special-packages/electrical-computer-engineering/sem-1/eceg3081"),
    NativeSpecialCourse("ECEg3073", "Electrical Engineering Laboratory III", "eceg3073", "sem-1", "file:///android_asset/images/special-packages/courses/eceg3073.jpg", "/academy/special-packages/electrical-computer-engineering/sem-1/eceg3073"),
    NativeSpecialCourse("ECEg3101", "Object Oriented Programming", "eceg3101", "sem-1", "file:///android_asset/images/special-packages/courses/eceg3101.jpg", "/academy/special-packages/electrical-computer-engineering/sem-1/eceg3101"),
    NativeSpecialCourse("ECEg3061", "Computational Methods", "eceg3061", "sem-1", "file:///android_asset/images/special-packages/courses/eceg3061.jpg", "/academy/special-packages/electrical-computer-engineering/sem-1/eceg3061")
)

val ECE_SEM2_COURSES = listOf(
    NativeSpecialCourse("MEng3052", "Engineering Thermodynamics", "meng3052", "sem-2", "file:///android_asset/images/special-packages/courses/meng3052.jpg", "/academy/special-packages/electrical-computer-engineering/sem-2/meng3052"),
    NativeSpecialCourse("ECEg3082", "Network Analysis and Synthesis", "eceg3082", "sem-2", "file:///android_asset/images/special-packages/courses/eceg3082.jpg", "/academy/special-packages/electrical-computer-engineering/sem-2/eceg3082"),
    NativeSpecialCourse("ECEg3092", "Introduction to Electrical Machines", "eceg3092", "sem-2", "file:///android_asset/images/special-packages/courses/eceg3092.jpg", "/academy/special-packages/electrical-computer-engineering/sem-2/eceg3092"),
    NativeSpecialCourse("ECEg3094", "Electrical Engineering Lab IV", "eceg3094", "sem-2", "file:///android_asset/images/special-packages/courses/eceg3094.jpg", "/academy/special-packages/electrical-computer-engineering/sem-2/eceg3094"),
    NativeSpecialCourse("ECEg3102", "Digital Logic Design", "eceg3102", "sem-2", "file:///android_asset/images/special-packages/courses/eceg3102.jpg", "/academy/special-packages/electrical-computer-engineering/sem-2/eceg3102"),
    NativeSpecialCourse("ECEg3052", "Electrical Materials and Technology", "eceg3052", "sem-2", "file:///android_asset/images/special-packages/courses/eceg3052.jpg", "/academy/special-packages/electrical-computer-engineering/sem-2/eceg3052"),
    NativeSpecialCourse("ECEg3096", "Electrical Workshop Practice II", "eceg3096", "sem-2", "file:///android_asset/images/special-packages/courses/eceg3096.jpg", "/academy/special-packages/electrical-computer-engineering/sem-2/eceg3096")
)

data class NativeGradeSubject(
    val id: String,
    val name: String,
    val hint: String,
    val grade: String,
    val path: String
)

val GRADE_9_SUBJECTS = listOf(
    NativeGradeSubject("chemistry", "Chemistry", "Matter, atoms, reactions", "9", "/academy/grades/9/chemistry"),
    NativeGradeSubject("mathematics", "Math", "Algebra, geometry, number work", "9", "/academy/grades/9/mathematics"),
    NativeGradeSubject("physics", "Physics", "Motion, forces, energy", "9", "/academy/grades/9/physics"),
    NativeGradeSubject("biology", "Biology", "Cells, organisms, life processes", "9", "/academy/grades/9/biology"),
    NativeGradeSubject("geography", "Geography", "Earth systems and places", "9", "/academy/grades/9/geography"),
    NativeGradeSubject("history", "History", "Past societies and change", "9", "/academy/grades/9/history"),
    NativeGradeSubject("economics", "Economics", "Resources, markets, choices", "9", "/academy/grades/9/economics")
)

val GRADE_10_SUBJECTS = listOf(
    NativeGradeSubject("mathematics", "Math", "Functions, geometry, statistics", "10", "/academy/grades/10/mathematics"),
    NativeGradeSubject("biology", "Biology", "Systems, ecology, health", "10", "/academy/grades/10/biology"),
    NativeGradeSubject("chemistry", "Chemistry", "Bonding, stoichiometry", "10", "/academy/grades/10/chemistry"),
    NativeGradeSubject("physics", "Physics", "Waves, electricity foundations", "10", "/academy/grades/10/physics"),
    NativeGradeSubject("geography", "Geography", "Human and physical geography", "10", "/academy/grades/10/geography"),
    NativeGradeSubject("history", "History", "Regional and world contexts", "10", "/academy/grades/10/history"),
    NativeGradeSubject("economics", "Economics", "Production and national economy", "10", "/academy/grades/10/economics")
)

val GRADE_11_SUBJECTS = listOf(
    NativeGradeSubject("mathematics", "Math", "Advanced algebra and exam path", "11", "/academy/grades/11/mathematics"),
    NativeGradeSubject("biology", "Biology", "Genetics, physiology, ecology", "11", "/academy/grades/11/biology"),
    NativeGradeSubject("physics", "Physics", "Mechanics, energy, fields", "11", "/academy/grades/11/physics"),
    NativeGradeSubject("chemistry", "Chemistry", "Structure, reactions, equilibrium", "11", "/academy/grades/11/chemistry"),
    NativeGradeSubject("economics", "Economics", "Markets, macro, development", "11", "/academy/grades/11/economics"),
    NativeGradeSubject("geography", "Geography", "Population, development, Ethiopia", "11", "/academy/grades/11/geography"),
    NativeGradeSubject("history", "History", "Ethiopia and global history", "11", "/academy/grades/11/history")
)

val GRADE_12_SUBJECTS = listOf(
    NativeGradeSubject("english", "English", "Leaving-exam English", "12", "/academy/grades/12/english"),
    NativeGradeSubject("chemistry", "Chemistry", "Organic and physical chemistry", "12", "/academy/grades/12/chemistry"),
    NativeGradeSubject("biology", "Biology", "Exam depth across life sciences", "12", "/academy/grades/12/biology"),
    NativeGradeSubject("mathematics", "Math", "Exam-ready pure and applied math", "12", "/academy/grades/12/mathematics"),
    NativeGradeSubject("physics", "Physics", "Electromagnetism, modern physics", "12", "/academy/grades/12/physics"),
    NativeGradeSubject("geography", "Geography", "Exam depth in geo systems", "12", "/academy/grades/12/geography"),
    NativeGradeSubject("economics", "Economics", "Exam depth in economic theory", "12", "/academy/grades/12/economics"),
    NativeGradeSubject("history", "History", "Exam depth in historical analysis", "12", "/academy/grades/12/history"),
    NativeGradeSubject("sat", "SAT", "SAT-style practice and strategies", "12", "/academy/grades/12/sat"),
    NativeGradeSubject("exam-tips", "Exam tips", "Study tactics and exam-day guidance", "12", "/academy/grades/12/exam-tips")
)

val REMEDIAL_SUBJECTS = listOf(
    NativeSubject("english", "English", "Catch-up core grammar, reading comprehension and writing mechanics.", "file:///android_asset/images/freshman/english-1.jpg", "/academy/remedial/english"),
    NativeSubject("mathematics", "Mathematics", "Foundational algebra, geometry, functions, and quantitative problems.", "file:///android_asset/images/freshman/math-natural.jpg", "/academy/remedial/mathematics"),
    NativeSubject("physics", "Physics", "Mechanics, kinematics, work, heat, and basic physical sciences.", "file:///android_asset/images/freshman/physics.jpg", "/academy/remedial/physics"),
    NativeSubject("chemistry", "Chemistry", "Atomic structure, chemical equations, solutions, and acids/bases.", "file:///android_asset/images/freshman/chemistry.jpg", "/academy/remedial/chemistry"),
    NativeSubject("biology", "Biology", "Cell biology, genetics, ecosystems, and human physiology.", "file:///android_asset/images/freshman/biology.jpg", "/academy/remedial/biology"),
    NativeSubject("history", "History", "Ethiopian and regional Horn history, statecraft, and modernization.", "file:///android_asset/images/freshman/history.jpg", "/academy/remedial/history"),
    NativeSubject("geography", "Geography", "Physical geography, natural resources, cartography, and population.", "file:///android_asset/images/freshman/geography.jpg", "/academy/remedial/geography")
)

