"use client";

import BrandLogo from "@/components/BrandLogo";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import {
  Menu,
  X,
  LogOut,
  Shield,
  GraduationCap,
  ChevronDown,
  User,
  Settings,
  ShoppingBag,
  Package,
  ExternalLink,
  Home,
  BookOpen,
  Info,
  Mail,
  Gamepad2,
  Compass,
  Sparkles,
  Calculator as CalcIcon,
  Folder,
  Timer,
} from "lucide-react";
import { supabase, recoverSession } from "@/lib/supabase";
import { isAdminEmail } from "@/lib/admin";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import HeaderLibraryLinks from "@/components/HeaderLibraryLinks";
import { IS_FREE_MODE } from "@/lib/ownership";
import RefreshButton from "@/components/RefreshButton";
import StudentAvatar from "@/components/StudentAvatar";
import { DIGITAL_URL } from "@/lib/digital-url";
import { requestOpenTool } from "@/lib/native-app";

const mainNavLinks = [
  { href: "/", label: "Home" },
  { href: "/academy", label: "Academy" },
  { href: "/packages", label: "Packages" },
  { href: "/learning", label: "My Learning" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Header() {
  const pathname = usePathname() ?? "/";
  const [isOpen, setIsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const handleLaunchTool = (e: React.MouseEvent, toolKey: string) => {
    // If not on /learning, prefer opening the non-destructive tool overlay over full site navigation away from hub content
    if (pathname !== "/learning") {
      e.preventDefault();
      setIsOpen(false);
      requestOpenTool(toolKey);
      return;
    }

    if (typeof window !== "undefined") {
      const full = window.location.pathname + window.location.search + window.location.hash;
      if (full && !full.includes("tool=")) {
        sessionStorage.setItem("wt_prior_study_route", full);
      }
    }
    setIsOpen(false);
  };

  useEffect(() => {
    let cancelled = false;

    const apply = (u: SupabaseUser | null) => {
      if (!cancelled) {
        setUser(u);
        setLoading(false);
      }
    };

    (async () => {
      const session = await recoverSession();
      apply(session?.user ?? null);
    })();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      apply(session?.user ?? null);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setProfileOpen(false);

    // Track last study route so tools can return student to their exact study place
    if (
      pathname &&
      pathname !== "/learning" &&
      !pathname.startsWith("/login") &&
      !pathname.startsWith("/signup") &&
      !pathname.startsWith("/auth")
    ) {
      try {
        const full =
          typeof window !== "undefined"
            ? window.location.pathname + window.location.search
            : pathname;
        sessionStorage.setItem("wt_prior_study_route", full);
      } catch {}
    }
  }, [pathname]);

  useEffect(() => {
    if (!profileOpen) return;
    const onPointer = (e: MouseEvent | TouchEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("touchstart", onPointer, { passive: true });
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("touchstart", onPointer);
    };
  }, [profileOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onPointer = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("touchstart", onPointer, { passive: true });
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("touchstart", onPointer);
    };
  }, [isOpen]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsOpen(false);
    setProfileOpen(false);
  };

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "Student";

  const isAdmin = isAdminEmail(user?.email);

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 bg-wisdom-dark/95 backdrop-blur-md border-b border-white/5 site-header"
        data-site-header="true"
        role="banner"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Top-Left Corner: Menu Button + Brand Logo */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <button
                type="button"
                className="p-2 rounded-xl text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-cyan-400/40 transition-all cursor-pointer shadow-sm active:scale-95"
                onClick={() => setIsOpen(true)}
                aria-label="Navigation Menu"
                aria-expanded={isOpen}
              >
                <Menu className="w-5 h-5 text-cyan-300" />
              </button>

              <Link href="/" className="flex items-center gap-2.5 group min-w-0">
                <span className="relative w-9 h-9 shrink-0 rounded-lg overflow-hidden ring-1 ring-white/10 bg-black">
                  <BrandLogo size={36} className="w-full h-full object-contain p-0.5" priority />
                </span>
                <span className="font-semibold text-lg tracking-tight group-hover:text-amber-300 transition-colors truncate">
                  Wisdom Tower Academy
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-5" aria-label="Main">
              {mainNavLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="nav-link text-sm text-wisdom-muted hover:text-amber-300 transition-colors"
                  data-active={isActivePath(pathname, link.href) ? "true" : undefined}
                >
                  {link.label}
                </Link>
              ))}
              <a
                href={DIGITAL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-wisdom-muted hover:text-wisdom-cyan transition-colors"
              >
                Digital
                <ExternalLink className="w-3.5 h-3.5 opacity-70" />
              </a>

              {!loading && (
                <div className="flex items-center gap-1.5 ml-1">
                  <HeaderLibraryLinks />
                  <RefreshButton />
                  {user ? (
                    <div className="relative" ref={profileRef}>
                      <button
                        type="button"
                        onClick={() => setProfileOpen((v) => !v)}
                        aria-expanded={profileOpen}
                        aria-haspopup="menu"
                        className={`flex items-center gap-1.5 rounded-full p-0.5 pr-1.5 border transition-all ${
                          profileOpen
                            ? "border-amber-400/50 bg-amber-500/10"
                            : "border-white/10 hover:border-white/25"
                        }`}
                      >
                        <StudentAvatar
                          avatarPreset={user?.user_metadata?.avatar_preset}
                          avatarUrl={user?.user_metadata?.avatar_url}
                          name={displayName}
                          size="xs"
                          className="rounded-full"
                          showGlow={false}
                        />
                        <ChevronDown
                          className={`w-3.5 h-3.5 text-wisdom-muted ${profileOpen ? "rotate-180" : ""}`}
                        />
                      </button>
                      {profileOpen && (
                        <div
                          className="absolute right-0 top-full mt-2.5 w-[17.5rem] rounded-2xl border border-white/12 bg-[#0a0f1a] shadow-2xl overflow-hidden z-[70]"
                          role="menu"
                        >
                          <div className="px-4 py-3 border-b border-white/10">
                            <p className="text-sm font-semibold text-white truncate">{displayName}</p>
                            <p className="text-[11px] text-wisdom-muted truncate">{user.email}</p>
                          </div>
                          <div className="py-1.5">
                            <Link href="/learning" role="menuitem" className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/90 hover:bg-white/5" onClick={() => setProfileOpen(false)}>
                              <GraduationCap className="w-4 h-4 text-amber-400" />
                              My Learning
                            </Link>
                            <Link href="/packages" role="menuitem" className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/90 hover:bg-white/5" onClick={() => setProfileOpen(false)}>
                              <Package className="w-4 h-4 text-wisdom-muted" />
                              Packages
                            </Link>
                            {!IS_FREE_MODE && (
                              <Link href="/cart" role="menuitem" className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/90 hover:bg-white/5" onClick={() => setProfileOpen(false)}>
                                <ShoppingBag className="w-4 h-4 text-wisdom-muted" />
                                Cart
                              </Link>
                            )}
                            <Link href="/account" role="menuitem" className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/90 hover:bg-white/5" onClick={() => setProfileOpen(false)}>
                              <User className="w-4 h-4 text-wisdom-muted" />
                              My Account
                            </Link>
                            <Link href="/settings" role="menuitem" className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/90 hover:bg-white/5" onClick={() => setProfileOpen(false)}>
                              <Settings className="w-4 h-4 text-wisdom-muted" />
                              Settings
                            </Link>
                            {isAdmin && (
                              <Link href="/admin?tab=grants" role="menuitem" className="flex items-center gap-3 px-4 py-2.5 text-sm text-amber-300 hover:bg-amber-500/10" onClick={() => setProfileOpen(false)}>
                                <Shield className="w-4 h-4" />
                                Admin
                              </Link>
                            )}
                            <a href={DIGITAL_URL} target="_blank" rel="noopener noreferrer" role="menuitem" className="flex items-center gap-3 px-4 py-2.5 text-sm text-wisdom-cyan hover:bg-white/5" onClick={() => setProfileOpen(false)}>
                              <ExternalLink className="w-4 h-4" />
                              Wisdom Digital
                            </a>
                          </div>
                          <div className="border-t border-white/10 py-1.5">
                            <button type="button" role="menuitem" onClick={() => void handleLogout()} className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 text-left cursor-pointer">
                              <LogOut className="w-4 h-4" />
                              Sign out
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2.5 ml-2">
                      <Link
                        href="/login"
                        className="px-3.5 py-2 rounded-xl text-sm font-semibold text-wisdom-muted hover:text-white hover:bg-white/5 transition-all"
                      >
                        Sign In
                      </Link>
                      <Link
                        href="/signup"
                        className="btn-accent px-4 py-2 text-sm shadow-md"
                      >
                        Get Started
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </nav>

            {/* Mobile Header Right Icons */}
            <div className="md:hidden flex items-center gap-1.5">
              <RefreshButton />
              <HeaderLibraryLinks size="lg" onNavigate={() => setIsOpen(false)} />
              {user ? (
                <Link
                  href="/account"
                  className="p-1 rounded-full border border-white/15 bg-white/5 hover:border-amber-400/40 transition-colors"
                  title="My Account"
                >
                  <StudentAvatar
                    avatarPreset={user?.user_metadata?.avatar_preset}
                    avatarUrl={user?.user_metadata?.avatar_url}
                    name={displayName}
                    size="xs"
                    className="rounded-full"
                    showGlow={false}
                  />
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-amber-300 bg-amber-400/15 border border-amber-400/30"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ========================================================= */}
      {/* COOL LEFT SLIDE-OUT NAVIGATION DRAWER                     */}
      {/* ========================================================= */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex animate-in fade-in duration-200">
          {/* Ambient Backdrop Blur */}
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Surface */}
          <div
            ref={menuRef}
            className="relative w-[min(22rem,85vw)] h-full bg-gradient-to-b from-[#091122] via-[#060b17] to-[#040810] border-r border-white/15 shadow-2xl flex flex-col justify-between overflow-hidden z-10 animate-in slide-in-from-left duration-300"
          >
            {/* Drawer Top Header */}
            <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="relative w-8 h-8 shrink-0 rounded-lg overflow-hidden ring-1 ring-white/15 bg-black">
                  <BrandLogo size={32} className="w-full h-full object-contain p-0.5" priority />
                </span>
                <div>
                  <h3 className="font-display font-bold text-base text-white tracking-tight truncate leading-none">
                    Wisdom Tower
                  </h3>
                  <span className="text-[10px] text-cyan-300 font-semibold tracking-wider uppercase">
                    Academy Portal
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                aria-label="Close menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Navigation Body */}
            <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-4">
              {/* Scholar Account Badge if logged in */}
              {user && (
                <div className="p-3.5 rounded-2xl border border-white/12 bg-gradient-to-r from-sky-500/10 to-indigo-500/10 flex items-center gap-3">
                  <StudentAvatar
                    avatarPreset={user?.user_metadata?.avatar_preset}
                    avatarUrl={user?.user_metadata?.avatar_url}
                    name={displayName}
                    size="sm"
                    className="rounded-full shrink-0"
                    showGlow={false}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white truncate">{displayName}</p>
                    <p className="text-[10px] text-slate-300 truncate">{user.email}</p>
                    <span className="inline-block mt-1 text-[9px] font-bold text-cyan-300 px-2 py-0.5 rounded-md bg-cyan-400/15 border border-cyan-400/25">
                      Enrolled Scholar
                    </span>
                  </div>
                </div>
              )}

              {/* Platform Navigation Links */}
              <nav className="space-y-1">
                <p className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">
                  Academic Platform
                </p>
                {[
                  { href: "/", label: "Home", icon: Home },
                  { href: "/academy", label: "Academy", icon: GraduationCap },
                  { href: "/packages", label: "Packages", icon: Package },
                  { href: "/learning", label: "My Learning", icon: BookOpen },
                  /* Games commented out per request
                  { href: "/games/tower-climb", label: "Tower Climb", icon: Compass },
                  { href: "/games/tower-defense", label: "Tower Defense", icon: Gamepad2 },
                  */
                  ...(!IS_FREE_MODE ? [{ href: "/cart", label: "Cart & Checkout", icon: ShoppingBag }] : []),
                  { href: "/account", label: "Student Profile & ID", icon: User },
                  { href: "/settings", label: "Settings", icon: Settings },
                  { href: "/about", label: "About Academy", icon: Info },
                  { href: "/contact", label: "Support & Contact", icon: Mail },
                ].map((item) => {
                  const Icon = item.icon;
                  const active = isActivePath(pathname, item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                        active
                          ? "bg-cyan-500/15 text-cyan-300 border border-cyan-400/30 shadow-sm"
                          : "text-slate-300 hover:text-white hover:bg-white/5 border border-transparent"
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${active ? "text-cyan-300" : "text-slate-400"}`} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}

                {isAdmin && (
                  <Link
                    href="/admin?tab=grants"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-amber-300 hover:bg-amber-500/10 transition-colors"
                  >
                    <Shield className="w-4 h-4 text-amber-300 shrink-0" />
                    <span>Admin Panel</span>
                  </Link>
                )}

                {/* Quick Study Tools in Drawer */}
                <div className="pt-3 border-t border-white/10">
                  <p className="px-3 text-[10px] font-black uppercase tracking-wider text-cyan-400 mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-cyan-400" />
                    <span>Study Tools</span>
                  </p>
                  <div className="grid grid-cols-2 gap-1.5 px-1">
                    <Link
                      href={`/learning?tool=tutor`}
                      onClick={(e) => handleLaunchTool(e, "tutor")}
                      className="flex items-center gap-2 p-2 rounded-xl text-xs font-semibold bg-white/[0.04] hover:bg-cyan-500/15 text-slate-300 hover:text-cyan-300 border border-white/10 transition-all cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
                      <span className="truncate">AI Tutor</span>
                    </Link>
                    <Link
                      href={`/learning?tool=calculator`}
                      onClick={(e) => handleLaunchTool(e, "calculator")}
                      className="flex items-center gap-2 p-2 rounded-xl text-xs font-semibold bg-white/[0.04] hover:bg-cyan-500/15 text-slate-300 hover:text-cyan-300 border border-white/10 transition-all cursor-pointer"
                    >
                      <CalcIcon className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
                      <span className="truncate">Calculator</span>
                    </Link>
                    <Link
                      href={`/learning?tool=notes`}
                      onClick={(e) => handleLaunchTool(e, "notes")}
                      className="flex items-center gap-2 p-2 rounded-xl text-xs font-semibold bg-white/[0.04] hover:bg-cyan-500/15 text-slate-300 hover:text-cyan-300 border border-white/10 transition-all cursor-pointer"
                    >
                      <Folder className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      <span className="truncate">Notebook</span>
                    </Link>
                    <Link
                      href={`/learning?tool=timer`}
                      onClick={(e) => handleLaunchTool(e, "timer")}
                      className="flex items-center gap-2 p-2 rounded-xl text-xs font-semibold bg-white/[0.04] hover:bg-cyan-500/15 text-slate-300 hover:text-cyan-300 border border-white/10 transition-all cursor-pointer"
                    >
                      <Timer className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      <span className="truncate">Pomodoro</span>
                    </Link>
                  </div>
                </div>

                <div className="pt-2">
                  <a
                    href={DIGITAL_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold text-wisdom-cyan hover:bg-white/5 transition-colors border border-cyan-400/20 bg-cyan-500/5"
                  >
                    <span className="flex items-center gap-3">
                      <ExternalLink className="w-4 h-4 shrink-0" />
                      <span>Wisdom Digital</span>
                    </span>
                    <span className="text-[10px] text-cyan-400 uppercase font-mono">External</span>
                  </a>
                </div>
              </nav>
            </div>

            {/* Drawer Bottom Section: Sign Out below all items */}
            <div className="p-4 border-t border-white/10 bg-[#040810]/90">
              {user ? (
                <button
                  type="button"
                  onClick={() => void handleLogout()}
                  className="flex items-center justify-center gap-2.5 w-full py-3 px-4 rounded-xl text-sm font-bold bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/35 text-rose-300 hover:text-rose-200 transition-all cursor-pointer shadow-md active:scale-98"
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  <span>Sign Out</span>
                </button>
              ) : (
                <div className="space-y-2">
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="block text-center text-sm font-bold text-white/90 hover:text-white py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setIsOpen(false)}
                    className="btn-accent block text-center w-full py-2.5 text-sm font-extrabold shadow-md"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
