package com.wisdomtower.academy.ui.drawer

/**
 * Privacy Policy and Terms of Service: text copied from the website pages
 * website-reference/src/app/privacy/page.tsx and website-reference/src/app/terms/page.tsx
 * (version 3.2, last revised 28 September 2026). Do NOT reword or add text here: change the
 * website first, then copy.
 */
sealed class LegalBlock {
    /** A paragraph; [lead] is printed in bold in front of [text]. */
    data class Para(val text: String, val lead: String = "", val italic: Boolean = false) : LegalBlock()

    /** Bullet list; each item is (bold lead, text), the lead may be empty. */
    data class Bullets(val items: List<Pair<String, String>>) : LegalBlock()

    /** A small boxed note with a title and a text. */
    data class Card(val title: String, val text: String) : LegalBlock()

    /** Contact box; each link is (prefix, label, uri). */
    data class Contact(
        val title: String,
        val lines: List<String>,
        val links: List<Triple<String, String, String>>
    ) : LegalBlock()
}

data class LegalSection(val number: String, val title: String, val blocks: List<LegalBlock>)

data class LegalDocument(
    val badge: String,
    val effective: String,
    val title: String,
    val intro: String,
    val meta: String,
    val summaryTitle: String,
    val summaryItems: List<Pair<String, String>>,
    val sections: List<LegalSection>
)

