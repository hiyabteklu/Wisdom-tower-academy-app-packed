"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Send,
  X,
  Trash2,
  Copy,
  Check,
  User,
  GraduationCap,
  Sparkles,
  Square,
  Plus,
  History,
  MessageSquare,
  Clock,
} from "lucide-react";
import RichContent from "@/components/learning/RichContent";
import "katex/dist/katex.min.css";
import { closeToolOverlay, isNativeToolOverlay } from "@/lib/native-app";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  suggestions?: string[];
};

export type ChatSession = {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  defaultFullScreen?: boolean;
  isEmbedded?: boolean;
  isStandalone?: boolean;
  courseContext?: string;
  hideHeader?: boolean;
};

const SESSIONS_STORAGE_KEY = "wt_ai_tutor_sessions_v2";
const ACTIVE_SESSION_ID_KEY = "wt_ai_tutor_active_session_id_v2";
const LEGACY_STORAGE_KEY = "wt_ai_tutor_chat_v2";

const DEFAULT_WELCOME: Message = {
  id: "welcome",
  role: "assistant",
  content:
    "👋 Welcome! I am your **Wisdom Tower AI Tutor** — your friendly academic coach.\n\nWhether you're tackling **Grade 9–12** secondary concepts, navigating **Freshman university** courses (Calculus, Physics, C++, Logic...), or diving into **Senior Engineering (ECE)** and national entrance exams (**UAT, GAT, COC, Exit Exams**), I'm here to break down problems step-by-step with clear derivations.\n\nWhat concept, formula, or problem are we conquering today?",
  timestamp: "Just now",
  suggestions: [
    "How to calculate Ethiopian university GPA?",
    "Explain Newton's Laws with examples",
    "Derivative power rule step-by-step",
  ],
};

function createNewSession(customTitle?: string): ChatSession {
  const now = Date.now();
  return {
    id: "session-" + now + "-" + Math.random().toString(36).substring(2, 7),
    title: customTitle || "New chat",
    messages: [],
    createdAt: now,
    updatedAt: now,
  };
}

function initSessions(): { sessions: ChatSession[]; activeId: string } {
  if (typeof window === "undefined") {
    const s = createNewSession();
    return { sessions: [s], activeId: s.id };
  }

  try {
    const stored = window.localStorage.getItem(SESSIONS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const storedActiveId = window.localStorage.getItem(ACTIVE_SESSION_ID_KEY);
        const exists = parsed.some((s: ChatSession) => s && s.id === storedActiveId);
        const activeId = exists && storedActiveId ? storedActiveId : parsed[0].id;
        return { sessions: parsed, activeId };
      }
    }

    // Check legacy single-thread storage for smooth migration
    const legacy = window.localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacy) {
      const legacyMsgs = JSON.parse(legacy);
      if (Array.isArray(legacyMsgs) && legacyMsgs.length > 0) {
        const firstUser = legacyMsgs.find((m: any) => m && m.role === "user");
        const title = firstUser?.content
          ? firstUser.content.length > 36
            ? firstUser.content.slice(0, 36).trim() + "…"
            : firstUser.content
          : "Previous Study Chat";
        const migrated: ChatSession = {
          id: "session-" + Date.now(),
          title,
          messages: legacyMsgs,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        return { sessions: [migrated], activeId: migrated.id };
      }
    }
  } catch (e) {
    console.warn("Failed to load AI Tutor sessions from storage", e);
  }

  const fresh = createNewSession();
  return { sessions: [fresh], activeId: fresh.id };
}

function formatSessionTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });
}

