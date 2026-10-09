/**
 * Department guides for Academy, competitive undergraduate fields.
 * Writing targets students choosing a path, not institutional brochure tone.
 */

export type DepartmentCategoryId =
  | "law"
  | "business"
  | "health"
  | "computing"
  | "sciences"
  | "agriculture"
  | "veterinary"
  | "education"
  | "communication";

export type Department = {
  id: string;
  name: string;
  shortName: string;
  category: DepartmentCategoryId;
  durationYears: string;
  about: string;
  courses: string[];
  careers: string[];
  market: string;
  pros: string[];
  cons: string[];
};

export type DepartmentCategory = {
  id: DepartmentCategoryId;
  label: string;
  blurb: string;
  accent: string;
  border: string;
  badge: string;
  glow: string;
};

export const departmentCategories: DepartmentCategory[] = [
  {
    id: "law",
    label: "Law",
    blurb: "Rights, procedure, and the machinery of the state.",
    accent: "text-amber-300",
    border: "hover:border-amber-400/40",
    badge: "border-amber-400/30 bg-amber-500/15 text-amber-200",
    glow: "from-amber-500/20",
  },
  {
    id: "business",
    label: "Business & Economics",
    blurb: "Money, firms, markets, and how organizations decide.",
    accent: "text-emerald-300",
    border: "hover:border-emerald-400/40",
    badge: "border-emerald-400/30 bg-emerald-500/15 text-emerald-200",
    glow: "from-emerald-500/20",
  },
  {
    id: "health",
    label: "Health & Medicine",
    blurb: "Clinical care, public systems, and lab science.",
    accent: "text-rose-300",
    border: "hover:border-rose-400/40",
    badge: "border-rose-400/30 bg-rose-500/15 text-rose-200",
    glow: "from-rose-500/20",
  },
  {
    id: "computing",
    label: "Computing & Data",
    blurb: "Software, systems, and quantitative reasoning.",
    accent: "text-cyan-300",
    border: "hover:border-cyan-400/40",
    badge: "border-cyan-400/30 bg-cyan-500/15 text-cyan-200",
    glow: "from-cyan-500/20",
  },
  {
    id: "sciences",
    label: "Natural Sciences",
    blurb: "Theory first, then labs, models, and research paths.",
    accent: "text-violet-300",
    border: "hover:border-violet-400/40",
    badge: "border-violet-400/30 bg-violet-500/15 text-violet-200",
    glow: "from-violet-500/20",
  },
  {
    id: "agriculture",
    label: "Agriculture & Environment",
    blurb: "Production systems, land, and rural livelihoods.",
    accent: "text-lime-300",
    border: "hover:border-lime-400/40",
    badge: "border-lime-400/30 bg-lime-500/15 text-lime-200",
    glow: "from-lime-500/20",
  },
  {
    id: "veterinary",
    label: "Veterinary",
    blurb: "Animal health at clinic and herd scale.",
    accent: "text-teal-300",
    border: "hover:border-teal-400/40",
    badge: "border-teal-400/30 bg-teal-500/15 text-teal-200",
    glow: "from-teal-500/20",
  },
  {
    id: "education",
    label: "Education & Behavior",
    blurb: "Learning systems, minds, and institutional design.",
    accent: "text-sky-300",
    border: "hover:border-sky-400/40",
    badge: "border-sky-400/30 bg-sky-500/15 text-sky-200",
    glow: "from-sky-500/20",
  },
  {
    id: "communication",
    label: "Communication & Language",
    blurb: "Media, narrative, and professional language skill.",
    accent: "text-fuchsia-300",
    border: "hover:border-fuchsia-400/40",
    badge: "border-fuchsia-400/30 bg-fuchsia-500/15 text-fuchsia-200",
    glow: "from-fuchsia-500/20",
  },
];