val PRIVACY_DOCUMENT = LegalDocument(
    badge = "Student Data Protection",
    effective = "Effective: Academic Year 2026/2027",
    title = "Institutional Privacy Policy",
    intro = "Wisdom Tower Academy is dedicated to safeguarding the privacy, personal records, and academic integrity of every enrolled learner. This charter articulates our rigorous protocols for data stewardship, encryption safeguards, and the protection of student telemetry.",
    meta = "Policy version: 3.2 • Last revised: 28 September 2026",
    summaryTitle = "Our Academic Privacy Guarantees",
    summaryItems = listOf(
        "Zero Data Monetization:" to "We never sell, lease, or broker student personal or academic data to third-party ad networks.",
        "End-to-End Encryption:" to "TLS 1.3 protocol protects all transit data; cryptographic vaults secure student profiles at rest.",
        "Student-Centric Ownership:" to "Your progress records, bookmarks, and quiz histories belong to your academic journey.",
        "Underage Scholar Protections:" to "Dedicated safety guardrails for secondary school learners in Grades 9–12."
    ),
    sections = listOf(
        LegalSection(
            "01", "Institutional Scope & Controller Identity", listOf(
                LegalBlock.Para("Wisdom Tower Academy (“Wisdom Tower”, “we”, “our”, or “us”) operates the primary educational platform accessible via wisdomtower.et and its sub-domains. For the purposes of applicable data protection legislation and institutional standards, Wisdom Tower Academy is the official Data Controller responsible for the processing and protection of your personal and academic information."),
                LegalBlock.Para("If you have questions regarding this charter or wish to exercise statutory data subject rights, you may reach our Data Protection Desk directly at: support@wisdomtower.tech")
            )
        ),
        LegalSection(
            "02", "Categories of Information We Collect", listOf(
                LegalBlock.Para("We collect only the essential data necessary to deliver personalized, uninterrupted educational services across our hubs:"),
                LegalBlock.Card("A. Student Identity & Authentication Records", "Full name, email address, password hash (one-way salted via bcrypt), and unique profile identifiers. When registering via Google OAuth, we receive authorized profile tokens (name, primary email, profile picture) without accessing personal passwords or external Google account details."),
                LegalBlock.Card("B. Academic Telemetry & Performance Data", "Chapter completion timestamps, question-bank solution logs, mock exam scores, streak frequencies, study planner schedules, flashcard confidence ratings, and voluntary submissions to department or field leaderboards."),
                LegalBlock.Card("C. Enrollment & Financial Verification Data", "Package identifiers, payment methods selected (Telebirr, CBE, Abyssinia, Awash), transaction reference codes, student contact phone numbers submitted for payment reconciliation, and optional payment receipt image uploads. Note: We never handle, store, or solicit private banking PINs or mobile wallet passwords."),
                LegalBlock.Card("D. Device, Cache & Network Telemetry", "IP address (coarse geographic region), browser user agent, operating system, and localized IndexedDB cache storage used strictly to preserve offline study capability during internet interruptions in Ethiopia.")
            )
        ),
        LegalSection(
            "03", "Lawful Grounds for Processing", listOf(
                LegalBlock.Para("In alignment with international privacy standards and Ethiopian legal frameworks, our processing activities rest upon well-defined legal bases:"),
                LegalBlock.Bullets(
                    listOf(
                        "Contractual Necessity:" to "Processing required to authenticate your enrollment, unlock purchased packages, record completed chapters, and calculate exam scores.",
                        "Legitimate Institutional Interests:" to "Enhancing pedagogical curriculum quality, diagnosing platform errors, safeguarding against fraudulent bank reference submissions, and preventing illegal scraping of copyrighted material.",
                        "Explicit Student Consent:" to "Optional participation in field leaderboards, scholarship notification updates, or voluntary academic feedback surveys."
                    )
                )
            )
        ),
        LegalSection(
            "04", "Infrastructure Safeguards & Cryptographic Protocols", listOf(
                LegalBlock.Para("Wisdom Tower Academy enforces rigorous technological barriers to shield student records from unauthorized access, alteration, or disclosure:"),
                LegalBlock.Bullets(
                    listOf(
                        "Transit Encryption:" to "All HTTP traffic is forcefully upgraded to Transport Layer Security (TLS 1.3 / HTTPS), ensuring eavesdropping protection even on public Wi-Fi or cellular networks.",
                        "Database Vault:" to "Production database clusters are maintained via Supabase with row-level security (RLS) policies ensuring students can only access their own private records.",
                        "Restricted Administrative Access:" to "Academic registrars and staff operate under strict Role-Based Access Controls (RBAC) governed by multi-factor authentication and detailed audit logging."
                    )
                )
            )
        ),
        LegalSection(
            "05", "Third-Party Sub-processors & Service Partners", listOf(
                LegalBlock.Para("We partner only with enterprise-grade sub-processors bound by strict confidentiality and data-processing covenants:"),
                LegalBlock.Bullets(
                    listOf(
                        "Supabase:" to "Cloud database infrastructure, user authentication, and encrypted receipt asset storage.",
                        "Google Cloud Platform & Vercel:" to "Edge computing servers, static asset delivery, and DDoS mitigation.",
                        "Payment Verification Gateways:" to "Integration services (such as Verify.et) for automated bank reference validation.",
                        "Google Gemini AI:" to "Server-side AI processing for “Explain with AI” question walkthroughs (prompts contain only academic question context; no personal student identity is transferred)."
                    )
                )
            )
        ),
        LegalSection(
            "06", "Offline Persistence & Low-Bandwidth Caching", listOf(
                LegalBlock.Para("Because Ethiopian students frequently face network volatility or high data costs, our platform uses client-side Service Workers and browser IndexedDB caches to store downloaded chapter summaries, flashcards, and reading progress locally."),
                LegalBlock.Para("This localized data resides entirely on your device and can be cleared at any time through your browser settings or via the platform Preferences panel.")
            )
        ),
        LegalSection(
            "07", "Student Rights & Autonomous Data Control", listOf(
                LegalBlock.Para("Every enrolled student possesses comprehensive rights regarding their personal data:"),
                LegalBlock.Bullets(
                    listOf(
                        "Right to Inspect:" to "View all saved profile details, active package enrollments, and quiz histories inside My Learning and Account Settings.",
                        "Right to Rectify:" to "Update your name, phone number, and study preferences at any time.",
                        "Right to Erasure (Right to Be Forgotten):" to "Request the permanent deletion of your profile and historical records upon completing your studies.",
                        "Right to Opt-Out:" to "Toggle off optional leaderboard visibility to keep your score progress completely private."
                    )
                )
            )
        ),
        LegalSection(
            "08", "Protection of Secondary School Minors", listOf(
                LegalBlock.Para("For learners enrolled in our secondary curriculum tracks (Grades 9 through 12) who may be under the age of 18, Wisdom Tower Academy enforces protective parameters:"),
                LegalBlock.Bullets(
                    listOf(
                        "" to "We do not display public contact details or personal social media handles on secondary leaderboards.",
                        "" to "Parents and legal guardians may inspect or request modification of their dependent student's records by contacting our support desk.",
                        "" to "We provide an entirely educational, ad-free environment without behavioural profiling or commercial solicitations."
                    )
                )
            )
        ),
        LegalSection(
            "09", "Data Retention Schedules", listOf(
                LegalBlock.Para("Active student accounts and their associated learning histories are retained throughout the active enrollment period to maintain continuous academic records across academic semesters. Transaction records are maintained for a period of five (5) years in compliance with Ethiopian tax and commercial bookkeeping statutes. Dormant accounts with no package enrollments may be purged after two (2) years of persistent inactivity following prior email notification.")
            )
        ),
        LegalSection(
            "10", "Inquiries, Grievances & Data Protection Officer", listOf(
                LegalBlock.Para("If you have inquiries concerning this policy or wish to exercise your data subject prerogatives, please submit a formal request:"),
                LegalBlock.Contact(
                    title = "Wisdom Tower Academy · Data Protection Officer",
                    lines = listOf("Addis Ababa, Ethiopia"),
                    links = listOf(
                        Triple("Email: ", "support@wisdomtower.tech", "mailto:support@wisdomtower.tech"),
                        Triple("Official Channel: ", "@wisdom_tower2", "https://t.me/wisdom_tower2")
                    )
                )
            )
        )
    )
)

