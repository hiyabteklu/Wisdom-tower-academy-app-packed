"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ExternalLink,
  GraduationCap,
  LogIn,
} from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { useInView } from "@/hooks/useInView";
import InfinityCard from "@/components/home/InfinityCard";
import LandingPathways from "@/components/home/LandingPathways";
import { DIGITAL_URL } from "@/lib/digital-url";
import { supabase, recoverSession } from "@/lib/supabase";
import { getCachedAuthUser } from "@/lib/swr-cache";

const stats = [
  { value: 30, suffix: "K+", label: "Users", image: "/images/home/stat-users.jpg" },
  { value: 10, suffix: "+", label: "Partners", image: "/images/home/stat-partners.jpg" },
  { value: 70, suffix: "+", label: "Services", image: "/images/home/stat-services.jpg" },
];

const ACADEMY_IMAGE = "/images/home/academy.jpg";
const HERO_BG = "/images/home/hero-bg.jpg";

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

function CountUp({
  target,
  suffix,
  active,
  duration = 1600,
}: {
  target: number;
  suffix: string;
  active: boolean;
  duration?: number;
}) {
  const [display, setDisplay] = useState(0);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    if (!active) {
      setDisplay(0);
      return;
    }
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(target * eased));
      if (t < 1) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [active, target, duration]);

  return (
    <span>
      {display}
      {suffix}
    </span>
  );
}