export const departments: Department[] = [
  {
    id: "law-llb",
    name: "Law (LLB)",
    shortName: "Law",
    category: "law",
    durationYears: "5 years typical",
    about:
      "Law trains you to read rules as tools: constitutions, codes, contracts, and procedure. The work is less about memorizing slogans and more about applying text to facts, who has standing, what remedy exists, which court has jurisdiction. In Ethiopia the LLB is the standard first degree for advocates and many public-sector legal roles. Expect dense reading, oral argument practice, and written opinions under time pressure. The field rewards precision and patience more than charisma alone.",
    courses: [
      "Constitutional law",
      "Civil and criminal procedure",
      "Contract and property",
      "Commercial and company law",
      "Public international law",
      "Evidence and advocacy",
      "Legal research and drafting",
    ],
    careers: [
      "Advocate / private practice",
      "Prosecutor or court officer tracks",
      "In-house counsel (banks, NGOs, firms)",
      "Policy and legislative drafting",
      "Compliance and contracts in business",
    ],
    market:
      "Domestic demand is steady in urban centers and government. Cross-border work (trade, investment, IP) grows slowly and favors additional language and specialization. Globally, a first law degree is often a stepping stone to an LLM or local qualification exams, not an automatic license abroad. Strong writers who can handle commercial files remain scarce relative to pure volume of graduates.",
    pros: [
      "Clear professional identity and exam pathways",
      "Skills transfer to policy, compliance, and negotiation",
      "High social visibility when you practice well",
    ],
    cons: [
      "Long training and competitive pupillage / placement",
      "Early earnings can lag if you stay generalist",
      "Heavy continuous reading; burnout is real",
    ],
  },
  {
    id: "accounting-finance",
    name: "Accounting and Finance",
    shortName: "Accounting",
    category: "business",
    durationYears: "3–4 years",
    about:
      "This degree is about recording economic reality so decisions can be trusted. Accounting maps transactions into statements; finance asks how capital is raised, priced, and allocated. You will live in ratios, standards, tax rules, and the difference between cash and accrual. Employers hire the degree because it is auditable skill, not because of vague ‘business sense.’ Students who treat it as arithmetic only struggle; those who understand the story behind the numbers advance.",
    courses: [
      "Financial and managerial accounting",
      "Auditing and assurance",
      "Taxation",
      "Corporate finance",
      "Cost accounting",
      "Financial markets and institutions",
      "IFRS / local standards orientation",
    ],
    careers: [
      "Accountant / auditor (public or private)",
      "Financial analyst",
      "Treasury and credit roles in banks",
      "Tax and compliance",
      "Controller track in growing firms",
    ],
    market:
      "Banks, manufacturers, NGOs, and the public sector all need reliable books. Professional certifications (e.g. ACCA path where available) raise mobility. Globally, accounting principles travel better than pure local admin degrees, but you still must learn the jurisdiction’s tax and reporting regime. Automation is removing pure data-entry work; judgment, audit skepticism, and systems literacy are what remain valuable.",
    pros: [
      "Concrete skills employers can test",
      "Multiple exit routes: audit, tax, banking, industry",
      "Certification ladder can raise pay without a new degree",
    ],
    cons: [
      "Entry roles can be repetitive and seasonal (close periods)",
      "Standards and tax law change, continuous updating",
      "Promotion often requires soft skills beyond the ledger",
    ],
  },
  {
    id: "economics",
    name: "Economics",
    shortName: "Economics",
    category: "business",
    durationYears: "3–4 years",
    about:
      "Economics studies how scarce resources are allocated, by prices, policy, institutions, and incentives. Undergraduate programs mix theory (micro, macro) with measurement (statistics, econometrics). The best graduates can move from a model to a real dataset without losing the argument. Weak programs stop at diagram-drawing; strong ones force you to explain growth, inflation, trade, and poverty with evidence. It is not ‘business light’; it is social science with mathematics.",
    courses: [
      "Microeconomics and macroeconomics",
      "Mathematical economics",
      "Statistics and econometrics",
      "Development economics",
      "Monetary and public finance",
      "International trade",
      "Research methods",
    ],
    careers: [
      "Policy analyst (government, think tanks)",
      "Research assistant / junior economist",
      "Banking and research units",
      "Development project monitoring",
      "Graduate study (MSc / policy school)",
    ],
    market:
      "Local demand clusters around finance, planning agencies, and development projects. Pure theory roles are few; applied analysis and data literacy open more doors. Internationally, economics is a recognized base for master’s programs and for roles that need causal thinking. Competition is high among graduates who only have soft qualitative skills without quantitative depth.",
    pros: [
      "Strong foundation for policy and graduate study",
      "Quantitative skill set travels across sectors",
      "Trains clear argument under constraint",
    ],
    cons: [
      "Bachelor-level titles alone rarely unlock senior economist posts",
      "Abstract theory frustrates students who wanted ‘business only’",
      "Job search needs deliberate positioning (data + domain)",
    ],
  },
  {
    id: "management",
    name: "Management",
    shortName: "Management",
    category: "business",
    durationYears: "3–4 years",
    about:
      "Management is the study of organizing people and resources toward goals: strategy, operations, HR, and marketing. Done well, it is evidence-based decision-making under incomplete information. Done poorly, it becomes slogan-heavy coursework with little measurement. Expect case discussions, group projects, and exposure to organizational behavior. Employers value graduates who can run a process, not only describe leadership in abstract terms.",
    courses: [
      "Principles of management",
      "Organizational behavior",
      "Operations and supply chain basics",
      "Marketing management",
      "Human resource management",
      "Strategic management",
      "Entrepreneurship and project management",
    ],
    careers: [
      "Operations / office administration",
      "HR and talent coordination",
      "Sales and account management",
      "Project coordinator",
      "Graduate schemes in large firms",
    ],
    market:
      "Almost every formal organization needs coordinators; the degree is common, so differentiation matters, internships, language, and a specialty (operations, HR, digital marketing). Globally, a general management BA is less portable than accounting or engineering unless paired with experience or an MBA later. In local markets, networks and demonstrated reliability often outweigh the transcript alone.",
    pros: [
      "Broad applicability across private and public sectors",
      "Room to specialize later without restarting from zero",
      "Builds communication and coordination habits",
    ],
    cons: [
      "Crowded graduate pool; ‘management’ alone is a weak signal",
      "Early roles may feel administrative",
      "Theory without internship experience ages quickly",
    ],
  },
  {
    id: "medicine",
    name: "Medicine",
    shortName: "Medicine",
    category: "health",
    durationYears: "6+ years incl. internship",
    about:
      "Medicine prepares physicians to diagnose, treat, and prevent disease. The path is long: preclinical science, clinical rotations, then internship and possible specialty training. You will learn anatomy and physiology not as trivia but as the map for every decision at the bedside. The work demands stamina, ethical judgment, and comfort with uncertainty. It is not a ‘high score’ trophy, it is a public trust profession with real liability and night shifts.",
    courses: [
      "Anatomy, physiology, biochemistry",
      "Pathology and pharmacology",
      "Internal medicine and surgery",
      "Pediatrics and obstetrics",
      "Community / public health",
      "Clinical skills and ethics",
    ],
    careers: [
      "General practitioner / medical officer",
      "Hospital specialty tracks (after further training)",
      "Public health and program roles",
      "Research and teaching (with postgraduate study)",
      "NGO clinical programs",
    ],
    market:
      "Domestic need for clinicians remains high, especially outside major cities, though placement and remuneration vary by region and facility. Specialty training is competitive. International practice almost always requires additional exams and licensing (USMLE, PLAB, etc.). The global shortage of physicians is real, but migration is regulated and expensive, plan years ahead if that is your goal.",
    pros: [
      "Deep professional identity and societal need",
      "Wide specialty options after the base degree",
      "Skills that remain relevant across health system reforms",
    ],
    cons: [
      "Very long training; delayed full earning power",
      "Emotional and physical load; shift work",
      "Bureaucracy and resource limits in many facilities",
    ],
  },
  {
    id: "clinical-pharmacy",
    name: "Clinical Pharmacy",
    shortName: "Pharmacy",
    category: "health",
    durationYears: "5 years typical",
    about:
      "Clinical pharmacy sits between chemistry and the patient: drug action, dosing, interactions, and rational use. You study how medicines are designed and how they behave in the body, then apply that in hospital or community settings. The modern role is not only dispensing, it is preventing harm from therapy and advising the care team. Attention to detail and continuous updating on new agents are non-negotiable.",
    courses: [
      "Pharmaceutical chemistry",
      "Pharmacology and therapeutics",
      "Pharmaceutics",
      "Clinical pharmacy practice",
      "Pharmacokinetics",
      "Pharmacy law and ethics",
      "Hospital attachment",
    ],
    careers: [
      "Hospital / community pharmacist",
      "Clinical pharmacy services",
      "Regulatory and quality roles",
      "Pharmaceutical industry (medical info, QA)",
      "Supply chain for essential medicines",
    ],
    market:
      "Retail and hospital demand is steady where the health system expands. Industry and regulatory posts favor strong science graduates. Internationally, pharmacy licenses are jurisdiction-specific; moving countries usually means new exams. Specialization in clinical services or pharmacovigilance improves the signal beyond a generic title.",
    pros: [
      "Clear applied science with patient impact",
      "Multiple settings: hospital, retail, industry, regulation",
      "Growing emphasis on clinical (not only retail) roles",
    ],
    cons: [
      "Retail shifts and standing work can be tiring",
      "Responsibility for high-risk medicines",
      "Some markets oversupply generalists",
    ],
  },
  {
    id: "public-health",
    name: "Public Health",
    shortName: "Public Health",
    category: "health",
    durationYears: "3–4 years",
    about:
      "Public health focuses on populations rather than single patients: surveillance, prevention, health systems, and the social conditions that drive disease. You will study epidemiology, biostatistics, environmental health, and program management. The discipline is for people who want measurable impact at scale, vaccination coverage, outbreak response, policy, not only bedside care. Writing clear reports and reading data carefully matter as much as fieldwork energy.",
    courses: [
      "Epidemiology",
      "Biostatistics",
      "Environmental and occupational health",
      "Health promotion",
      "Health policy and management",
      "Research methods",
      "Disease control programs",
    ],
    careers: [
      "Health program officer",
      "Surveillance and M&E roles",
      "NGO project staff",
      "Local health administration",
      "Graduate study (MPH) toward specialist tracks",
    ],
    market:
      "Government health bureaus, donors, and NGOs hire continuously for program roles. Funding cycles create both opportunity and job instability. Globally, public health is a strong base for MPH and for technical roles in agencies, but competition for international posts is intense and experience-weighted. Quantitative skill (Stata/R, survey design) separates serious candidates from generalists.",
    pros: [
      "Direct link to prevention and system-level change",
      "Diverse employers: government, NGOs, research",
      "Good bridge to MPH and specialized epidemiology",
    ],
    cons: [
      "Field and desk mix can mean irregular hours during outbreaks",
      "Donor dependence affects contract length",
      "Impact is collective, less individual ‘hero’ feedback than clinical care",
    ],
  },
  {
    id: "nursing",
    name: "Comprehensive Nursing",
    shortName: "Nursing",
    category: "health",
    durationYears: "4 years typical",
    about:
      "Nursing is skilled clinical care at the bedside and in the community: assessment, medication, procedures, patient education, and continuous monitoring. Comprehensive programs blend medical-surgical, maternal, pediatric, and mental health nursing with ethics and professional practice. The work is physical and relational. Graduates who thrive treat protocols as minimum standards, not the ceiling of judgment.",
    courses: [
      "Fundamentals of nursing",
      "Medical-surgical nursing",
      "Maternal and child health",
      "Psychiatric nursing",
      "Community health nursing",
      "Pharmacology for nurses",
      "Clinical practicum",
    ],
    careers: [
      "Staff nurse (hospital / clinic)",
      "Community and outreach nursing",
      "Specialization tracks (ICU, OR, midwifery-related paths where offered)",
      "Nursing education (with further study)",
      "Occupational health roles",
    ],
    market:
      "Hospitals and clinics need nurses continuously; distribution is uneven between cities and rural facilities. International demand is high in several regions, but migration requires language tests, licensing exams, and often years of experience. Local career growth improves with specialty certificates and leadership roles on the ward.",
    pros: [
      "Immediate employability in most health systems",
      "Human impact is visible day to day",
      "Specialty paths after the base degree",
    ],
    cons: [
      "Shift work, emotional load, and physical strain",
      "Hierarchy and resource constraints in some facilities",
      "Burnout risk without boundaries and support",
    ],
  },
  {
    id: "med-lab",
    name: "Medical Laboratory Sciences",
    shortName: "Med Lab",
    category: "health",
    durationYears: "4 years typical",
    about:
      "Laboratory science produces the numbers clinicians act on: blood counts, cultures, chemistry panels, histology. You learn pre-analytical quality, method principles, and how to recognize when a result cannot be trusted. The job is technical and methodical. People who enjoy careful process and troubleshooting instruments do well; those who need constant patient conversation may prefer nursing or medicine.",
    courses: [
      "Clinical chemistry",
      "Hematology",
      "Medical microbiology",
      "Immunology",
      "Histopathology basics",
      "Lab management and quality systems",
      "Practical rotations",
    ],
    careers: [
      "Medical laboratory technologist",
      "Hospital or reference lab scientist",
      "Quality control in diagnostics",
      "Public health laboratory networks",
      "Further study toward specialized lab medicine",
    ],
    market:
      "Diagnostic capacity expansion keeps demand for competent technologists. Private labs and hospitals compete for reliable staff. International moves again depend on local certification. Automation changes daily tasks but does not remove the need for human oversight of quality and complex cases.",
    pros: [
      "Clear technical skill set",
      "Critical to every modern clinical decision",
      "Less shift chaos than some ward roles (varies by lab)",
    ],
    cons: [
      "Repetitive high-volume testing periods",
      "Exposure risks if biosafety lapses",
      "Limited patient-facing variety",
    ],
  },
  {
    id: "computer-science",
    name: "Computer Science",
    shortName: "CS",
    category: "computing",
    durationYears: "3–4 years",
    about:
      "Computer science is the study of computation: algorithms, data structures, systems, and the theory that explains what can be computed efficiently. Good programs force you to implement, not only watch demos. You should leave able to reason about complexity, write correct programs, and understand how software sits on hardware and networks. It is not the same as ‘knowing apps’; it is building and analyzing systems.",
    courses: [
      "Programming and data structures",
      "Algorithms",
      "Computer architecture",
      "Operating systems",
      "Databases",
      "Networks",
      "Software engineering fundamentals",
      "Electives: AI, security, graphics",
    ],
    careers: [
      "Software developer",
      "Backend / systems engineer",
      "Data-oriented roles (with extra stats)",
      "Research assistant / graduate study",
      "Technical product roles in startups",
    ],
    market:
      "Local demand exists in banks, telecom, government digital projects, and product companies, but hiring screens for demonstrable skill (GitHub, projects, interviews), not only the degree title. Globally, CS remains one of the more mobile technical degrees if your English and portfolio are strong. The market punishes graduates who avoided coding practice during university.",
    pros: [
      "High leverage skill set; remote and exportable work possible",
      "Strong base for specialization (security, ML, systems)",
      "Problem-solving training that compounds",
    ],
    cons: [
      "Fast-moving tools; continuous self-study required",
      "Interview culture can be stressful",
      "Sedentary work and screen fatigue",
    ],
  },
  {
    id: "software-engineering",
    name: "Software Engineering",
    shortName: "SE",
    category: "computing",
    durationYears: "4 years typical",
    about:
      "Software engineering emphasizes building reliable systems in teams: requirements, design, testing, version control, and maintenance. Compared with pure CS, the center of gravity is process and product quality over theory for its own sake. You still need solid programming. Graduates should be able to take a vague need and ship a tested feature without drama.",
    courses: [
      "Object-oriented development",
      "Software design and architecture",
      "Requirements engineering",
      "Testing and quality assurance",
      "Project management for software",
      "Databases and web systems",
      "Team project courses",
    ],
    careers: [
      "Software engineer",
      "QA / test automation",
      "DevOps-leaning roles (with extra skills)",
      "Technical analyst in digital projects",
      "Startup builder / technical cofounder path",
    ],
    market:
      "Similar to CS in industry demand, with a slight bias toward delivery and collaboration skills. Employers care about shipped work. International mobility follows the same rules as CS: portfolio, English, and interview performance. Government digitization and private fintech both absorb capable graduates when selection is competence-based.",
    pros: [
      "Practice-oriented; maps cleanly to job tasks",
      "Team project experience is a real differentiator",
      "Path into product and engineering management later",
    ],
    cons: [
      "Weaker theory depth than top CS tracks if the curriculum is thin",
      "Legacy systems and deadline pressure in real jobs",
      "Must keep learning frameworks without clinging to one stack",
    ],
  },
  {
    id: "information-technology",
    name: "Information Technology",
    shortName: "IT",
    category: "computing",
    durationYears: "3–4 years",
    about:
      "IT focuses on applying technology in organizations: networks, administration, support, security basics, and integrating systems that already exist. The emphasis is operational reliability more than inventing new algorithms. Strong graduates understand how to keep services running, document changes, and talk to non-technical users without condescension.",
    courses: [
      "Computer networks",
      "Systems administration",
      "Database administration basics",
      "IT service management",
      "Information security fundamentals",
      "Web and enterprise applications",
      "Practical labs",
    ],
    careers: [
      "System / network administrator",
      "IT support and operations",
      "Junior security operations",
      "Implementation specialist for business software",
      "Infrastructure roles in banks and campuses",
    ],
    market:
      "Every mid-size organization needs IT operations. Pay and prestige lag elite software roles unless you specialize (cloud, security). Certifications (networking, cloud) often matter as much as the degree. Global remote work is less common than for pure development, but regional demand is durable.",
    pros: [
      "Steady local demand",
      "Concrete operational skills",
      "Bridge into cybersecurity with extra training",
    ],
    cons: [
      "Can be ticket-driven and reactive",
      "On-call stress for infrastructure roles",
      "Must specialize to avoid being stuck in entry support",
    ],
  },
  {
    id: "statistics",
    name: "Statistics",
    shortName: "Statistics",
    category: "computing",
    durationYears: "3–4 years",
    about:
      "Statistics is the discipline of learning from data under uncertainty. You study probability, estimation, hypothesis testing, regression, and survey design. In a world full of dashboards, the scarce skill is knowing when a number is trustworthy. Programs that include computing (R, Python) produce graduates who can work; pure chalkboard statistics without practice is harder to place.",
    courses: [
      "Probability theory",
      "Statistical inference",
      "Regression and experimental design",
      "Sampling methods",
      "Time series (where offered)",
      "Statistical computing",
      "Applied projects",
    ],
    careers: [
      "Data analyst",
      "Research statistician (health, agriculture, surveys)",
      "Monitoring and evaluation",
      "Risk and credit analytics (with domain learning)",
      "Graduate study in biostatistics or data science",
    ],
    market:
      "Health research, agriculture surveys, banks, and NGOs need people who can design and analyze data correctly. ‘Data science’ titles attract noise; solid statistics plus coding still wins serious roles. Internationally, the degree pairs well with master’s programs in biostatistics and quantitative social science.",
    pros: [
      "Transferable across sectors",
      "High leverage when paired with domain knowledge",
      "Foundation for modern data careers without hype",
    ],
    cons: [
      "Abstract probability challenges many students",
      "Must learn tools employers use, not only theory",
      "Job titles vary; self-marketing is required",
    ],
  },
  {
    id: "biology",
    name: "Biology",
    shortName: "Biology",
    category: "sciences",
    durationYears: "3–4 years",
    about:
      "Biology is the science of living systems, from molecules to ecosystems. Undergraduate study covers cell biology, genetics, physiology, ecology, and laboratory method. The degree is a foundation, not a finished professional license. Graduates who succeed plan early for a direction: research, health-related pathways, education, or applied biotech.",
    courses: [
      "Cell and molecular biology",
      "Genetics",
      "Microbiology",
      "Physiology",
      "Ecology",
      "Biochemistry",
      "Lab techniques and research methods",
    ],
    careers: [
      "Lab technician / research assistant",
      "Environmental and conservation roles",
      "Health-adjacent support roles",
      "Science teaching (with education credentials)",
      "Graduate study (biotech, biomedical, ecology)",
    ],
    market:
      "Pure bachelor biology roles are limited compared with professional health degrees. Value rises with lab skill, fieldwork experience, or a clear postgraduate plan. Globally, biology is a standard path into research master’s and PhD tracks. Local biotech industry is still developing; NGOs and universities absorb many graduates.",
    pros: [
      "Deep understanding of life systems",
      "Flexible base for many postgraduate routes",
      "Lab and field skills are concrete",
    ],
    cons: [
      "Weaker direct employability than medicine, nursing, or engineering",
      "May need MSc for research careers",
      "Funding for pure science roles can be tight",
    ],
  },
  {
    id: "chemistry",
    name: "Chemistry",
    shortName: "Chemistry",
    category: "sciences",
    durationYears: "3–4 years",
    about:
      "Chemistry explains matter by structure and reaction. You work through inorganic, organic, physical, and analytical chemistry with substantial lab time. Precision, safety habits, and honest data recording define the culture. The degree supports industry, further study, and teaching, not a single narrow job title.",
    courses: [
      "General and inorganic chemistry",
      "Organic chemistry",
      "Physical chemistry",
      "Analytical chemistry",
      "Instrumental methods",
      "Laboratory practice",
      "Industrial or environmental electives",
    ],
    careers: [
      "Quality control / analytical lab",
      "Chemical industry technician",
      "Environmental sampling and analysis",
      "Teaching",
      "Graduate study (pharma, materials, pure chemistry)",
    ],
    market:
      "QC labs, manufacturing, and environmental monitoring hire practical chemists. Pharmaceutical and advanced materials paths often need postgraduate study. International research mobility depends on publications and advisor networks more than the bachelor alone.",
    pros: [
      "Rigorous lab discipline employers respect",
      "Multiple industry and research doorways",
      "Strong preparation for pharmacy-adjacent or materials paths",
    ],
    cons: [
      "Lab hazards if standards slip",
      "Some roles are routine analytical work",
      "Advanced R&D usually needs further degrees",
    ],
  },
  {
    id: "mathematics",
    name: "Mathematics",
    shortName: "Math",
    category: "sciences",
    durationYears: "3–4 years",
    about:
      "Mathematics trains abstraction and proof: analysis, algebra, and the structures underneath applied science. Undergraduate math is less about calculator speed and more about argument. Students who enjoy precise reasoning thrive; those seeking immediate vocational labels may feel adrift unless they add computing or statistics intentionally.",
    courses: [
      "Calculus and analysis",
      "Linear algebra",
      "Abstract algebra",
      "Probability",
      "Differential equations",
      "Numerical methods (where offered)",
      "Electives toward applied or pure tracks",
    ],
    careers: [
      "Data and quant-adjacent roles (with coding)",
      "Teaching",
      "Actuarial or risk paths (extra exams)",
      "Graduate study in math, stats, or economics",
      "Technical roles that need modeling",
    ],
    market:
      "Pure math bachelor employment is rarely ‘mathematician’ by title. The degree is a signal of cognitive strength when paired with programming, finance knowledge, or education credentials. Globally it remains a respected base for theoretical and quantitative master’s programs.",
    pros: [
      "Exceptional training in rigorous thought",
      "Opens graduate doors across quantitative fields",
      "Long shelf life of core ideas",
    ],
    cons: [
      "Must add applied skills for many private-sector jobs",
      "Abstract curriculum can feel disconnected from daily work",
      "Teaching may require separate pedagogical certification",
    ],
  },
  {
    id: "physics",
    name: "Physics",
    shortName: "Physics",
    category: "sciences",
    durationYears: "3–4 years",
    about:
      "Physics models nature with mathematics: mechanics, electromagnetism, thermodynamics, quantum ideas, and experiment. The habit it builds, reduce a system to governing principles, is valuable beyond the lab. Like mathematics, the bachelor is often a platform rather than a terminal professional degree.",
    courses: [
      "Classical mechanics",
      "Electromagnetism",
      "Thermodynamics and statistical physics",
      "Modern / quantum physics",
      "Laboratory and instrumentation",
      "Computational physics (where offered)",
    ],
    careers: [
      "Lab and instrumentation roles",
      "Teaching",
      "Technical industry posts",
      "Graduate study (engineering-physics, applied physics)",
      "Data and modeling roles with extra computing",
    ],
    market:
      "Direct physics job titles are limited locally; applied paths (electronics, energy, computing) absorb graduates who gain practical skills. International research careers are PhD-centric. Students should plan the second step while still undergraduates.",
    pros: [
      "Deep problem-solving culture",
      "Strong base for engineering-leaning graduate work",
      "Experimental skill is transferable",
    ],
    cons: [
      "Sparse pure-physics posts at bachelor level",
      "Heavy math load",
      "Needs intentional career bridging",
    ],
  },
  {
    id: "agri-economics",
    name: "Agricultural Economics",
    shortName: "Agri-Econ",
    category: "agriculture",
    durationYears: "3–4 years",
    about:
      "Agricultural economics applies economic tools to farms, value chains, and food systems: prices, credit, cooperatives, trade, and policy. You study how producers decide and how markets fail or work. It is quantitative social science rooted in a sector that still employs a large share of the population. Graduates who can combine survey skills with clear policy writing are useful; pure description without analysis is not.",
    courses: [
      "Micro and macro for agriculture",
      "Farm management",
      "Agricultural marketing",
      "Rural finance",
      "Econometrics / quantitative methods",
      "Agricultural policy",
      "Value chain analysis",
    ],
    careers: [
      "Agribusiness analyst",
      "Cooperative and rural development projects",
      "Policy and extension-linked analysis",
      "NGO livelihoods programs",
      "Credit and input market roles",
    ],
    market:
      "Development projects, agribusiness firms, and public agriculture institutions hire applied economists. International organizations value the combination of economics and sector knowledge. Competition increases when graduates lack quantitative depth.",
    pros: [
      "Direct relevance to national food and rural systems",
      "Blend of economics and applied fieldwork",
      "Multiple NGO and public employers",
    ],
    cons: [
      "Project funding cycles affect job stability",
      "Field travel can be demanding",
      "Must stay sharp on data methods",
    ],
  },
  {
    id: "animal-sciences",
    name: "Animal Sciences",
    shortName: "Animal Sci",
    category: "agriculture",
    durationYears: "3–4 years",
    about:
      "Animal sciences covers livestock production: nutrition, breeding, health management at herd level, and product quality. It is applied biology aimed at productivity and sustainability, not a substitute for veterinary clinical training. Expect labs, farms, and production systems thinking.",
    courses: [
      "Animal physiology and nutrition",
      "Genetics and breeding",
      "Livestock production systems",
      "Pasture and forage",
      "Animal products",
      "Farm practice",
    ],
    careers: [
      "Livestock production officer",
      "Farm and ranch management support",
      "Feed and input companies",
      "Extension and development projects",
      "Further study toward specialized production science",
    ],
    market:
      "Livestock remains central to rural livelihoods and national protein supply. Employers include public extension, private farms, and NGOs. Clinical diagnosis belongs to veterinarians; animal science graduates who respect that boundary and excel at production systems do better.",
    pros: [
      "Hands-on sector with clear national relevance",
      "Bridge between biology and farm enterprise",
      "Room to specialize (dairy, poultry, etc.)",
    ],
    cons: [
      "Field conditions can be tough",
      "Not a license to practice veterinary medicine",
      "Modern employers expect data and business literacy too",
    ],
  },
  {
    id: "plant-sciences",
    name: "Plant Sciences",
    shortName: "Plant Sci",
    category: "agriculture",
    durationYears: "3–4 years",
    about:
      "Plant sciences focuses on crops: physiology, breeding, protection, and agronomic practice. The goal is higher, more reliable yields under real constraints, soil, water, pests, climate. You learn to diagnose field problems and recommend practices grounded in evidence, not folklore.",
    courses: [
      "Crop physiology",
      "Soil–plant relations",
      "Plant breeding basics",
      "Entomology and plant pathology",
      "Agronomy",
      "Field experimentation",
    ],
    careers: [
      "Agronomist / crop officer",
      "Seed and input companies",
      "Research stations and trials",
      "Extension and agribusiness advisory",
      "Graduate study in breeding or crop science",
    ],
    market:
      "Seed companies, research institutes, and development programs need practical plant scientists. Climate stress and food demand keep the problem space large. International agricultural research centers recruit strong technical profiles, usually with postgraduate credentials for scientist ranks.",
    pros: [
      "Tangible impact on food production",
      "Field + lab combination",
      "Clear industry partners (seed, fertilizer, research)",
    ],
    cons: [
      "Seasonal workload and outdoor exposure",
      "Advanced breeding roles need further study",
      "Must integrate economics to advise farms well",
    ],
  },
  {
    id: "nrm",
    name: "Natural Resource Management",
    shortName: "NRM",
    category: "agriculture",
    durationYears: "3–4 years",
    about:
      "Natural resource management addresses land, water, forests, and biodiversity under human use. The core tension is livelihoods versus long-term ecological limits. Programs mix ecology, policy, GIS basics, and community practice. Graduates should be able to read a landscape and a stakeholder map at the same time.",
    courses: [
      "Ecology and conservation",
      "Watershed and land management",
      "Forest and wildlife basics",
      "Environmental policy",
      "GIS / remote sensing introduction",
      "Participatory planning methods",
    ],
    careers: [
      "Natural resource / watershed officer",
      "Conservation and NGO field roles",
      "Environmental compliance support",
      "Community-based resource projects",
      "Further study in environmental science",
    ],
    market:
      "Public agencies and environmental NGOs are primary employers. Climate adaptation funding creates project roles with variable duration. Technical GIS skill and sober field judgment improve hireability over purely rhetorical environmentalism.",
    pros: [
      "Work tied to urgent land and climate problems",
      "Interdisciplinary by nature",
      "NGO and public sector pathways",
    ],
    cons: [
      "Project-based contracts common",
      "Field hardship in remote sites",
      "Progress can be politically constrained",
    ],
  },
  {
    id: "veterinary-dvm",
    name: "Veterinary Medicine (DVM)",
    shortName: "Veterinary",
    category: "veterinary",
    durationYears: "6 years typical",
    about:
      "The DVM trains clinicians for animal health: diagnosis, surgery, herd medicine, and public health interfaces (zoonoses, food safety). Training is long and intensive, combining biomedical science with clinical rotations. You are responsible for patients that cannot describe their symptoms and for owners under economic stress. It is a medical profession with its own ethics and emergency culture.",
    courses: [
      "Animal anatomy and physiology",
      "Pathology and pharmacology",
      "Medicine and surgery",
      "Theriogenology",
      "Preventive medicine",
      "Public health and epidemiology",
      "Clinical rotations",
    ],
    careers: [
      "Clinical veterinarian (clinic or ambulatory)",
      "Herd health for commercial farms",
      "Government veterinary services",
      "Food safety and quarantine roles",
      "Further specialty training",
    ],
    market:
      "Livestock economies sustain demand for veterinarians, especially outside capitals. Private clinics grow in cities with companion animals. International practice requires local licensing. Public health veterinary roles expand where One Health programs are funded.",
    pros: [
      "Clear professional status",
      "Mix of science, procedure, and field work",
      "Importance to food systems and zoonotic control",
    ],
    cons: [
      "Long training; emotional weight of clinical outcomes",
      "Physical risk in large-animal work",
      "Income varies sharply by location and client base",
    ],
  },
  {
    id: "psychology",
    name: "Psychology",
    shortName: "Psychology",
    category: "education",
    durationYears: "3–4 years",
    about:
      "Psychology studies behavior and mental processes: development, learning, social influence, assessment, and mental health. Undergraduate training builds literacy in research methods and major theories. It does not by itself license independent clinical practice in most systems, postgraduate training and regulation matter. Students should be honest about whether they want science, counseling pathways, or organizational roles.",
    courses: [
      "Introduction to psychology",
      "Developmental psychology",
      "Social psychology",
      "Cognitive psychology",
      "Research methods and statistics",
      "Psychopathology overview",
      "Counseling foundations (where offered)",
    ],
    careers: [
      "HR and organizational support",
      "School and community program roles",
      "Research assistant",
      "Counseling pathways (with further training)",
      "Graduate study (clinical, counseling, industrial)",
    ],
    market:
      "Clinical titles are regulated; do not assume a BA equals therapist. HR, education support, and NGO psychosocial programs hire psychology graduates with strong interpersonal skill. International clinical careers require accredited postgraduate training. Research literacy is a competitive edge.",
    pros: [
      "Insight into human behavior useful across careers",
      "Foundation for specialized mental health training",
      "Research methods transfer to many social roles",
    ],
    cons: [
      "Bachelor alone rarely qualifies clinical practice",
      "Emotional labor in helping roles",
      "Must plan credentials deliberately",
    ],
  },
  {
    id: "ed-planning",
    name: "Educational Planning and Management",
    shortName: "Ed. Planning",
    category: "education",
    durationYears: "3–4 years",
    about:
      "This field treats education as a system to be planned, financed, and managed: schools, staffing, curriculum delivery, and policy. It is for people who want to improve how learning is organized, not only teach a single classroom. Expect policy analysis, statistics for education, and institutional leadership themes.",
    courses: [
      "Education systems and policy",
      "School leadership",
      "Educational planning techniques",
      "Economics of education",
      "Monitoring and evaluation in education",
      "Human resource management in schools",
    ],
    careers: [
      "Education office administration",
      "School leadership tracks",
      "Program officer for education NGOs",
      "Planning and EMIS-related roles",
      "Policy support in ministries and projects",
    ],
    market:
      "Public education systems and donor-funded projects employ planners and managers. Advancement often mixes formal credentials with years inside the system. International education development roles prefer experience plus, frequently, a master’s.",
    pros: [
      "Direct contribution to how schools run",
      "Public and NGO employment paths",
      "Systems view beyond single classroom",
    ],
    cons: [
      "Bureaucracy can slow change",
      "Political context shapes what is possible",
      "Field credibility grows with experience, not only the degree",
    ],
  },
  {
    id: "journalism",
    name: "Journalism and Mass Communication",
    shortName: "Journalism",
    category: "communication",
    durationYears: "3–4 years",
    about:
      "Journalism and mass communication train you to gather facts, verify them, and deliver stories across print, broadcast, and digital channels. Ethics, law, and audience awareness sit beside reporting craft. The industry is under economic pressure everywhere; graduates who can report cleanly, edit carefully, and understand digital distribution have better odds than those chasing only on-camera glamour.",
    courses: [
      "News writing and reporting",
      "Media ethics and law",
      "Broadcast and digital media",
      "Public relations basics",
      "Research and audience studies",
      "Multimedia production",
    ],
    careers: [
      "Reporter / correspondent",
      "Editor and content producer",
      "Communications officer (NGO, corporate)",
      "Public relations",
      "Digital content strategy roles",
    ],
    market:
      "Newsroom hiring is selective; many graduates move into institutional communications. Language skill (including English) and a visible portfolio matter more than the transcript. Globally, media is competitive and often freelance-heavy. Credibility and safety awareness are professional requirements, not optional ideals.",
    pros: [
      "Strong writing and interviewing skills",
      "Multiple channels: news, PR, digital",
      "Public-interest impact when done honestly",
    ],
    cons: [
      "Unstable industry economics",
      "Pressure, deadlines, and occasional risk",
      "Must build a portfolio early",
    ],
  },
  {
    id: "english",
    name: "English Language and Literature",
    shortName: "English",
    category: "communication",
    durationYears: "3–4 years",
    about:
      "English studies combine advanced language skill with literature and critical reading. You analyze texts, write with control, and learn how arguments are built in prose. In a globalized labor market, high-level English is infrastructure for many careers. The degree is strongest when treated as rigorous language and thought training, not as passive novel-reading.",
    courses: [
      "Advanced composition",
      "Linguistics foundations",
      "British and other literatures",
      "Literary criticism",
      "Communication skills",
      "Research writing",
    ],
    careers: [
      "Teaching English (with credentials)",
      "Editing and content roles",
      "Communications and administration",
      "Translation support (with bilingual strength)",
      "Graduate study in humanities or education",
    ],
    market:
      "Schools, publishers, NGOs, and offices need people who write and speak precisely. International education and remote content work favor proven English proficiency. Pairing the degree with a practical skill (digital media, business, law interest) improves outcomes.",
    pros: [
      "Elite communication skill in a global language",
      "Flexible gateway into education and media",
      "Trains careful reading, rare and useful",
    ],
    cons: [
      "Not a narrow vocational license",
      "Must add practical experience for competitive roles",
      "Teaching may require separate certification",
    ],
  },
];

export function getDepartment(id: string) {
  return departments.find((d) => d.id === id);
}

export function departmentsByCategory(category: DepartmentCategoryId) {
  return departments.filter((d) => d.category === category);
}