val TERMS_DOCUMENT = LegalDocument(
    badge = "Institutional Agreement",
    effective = "Effective: Academic Year 2026/2027",
    title = "Terms of Service & Academic Agreement",
    intro = "These Terms govern your enrollment, access to curriculum materials, digital examination engines, and software services provided by Wisdom Tower Academy. By registering an account or accessing any academic track, you enter into a legally binding academic compact.",
    meta = "Document version: 3.2 • Last revised: 28 September 2026",
    summaryTitle = "Core Academic Compact at a Glance",
    summaryItems = listOf(
        "Personal Educational License:" to "Course enrollments, solved exams, and lecture notes are licensed strictly for your individual academic preparation and cannot be redistributed, scraped, or shared.",
        "Academic Integrity:" to "Wisdom Tower Academy upholds rigorous academic honesty. The platform is designed to develop genuine competence under Ethiopia's new curriculum framework.",
        "Verified Access:" to "Tuition fees in Ethiopian Birr (ETB) are verified through domestic payment channels (Telebirr, CBE, Abyssinia, etc.). Verified orders unlock immediate learning hub access."
    ),
    sections = listOf(
        LegalSection(
            "01", "Academic Purpose & Acceptance of Terms", listOf(
                LegalBlock.Para("Wisdom Tower Academy (“the Platform”, “we”, “our”, or “us”) operates a specialized digital education infrastructure engineered to support secondary learners (Grades 9–12), remedial foundation candidates, university freshman scholars, departmental engineering students, and candidates preparing for national standardized examinations (including UAT, GAT, COC, and University Exit Exams)."),
                LegalBlock.Para("By creating a student profile, logging in via federated credentials (such as Google OAuth), making a tuition payment, or accessing downloadable materials, you affirm that you are either at least 18 years of age or possess legal parental or guardian consent, and that you unreservedly agree to be bound by these Terms of Service. If you do not accept these provisions in their entirety, you are not authorized to utilize the platform.")
            )
        ),
        LegalSection(
            "02", "Account Governance & Credential Security", listOf(
                LegalBlock.Para("Each student account is an individual academic identity. To maintain the pedagogical validity of leaderboards, streak counts, and personalized question-bank progress, account credentials must remain exclusive to the registered student."),
                LegalBlock.Bullets(
                    listOf(
                        "True Information:" to "You agree to provide accurate, up-to-date registration details, including your genuine name, active phone number, and institutional or personal email address.",
                        "Prohibition of Credential Sharing:" to "Sharing credentials, selling account seats, or distributing authenticated session tokens to unauthorized third parties constitutes a material breach of this Agreement and results in immediate, unrefunded termination of access.",
                        "Multi-Device Authorization:" to "Students may access their learning portal across their personal mobile phones, tablets, and personal computers, provided usage represents the authentic individual study sessions of the enrolled student. Simultaneous concurrent sessions indicating credential pooling may trigger security holds."
                    )
                )
            )
        ),
        LegalSection(
            "03", "Intellectual Property & Limited Educational License", listOf(
                LegalBlock.Para("All course lectures, modular summary notes, original step-by-step examination solutions, algorithmic question banks, flashcard taxonomies, pedagogical software code, graphic artwork, and trademarked branding are the exclusive proprietary intellectual property of Wisdom Tower Academy and its contributing academic faculty."),
                LegalBlock.Card("License Scope Granted to Enrolled Students:", "Upon confirmed payment and activation of a package, Wisdom Tower Academy grants you a personal, non-exclusive, non-transferable, revocable license to view, read, and solve the designated curriculum materials for your own private study and exam revision."),
                LegalBlock.Para("", lead = "Expressly Prohibited Conduct:"),
                LegalBlock.Bullets(
                    listOf(
                        "" to "Automated scraping, bulk downloading, or mirroring of curriculum materials via bots or unauthorized web crawlers.",
                        "" to "Re-uploading, republishing, or reselling our notes, question banks, or solutions on external Telegram channels, social platforms, or rival websites.",
                        "" to "Modifying, reverse-engineering, decompiling, or creating derivative works based upon our platform software or proprietary content engines."
                    )
                )
            )
        ),
        LegalSection(
            "04", "Academic Integrity & Honor Code", listOf(
                LegalBlock.Para("Wisdom Tower Academy is built to foster genuine intellectual mastery aligned with the high standards of higher education in Ethiopia and internationally. By engaging with our timed practice exams and leaderboard systems, you agree to:"),
                LegalBlock.Bullets(
                    listOf(
                        "" to "Complete timed diagnostic examinations honestly without manipulating client-side timers or injecting synthetic score submissions.",
                        "" to "Use AI-assisted explanations as a formative learning tutor rather than as a substitute for developing personal problem-solving mastery.",
                        "" to "Refrain from posting examination keys or solutions during ongoing live institutional assessments."
                    )
                )
            )
        ),
        LegalSection(
            "05", "Curriculum Packages, Tuition Fees & Payment Verification", listOf(
                LegalBlock.Para("To maintain accessible education across Ethiopia, packages are denominated in Ethiopian Birr (ETB) and structured modularly so students only pay for the tracks they need."),
                LegalBlock.Bullets(
                    listOf(
                        "Domestic Payment Gateways:" to "Payments are transacted directly via established Ethiopian banking and mobile money institutions, including Telebirr, Commercial Bank of Ethiopia (CBE), Bank of Abyssinia, and Awash Bank.",
                        "Verification Protocols:" to "Students submit their genuine bank transfer transaction reference (or optional receipt screenshot). Access is provisioned either automatically via our verification microservices or promptly via our academic registrar verification desk.",
                        "Submission of Fraudulent References:" to "Submitting forged transaction codes, re-used transfer numbers, or falsified receipts constitutes fraud. Such attempts will lead to immediate account suspension, permanent blacklisting, and reporting to relevant financial channels."
                    )
                )
            )
        ),
        LegalSection(
            "06", "Digital Fulfillment & Refund Policy", listOf(
                LegalBlock.Para("Due to the immediate digital fulfillment and direct accessibility of proprietary textbooks, worked solutions, and question banks upon verification, enrollments are generally non-refundable once unlocked."),
                LegalBlock.Para("Refunds will be granted under the following documented conditions:", lead = "Exceptional Refund Circumstances:"),
                LegalBlock.Bullets(
                    listOf(
                        "" to "Duplicate payment for the identical package resulting from network timeout during transfer submission.",
                        "" to "Verifiable technical defect on our platform that persistently prevents access to curriculum materials, where our technical team is unable to resolve the issue within 72 hours of written notification."
                    )
                ),
                LegalBlock.Para("Refund requests must be lodged within 7 days of the payment date via official support channels, quoting the original Order Reference.")
            )
        ),
        LegalSection(
            "07", "Platform Continuity, Offline Resilience & System Availability", listOf(
                LegalBlock.Para("We understand that reliable study access is vital during examination seasons. Wisdom Tower Academy employs modern Progressive Web App (PWA) technologies, edge caching, and localized data stores (IndexedDB) to allow continuous learning during intermittent internet connectivity."),
                LegalBlock.Para("While we strive for 99.9% uptime, we do not warrant that digital services will be entirely uninterrupted or immune from third-party telecom outages, national infrastructure maintenance, or force majeure events. Scheduled maintenance will be communicated via platform announcements.")
            )
        ),
        LegalSection(
            "08", "Educational Outcomes & Warranty Disclaimers", listOf(
                LegalBlock.Para("Wisdom Tower Academy delivers high-caliber, curriculum-aligned academic instruments, verified exam solutions, and personalized practice engines. However, individual performance in national examinations, regional competitions, university admissions, and subsequent grade point averages depends upon the student's personal diligence, study discipline, and exam execution."),
                LegalBlock.Para("The platform is provided on an “as is” and “as available” basis without express or implied warranties of commercial fitness for a particular vocational outcome. Wisdom Tower Academy shall not be liable for incidental, consequential, or indirect damages arising out of the use or inability to use our educational tools.", italic = true)
            )
        ),
        LegalSection(
            "09", "Governing Law & Institutional Dispute Resolution", listOf(
                LegalBlock.Para("These Terms are governed by and construed in conformity with the laws and educational proclamations of the Federal Democratic Republic of Ethiopia. Any disputes arising under or in connection with these Terms shall first be submitted to informal dispute resolution via our Academic Affairs Committee. If unresolved, disputes shall be subject to the exclusive jurisdiction of the competent courts of Addis Ababa, Ethiopia.")
            )
        ),
        LegalSection(
            "10", "Official Academic Contact & Registrars", listOf(
                LegalBlock.Para("For official legal notices, institutional licensing inquiries, or student advocacy matters regarding these Terms, contact our administrative office:"),
                LegalBlock.Contact(
                    title = "Wisdom Tower Academy · Legal & Academic Affairs",
                    lines = listOf("Addis Ababa, Ethiopia"),
                    links = listOf(
                        Triple("Email: ", "support@wisdomtower.tech", "mailto:support@wisdomtower.tech"),
                        Triple("Telegram Official: ", "@wisdom_tower2", "https://t.me/wisdom_tower2")
                    )
                )
            )
        )
    )
)
