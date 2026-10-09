package com.wisdomtower.academy.ui.guides

import androidx.compose.ui.graphics.Color
import com.wisdomtower.academy.ui.theme.WisdomAccentAmber
import com.wisdomtower.academy.ui.theme.WisdomAccentEmerald
import com.wisdomtower.academy.ui.theme.WisdomAccentOrange
import com.wisdomtower.academy.ui.theme.WisdomAccentPurple
import com.wisdomtower.academy.ui.theme.WisdomAccentRose
import com.wisdomtower.academy.ui.theme.WisdomAccentSky
import com.wisdomtower.academy.ui.theme.WisdomAccentViolet
import com.wisdomtower.academy.ui.theme.WisdomCyan

data class GuideTab(
    val slug: String,
    val title: String,
    val accentColor: Color
)

val GUIDE_TABS = listOf(
    GuideTab("study-techniques", "Study Techniques", WisdomCyan),
    GuideTab("success-stories", "Success Stories", WisdomAccentAmber),
    GuideTab("campus-life", "Campus Life", WisdomAccentSky),
    GuideTab("universities", "Universities", WisdomAccentViolet),
    GuideTab("departments", "Departments", WisdomAccentOrange),
    GuideTab("scholarships", "Scholarships", WisdomAccentRose)
)

data class SuccessStory(
    val name: String,
    val achievement: String,
    val program: String,
    val year: String,
    val quote: String,
    val body: String
)

val SUCCESS_STORIES = listOf(
    SuccessStory(
        name = "Kalkidan Mengistu",
        achievement = "Top 0.5% National Matriculation Score",
        program = "Grade 12 Natural Stream",
        year = "2025/2026",
        quote = "Solving timed question banks under closed-book conditions made the real exam feel like an everyday drill.",
        body = "I stopped passive rereading early in the first semester. Every day after classes, I dedicated 45 minutes to active retrieval: writing textbook definitions from memory, solving unworked questions, and explaining difficult Physics concepts to my study partner without looking at my notebook."
    ),
    SuccessStory(
        name = "Bereket Tesfaye",
        achievement = "3.94 Freshman GPA & ECE Department Placement",
        program = "Freshman University STEM",
        year = "2025/2026",
        quote = "The university midterm gap catches students off guard. Starting semester question banks on week two was my greatest advantage.",
        body = "Freshman calculus and classical mechanics cover double the speed of high school. Wisdom Tower's chapter summaries gave me the core mental models before lectures, so classroom hours became review sessions rather than first exposure."
    ),
    SuccessStory(
        name = "Selamawit Girma",
        achievement = "Perfect Verbal & 94th Percentile UAT Admission",
        program = "Undergraduate Admission Test",
        year = "2025/2026",
        quote = "Speed is the real test in entrance exams. Timed simulations gave me the rhythm to finish with 10 minutes to spare.",
        body = "The UAT tests structured logic and rapid comprehension. Practicing with full timed mock exams once every weekend eliminated my test anxiety completely."
    )
)

data class UniversityProfile(
    val name: String,
    val abbreviation: String,
    val location: String,
    val strengths: String,
    val climate: String
)

val UNIVERSITIES_LIST = listOf(
    UniversityProfile("Addis Ababa University", "AAU", "Addis Ababa (Sidist Kilo, Arat Kilo, Tikur Anbessa)", "Medicine, Law, STEM, Social Sciences, Economics", "Temperate highland climate, extensive library network"),
    UniversityProfile("Adama Science and Technology University", "ASTU", "Adama, Oromia", "Advanced Engineering, Applied Sciences, Nanotechnology", "Warm Rift Valley climate, specialized STEM campus"),
    UniversityProfile("Addis Ababa Science and Technology University", "AASTU", "Kilinto, Addis Ababa", "Software Engineering, Mechatronics, Biotechnology", "Modern specialized laboratories, tech innovation centers"),
    UniversityProfile("Bahir Dar University", "BDU", "Bahir Dar, Amhara", "Maritime Academy, Engineering, Agriculture, Law", "Lake Tana shorelines, beautiful tropical green campus"),
    UniversityProfile("Jimma University", "JU", "Jimma, Oromia", "Community-Based Medicine, Public Health, Technology", "Lush highland climate, renowned medical teaching hospital"),
    UniversityProfile("University of Gondar", "UoG", "Gondar, Amhara", "Medical Sciences, Health Officer, Veterinary, History", "Historic university city, pioneer in medical health training")
)

data class DepartmentProfile(
    val name: String,
    val category: String,
    val streamRequired: String,
    val description: String,
    val careerPaths: String
)

val DEPARTMENTS_LIST = listOf(
    DepartmentProfile(
        "Software Engineering & Computer Science",
        "Computing & Technology",
        "Natural Stream (Higher Math & Physics)",
        "Focuses on algorithms, system architecture, database design, software engineering methodologies, and intelligent systems.",
        "Full-Stack Developer, AI Engineer, Systems Architect, Cybersecurity Specialist"
    ),
    DepartmentProfile(
        "Electrical & Computer Engineering",
        "Engineering",
        "Natural Stream (Advanced Calculus & Physics)",
        "Combines hardware electronics, signal processing, power systems, telecommunications, and embedded computer hardware.",
        "Telecommunications Engineer, Power Systems Analyst, Hardware Architect"
    ),
    DepartmentProfile(
        "Doctor of Medicine (MD)",
        "Health Sciences",
        "Natural Stream (High Biology, Chemistry, Physics)",
        "Clinical medical education covering anatomy, pathology, pharmacology, internal medicine, surgery, and public community health.",
        "Medical Doctor, Clinical Specialist, Hospital Administrator, Health Researcher"
    ),
    DepartmentProfile(
        "Civil Engineering",
        "Engineering",
        "Natural Stream (Mechanics & Analytical Math)",
        "Design and supervision of physical infrastructures including bridges, transport systems, structural buildings, and geotechnical systems.",
        "Structural Engineer, Project Manager, Geotechnical Consultant, Urban Planner"
    ),
    DepartmentProfile(
        "Economics & Development Finance",
        "Business & Economics",
        "Social or Natural Stream (Analytical Foundations)",
        "Micro and macroeconomic theories, econometric modeling, fiscal policy, international trade, and commercial banking.",
        "Economic Analyst, Investment Banker, Development Specialist, Policy Advisor"
    )
)
