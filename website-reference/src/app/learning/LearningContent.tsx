"use client";

import { useEffect, useState, useMemo, useCallback, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import {
  BookOpen,
  Layers,
  FileText,
  Award,
  HelpCircle,
  Timer,
  Calendar,
  CalendarDays,
  BarChart3,
  CheckSquare,
  Folder,
  Plus,
  Trash2,
  Copy,
  Check,
  Flame,
  ArrowRight,
  TrendingUp,
  Settings2,
  X,
  ArrowLeft,
  LayoutGrid,
  ChevronRight,
  Calculator as CalcIcon,
  Sparkles,
  LifeBuoy,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { packageImages } from "@/data/packages";
import {
  STORAGE_ENROLLED_COURSES,
  getDefaultPackagesForAcademicLevel,
} from "@/lib/academic-levels";
import { getFullProfile, type UserProfileRecord } from "@/lib/profile";
import PomodoroTimer from "@/components/learning/PomodoroTimer";
import StudyPlanner from "@/components/learning/StudyPlanner";
import StudentAnalyticsDashboard from "@/components/StudentAnalyticsDashboard";
import ScientificCalculator from "@/components/learning/ScientificCalculator";
import AiTutor from "@/components/learning/AiTutor";
import { isOverlayOrStandaloneMode, closeToolOverlay } from "@/lib/native-app";

// Games commented out per request - code preserved in repository
// import TowerDefenseGame from "@/components/games/tower-defense/TowerDefenseGame";
// import TowerClimbApp from "@/components/games/tower-climb/TowerClimbApp";

// ── Types ───────────────────────────────────────────────────────
export interface NoteSheet {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
}

export interface NoteFolder {
  id: string;
  name: string;
  sheets: NoteSheet[];
}

export interface StudyGoalItem {
  id: string;
  text: string;
  completed: boolean;
  priority: "high" | "medium" | "low";
}

export interface AcademicResultItem {
  id: string;
  title: string;
  total: number;
  correct: number;
  missed: number;
  percent: number;
  created_at: string;
}

export type FeatureKey =
  | "timer"
  | "planner"
  | "goals"
  | "notes"
  | "calculator"
  | "tutor"
  | "analytics"
  | "courses";

const STORAGE_NOTEBOOK_KEY = "wt_student_notebook_v5";
const STORAGE_GOALS_KEY = "wt_student_goals_v5";

// All available packages with verified official imagery and routes
const AVAILABLE_COURSES = [
  {
    id: "freshman",
    title: "Freshman University Courses",
    level: "Higher Education",
    path: "/academy/freshman",
    image: packageImages["freshman"],
    desc: "All 17 first-year university subjects with official textbooks, lecture notes & model exams.",
  },
  {
    id: "coc",
    title: "COC Comprehensive Package",
    level: "Professional & University",
    path: "/academy/coc",
    image: packageImages["coc"],
    desc: "Certificate of Competency exam modules, practical assessments, and freshman university preparation.",
  },
  {
    id: "ece",
    title: "3rd Year (ECE) Engineering",
    level: "University Special",
    path: "/academy/special-packages/electrical-computer-engineering",
    image: "/images/special-packages/ece.jpg",
    desc: "Electrical and Computer Engineering semester modules, laboratory notes, and past exams.",
  },
  {
    id: "grade-12",
    title: "Grade 12 Package",
    level: "Secondary Matric",
    path: "/academy/grades/12",
    image: packageImages["grade-12"],
    desc: "National matriculation past papers, chapter question drills & timed exam simulations.",
  },
  {
    id: "grade-11",
    title: "Grade 11 Package",
    level: "Secondary Stream",
    path: "/academy/grades/11",
    image: packageImages["grade-11"],
    desc: "Natural & Social science textbooks, high-yield summaries & formula recall flashcards.",
  },
  {
    id: "uat",
    title: "AAU UAT Entrance Exam",
    level: "University Entrance",
    path: "/academy/uat",
    image: packageImages["uat"],
    desc: "Undergraduate Aptitude Test drills, quantitative reasoning & past exam solutions.",
  },
  {
    id: "grade-10",
    title: "Grade 10 Package",
    level: "Secondary Core",
    path: "/academy/grades/10",
    image: packageImages["grade-10"],
    desc: "Concept mastery, stream preparation drills & practice question banks.",
  },
  {
    id: "grade-9",
    title: "Grade 9 Package",
    level: "Secondary Foundation",
    path: "/academy/grades/9",
    image: packageImages["grade-9"],
    desc: "Core syllabus subjects, chapter-by-chapter summaries & foundation quizzes.",
  },
  {
    id: "remedial",
    title: "Remedial Program",
    level: "University Catch-Up",
    path: "/academy/remedial",
    image: packageImages["remedial"],
    desc: "Remedial program modules, revision quizzes & preparation drills.",
  },
  {
    id: "gat",
    title: "AAU GAT Graduate Aptitude",
    level: "Postgraduate",
    path: "/academy/gat",
    image: packageImages["gat"],
    desc: "Graduate Aptitude Test analytics, logical reasoning, and verbal drill questions.",
  },
];

// ── Tool Deep-Link Param Normalizer ─────────────────────────────
export function normalizeToolParam(raw: string | null | undefined): FeatureKey | null {
  if (!raw) return null;
  const clean = raw.trim().toLowerCase().replace(/[-_ ]/g, "");
  switch (clean) {
    case "timer":
    case "pomodoro":
    case "focus":
    case "clock":
      return "timer";
    case "planner":
    case "studyplanner":
    case "schedule":
    case "plan":
    case "calendar":
      return "planner";
    case "goals":
    case "targets":
    case "target":
    case "goal":
      return "goals";
    case "notes":
    case "notebook":
    case "note":
    case "scholarnotes":
      return "notes";
    case "calc":
    case "calculator":
    case "scientific":
    case "scientificcalculator":
      return "calculator";
    case "tutor":
    case "aitutor":
    case "ai":
    case "chat":
    case "ask":
      return "tutor";
    case "status":
    case "analytics":
    case "stats":
    case "progress":
    case "yourstatus":
      return "analytics";
    case "courses":
    case "curriculum":
    case "syllabus":
    case "mycourses":
    case "course":
      return "courses";
    default:
      return null;
  }
}

export default function LearningContent({
  initialTool,
}: {
  initialTool?: FeatureKey | null;
}) {
  const searchParams = useSearchParams();

  // Helper to extract param from searchParams or direct window.location fallback in WebViews
  const getToolFromLocation = useCallback((): FeatureKey | null => {
    // 1. Next.js useSearchParams
    const fromNext =
      searchParams?.get("tool") ||
      searchParams?.get("tab") ||
      searchParams?.get("feature");
    const normalizedNext = normalizeToolParam(fromNext);
    if (normalizedNext) return normalizedNext;

    // 2. Direct window.location check (vital for Android/iOS WebViews & direct links)
    if (typeof window !== "undefined") {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const fromWindow =
          urlParams.get("tool") ||
          urlParams.get("tab") ||
          urlParams.get("feature");
        const normalizedWindow = normalizeToolParam(fromWindow);
        if (normalizedWindow) return normalizedWindow;

        // Hash query check (e.g. #/learning?tool=calculator)
        if (window.location.hash && window.location.hash.includes("?")) {
          const hashQuery = window.location.hash.substring(window.location.hash.indexOf("?"));
          const hashParams = new URLSearchParams(hashQuery);
          const fromHash =
            hashParams.get("tool") ||
            hashParams.get("tab") ||
            hashParams.get("feature");
          const normalizedHash = normalizeToolParam(fromHash);
          if (normalizedHash) return normalizedHash;
        }

        // Full href regex match fallback for WebView wrappers
        const match = window.location.href.match(/[?&](?:tool|tab|feature)=([^&#]+)/i);
        if (match && match[1]) {
          const normalizedHref = normalizeToolParam(decodeURIComponent(match[1]));
          if (normalizedHref) return normalizedHref;
        }
      } catch {}
    }
    return null;
  }, [searchParams]);

  // Selected tool feature (null = Hub Cards Deck; string = Opened Tool View)
  const [activeFeature, setActiveFeature] = useState<FeatureKey | null>(() => {
    if (initialTool) return initialTool;
    return getToolFromLocation();
  });

  // Standalone / Overlay mode check
  const [isStandalone, setIsStandalone] = useState<boolean>(() => {
    return isOverlayOrStandaloneMode();
  });

  useEffect(() => {
    if (isOverlayOrStandaloneMode()) {
      setIsStandalone(true);
      if (typeof document !== "undefined") {
        document.documentElement.classList.add("wta-tool-overlay");
        document.body.classList.add("wta-tool-overlay");
      }
    }
  }, []);

  // Dedicated Mobile View for AI Tutor: locks viewport, suppresses site header, footer & nav clutter
  useEffect(() => {
    if (typeof document === "undefined") return;

    const syncTutorClasses = () => {
      const isMobile = window.innerWidth < 640;
      if (activeFeature === "tutor") {
        if (isMobile) {
          document.documentElement.classList.add("wta-tutor-active");
          document.body.classList.add("wta-tutor-active");
        } else {
          document.documentElement.classList.remove("wta-tutor-active");
          document.body.classList.remove("wta-tutor-active");
        }
      } else {
        document.documentElement.classList.remove("wta-tutor-active");
        document.body.classList.remove("wta-tutor-active");
      }
    };

    syncTutorClasses();
    window.addEventListener("resize", syncTutorClasses);

    return () => {
      window.removeEventListener("resize", syncTutorClasses);
      document.documentElement.classList.remove("wta-tutor-active");
      document.body.classList.remove("wta-tutor-active");
    };
  }, [activeFeature]);

  // Sync with initialTool prop from server navigation
  useEffect(() => {
    if (initialTool !== undefined) {
      setActiveFeature((prev) => (prev !== initialTool ? initialTool : prev));
    }
  }, [initialTool]);

  // Open tool helper that synchronizes both state and URL
  const openTool = useCallback((tool: FeatureKey) => {
    setActiveFeature(tool);
    if (typeof window !== "undefined") {
      try {
        const url = new URL(window.location.href);
        url.searchParams.set("tool", tool);
        url.searchParams.delete("tab");
        url.searchParams.delete("feature");
        window.history.pushState(null, "", url.pathname + url.search);
      } catch {}
    }
  }, []);

  const router = useRouter();

  // Bulletproof close helper: notifies native app bridge, restores prior study place, or returns to tools grid
  const closeActiveTool = useCallback(() => {
    const current = activeFeature;
    setActiveFeature(null);

    if (typeof window !== "undefined") {
      // 1. Notify native app bridge if present
      const dismissedByBridge = closeToolOverlay(current || undefined);
      if (dismissedByBridge) {
        return;
      }

      try {
        const url = new URL(window.location.href);
        const rawReturnTo =
          url.searchParams.get("returnTo") ||
          url.searchParams.get("from") ||
          url.searchParams.get("back");

        const savedStudyPath = sessionStorage.getItem("wt_prior_study_route");

        // Clean query params so URL is neat
        url.searchParams.delete("tool");
        url.searchParams.delete("tab");
        url.searchParams.delete("feature");
        url.searchParams.delete("returnTo");
        url.searchParams.delete("from");
        url.searchParams.delete("back");
        window.history.replaceState(null, "", url.pathname + (url.search ? url.search : ""));

        // 1. Explicit returnTo target in query params
        if (rawReturnTo) {
          const returnTo = decodeURIComponent(rawReturnTo);
          if (returnTo && returnTo.startsWith("/") && !returnTo.startsWith("/learning?tool=")) {
            if (returnTo === "/learning" || returnTo.startsWith("/learning?")) {
              setActiveFeature(null);
              return;
            }
            router.push(returnTo);
            return;
          }
        }

        // 2. Saved prior study route in sessionStorage (e.g. question bank, lecture note, syllabus)
        if (
          savedStudyPath &&
          savedStudyPath.startsWith("/") &&
          !savedStudyPath.startsWith("/learning?tool=")
        ) {
          if (savedStudyPath === "/learning" || savedStudyPath.startsWith("/learning?")) {
            setActiveFeature(null);
            return;
          }
          sessionStorage.removeItem("wt_prior_study_route");
          router.push(savedStudyPath);
          return;
        }

        // 3. Referrer is internal deep study content
        if (
          document.referrer &&
          document.referrer.includes(window.location.host) &&
          !document.referrer.includes("/learning")
        ) {
          window.history.back();
          return;
        }

        // 4. In standalone mode and history has a prior page
        if (isStandalone && window.history.length > 1) {
          window.history.back();
          return;
        }
      } catch {}
    }
  }, [router, activeFeature, isStandalone]);

  // Re-sync on searchParams update, client navigation, or popstate event
  useEffect(() => {
    const syncFromLocation = () => {
      const detected = getToolFromLocation();
      setActiveFeature((prev) => (prev !== detected ? detected : prev));
    };
    syncFromLocation();
    window.addEventListener("popstate", syncFromLocation);
    return () => window.removeEventListener("popstate", syncFromLocation);
  }, [searchParams, getToolFromLocation]);

  useEffect(() => {
    if (activeFeature) {
      window.__wtaInPageBack = () => {
        closeActiveTool();
        return true;
      };
    } else {
      if (typeof window !== "undefined" && window.__wtaInPageBack) {
        window.__wtaInPageBack = undefined;
      }
    }
    return () => {
      if (typeof window !== "undefined" && window.__wtaInPageBack) {
        window.__wtaInPageBack = undefined;
      }
    };
  }, [activeFeature, closeActiveTool]);

  // User details
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState("Scholar");
  const [userEmail, setUserEmail] = useState("");
  const [studentId, setStudentId] = useState("WTA-7749");
  const [streakDays, setStreakDays] = useState(1);
  const [userProfile, setUserProfile] = useState<UserProfileRecord | null>(null);

  // Enrolled courses state (defaults to Freshman + COC or level-specific)
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>([
    "freshman",
    "coc",
  ]);
  const [showCourseManager, setShowCourseManager] = useState(false);

  // Daily goals state
  const [goals, setGoals] = useState<StudyGoalItem[]>([]);
  const [newGoalText, setNewGoalText] = useState("");
  const [newGoalPriority, setNewGoalPriority] = useState<"high" | "medium" | "low">("high");

  // Notes state
  const [folders, setFolders] = useState<NoteFolder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string>("");
  const [selectedSheetId, setSelectedSheetId] = useState<string>("");
  const [copiedNotice, setCopiedNotice] = useState(false);

  // Results analytics state
  const [results, setResults] = useState<AcademicResultItem[]>([]);

  // 1. Initial Load: User Auth & LocalStorage
  useEffect(() => {
    // Auth profile
    supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user;
      if (user) {
        setUserId(user.id);
        const nameMeta = user.user_metadata?.name || user.user_metadata?.full_name;
        if (nameMeta) setUserName(nameMeta);
        if (user.email) setUserEmail(user.email);
        const code = user.id.replace(/-/g, "").slice(0, 4).toUpperCase();
        setStudentId(`WTA-${code}`);

        getFullProfile(user.id).then((p) => {
          if (p) setUserProfile(p);
        });

        // If no saved courses in localStorage yet, initialize from user's education_level
        const savedEnrolled = localStorage.getItem(STORAGE_ENROLLED_COURSES);
        if (savedEnrolled === null) {
          const edu = user.user_metadata?.education_level;
          const defaults = getDefaultPackagesForAcademicLevel(edu);
          setEnrolledCourseIds(defaults);
          localStorage.setItem(STORAGE_ENROLLED_COURSES, JSON.stringify(defaults));
        }
      }
    });

    // Enrolled courses from localStorage
    try {
      const savedEnrolled = localStorage.getItem(STORAGE_ENROLLED_COURSES);
      if (savedEnrolled !== null) {
        const parsed = JSON.parse(savedEnrolled);
        if (Array.isArray(parsed)) {
          setEnrolledCourseIds(parsed);
        }
      }
    } catch {
      /* ignore */
    }

    const handleStorageUpdate = (e: StorageEvent) => {
      if (e.key === STORAGE_ENROLLED_COURSES || e.key === null) {
        try {
          const raw = localStorage.getItem(STORAGE_ENROLLED_COURSES);
          if (raw !== null) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
              setEnrolledCourseIds(parsed);
            }
          }
        } catch {}
      }
    };
    window.addEventListener("storage", handleStorageUpdate);

    // Daily Goals
    try {
      const savedGoals = localStorage.getItem(STORAGE_GOALS_KEY);
      if (savedGoals) {
        const parsed = JSON.parse(savedGoals);
        if (Array.isArray(parsed)) setGoals(parsed);
      } else {
        const defaultGoals: StudyGoalItem[] = [
          { id: "g1", text: "Complete 15 Model Exam Questions", completed: true, priority: "high" },
          { id: "g2", text: "Review Freshman Physics Lecture Notes", completed: false, priority: "high" },
          { id: "g3", text: "Practice 10 Quantitative Aptitude Problems", completed: false, priority: "medium" },
        ];
        setGoals(defaultGoals);
        localStorage.setItem(STORAGE_GOALS_KEY, JSON.stringify(defaultGoals));
      }
    } catch {
      /* ignore */
    }

    // Notebook
    try {
      const savedNotes = localStorage.getItem(STORAGE_NOTEBOOK_KEY);
      if (savedNotes) {
        const parsed = JSON.parse(savedNotes);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setFolders(parsed);
          setSelectedFolderId(parsed[0].id);
          if (parsed[0].sheets?.length > 0) {
            setSelectedSheetId(parsed[0].sheets[0].id);
          }
        }
      } else {
        const defaultFolders: NoteFolder[] = [
          {
            id: "f-freshman",
            name: "Freshman Year",
            sheets: [
              {
                id: "s-math",
                title: "Applied Mathematics Formulas",
                content:
                  "Derivative shortcuts:\n- d/dx(x^n) = n*x^(n-1)\n- d/dx(sin x) = cos x\n- d/dx(e^x) = e^x\n\nIntegrals:\n- ∫ x^n dx = (x^(n+1))/(n+1) + C\n- ∫ 1/x dx = ln|x| + C",
                updatedAt: new Date().toISOString(),
              },
              {
                id: "s-phys",
                title: "General Physics Mechanics Summary",
                content:
                  "Newton's Laws:\n1. Inertia: An object remains at rest or constant velocity unless acted upon.\n2. F = ma (Force = Mass × Acceleration)\n3. Action & Reaction: Equal and opposite forces.",
                updatedAt: new Date().toISOString(),
              },
            ],
          },
          {
            id: "f-exams",
            name: "Entrance & Exit Notes",
            sheets: [
              {
                id: "s-uat",
                title: "UAT Aptitude Shortcuts",
                content:
                  "Percentage calculations:\n- 15% of X = (10% of X) + (half of 10% of X)\n- Speed = Distance / Time\n- Work = Rate × Time",
                updatedAt: new Date().toISOString(),
              },
            ],
          },
        ];
        setFolders(defaultFolders);
        setSelectedFolderId(defaultFolders[0].id);
        setSelectedSheetId(defaultFolders[0].sheets[0].id);
        localStorage.setItem(STORAGE_NOTEBOOK_KEY, JSON.stringify(defaultFolders));
      }
    } catch {
      /* ignore */
    }

    // Results history
    try {
      const savedResults = localStorage.getItem("wt_academic_results_v2");
      if (savedResults) {
        const parsed = JSON.parse(savedResults);
        if (Array.isArray(parsed)) setResults(parsed);
      }
    } catch {
      /* ignore */
    }

    // Streak tracker
    try {
      const todayStr = new Date().toISOString().split("T")[0];
      const lastVisit = localStorage.getItem("wt_last_study_date");
      const savedStreak = parseInt(localStorage.getItem("wt_study_streak") || "1", 10);
      if (lastVisit === todayStr) {
        setStreakDays(savedStreak);
      } else {
        const newStreak = savedStreak + 1;
        setStreakDays(newStreak);
        localStorage.setItem("wt_study_streak", String(newStreak));
        localStorage.setItem("wt_last_study_date", todayStr);
      }
    } catch {
      /* ignore */
    }

    return () => {
      window.removeEventListener("storage", handleStorageUpdate);
    };
  }, []);

  // Course Enrollment Helpers
  const toggleCourseEnrollment = (courseId: string) => {
    let next: string[];
    if (enrolledCourseIds.includes(courseId)) {
      next = enrolledCourseIds.filter((id) => id !== courseId);
    } else {
      next = [...enrolledCourseIds, courseId];
    }
    setEnrolledCourseIds(next);
    try {
      localStorage.setItem(STORAGE_ENROLLED_COURSES, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  // Goals Helpers
  const persistGoals = (next: StudyGoalItem[]) => {
    setGoals(next);
    try {
      localStorage.setItem(STORAGE_GOALS_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  const addGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalText.trim()) return;
    const item: StudyGoalItem = {
      id: `g-${Date.now()}`,
      text: newGoalText.trim(),
      completed: false,
      priority: newGoalPriority,
    };
    persistGoals([item, ...goals]);
    setNewGoalText("");
  };

  const toggleGoal = (id: string) => {
    persistGoals(
      goals.map((g) => (g.id === id ? { ...g, completed: !g.completed } : g))
    );
  };

  const deleteGoal = (id: string) => {
    persistGoals(goals.filter((g) => g.id !== id));
  };

  // Notebook Helpers
  const persistNotebook = (next: NoteFolder[]) => {
    setFolders(next);
    try {
      localStorage.setItem(STORAGE_NOTEBOOK_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  const currentFolder = useMemo(() => {
    return folders.find((f) => f.id === selectedFolderId) || folders[0] || null;
  }, [folders, selectedFolderId]);

  const currentSheet = useMemo(() => {
    if (!currentFolder) return null;
    return (
      currentFolder.sheets.find((s) => s.id === selectedSheetId) ||
      currentFolder.sheets[0] ||
      null
    );
  }, [currentFolder, selectedSheetId]);

  const handleAddFolder = () => {
    const name = prompt("Enter folder title (e.g. Physics):");
    if (!name?.trim()) return;
    const newF: NoteFolder = {
      id: `f-${Date.now()}`,
      name: name.trim(),
      sheets: [
        {
          id: `s-${Date.now()}`,
          title: "New Sheet",
          content: "",
          updatedAt: new Date().toISOString(),
        },
      ],
    };
    const next = [...folders, newF];
    persistNotebook(next);
    setSelectedFolderId(newF.id);
    setSelectedSheetId(newF.sheets[0].id);
  };

  const handleDeleteFolder = (folderId: string) => {
    if (folders.length <= 1) {
      alert("You must keep at least one notes folder.");
      return;
    }
    if (!confirm("Delete this folder and all its sheets?")) return;
    const next = folders.filter((f) => f.id !== folderId);
    persistNotebook(next);
    if (selectedFolderId === folderId) {
      setSelectedFolderId(next[0].id);
      setSelectedSheetId(next[0].sheets[0]?.id || "");
    }
  };

  const handleAddSheet = () => {
    if (!currentFolder) return;
    const newS: NoteSheet = {
      id: `s-${Date.now()}`,
      title: "Untitled Sheet",
      content: "",
      updatedAt: new Date().toISOString(),
    };
    const next = folders.map((f) => {
      if (f.id === currentFolder.id) {
        return { ...f, sheets: [newS, ...f.sheets] };
      }
      return f;
    });
    persistNotebook(next);
    setSelectedSheetId(newS.id);
  };

  const handleDeleteSheet = (sheetId: string) => {
    if (!currentFolder) return;
    if (currentFolder.sheets.length <= 1) {
      alert("A folder must keep at least one sheet.");
      return;
    }
    const next = folders.map((f) => {
      if (f.id === currentFolder.id) {
        return { ...f, sheets: f.sheets.filter((s) => s.id !== sheetId) };
      }
      return f;
    });
    persistNotebook(next);
    if (selectedSheetId === sheetId) {
      const remaining = currentFolder.sheets.filter((s) => s.id !== sheetId);
      if (remaining.length > 0) setSelectedSheetId(remaining[0].id);
    }
  };

  const handleUpdateSheet = (updates: Partial<NoteSheet>) => {
    if (!currentFolder || !currentSheet) return;
    const updatedSheet: NoteSheet = {
      ...currentSheet,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    const next = folders.map((f) => {
      if (f.id === currentFolder.id) {
        return {
          ...f,
          sheets: f.sheets.map((s) => (s.id === currentSheet.id ? updatedSheet : s)),
        };
      }
      return f;
    });
    persistNotebook(next);
  };

  const handleCopySheet = () => {
    if (!currentSheet) return;
    navigator.clipboard.writeText(`${currentSheet.title}\n\n${currentSheet.content}`);
    setCopiedNotice(true);
    setTimeout(() => setCopiedNotice(false), 2000);
  };

  // Enrolled courses mapped to full details
  const activeEnrolledList = useMemo(() => {
    return AVAILABLE_COURSES.filter((c) => enrolledCourseIds.includes(c.id));
  }, [enrolledCourseIds]);

  const completedGoalsCount = goals.filter((g) => g.completed).length;
  const goalProgressPercent =
    goals.length > 0 ? Math.round((completedGoalsCount / goals.length) * 100) : 0;

  // Features configuration with clean iOS titles & unified styling (no rainbow colors)
  const FEATURES = [
    {
      key: "timer" as FeatureKey,
      title: "Timer",
      icon: Timer,
    },
    {
      key: "planner" as FeatureKey,
      title: "Planner",
      icon: Calendar,
    },
    {
      key: "goals" as FeatureKey,
      title: "Targets",
      icon: CheckSquare,
    },
    {
      key: "notes" as FeatureKey,
      title: "Notebook",
      icon: Folder,
    },
    {
      key: "calculator" as FeatureKey,
      title: "Calculator",
      icon: CalcIcon,
    },
    {
      key: "tutor" as FeatureKey,
      title: "AI Tutor",
      icon: Sparkles,
    },
    {
      key: "analytics" as FeatureKey,
      title: "Your status",
      icon: TrendingUp,
    },
    {
      key: "courses" as FeatureKey,
      title: "Courses",
      icon: BookOpen,
    },
  ];

  const currentFeatureMeta = activeFeature
    ? FEATURES.find((f) => f.key === activeFeature)
    : null;

  return (
    <div
      className={`relative bg-[#050811] text-[#f4f7fb] ${
        activeFeature === "tutor"
          ? "h-full min-h-0 sm:min-h-[85vh] pb-0 sm:pb-16"
          : "min-h-[85vh] pb-16"
      }`}
    >
      {/* Ambient background glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-32 right-10 w-[35rem] h-[35rem] rounded-full blur-[110px] opacity-20 bg-sky-500" />
        <div className="absolute top-1/2 left-0 w-[30rem] h-[30rem] rounded-full blur-[120px] opacity-15 bg-blue-600" />
      </div>

      <div
        className={
          activeFeature === "tutor"
            ? "w-full p-0 sm:max-w-6xl sm:mx-auto sm:px-6 lg:px-8 sm:pt-6"
            : "max-w-6xl mx-auto px-3.5 sm:px-6 lg:px-8 pt-4 sm:pt-6"
        }
      >
        {/* ═════════════════════════════════════════════════════════════ */}
        {/* NATIVE APP VIEW HEADER                                         */}
        {/* ═════════════════════════════════════════════════════════════ */}
        {activeFeature === null ? (
          <>
            {/* Hub Header: Compact, clean, iOS-smooth rounded container */}
            <header className="mb-5 rounded-3xl border border-white/[0.08] bg-[#0c1626]/80 backdrop-blur-2xl p-4 sm:p-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/[0.08] border border-white/[0.12] text-white font-black text-xl shadow-md">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h1 className="text-lg sm:text-2xl font-black text-white tracking-tight truncate">
                      {userName}
                    </h1>
                    <p className="text-xs text-slate-300 flex items-center gap-2 mt-0.5">
                      <span className="font-mono text-sky-400 font-bold tracking-wide">{studentId}</span>
                      {userEmail && <span className="hidden sm:inline text-slate-400">• {userEmail}</span>}
                    </p>
                  </div>
                </div>

                {/* Compact Quick Metrics Bar */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] shadow-sm">
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-xs font-semibold text-slate-200">{streakDays}d Streak</span>
                  </div>

                  <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] shadow-sm">
                    <CheckSquare className="w-3.5 h-3.5 text-sky-400" />
                    <span className="text-xs font-semibold text-slate-200">{goalProgressPercent}% Goals</span>
                  </div>

                  <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] shadow-sm">
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-xs font-semibold text-slate-200">{results.length} Tested</span>
                  </div>
                </div>
              </div>
            </header>

            {/* Guest Scholar Banner */}
            {!userId && (
              <div className="mb-5 rounded-3xl border border-white/[0.08] bg-[#0c1626]/75 backdrop-blur-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
                <div>
                  <p className="text-sm font-bold text-white">
                    Scholar Access
                  </p>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Sign in or create an account to sync your study notes, targets, and course progress.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href="/login?next=/learning"
                    className="px-4 py-2 rounded-full text-xs font-semibold bg-white text-slate-950 hover:bg-slate-200 active:scale-95 shadow-md transition-all"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup?next=/learning"
                    className="px-4 py-2 rounded-full text-xs font-semibold border border-white/20 bg-white/5 hover:bg-white/10 text-white active:scale-95 transition-all"
                  >
                    Create Account
                  </Link>
                </div>
              </div>
            )}
          </>
        ) : !isStandalone ? (
          // Feature Screen Top Bar: iOS Segmented Toolbar + Back Button
          <div
            className={`mb-5 p-2 rounded-2xl sm:rounded-full border border-white/[0.08] bg-[#0c1626]/90 backdrop-blur-2xl shadow-xl items-center justify-between gap-2 sticky top-2 z-20 ${
              activeFeature === "tutor" ? "hidden sm:flex" : "flex flex-wrap"
            }`}
          >
            <button
              type="button"
              onClick={closeActiveTool}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 hover:text-white active:scale-95 border border-rose-500/30 text-xs font-bold transition-all cursor-pointer shadow-sm"
              title="Return to Study Tools"
            >
              <ArrowLeft className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Back to Tools</span>
            </button>

            {/* iOS Segmented Toolbar */}
            <div className="flex items-center gap-1 overflow-x-auto max-w-full p-1 rounded-full bg-black/40 border border-white/[0.06]">
              {FEATURES.map((feat) => {
                const isCurrent = feat.key === activeFeature;
                const IconComponent = feat.icon;
                return (
                  <button
                    key={feat.key}
                    type="button"
                    onClick={() => openTool(feat.key)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 shrink-0 active:scale-95 cursor-pointer ${
                      isCurrent
                        ? "bg-white text-slate-950 font-bold shadow-md"
                        : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                    }`}
                  >
                    <IconComponent className="w-3.5 h-3.5" />
                    <span>{feat.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* VIEW 1: PHONE NAV / TOOLBAR BUTTONS DOCK (NO BIG CARDS)        */}
        {/* ═════════════════════════════════════════════════════════════ */}
        {activeFeature === null && (
          <div className="space-y-5 animate-fade-up">
            {/* Phone Nav / Toolbar Buttons Dock */}
            <div className="rounded-3xl border border-white/[0.08] bg-[#0c1626]/80 backdrop-blur-2xl p-4 sm:p-5 shadow-2xl">
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Study Tools
                </span>
              </div>

              {/* Phone-like Nav / Toolbar Grid */}
              <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-2 sm:gap-2.5">
                {FEATURES.map((feat) => {
                  const IconComponent = feat.icon;
                  return (
                    <button
                      key={feat.key}
                      type="button"
                      onClick={() => openTool(feat.key)}
                      className="group relative flex flex-col items-center justify-center p-2.5 sm:p-3.5 rounded-2xl border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/20 active:scale-90 active:bg-white/[0.12] transition-all duration-200 cursor-pointer shadow-sm text-center"
                    >
                      <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-white/[0.06] border border-white/[0.08] text-sky-400 group-hover:text-white group-hover:bg-sky-500/20 group-hover:border-sky-400/40 group-active:scale-95 transition-all duration-200 shadow-inner mb-1.5">
                        <IconComponent className="w-5 h-5 stroke-[2.2]" />
                      </div>
                      <span className="text-[11px] sm:text-xs font-semibold text-slate-200 group-hover:text-white tracking-tight leading-tight">
                        {feat.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Enrolled Courses Preview Strip */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-sky-400" />
                  <span>Curriculum</span>
                </h3>
                <button
                  type="button"
                  onClick={() => openTool("courses")}
                  className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1 rounded-full px-3 py-1 bg-white/[0.04] border border-white/[0.08] active:scale-95 transition-all cursor-pointer"
                >
                  <span>All Courses ({activeEnrolledList.length})</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {activeEnrolledList.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-5 text-center">
                  <p className="text-xs sm:text-sm font-semibold text-white/90">
                    No curriculum packages selected
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
                    You can browse all courses, choose packages in the course manager, or update your academic level in Settings.
                  </p>
                  <div className="mt-3 flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => openTool("courses")}
                      className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white transition-all cursor-pointer"
                    >
                      Browse Courses
                    </button>
                    <Link
                      href="/settings?tab=study"
                      className="px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-all"
                    >
                      Settings
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {activeEnrolledList.slice(0, 3).map((course) => (
                    <Link
                      key={course.id}
                      href={course.path}
                      className="flex items-center gap-3 p-3 rounded-2xl border border-white/[0.08] bg-[#091222]/80 hover:bg-[#0f1d35] hover:border-white/20 active:scale-95 transition-all duration-200 shadow-md group"
                    >
                      <div className="relative h-12 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-900 border border-white/10">
                        <Image
                          src={course.image}
                          alt={course.title}
                          fill
                          className="object-cover"
                          sizes="56px"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-white truncate group-hover:text-sky-300 transition-colors">
                          {course.title}
                        </p>
                        <span className="text-[10px] font-semibold text-slate-400 block mt-0.5">
                          {course.level}
                        </span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* VIEW 2: FULL FEATURE STATION (ONE-CLICK OPENED VIEW)           */}
        {/* ═════════════════════════════════════════════════════════════ */}

        {/* ── 1. FOCUS POMODORO STATION ──────────────────────────────── */}
        {activeFeature === "timer" && (
          <section className="animate-fade-up max-w-4xl mx-auto space-y-4">
            <div className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-[#0c1626]/90 border border-white/[0.08] backdrop-blur-2xl shadow-xl">
              <div className="flex items-center gap-2.5">
                <Timer className="w-5 h-5 text-sky-400" />
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                    Focus Pomodoro Station
                  </h2>
                  <p className="text-[11px] sm:text-xs text-slate-400 hidden sm:block">
                    Structured intervals for deep academic work.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeActiveTool}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 hover:text-white border border-rose-500/30 text-xs sm:text-sm font-semibold active:scale-95 transition-all cursor-pointer shadow-sm"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
                <span>Close</span>
              </button>
            </div>
            <div className="rounded-3xl border border-white/[0.08] bg-[#0c1626]/80 backdrop-blur-2xl p-4 sm:p-8 shadow-2xl">
              <PomodoroTimer />
            </div>
          </section>
        )}

        {/* ── 2. WEEKLY STUDY PLANNER ────────────────────────────────── */}
        {activeFeature === "planner" && (
          <section className="animate-fade-up max-w-5xl mx-auto space-y-4">
            <div className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-[#0c1626]/90 border border-white/[0.08] backdrop-blur-2xl shadow-xl">
              <div className="flex items-center gap-2.5">
                <CalendarDays className="w-5 h-5 text-purple-400" />
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                    Weekly Study Planner
                  </h2>
                  <p className="text-[11px] sm:text-xs text-slate-400 hidden sm:block">
                    Map timetable slots, exam prep, and revision blocks.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeActiveTool}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 hover:text-white border border-rose-500/30 text-xs sm:text-sm font-semibold active:scale-95 transition-all cursor-pointer shadow-sm"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
                <span>Close</span>
              </button>
            </div>
            <div className="rounded-3xl border border-white/[0.08] bg-[#0c1626]/80 backdrop-blur-2xl p-2.5 sm:p-5 md:p-6 shadow-2xl">
              <StudyPlanner />
            </div>
          </section>
        )}

        {/* ── 3. DAILY TARGETS & ACCOUNTABILITY ──────────────────────── */}
        {activeFeature === "goals" && (
          <section className="animate-fade-up max-w-4xl mx-auto space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-3xl bg-[#0c1626]/80 border border-white/[0.08] backdrop-blur-2xl shadow-xl">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-sky-400" />
                  <span>Targets</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Track and complete your daily study milestones.
                </p>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="text-xs text-slate-400">
                  {completedGoalsCount} of {goals.length} Done
                </span>
                <div className="h-8 px-3.5 flex items-center justify-center rounded-full bg-white/[0.06] border border-white/[0.08] text-white font-bold text-xs shadow-sm">
                  {goalProgressPercent}%
                </div>
                <button
                  type="button"
                  onClick={closeActiveTool}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 hover:text-white border border-rose-500/30 active:scale-95 transition-all shadow-sm cursor-pointer ml-1"
                  title="Close targets"
                >
                  <X className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Close</span>
                </button>
              </div>
            </div>

            {/* Add Target Input Form */}
            <form
              onSubmit={addGoal}
              className="flex flex-col sm:flex-row items-center gap-2.5 p-2.5 rounded-2xl sm:rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl shadow-lg"
            >
              <input
                type="text"
                value={newGoalText}
                onChange={(e) => setNewGoalText(e.target.value)}
                placeholder="What is your study target? (e.g. Solve 20 Physics questions)"
                className="flex-1 w-full bg-transparent border-none px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none"
              />
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={newGoalPriority}
                  onChange={(e) => setNewGoalPriority(e.target.value as "high" | "medium" | "low")}
                  className="bg-white/[0.06] border border-white/[0.08] rounded-full px-3.5 py-2 text-xs text-slate-200 focus:outline-none cursor-pointer"
                >
                  <option value="high" className="bg-[#091222] text-white">High Priority</option>
                  <option value="medium" className="bg-[#091222] text-white">Medium Priority</option>
                  <option value="low" className="bg-[#091222] text-white">Low Priority</option>
                </select>
                <button
                  type="submit"
                  className="flex items-center justify-center gap-1.5 px-5 py-2 rounded-full font-semibold text-xs bg-white text-slate-950 hover:bg-slate-200 shrink-0 active:scale-95 transition-all shadow-md cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Add</span>
                </button>
              </div>
            </form>

            {/* Goals List */}
            <div className="space-y-2">
              {goals.length === 0 ? (
                <div className="p-8 text-center rounded-3xl border border-dashed border-white/10 bg-white/[0.02]">
                  <p className="text-sm text-slate-400">No targets added yet. Add your first study goal above.</p>
                </div>
              ) : (
                goals.map((goal) => (
                  <div
                    key={goal.id}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-150 ${
                      goal.completed
                        ? "bg-white/[0.02] border-white/[0.04] opacity-70"
                        : "bg-white/[0.04] border-white/[0.08] hover:border-white/20 shadow-sm"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={() => toggleGoal(goal.id)}
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-all active:scale-90 cursor-pointer ${
                          goal.completed
                            ? "bg-white border-white text-slate-950 font-bold"
                            : "border-white/30 hover:border-white bg-white/[0.04]"
                        }`}
                      >
                        {goal.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>
                      <span
                        className={`text-sm truncate ${
                          goal.completed ? "line-through text-slate-400" : "text-white font-medium"
                        }`}
                      >
                        {goal.text}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/[0.06] text-slate-300 border border-white/[0.08]">
                        {goal.priority}
                      </span>
                      <button
                        type="button"
                        onClick={() => deleteGoal(goal.id)}
                        className="p-1.5 rounded-full text-slate-400 hover:text-rose-400 hover:bg-white/5 active:scale-90 transition-all cursor-pointer"
                        title="Delete target"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {/* ── 4. SCHOLAR NOTEBOOK ────────────────────────────────────── */}
        {activeFeature === "notes" && (
          <section className="animate-fade-up space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-3xl bg-[#0c1626]/80 border border-white/[0.08] backdrop-blur-2xl shadow-xl">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  <Folder className="w-5 h-5 text-sky-400" />
                  <span>Notebook</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Study notes, formulas, and chapter summaries.
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={handleAddFolder}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/[0.06] hover:bg-white/[0.12] active:scale-95 border border-white/[0.08] text-slate-200 transition-all shadow-sm cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Folder</span>
                </button>
                <button
                  type="button"
                  onClick={handleAddSheet}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white hover:bg-slate-200 active:scale-95 text-slate-950 shadow-md transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Add Sheet</span>
                </button>
                <button
                  type="button"
                  onClick={closeActiveTool}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 hover:text-white border border-rose-500/30 active:scale-95 transition-all shadow-sm cursor-pointer ml-1"
                  title="Close notebook"
                >
                  <X className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Close</span>
                </button>
              </div>
            </div>

            {/* Folder Tabs Bar */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
              {folders.map((folder) => {
                const isActive = folder.id === currentFolder?.id;
                return (
                  <div key={folder.id} className="flex items-center shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFolderId(folder.id);
                        if (folder.sheets?.length > 0) {
                          setSelectedSheetId(folder.sheets[0].id);
                        }
                      }}
                      className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all border active:scale-95 cursor-pointer ${
                        isActive
                          ? "bg-white text-slate-950 border-white shadow-md font-bold"
                          : "bg-white/[0.04] border-white/[0.08] text-slate-300 hover:text-white hover:bg-white/[0.08]"
                      }`}
                    >
                      <span>{folder.name}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? "bg-slate-200 text-slate-900" : "bg-black/40 text-slate-400"}`}>
                        {folder.sheets.length}
                      </span>
                    </button>
                    {folders.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteFolder(folder.id)}
                        className="ml-1 p-1 text-slate-500 hover:text-rose-400 active:scale-90 transition-all cursor-pointer"
                        title="Delete folder"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Notebook 2-Column Workspace */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
              {/* Sheets List in Current Folder */}
              <div className="lg:col-span-4 rounded-3xl border border-white/[0.08] bg-[#0c1626]/80 backdrop-blur-2xl p-4 space-y-2.5 shadow-xl">
                <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                  <span className="text-xs font-semibold text-slate-300">
                    {currentFolder?.name} Sheets
                  </span>
                  <button
                    type="button"
                    onClick={handleAddSheet}
                    className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1 active:scale-95 cursor-pointer px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08]"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add</span>
                  </button>
                </div>

                <div className="space-y-1.5 max-h-[360px] overflow-y-auto pr-1">
                  {currentFolder?.sheets.map((sheet) => {
                    const isSelected = sheet.id === currentSheet?.id;
                    return (
                      <div
                        key={sheet.id}
                        onClick={() => setSelectedSheetId(sheet.id)}
                        className={`p-3 rounded-2xl border transition-all duration-150 cursor-pointer flex items-center justify-between active:scale-[0.99] ${
                          isSelected
                            ? "bg-white/[0.12] border-white/30 text-white shadow-sm"
                            : "bg-white/[0.02] border-white/[0.06] hover:border-white/15 text-slate-300"
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <p className="text-xs font-semibold truncate text-white">
                            {sheet.title || "Untitled Sheet"}
                          </p>
                          <span className="text-[10px] text-slate-400">
                            {new Date(sheet.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                        {currentFolder.sheets.length > 1 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSheet(sheet.id);
                            }}
                            className="p-1 text-slate-500 hover:text-rose-400 active:scale-90 transition-all cursor-pointer"
                            title="Delete sheet"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Active Sheet Editor */}
              <div className="lg:col-span-8 rounded-3xl border border-white/[0.08] bg-[#0c1626]/80 backdrop-blur-2xl p-4 sm:p-5 space-y-3 shadow-xl">
                {currentSheet ? (
                  <>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-white/[0.08]">
                      <input
                        type="text"
                        value={currentSheet.title}
                        onChange={(e) => handleUpdateSheet({ title: e.target.value })}
                        className="text-base sm:text-lg font-bold text-white bg-transparent border-none focus:outline-none rounded-lg px-1 flex-1"
                        placeholder="Sheet Title..."
                      />
                      <button
                        type="button"
                        onClick={handleCopySheet}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/[0.06] hover:bg-white/[0.12] active:scale-95 border border-white/[0.08] text-slate-200 transition-all self-start sm:self-auto shadow-sm cursor-pointer"
                      >
                        {copiedNotice ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedNotice ? "Copied" : "Copy Notes"}</span>
                      </button>
                    </div>

                    <textarea
                      value={currentSheet.content}
                      onChange={(e) => handleUpdateSheet({ content: e.target.value })}
                      placeholder="Start typing your study notes, formulas, or summaries here..."
                      className="w-full h-[320px] bg-black/40 border border-white/[0.08] rounded-2xl p-3.5 text-sm text-slate-100 font-serif italic font-medium leading-relaxed focus:outline-none focus:border-white/20 resize-y transition-colors"
                    />

                    <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/[0.08]">
                      <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 inline-block" />
                        <span>Auto-saved locally</span>
                      </span>
                      <span>{currentSheet.content.length} characters</span>
                    </div>
                  </>
                ) : (
                  <div className="p-12 text-center text-slate-400">
                    No sheet selected. Click &quot;Add Sheet&quot; to begin.
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ── 5. SCIENTIFIC CALCULATOR ────────────────────────────── */}
        {activeFeature === "calculator" && (
          <section className="animate-fade-up max-w-xl mx-auto space-y-4">
            <ScientificCalculator
              isOpen={true}
              onClose={closeActiveTool}
              isEmbedded={true}
              isStandalone={isStandalone}
            />
          </section>
        )}

        {/* ── 6. AI ACADEMIC TUTOR ───────────────────────────────────── */}
        {activeFeature === "tutor" && (
          <section className="w-full sm:max-w-4xl sm:mx-auto sm:animate-fade-up">
            <AiTutor
              isOpen={true}
              onClose={closeActiveTool}
              isEmbedded={true}
              isStandalone={isStandalone}
            />
          </section>
        )}

        {/* ── 7. YOUR STATUS ────────────────────────────────────────── */}
        {activeFeature === "analytics" && (
          <section className="animate-fade-up max-w-5xl mx-auto space-y-4">
            <div className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-[#0c1626]/90 border border-white/[0.08] backdrop-blur-2xl shadow-xl">
              <div className="flex items-center gap-2.5">
                <BarChart3 className="w-5 h-5 text-sky-400" />
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                    Scholar Academic Status
                  </h2>
                  <p className="text-[11px] sm:text-xs text-slate-400 hidden sm:block">
                    Diagnostic reports, practice exam metrics, and study progress.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeActiveTool}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 hover:text-white border border-rose-500/30 text-xs sm:text-sm font-semibold active:scale-95 transition-all cursor-pointer shadow-sm"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
                <span>Close</span>
              </button>
            </div>
            <StudentAnalyticsDashboard
              userId={userId || "guest"}
              studentName={userName}
              educationLevel={userProfile?.education_level}
              stream={userProfile?.stream}
              userCreatedAt={userProfile?.created_at}
              dailyGoalMinutes={userProfile?.daily_study_goal_minutes || 45}
              enrolledPackageIds={enrolledCourseIds}
            />
          </section>
        )}

        {/* ── 6. MY ENROLLED COURSES & SYLLABUS ──────────────────────── */}
        {activeFeature === "courses" && (
          <section className="animate-fade-up space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-3xl bg-[#0c1626]/80 border border-white/[0.08] backdrop-blur-2xl shadow-xl">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-sky-400" />
                  <span>Courses</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Curriculum with textbooks, notes, cards, and model exams.
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setShowCourseManager(!showCourseManager)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-xs bg-white/[0.06] hover:bg-white/[0.12] active:scale-95 text-slate-200 border border-white/[0.08] transition-all shadow-sm cursor-pointer"
                >
                  <Settings2 className="w-4 h-4" />
                  <span>{showCourseManager ? "Done" : "Manage"}</span>
                </button>
                <button
                  type="button"
                  onClick={closeActiveTool}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-full font-semibold text-xs bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 hover:text-white border border-rose-500/30 active:scale-95 transition-all shadow-sm cursor-pointer"
                  title="Close courses view"
                >
                  <X className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Close</span>
                </button>
              </div>
            </div>

            {/* Course Customizer Drawer */}
            {showCourseManager && (
              <div className="rounded-3xl border border-white/[0.1] bg-[#0a1220]/95 backdrop-blur-2xl p-4 sm:p-5 space-y-3 shadow-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">Active Courses</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Select courses to display on your learning dashboard.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCourseManager(false)}
                    className="p-1.5 rounded-full bg-white/5 text-slate-400 hover:text-white border border-white/10 active:scale-90 transition-all cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {AVAILABLE_COURSES.map((course) => {
                    const isSelected = enrolledCourseIds.includes(course.id);
                    return (
                      <button
                        key={course.id}
                        type="button"
                        onClick={() => toggleCourseEnrollment(course.id)}
                        className={`group flex items-center gap-2.5 p-2.5 rounded-2xl border text-left transition-all active:scale-95 cursor-pointer ${
                          isSelected
                            ? "bg-white/[0.12] border-white/30 text-white shadow-sm"
                            : "bg-white/[0.02] border-white/[0.08] text-slate-300 hover:bg-white/[0.06]"
                        }`}
                      >
                        <div className="relative h-10 w-12 shrink-0 overflow-hidden rounded-xl bg-slate-900 border border-white/10">
                          <Image
                            src={course.image}
                            alt={course.title}
                            fill
                            className="object-cover"
                            sizes="48px"
                            referrerPolicy="no-referrer"
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold truncate text-white">{course.title}</p>
                          <span className="text-[10px] font-semibold text-slate-400">{course.level}</span>
                        </div>

                        <div
                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${
                            isSelected
                              ? "bg-white border-white text-slate-950"
                              : "border-white/20 bg-white/5"
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Active Enrolled Courses Grid */}
            {activeEnrolledList.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-white/15 bg-white/[0.02] p-8 sm:p-12 text-center max-w-xl mx-auto">
                <BookOpen className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                <h4 className="text-base sm:text-lg font-bold text-white mb-1">
                  Your My Learning package list is empty
                </h4>
                <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mb-6">
                  You selected &quot;Other&quot; or customized your list. Click below to pick packages to display or configure your academic level in settings.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCourseManager(true)}
                    className="px-4 py-2.5 rounded-xl bg-white text-slate-950 text-xs font-bold hover:bg-slate-200 transition-all cursor-pointer"
                  >
                    Select Packages ({AVAILABLE_COURSES.length} Available)
                  </button>
                  <Link
                    href="/settings?tab=study"
                    className="px-4 py-2.5 rounded-xl bg-white/10 border border-white/15 text-white text-xs font-semibold hover:bg-white/15 transition-all"
                  >
                    Set Academic Level in Settings
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeEnrolledList.map((course) => (
                  <div
                    key={course.id}
                    className="group rounded-3xl border border-white/[0.08] bg-[#0c1626]/80 backdrop-blur-2xl p-4 sm:p-5 flex flex-col justify-between hover:border-white/20 transition-all duration-200 shadow-xl"
                  >
                    <div>
                      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl mb-3 border border-white/10 bg-slate-900 shadow-lg">
                        <Image
                          src={course.image}
                          alt={course.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, 50vw"
                          priority
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-x-0 bottom-0 px-3.5 py-2 bg-slate-950/80 backdrop-blur-sm border-t border-white/10">
                          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                            {course.title}
                          </h3>
                          <span className="text-[10px] font-mono text-sky-400 uppercase tracking-wider font-semibold">
                            {course.level}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mb-3">
                        {course.desc}
                      </p>
                    </div>

                    <div>
                      {/* Fast Navigation Hub Links */}
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 pt-3 border-t border-white/[0.08]">
                        <Link
                          href={`${course.path}/books`}
                          className="flex items-center justify-center gap-1 py-1.5 px-1 rounded-full font-semibold text-[11px] bg-white/[0.06] hover:bg-white/[0.12] active:scale-95 text-slate-200 hover:text-white border border-white/[0.08] transition-all text-center"
                        >
                          <BookOpen className="w-3 h-3 shrink-0" />
                          <span>Books</span>
                        </Link>
                        <Link
                          href={`${course.path}/short-notes`}
                          className="flex items-center justify-center gap-1 py-1.5 px-1 rounded-full font-semibold text-[11px] bg-white/[0.06] hover:bg-white/[0.12] active:scale-95 text-slate-200 hover:text-white border border-white/[0.08] transition-all text-center"
                        >
                          <FileText className="w-3 h-3 shrink-0" />
                          <span>Notes</span>
                        </Link>
                        <Link
                          href={`${course.path}/flashcards`}
                          className="flex items-center justify-center gap-1 py-1.5 px-1 rounded-full font-semibold text-[11px] bg-white/[0.06] hover:bg-white/[0.12] active:scale-95 text-slate-200 hover:text-white border border-white/[0.08] transition-all text-center"
                        >
                          <Layers className="w-3 h-3 shrink-0" />
                          <span>Cards</span>
                        </Link>
                        <Link
                          href={`${course.path}/question-banks`}
                          className="flex items-center justify-center gap-1 py-1.5 px-1 rounded-full font-semibold text-[11px] bg-white/[0.06] hover:bg-white/[0.12] active:scale-95 text-slate-200 hover:text-white border border-white/[0.08] transition-all text-center"
                        >
                          <HelpCircle className="w-3 h-3 shrink-0" />
                          <span>Banks</span>
                        </Link>
                        <Link
                          href={`${course.path}/exams`}
                          className="flex items-center justify-center gap-1 py-1.5 px-1 rounded-full font-semibold text-[11px] bg-white/[0.06] hover:bg-white/[0.12] active:scale-95 text-slate-200 hover:text-white border border-white/[0.08] transition-all text-center"
                        >
                          <Award className="w-3 h-3 shrink-0" />
                          <span>Exams</span>
                        </Link>
                        <Link
                          href={`${course.path}/life-savers`}
                          className="flex items-center justify-center gap-1 py-1.5 px-1 rounded-full font-semibold text-[11px] bg-white/[0.06] hover:bg-white/[0.12] active:scale-95 text-slate-200 hover:text-white border border-white/[0.08] transition-all text-center"
                        >
                          <LifeBuoy className="w-3 h-3 shrink-0 text-rose-400" />
                          <span>Life Savers</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