export default function AiTutor({
  isOpen,
  onClose,
  courseContext,
  isEmbedded = false,
  isStandalone = false,
  hideHeader = false,
}: Props) {
  // Detect if running inside native Android app dedicated tool overlay WebView
  // (e.g. /learning?tool=tutor&overlay=1&app=1 or classes wta-native-app + wta-tool-overlay)
  const [isNativeOverlay, setIsNativeOverlay] = useState<boolean>(() => {
    if (hideHeader) return true;
    return isNativeToolOverlay("tutor");
  });

  useEffect(() => {
    const checkOverlay = () => {
      const active = hideHeader || isNativeToolOverlay("tutor");
      setIsNativeOverlay(active);
      if (active && typeof document !== "undefined") {
        document.documentElement.classList.add("wta-native-app", "wta-tool-overlay");
        if (document.body) {
          document.body.classList.add("wta-native-app", "wta-tool-overlay");
        }
      }
    };
    checkOverlay();
    window.addEventListener("resize", checkOverlay);
    window.addEventListener("popstate", checkOverlay);
    return () => {
      window.removeEventListener("resize", checkOverlay);
      window.removeEventListener("popstate", checkOverlay);
    };
  }, [hideHeader]);

  // Multi-session chat history state
  const [sessions, setSessions] = useState<ChatSession[]>(() => initSessions().sessions);
  const [activeSessionId, setActiveSessionId] = useState<string>(
    () => initSessions().activeId
  );
  const [showHistory, setShowHistory] = useState(false);

  // Active session and its messages
  const activeSession =
    sessions.find((s) => s.id === activeSessionId) ||
    sessions[0] ||
    createNewSession();
  const messages = activeSession.messages;

  // Updater for active session messages
  const setMessages = useCallback(
    (updater: Message[] | ((prev: Message[]) => Message[])) => {
      setSessions((prevSessions) => {
        return prevSessions.map((session) => {
          if (session.id === activeSessionId) {
            const nextMessages =
              typeof updater === "function" ? updater(session.messages) : updater;
            let title = session.title;
            // Auto-title from the first user question if currently "New chat"
            if (title === "New chat" || title === "New Study Session") {
              const firstUser = nextMessages.find((m) => m && m.role === "user");
              if (firstUser?.content) {
                const cleaned = firstUser.content.replace(/\s+/g, " ").trim();
                title =
                  cleaned.length > 36 ? cleaned.slice(0, 36).trim() + "…" : cleaned;
              }
            }
            return {
              ...session,
              title,
              messages: nextMessages,
              updatedAt: Date.now(),
            };
          }
          return session;
        });
      });
    },
    [activeSessionId]
  );

  const [input, setInput] = useState("");
  // isThinking is true ONLY while waiting for the very first token
  const [isThinking, setIsThinking] = useState(false);
  // isStreaming is true while tokens are actively streaming in
  const [isStreaming, setIsStreaming] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Dynamic visual viewport positioning for mobile/Android WebViews
  const [viewportStyle, setViewportStyle] = useState<React.CSSProperties>({});
  const [headerStyle, setHeaderStyle] = useState<React.CSSProperties>({});

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const typingAnchorRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastScrollTimeRef = useRef<number>(0);
  const rafIdRef = useRef<number | null>(null);
  const viewportRafRef = useRef<number | null>(null);

  // Debounced persistence of sessions into localStorage
  useEffect(() => {
    if (typeof window === "undefined" || sessions.length === 0) return;
    const timer = setTimeout(() => {
      try {
        window.localStorage.setItem(
          SESSIONS_STORAGE_KEY,
          JSON.stringify(sessions)
        );
        window.localStorage.setItem(ACTIVE_SESSION_ID_KEY, activeSessionId);
      } catch (err) {
        console.warn("Failed to persist sessions", err);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [sessions, activeSessionId]);

  // Viewport calculation keeping root & composer strictly pinned above virtual keyboard
  const updateViewport = useCallback(() => {
    if (typeof window === "undefined") return;

    if (window.innerWidth < 640) {
      if (window.visualViewport) {
        const vv = window.visualViewport;
        const vHeight = vv.height > 0 ? vv.height : window.innerHeight;
        const vWidth = vv.width > 0 ? vv.width : window.innerWidth;
        const vTop = Math.max(0, vv.offsetTop || 0);
        const vLeft = Math.max(0, vv.offsetLeft || 0);

        setViewportStyle({
          position: "fixed",
          top: `${vTop}px`,
          left: `${vLeft}px`,
          width: `${vWidth}px`,
          height: `${vHeight}px`,
          maxHeight: `${vHeight}px`,
          bottom: "auto",
        });
      } else {
        setViewportStyle({
          position: "fixed",
          top: "0px",
          left: "0px",
          width: "100%",
          height: "100dvh",
          maxHeight: "100dvh",
          bottom: "auto",
        });
      }

      // Android WebView Status Bar Inset Detection & Fallback
      let safeArea = 0;
      try {
        const probe = document.createElement("div");
        probe.style.cssText =
          "position:fixed;top:0;left:0;height:env(safe-area-inset-top,0px);pointer-events:none;visibility:hidden;z-index:-1;";
        document.body.appendChild(probe);
        safeArea = probe.offsetHeight || 0;
        probe.remove();
      } catch {
        safeArea = 0;
      }

      const isNativeApp =
        document.documentElement.classList.contains("wta-native-app") ||
        document.body?.classList.contains("wta-native-app");

      const isOverlayActive =
        hideHeader ||
        isNativeOverlay ||
        document.documentElement.classList.contains("wta-tool-overlay") ||
        document.body?.classList.contains("wta-tool-overlay") ||
        /(?:[?&])(?:overlay|standalone|embed)=(?:1|true|standalone|overlay)/i.test(
          typeof window !== "undefined" ? window.location.search : ""
        );

      const vvOffsetTop = window.visualViewport?.offsetTop || 0;
      // In native tool overlay, the native Android top bar is already above the WebView.
      // Avoid redundant status bar padding when in tool overlay.
      const statusBarGuess = (isNativeApp && !isOverlayActive) ? (vvOffsetTop === 0 ? 32 : 28) : 0;
      const targetPadding = isOverlayActive ? 0 : Math.max(safeArea, statusBarGuess);

      if (targetPadding > 0) {
        setHeaderStyle({ paddingTop: `${targetPadding}px` });
      } else {
        setHeaderStyle({});
      }
    } else {
      setViewportStyle({});
      setHeaderStyle({});
    }
  }, [hideHeader, isNativeOverlay]);

  // Track visualViewport in the same frame on resize and scroll
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleViewportChange = () => {
      if (viewportRafRef.current) {
        cancelAnimationFrame(viewportRafRef.current);
      }
      viewportRafRef.current = requestAnimationFrame(() => {
        updateViewport();
      });
    };

    updateViewport();

    const vv = window.visualViewport;
    if (vv) {
      vv.addEventListener("resize", handleViewportChange);
      vv.addEventListener("scroll", handleViewportChange);
    }
    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange);

    return () => {
      if (viewportRafRef.current) {
        cancelAnimationFrame(viewportRafRef.current);
      }
      if (vv) {
        vv.removeEventListener("resize", handleViewportChange);
        vv.removeEventListener("scroll", handleViewportChange);
      }
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange);
    };
  }, [updateViewport]);

  // Immediate input focus handler without laggy timeouts
  const handleInputFocus = useCallback(() => {
    // Force immediate viewport update with no delay
    updateViewport();
    requestAnimationFrame(() => {
      updateViewport();
      if (window.innerWidth < 640) {
        messagesEndRef.current?.scrollIntoView({ behavior: "auto", block: "end" });
      }
    });
    // Follow-up after keyboard transition completes
    setTimeout(updateViewport, 150);
    setTimeout(updateViewport, 300);
  }, [updateViewport]);

  // Keep typewriter typing edge visible during streaming (smooth, jitter-free, throttled)
  const keepTypingEdgeInView = useCallback((force = false) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const now = performance.now();
    // Throttle scroll updates to avoid vibration & layout thrashing during fast token streams (~75ms)
    if (!force && now - lastScrollTimeRef.current < 75) {
      if (!rafIdRef.current) {
        rafIdRef.current = requestAnimationFrame(() => {
          rafIdRef.current = null;
          keepTypingEdgeInView(false);
        });
      }
      return;
    }
    lastScrollTimeRef.current = now;

    const anchor = typingAnchorRef.current;
    if (anchor) {
      const containerRect = container.getBoundingClientRect();
      const anchorRect = anchor.getBoundingClientRect();

      // Distance from typing bottom to bottom of visible scrollport
      const offsetFromBottom = containerRect.bottom - anchorRect.bottom;

      // Keep typing edge clearly visible above the composer (near center/lower viewport)
      // If typing edge is closer than 110px from container bottom or below it:
      if (offsetFromBottom < 110) {
        const delta = 120 - offsetFromBottom;
        container.scrollBy({ top: delta, behavior: "smooth" });
      }
    } else {
      const remainingScroll =
        container.scrollHeight - container.scrollTop - container.clientHeight;
      if (remainingScroll > 20) {
        container.scrollBy({
          top: Math.min(remainingScroll, 120),
          behavior: "smooth",
        });
      }
    }
  }, []);

  // Smooth scroll to bottom when new messages arrive or when opening
  const scrollToBottom = useCallback((smooth = true) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    requestAnimationFrame(() => {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: smooth ? "smooth" : "auto",
      });
    });
  }, []);

  // Scroll to bottom on initial open
  useEffect(() => {
    if (isOpen) {
      scrollToBottom(false);
    }
  }, [isOpen, scrollToBottom]);

  const handleClose = useCallback(() => {
    closeToolOverlay("tutor");
    onClose();
  }, [onClose]);

  const isBusy = isThinking || isStreaming;

  async function sendMessage(textOverride?: string, smoothScroll = true) {
    const q = (textOverride !== undefined ? textOverride : input).trim();
    if (!q || isBusy) return;

    const userMsg: Message = {
      id: "user-" + Date.now(),
      role: "user",
      content: q,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setInput("");
    setIsThinking(true);
    setIsStreaming(false);
    scrollToBottom(smoothScroll);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const botMessageId = "bot-" + Date.now();
    const botTimestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    let accumulatedText = "";
    let hasReceivedFirstToken = false;

    try {
      const historyPayload = nextHistory.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/ai/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: historyPayload,
          courseContext,
        }),
        signal: abortController.signal,
      });

      if (!res.ok) {
        throw new Error(`Server status ${res.status}`);
      }

      if (!res.body) {
        throw new Error("Missing response body stream");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const blocks = buffer.split("\n\n");
        buffer = blocks.pop() || "";

        for (const block of blocks) {
          const trimmed = block.trim();
          if (!trimmed.startsWith("data:")) continue;
          const jsonStr = trimmed.slice(5).trim();
          if (!jsonStr) continue;

          try {
            const data = JSON.parse(jsonStr);

            if (data.type === "chunk" && data.text) {
              if (!hasReceivedFirstToken) {
                hasReceivedFirstToken = true;
                setIsThinking(false); // Stop "Thinking" immediately upon first token!
                setIsStreaming(true);
                accumulatedText = data.text;

                setMessages((prev) => [
                  ...prev,
                  {
                    id: botMessageId,
                    role: "assistant",
                    content: accumulatedText,
                    timestamp: botTimestamp,
                  },
                ]);
                keepTypingEdgeInView(true);
              } else {
                accumulatedText += data.text;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === botMessageId ? { ...m, content: accumulatedText } : m
                  )
                );
                keepTypingEdgeInView(false);
              }
            } else if (data.type === "suggestions" && Array.isArray(data.suggestions)) {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === botMessageId ? { ...m, suggestions: data.suggestions } : m
                )
              );
              keepTypingEdgeInView(false);
            }
          } catch {
            // Ignore incomplete chunks
          }
        }
      }
    } catch (err: any) {
      if (err?.name === "AbortError") {
        console.log("[AI Tutor] Stream aborted by user");
        // Keep partial text if already generated
        if (!hasReceivedFirstToken) {
          // If stopped before any token arrived, show clean notice
          setMessages((prev) => [
            ...prev,
            {
              id: botMessageId,
              role: "assistant",
              content: "Response stopped. What would you like to explore instead?",
              timestamp: botTimestamp,
              suggestions: [
                "Give me a practice problem",
                "Explain the formula step-by-step",
                "What are common exam pitfalls?",
              ],
            },
          ]);
        }
      } else {
        console.warn("[AI Tutor] Request failed:", err?.message || err);
        const calmNotice =
          "The Wisdom Tower AI Tutor is currently experiencing high demand. Please wait a moment and try asking your question again.";

        if (!hasReceivedFirstToken) {
          setMessages((prev) => [
            ...prev,
            {
              id: "err-" + Date.now(),
              role: "assistant",
              content: calmNotice,
              timestamp: botTimestamp,
              suggestions: [
                "Try asking again",
                "Explain in simpler terms",
                "Give me an example",
              ],
            },
          ]);
        } else {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === botMessageId
                ? {
                    ...m,
                    content: m.content + "\n\n*(Response stopped due to high server demand. You can ask to continue.)*",
                    suggestions: ["Please continue where you left off", "Summarize this topic"],
                  }
                : m
            )
          );
        }
      }
    } finally {
      setIsThinking(false);
      setIsStreaming(false);
      abortControllerRef.current = null;
      setTimeout(() => keepTypingEdgeInView(true), 100);
    }
  }

  function handleStop() {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsThinking(false);
    setIsStreaming(false);
    // User can type again immediately
    inputRef.current?.focus();
  }

  function handleCopy(id: string, text: string) {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  }

  const handleNewChat = useCallback(() => {
    if (isBusy) {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      setIsThinking(false);
      setIsStreaming(false);
    }
    const fresh = createNewSession();
    setSessions((prev) => [fresh, ...prev]);
    setActiveSessionId(fresh.id);
    setInput("");
    setShowHistory(false);
    setTimeout(() => {
      inputRef.current?.focus();
      scrollToBottom(false);
    }, 50);
  }, [isBusy, scrollToBottom]);

  const handleSelectSession = useCallback(
    (sessionId: string) => {
      if (sessionId === activeSessionId) {
        setShowHistory(false);
        return;
      }
      if (isBusy) {
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
          abortControllerRef.current = null;
        }
        setIsThinking(false);
        setIsStreaming(false);
      }
      setActiveSessionId(sessionId);
      setInput("");
      setShowHistory(false);
      setTimeout(() => {
        inputRef.current?.focus();
        scrollToBottom(false);
      }, 50);
    },
    [activeSessionId, isBusy, scrollToBottom]
  );

  const handleDeleteSession = useCallback(
    (sessionId: string, e?: React.MouseEvent) => {
      e?.stopPropagation();
      if (isBusy && sessionId === activeSessionId) {
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
          abortControllerRef.current = null;
        }
        setIsThinking(false);
        setIsStreaming(false);
      }
      setSessions((prev) => {
        const filtered = prev.filter((s) => s.id !== sessionId);
        if (filtered.length === 0) {
          const fresh = createNewSession();
          setActiveSessionId(fresh.id);
          return [fresh];
        }
        if (sessionId === activeSessionId) {
          setActiveSessionId(filtered[0].id);
        }
        return filtered;
      });
    },
    [activeSessionId, isBusy]
  );

  const handleClearAllSessions = useCallback(() => {
    if (isBusy) {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      setIsThinking(false);
      setIsStreaming(false);
    }
    const fresh = createNewSession();
    setSessions([fresh]);
    setActiveSessionId(fresh.id);
    setShowHistory(false);
    setInput("");
    setTimeout(() => {
      inputRef.current?.focus();
      scrollToBottom(false);
    }, 50);
  }, [isBusy, scrollToBottom]);

  const handleClear = useCallback(() => {
    if (isBusy) {
      handleStop();
    }
    setMessages([]);
    inputRef.current?.focus();
  }, [isBusy, setMessages]);

  // Expose optional window.__wtaTutorApi so the native app header can trigger chat history, new chat, or close
  useEffect(() => {
    if (typeof window === "undefined") return;

    window.__wtaTutorApi = {
      openHistory: () => setShowHistory(true),
      closeHistory: () => setShowHistory(false),
      toggleHistory: () => setShowHistory((prev) => !prev),
      newChat: handleNewChat,
      close: handleClose,
      clear: handleClear,
    };

    return () => {
      try {
        delete window.__wtaTutorApi;
      } catch {
        (window as any).__wtaTutorApi = undefined;
      }
    };
  }, [handleNewChat, handleClose, handleClear]);

  function handleSuggestionClick(prompt: string) {
    if (isBusy) return;
    sendMessage(prompt, false);
  }

  if (!isOpen) return null;

  return (
    <div
      data-ai-tutor-root
      data-native-overlay={isNativeOverlay ? "true" : undefined}
      className={
        isStandalone
          ? `fixed inset-0 z-[150] flex flex-col bg-[#050914] w-full h-[100dvh] max-h-[100dvh] overflow-hidden sm:relative sm:inset-auto sm:z-auto sm:w-full sm:max-w-4xl sm:mx-auto sm:h-full sm:max-h-[85vh] sm:rounded-3xl sm:border sm:border-cyan-400/30 sm:bg-[#091122]/95 sm:backdrop-blur-2xl sm:shadow-2xl sm:ring-1 sm:ring-cyan-500/20 animate-in fade-in duration-200 ${
              isNativeOverlay ? "wta-native-tool-overlay" : ""
            }`
          : `fixed inset-0 z-[150] flex flex-col bg-[#050914] w-full h-[100dvh] max-h-[100dvh] overflow-hidden sm:relative sm:inset-auto sm:z-auto sm:w-full sm:max-w-4xl sm:mx-auto sm:h-[680px] sm:max-h-[85vh] sm:rounded-3xl sm:border sm:border-cyan-400/30 sm:bg-[#091122]/95 sm:backdrop-blur-2xl sm:shadow-2xl sm:ring-1 sm:ring-cyan-500/20 animate-in fade-in duration-200 ${
              isNativeOverlay ? "wta-native-tool-overlay" : ""
            }`
      }
      style={viewportStyle}
    >
      {/* ── Top Header (web / standalone default; hidden inside native tool overlay) ── */}
      <header
        data-ai-tutor-header
        className={`px-2.5 sm:px-4 py-2 sm:py-2.5 border-b border-white/10 bg-[#0c162a]/95 backdrop-blur-xl flex items-center justify-between shrink-0 select-none z-20 pt-[max(0.75rem,env(safe-area-inset-top,0px))] gap-1 ${
          isNativeOverlay ? "!hidden" : ""
        }`}
        style={isNativeOverlay ? { display: "none" } : headerStyle}
      >
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          {/* Chats history drawer toggle */}
          <button
            type="button"
            onClick={() => setShowHistory((prev) => !prev)}
            title="Open past study chats"
            aria-label="Toggle chat history"
            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl border text-xs font-semibold active:scale-95 transition-all cursor-pointer shrink-0 ${
              showHistory
                ? "bg-cyan-500/20 border-cyan-400/50 text-cyan-200 shadow-xs"
                : "bg-white/5 hover:bg-white/10 border-white/10 text-slate-300 hover:text-white"
            }`}
          >
            <History className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="text-[11px] font-bold">Chats</span>
            <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.2 rounded-full font-bold">
              {sessions.length}
            </span>
          </button>

          <div className="hidden xs:flex w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 items-center justify-center text-white shadow-md shadow-cyan-500/20 shrink-0">
            <GraduationCap className="w-4 h-4 text-cyan-100" />
          </div>

          <div className="min-w-0">
            <h3 className="text-xs sm:text-sm font-bold text-white tracking-wide truncate max-w-[80px] xs:max-w-[140px] sm:max-w-[260px]">
              {activeSession.title !== "New chat"
                ? activeSession.title
                : "AI Tutor"}
            </h3>
            <p className="text-[10px] text-slate-400 truncate hidden md:block">
              Ethiopian Academic Study Coach
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* + New Chat Button */}
          <button
            type="button"
            onClick={handleNewChat}
            title="Start a fresh chat session"
            aria-label="New chat session"
            className="flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 hover:text-white border border-cyan-400/35 text-xs font-bold active:scale-95 transition-all cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="text-[11px] font-bold">
              <span className="inline sm:hidden">New</span>
              <span className="hidden sm:inline">New chat</span>
            </span>
          </button>

          {/* Clear current chat messages */}
          <button
            type="button"
            onClick={handleClear}
            title="Clear current messages"
            aria-label="Clear chat"
            className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 text-xs font-semibold active:scale-95 transition-all cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Clear</span>
          </button>

          {/* Close button */}
          <button
            type="button"
            onClick={handleClose}
            title="Close AI Tutor and return"
            aria-label="Close AI Tutor"
            className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-rose-500/25 hover:bg-rose-500/35 text-rose-200 hover:text-white border border-rose-500/40 text-xs sm:text-sm font-bold active:scale-95 shadow-sm transition-all cursor-pointer"
          >
            <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
            <span>Close</span>
          </button>
        </div>
      </header>

      {/* ── Compact In-Body Toolbar: Rendered in native tool overlay so Chats drawer & New chat stay accessible ── */}
      {isNativeOverlay && (
        <div
          data-ai-tutor-inbody-toolbar
          className="px-3 py-2 border-b border-white/10 bg-[#0c162a]/95 backdrop-blur-xl flex items-center justify-between shrink-0 select-none z-20 gap-2"
        >
          <div className="flex items-center gap-1.5 min-w-0">
            {/* Chats history drawer toggle */}
            <button
              type="button"
              onClick={() => setShowHistory((prev) => !prev)}
              title="Open past study chats"
              aria-label="Toggle chat history"
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-semibold active:scale-95 transition-all cursor-pointer shrink-0 ${
                showHistory
                  ? "bg-cyan-500/20 border-cyan-400/50 text-cyan-200 shadow-xs"
                  : "bg-white/5 hover:bg-white/10 border-white/10 text-slate-300 hover:text-white"
              }`}
            >
              <History className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="text-xs font-bold">Chats</span>
              <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.2 rounded-full font-bold">
                {sessions.length}
              </span>
            </button>

            <div className="min-w-0">
              <span className="text-xs font-semibold text-slate-300 truncate block max-w-[140px] xs:max-w-[220px]">
                {activeSession.title !== "New chat"
                  ? activeSession.title
                  : "AI Tutor"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* + New Chat Button */}
            <button
              type="button"
              onClick={handleNewChat}
              title="Start a fresh chat session"
              aria-label="New chat session"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 hover:text-white border border-cyan-400/35 text-xs font-bold active:scale-95 transition-all cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="text-xs font-bold">New</span>
            </button>

            {/* Clear messages */}
            <button
              type="button"
              onClick={handleClear}
              title="Clear current messages"
              aria-label="Clear chat"
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 text-xs active:scale-95 transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ── Slide-Out History Panel ── */}
      {showHistory && (
        <div className="absolute inset-0 z-40 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
            onClick={() => setShowHistory(false)}
          />

          {/* Side Sheet */}
          <div className="relative w-[85vw] max-w-xs sm:max-w-sm h-full bg-[#0a1224] border-r border-white/10 shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
            {/* Drawer Header */}
            <div
              className={`p-3.5 sm:p-4 border-b border-white/10 flex items-center justify-between ${
                isNativeOverlay ? "pt-3.5 sm:pt-4" : "pt-[max(0.75rem,env(safe-area-inset-top,0px))]"
              }`}
              style={isNativeOverlay ? undefined : headerStyle}
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-cyan-400" />
                <h4 className="text-sm font-bold text-white tracking-wide">
                  Study Chats
                </h4>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-semibold">
                  {sessions.length}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowHistory(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Close history"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* + New Chat Action in Drawer */}
            <div className="p-3 border-b border-white/5">
              <button
                type="button"
                onClick={handleNewChat}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold text-xs shadow-md shadow-cyan-500/20 hover:brightness-110 active:scale-98 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>+ Start New Chat</span>
              </button>
            </div>

            {/* Sessions List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1.5 overscroll-contain">
              {sessions.map((s) => {
                const isActive = s.id === activeSessionId;
                const userMsgsCount = s.messages.filter(
                  (m) => m && m.role === "user"
                ).length;

                return (
                  <div
                    key={s.id}
                    onClick={() => handleSelectSession(s.id)}
                    className={`group flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all border ${
                      isActive
                        ? "bg-cyan-500/15 border-cyan-400/40 text-white shadow-sm"
                        : "bg-white/[0.03] hover:bg-white/[0.08] border-white/5 text-slate-300 hover:text-white"
                    }`}
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-xs font-semibold truncate ${
                            isActive ? "text-cyan-200" : "text-slate-200"
                          }`}
                        >
                          {s.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          {formatSessionTime(s.updatedAt)}
                        </span>
                        <span>•</span>
                        <span>
                          {userMsgsCount}{" "}
                          {userMsgsCount === 1 ? "question" : "questions"}
                        </span>
                        {isActive && (
                          <>
                            <span>•</span>
                            <span className="text-cyan-400 font-bold">
                              Active
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={(e) => handleDeleteSession(s.id, e)}
                      title="Delete chat session"
                      className="opacity-60 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 transition-all cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Clear All Footer */}
            {sessions.length > 1 && (
              <div className="p-3 border-t border-white/10 bg-[#070d1a]">
                <button
                  type="button"
                  onClick={handleClearAllSessions}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-semibold text-rose-300 hover:text-rose-200 hover:bg-rose-500/15 border border-rose-500/20 transition-all cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear All Past Chats</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Scrollable Messages Container ── */}
      <div
        ref={scrollContainerRef}
        className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-3.5 sm:p-5 space-y-4 pb-10"
      >
        {/* Empty Session Welcome State */}
        {messages.length === 0 && (
          <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-4 sm:p-6 space-y-4 max-w-md mx-auto my-auto animate-in fade-in duration-200">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden border border-cyan-400/30 bg-[#091122] flex items-center justify-center shadow-lg shadow-cyan-500/15">
              <Image
                src="/animation.gif"
                alt="Wisdom Tower AI Tutor"
                width={64}
                height={64}
                unoptimized
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
                Wisdom Tower AI Tutor
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                Ask any academic concept, formula, derivation, or Ethiopian exam problem.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2 pt-2">
              {[
                "Ethiopian university GPA calculation",
                "Derivative power rule step-by-step",
                "Newton's Laws with worked examples",
              ].map((prompt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSuggestionClick(prompt)}
                  disabled={isBusy}
                  className="text-xs px-3 py-1.5 rounded-full bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-200 hover:text-white border border-cyan-400/25 transition-all active:scale-95 cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, index) => {
          const isBot = m.role === "assistant";
          const isLatestBot = isBot && index === messages.length - 1;

          return (
            <div key={m.id} className="space-y-2.5">
              <div
                className={`flex gap-2.5 sm:gap-3 ${isBot ? "items-start" : "items-end justify-end"}`}
              >
                {isBot && (
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl overflow-hidden border border-cyan-400/30 bg-[#091122] flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <Image
                      src="/animation.gif"
                      alt="Wisdom Tower AI Tutor"
                      width={36}
                      height={36}
                      unoptimized
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div
                  className={`group relative rounded-2xl p-3.5 sm:p-4 text-sm sm:text-base leading-relaxed ${
                    isBot
                      ? "w-full max-w-full sm:max-w-[92%] bg-[#0c1628]/95 border border-white/10 text-slate-100 shadow-md"
                      : "max-w-[90%] sm:max-w-[80%] bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 font-medium rounded-br-xs shadow-md shadow-cyan-500/20"
                  }`}
                >
                  {/* KaTeX and Markdown parsed rich mathematical body */}
                  <div className="break-words font-sans">
                    <RichContent
                      body={m.content}
                      className={
                        isBot
                          ? "text-slate-100 study-prose text-sm sm:text-base"
                          : "text-slate-950 font-medium text-sm sm:text-base"
                      }
                    />
                  </div>

                  {/* Active typewriter typing edge anchor */}
                  {isLatestBot && isStreaming && (
                    <div ref={typingAnchorRef} className="h-1 w-full shrink-0" />
                  )}

                  <div
                    className={`mt-2 flex items-center justify-between gap-3 text-[11px] ${
                      isBot ? "text-slate-400" : "text-slate-900/75"
                    }`}
                  >
                    <span>{m.timestamp}</span>

                    {isBot && (
                      <button
                        type="button"
                        onClick={() => handleCopy(m.id, m.content)}
                        className="opacity-70 sm:opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/10 transition-opacity cursor-pointer inline-flex items-center gap-1 text-slate-400 hover:text-white"
                        title="Copy text"
                      >
                        {copiedId === m.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-[11px] text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {!isBot && (
                  <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0 mb-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>

              {/* ── Follow-up Suggestions Chips (up to 3 short tappable prompts) ── */}
              {isBot && m.suggestions && m.suggestions.length > 0 && (!isBusy || !isLatestBot) && (
                <div className="pl-10 sm:pl-11 pr-2 animate-in fade-in duration-200">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    {m.suggestions.slice(0, 3).map((sug, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSuggestionClick(sug)}
                        disabled={isBusy}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-cyan-500/10 hover:bg-cyan-500/20 active:bg-cyan-500/30 text-cyan-200 hover:text-white border border-cyan-400/25 hover:border-cyan-400/50 transition-all active:scale-95 text-left cursor-pointer shadow-xs disabled:opacity-40 disabled:pointer-events-none"
                      >
                        <Sparkles className="w-3 h-3 text-cyan-300 shrink-0" />
                        <span>{sug}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* ── Classic Bouncing Dots Thinking Indicator (NOT the avatar GIF) ── */}
        {isThinking && (
          <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#0c1628]/95 border border-cyan-400/25 text-slate-200 w-fit shadow-md animate-in fade-in duration-150">
            <span className="text-xs font-semibold text-cyan-300 tracking-wide">
              Thinking
            </span>
            <span className="flex items-center gap-1 mt-0.5" aria-hidden="true">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" />
            </span>
          </div>
        )}

        <div ref={messagesEndRef} className="h-4 w-full shrink-0" />
      </div>

      {/* ── Fixed Bottom Composer Bar (Always Pinned Above Virtual Keyboard) ── */}
      <footer
        data-ai-tutor-footer
        className="shrink-0 p-2.5 sm:p-3.5 border-t border-white/10 bg-[#070d1d] z-30 pb-[max(0.6rem,calc(env(safe-area-inset-bottom,0px)+0.4rem))]"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="flex items-center gap-2 max-w-4xl mx-auto w-full"
        >
          <input
            ref={inputRef}
            type="text"
            id="wt-ai-tutor-input"
            name="query"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
            }}
            onFocus={handleInputFocus}
            onClick={handleInputFocus}
            placeholder={
              isBusy
                ? "AI Tutor is responding (click Stop to cancel)..."
                : "Ask a concept, formula, or problem…"
            }
            autoComplete="off"
            autoCorrect="on"
            enterKeyHint="send"
            className="flex-1 bg-[#060b17] border border-white/15 focus:border-cyan-400 rounded-2xl px-3.5 py-2.5 sm:py-3 text-base text-white placeholder-slate-400 focus:outline-none transition-colors"
          />

          {/* Abort button when loading/streaming, Send button otherwise */}
          {isBusy ? (
            <button
              type="button"
              onClick={handleStop}
              className="px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-2xl bg-amber-500/25 hover:bg-amber-500/35 text-amber-200 hover:text-white border border-amber-400/40 text-xs sm:text-sm font-bold transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 shrink-0 shadow-md"
              aria-label="Stop generating"
              title="Stop generating"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Stop</span>
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              className="p-2.5 sm:p-3 rounded-2xl bg-cyan-400 text-slate-950 hover:bg-cyan-300 disabled:opacity-40 disabled:hover:bg-cyan-400 font-bold transition-all active:scale-95 cursor-pointer shadow-md shadow-cyan-500/25 shrink-0 flex items-center justify-center"
              aria-label="Send question"
            >
              <Send className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}
        </form>
      </footer>
    </div>
  );
}