function StatsSlider({ visible, reduced }: { visible: boolean; reduced: boolean }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduced || !visible) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % stats.length);
    }, 3200);
    return () => window.clearInterval(id);
  }, [reduced, visible]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5 hide-on-app">
      {stats.map((stat, i) => {
        const active = reduced ? visible : visible && i === index;
        return (
          <div
            key={stat.label}
            className={`stat-card relative overflow-hidden rounded-2xl border border-white/12 bg-wisdom-navy min-h-[12.5rem] md:min-h-[14rem] transition-all duration-500 hide-on-app ${
              active ? "opacity-100 scale-100" : "opacity-90 scale-[0.99]"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={stat.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />
            <div className="relative z-10 flex h-full flex-col justify-end p-5 sm:p-6">
              <p className="font-display text-3xl sm:text-4xl font-black text-white tabular-nums drop-shadow-md">
                <CountUp target={stat.value} suffix={stat.suffix} active={visible} />
              </p>
              <p className="text-sm font-semibold text-white/90 mt-1 drop-shadow-sm">{stat.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function LandingPage() {
  const reduced = usePrefersReducedMotion();
  const heroSection = useInView({ eager: true });
  const statsSection = useInView();
  const crossSection = useInView();
  const ctaSection = useInView();

  const [user, setUser] = useState<SupabaseUser | null>(() => getCachedAuthUser());
  const [authReady, setAuthReady] = useState(() => Boolean(getCachedAuthUser()));
  const [imgOk, setImgOk] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const apply = (u: SupabaseUser | null) => {
      if (!cancelled) {
        setUser(u);
        setAuthReady(true);
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

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "Student";

  const isSignedIn = Boolean(user);

  return (
    <div className="relative">
      <section
        className="relative overflow-hidden pt-8 pb-16 md:pt-12 md:pb-24"
        ref={heroSection.ref}
        suppressHydrationWarning
      >
        <div className="absolute inset-0" aria-hidden>
          {/* hero-bg photo removed to free space */}
          <div className="absolute inset-0 bg-gradient-to-b from-wisdom-dark/80 via-wisdom-dark/90 to-wisdom-dark" />
          <div className="landing-orb landing-orb-a" />
          <div className="landing-orb landing-orb-b" />
          <div className="landing-orb landing-orb-c" />
          <div className="landing-shine-sweep" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl is-visible">
            {/* cyan small label removed */}
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-5 leading-[1.1]">
              <span className="hero-word text-white">Wisdom</span>{" "}
              <span className="hero-word hero-word-accent animate-hero-gradient">Tower</span>{" "}
              <span className="hero-word text-white">Academy</span>
            </h1>
            {/* Structured pathways tagline removed */}

            <div className="flex flex-wrap gap-3.5 items-center min-h-[3.25rem] mb-8">
              <Link
                href="/academy"
                className="btn-primary text-sm sm:text-base px-6 py-3.5"
              >
                Enter Academy
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>

              {authReady && isSignedIn ? (
                <Link
                  href="/learning"
                  className="btn-secondary text-sm sm:text-base px-6 py-3.5"
                >
                  <GraduationCap className="w-4 h-4 text-cyan-300" />
                  My Learning
                </Link>
              ) : authReady ? (
                <Link
                  href="/login"
                  className="btn-secondary text-sm sm:text-base px-6 py-3.5 border-amber-400/40 hover:border-amber-400/60"
                >
                  <LogIn className="w-4 h-4 text-amber-300" />
                  Sign in
                </Link>
              ) : (
                <span className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border-2 border-transparent opacity-0 pointer-events-none select-none" aria-hidden>
                  <LogIn className="w-4 h-4" />
                  Sign in
                </span>
              )}
            </div>

            <p className="mt-4 text-xs text-wisdom-muted/80 min-h-[1.25rem]">
              {authReady && isSignedIn ? (
                <>
                  Welcome back, <span className="text-cyan-300 font-semibold">{displayName}</span>
                  {" · "}
                  <Link href="/learning" className="text-cyan-300/90 underline-offset-2 hover:underline font-medium">
                    Continue where you left off
                  </Link>
                </>
              ) : authReady ? (
                <>
                  New here?{" "}
                  <Link href="/signup" className="text-cyan-300 underline-offset-2 hover:underline font-semibold">
                    Create a free account
                  </Link>
                </>
              ) : null}
            </p>
          </div>

          {/* Welcome image as primary hero visual — stays full width on all screen sizes and links to Learning */}
          <div className="mt-8 sm:mt-10 w-full">
            <Link
              href="/learning"
              aria-label="Open Wisdom Tower Academy Learning Suite"
              className="group block relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/15 bg-wisdom-navy shadow-2xl shadow-black/40 cursor-pointer active:scale-[0.99] hover:border-cyan-400/40 hover:shadow-cyan-950/25 transition-all duration-300"
            >
              <div className="relative aspect-video sm:aspect-[21/9] w-full overflow-hidden bg-wisdom-navy min-h-[12rem] sm:min-h-[16rem]">
                {imgOk ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={ACADEMY_IMAGE}
                    alt="Wisdom Tower Academy Learning Environment - Tap to open Learning"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                    loading="eager"
                    decoding="async"
                    onError={() => setImgOk(false)}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-wisdom-navy via-cyan-950/40 to-wisdom-dark">
                    <p className="font-display text-xl sm:text-2xl font-bold text-white/90">Wisdom Tower Academy</p>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />

                {/* Obvious tappable indicator badge */}
                <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 z-10 flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-slate-950/85 backdrop-blur-md border border-white/20 text-[11px] sm:text-xs font-bold text-white shadow-xl group-hover:border-cyan-400/60 group-hover:bg-cyan-950/90 group-hover:text-cyan-200 transition-all">
                  <GraduationCap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" />
                  <span>Open Learning</span>
                  <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-cyan-400 transition-transform duration-200 group-hover:translate-x-0.5" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <LandingPathways />

      <section className="pb-20 md:pb-28 relative hide-on-app" ref={statsSection.ref}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6 items-stretch">
            <div className="lg:col-span-3 hide-on-app">
              <StatsSlider visible={statsSection.inView || reduced} reduced={reduced} />
            </div>
            <div className="lg:col-span-1 flex hide-on-app">
              <div className="w-full min-h-[12.5rem] md:min-h-[14rem] flex">
                <InfinityCard visible={statsSection.inView || reduced} delay={270} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-16 relative hide-on-app" ref={crossSection.ref}>
        <div className="max-w-3xl mx-auto px-4 relative z-10">
          <div className={`rounded-2xl border border-white/10 bg-wisdom-card/70 backdrop-blur-sm px-6 py-8 md:px-10 text-center reveal-item ${crossSection.inView ? "is-visible" : ""}`}>
            <h2 className="font-display text-xl md:text-2xl font-bold text-white mb-3">Want digital services instead?</h2>
            <p className="text-wisdom-muted text-sm md:text-base mb-6 leading-relaxed">
              Design, writing, web, marketing, data and business solutions on our Digital site.
            </p>
            <a href={DIGITAL_URL} target="_blank" rel="noopener noreferrer" className="btn-secondary px-8 py-3 text-cyan-300 border-cyan-400/30 hover:border-cyan-400/60 hover:bg-cyan-500/10">
              Open Wisdom Digital
              <ExternalLink className="w-4 h-4 ml-1" />
            </a>
          </div>
        </div>
      </section>

      <section className="pb-28 relative hide-on-app" ref={ctaSection.ref}>
        <div className="max-w-3xl mx-auto px-4 relative z-10 text-center">
          <div className={`reveal-item ${ctaSection.inView ? "is-visible" : ""}`}>
            {authReady && isSignedIn ? (
              <>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-white mb-3">Pick up where you left off</h2>
                <p className="text-wisdom-muted mb-6 max-w-md mx-auto">Jump back into Academy or My Learning.</p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Link href="/academy" className="btn-primary px-7 py-3.5">
                    Enter Academy
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <Link href="/learning" className="btn-secondary px-6 py-3.5 border-cyan-400/40 text-cyan-200 hover:border-cyan-300 hover:bg-cyan-500/10">
                    <GraduationCap className="w-4 h-4" />
                    My Learning
                  </Link>
                </div>
              </>
            ) : (
              <>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-white mb-3">Ready when you are</h2>
                <p className="text-wisdom-muted mb-6 max-w-md mx-auto">Create a free account to get started.</p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Link href="/signup" className="btn-primary px-8 py-3.5">
                    Get started
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <Link href="/login" className="btn-secondary px-6 py-3.5 border-white/20 text-white hover:border-amber-400/50 hover:bg-amber-500/10">
                    <LogIn className="w-4 h-4" />
                    Sign in
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
