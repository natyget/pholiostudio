"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  AnimatePresence,
  useSpring,
  useMotionValue,
} from "framer-motion";
import { Header } from "@/components/Header";

// ─── Constants ────────────────────────────────────────────────────────────────
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const EASE = [0.16, 1, 0.3, 1] as const;
const GOLD = "#C9A55A";

const AGENCIES = [
  "FORD MODELS", "ELITE MODEL MGMT", "IMG MODELS", "WILHELMINA",
  "THE SOCIETY", "NEW YORK MODEL MANAGEMENT", "NEON MODELS",
  "NEXT MODEL MANAGEMENT", "VISION MODEL MGMT", "DNA MODEL MGMT",
  "MUSE MODEL MANAGEMENT", "REQUEST MANAGEMENT",
];

// ─── Shared helpers ───────────────────────────────────────────────────────────
function Reveal({
  children, className, delay = 0, y = 28,
}: {
  children: React.ReactNode; className?: string; delay?: number; y?: number;
}) {
  const ref = useRef(null);
  const visible = useInView(ref, { once: true, margin: "-6% 0px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={visible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.9, ease: EASE, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const ArrowRight = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden>
    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CheckGold = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className="flex-shrink-0">
    <circle cx="8" cy="8" r="8" fill={GOLD} fillOpacity="0.12" />
    <path d="M5 8l2.5 2.5L11 5.5" stroke={GOLD} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ─── StatCounter ──────────────────────────────────────────────────────────────
function StatCounter({
  value, suffix, label, accent = false, onDark = true,
}: {
  value: number; suffix: string; label: string; accent?: boolean; onDark?: boolean;
}) {
  const spanRef = useRef<HTMLSpanElement>(null);
  const isInView = useInView(spanRef, { once: true, margin: "-10% 0px" });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const dur = 2400;
    let t0 = 0;
    const id = requestAnimationFrame(function tick(t) {
      if (!t0) t0 = t;
      const p = Math.min((t - t0) / dur, 1);
      const e = 1 - Math.pow(1 - p, 4);
      setCount(Math.round(e * value));
      if (p < 1) requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(id);
  }, [isInView, value]);

  return (
    <div className="text-center">
      <span
        ref={spanRef}
        className="block font-black leading-none tracking-tight"
        style={{
          fontSize: "clamp(2.8rem, 7vw, 6rem)",
          color: accent ? GOLD : onDark ? "#fff" : "#1C1C1C",
          letterSpacing: "-0.04em",
        }}
      >
        {count}{suffix}
      </span>
      <span
        className="block mt-2 uppercase tracking-[0.2em] text-[10px] font-semibold"
        style={{ color: onDark ? "#555" : "#999" }}
      >
        {label}
      </span>
    </div>
  );
}

// ─── TiltCard ─────────────────────────────────────────────────────────────────
function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const onMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setTilt({
      x: ((e.clientY - r.top) / r.height - 0.5) * -16,
      y: ((e.clientX - r.left) / r.width - 0.5) * 16,
    });
  }, []);
  const onLeave = useCallback(() => setTilt({ x: 0, y: 0 }), []);

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={className}
      style={{
        transform: `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transformStyle: "preserve-3d",
        transition: "transform 0.18s cubic-bezier(0.16,1,0.3,1)",
        willChange: "transform",
      }}
    >
      {children}
    </div>
  );
}

// ─── Preloader ────────────────────────────────────────────────────────────────
function Preloader({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const t = setTimeout(onComplete, 2000);
    return () => { clearTimeout(t); document.body.style.overflow = ""; };
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[500] flex flex-col items-center justify-center"
      style={{ background: "#050505" }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.7, ease: EASE }}
    >
      <div className="flex" style={{ gap: "0.01em" }}>
        {"PHOLIO".split("").map((l, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 + i * 0.07, ease: EASE }}
            style={{
              fontWeight: 900, fontSize: "clamp(2.8rem, 8vw, 6rem)",
              letterSpacing: "-0.04em", color: "#fff",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {l}
          </motion.span>
        ))}
      </div>
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 1.1, delay: 0.65, ease: EASE }}
        style={{ originX: 0, height: 1.5, background: GOLD, width: "clamp(2.8rem, 8vw, 6rem)", marginTop: 14 }}
      />
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.35 }}
        transition={{ delay: 1.2, duration: 0.5 }}
        className="mt-5 text-[10px] tracking-[0.5em] uppercase"
        style={{ color: "#666", fontFamily: "'Inter', sans-serif" }}
      >
        Editorial Quality
      </motion.p>
    </motion.div>
  );
}

// ─── Custom Cursor ────────────────────────────────────────────────────────────
function CustomCursor() {
  const x = useMotionValue(-200);
  const y = useMotionValue(-200);
  const sx = useSpring(x, { stiffness: 380, damping: 30 });
  const sy = useSpring(y, { stiffness: 380, damping: 30 });
  const [hovered, setHovered] = useState(false);
  const [isPointer, setIsPointer] = useState(false);

  useEffect(() => {
    setIsPointer(window.matchMedia("(pointer: fine)").matches);
    const mv = (e: MouseEvent) => { x.set(e.clientX); y.set(e.clientY); };
    const mo = (e: MouseEvent) => setHovered(!!(e.target as Element).closest("a,button,[role='button']"));
    window.addEventListener("mousemove", mv);
    window.addEventListener("mouseover", mo);
    return () => { window.removeEventListener("mousemove", mv); window.removeEventListener("mouseover", mo); };
  }, [x, y]);

  if (!isPointer) return null;
  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full"
      style={{ x: sx, y: sy, translateX: "-50%", translateY: "-50%" }}
      animate={{
        width: hovered ? 38 : 9, height: hovered ? 38 : 9,
        backgroundColor: hovered ? "transparent" : GOLD,
        border: hovered ? `1.5px solid ${GOLD}` : "none",
      }}
      transition={{ duration: 0.2 }}
    />
  );
}

// ─── Grain Overlay ────────────────────────────────────────────────────────────
function GrainOverlay() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[300]"
      style={{
        opacity: 0.018,
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundSize: "200px",
      }}
    />
  );
}

// ─── MagneticButton ───────────────────────────────────────────────────────────
function MagneticButton({
  href, children, className, style,
}: {
  href: string; children: React.ReactNode; className?: string; style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 280, damping: 28 });
  const sy = useSpring(y, { stiffness: 280, damping: 28 });

  const onMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * 0.38);
    y.set((e.clientY - (r.top + r.height / 2)) * 0.38);
  };
  const onLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.a
      ref={ref}
      href={href}
      style={{ x: sx, y: sy, ...style }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      whileTap={{ scale: 0.96 }}
      className={className}
    >
      {children}
    </motion.a>
  );
}

// ─── 1. HERO ──────────────────────────────────────────────────────────────────
function HeroSection() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);
  const fadeOut = useTransform(scrollYProgress, [0, 0.65], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative w-full min-h-screen flex items-center overflow-hidden"
      style={{ background: "#050505" }}
    >
      {/* Ambient gold glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 65% 55% at 68% 50%, rgba(201,165,90,0.065) 0%, transparent 68%)" }}
      />

      <div className="relative z-10 w-full max-w-[1380px] mx-auto px-8 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_480px] gap-12 lg:gap-20 items-center min-h-screen py-32">

          {/* ── LEFT: Copy ── */}
          <motion.div style={{ y: contentY, opacity: fadeOut }} className="flex flex-col items-start max-w-[640px]">

            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.25, ease: EASE }}
              className="flex items-center gap-3 mb-10"
            >
              <div className="h-px w-7" style={{ background: GOLD }} />
              <span className="text-[9px] tracking-[0.42em] uppercase font-semibold" style={{ color: GOLD, fontFamily: "'Inter', sans-serif" }}>
                The Talent Platform
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 36 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.05, delay: 0.4, ease: EASE }}
              className="text-white leading-[0.88] tracking-[-0.04em] mb-8"
              style={{ fontWeight: 900, fontSize: "clamp(3.4rem, 5.8vw, 7rem)", fontFamily: "'Inter', sans-serif" }}
            >
              YOUR<br />
              PORTFOLIO<br />
              IS YOUR<br />
              <span style={{ color: GOLD }}>AUDITION.</span>
            </motion.h1>

            {/* Body */}
            <motion.p
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.62, ease: EASE }}
              className="leading-relaxed mb-10 max-w-[420px]"
              style={{ color: "#888", fontWeight: 300, fontSize: "1.05rem" }}
            >
              AI-curated portfolios. Agency-grade comp cards. Real discovery.
              Built for talent that&apos;s serious about being seen.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.8, ease: EASE }}
              className="flex flex-wrap gap-4 mb-12"
            >
              <MagneticButton
                href={`${APP_URL}/signup`}
                className="flex items-center gap-2.5 px-7 py-3.5 rounded-full font-semibold text-sm"
                style={{ background: GOLD, color: "#050505", letterSpacing: "0.01em" }}
              >
                Get Started Free <ArrowRight size={14} />
              </MagneticButton>
              <motion.a
                href="#how-it-works"
                whileHover={{ borderColor: "rgba(255,255,255,0.28)" }}
                className="flex items-center gap-2.5 px-7 py-3.5 rounded-full font-light text-sm"
                style={{ color: "#bbb", border: "1px solid rgba(255,255,255,0.12)", letterSpacing: "0.01em" }}
              >
                See How It Works
              </motion.a>
            </motion.div>

            {/* Trust line */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ delay: 1.05, duration: 0.6 }}
              className="flex items-center gap-3"
            >
              <div className="flex -space-x-2">
                {["#E2CEBF", "#C9B8A8", "#DACCBC", "#B8A898", "#CBBDAA"].map((bg, i) => (
                  <div key={i} className="w-7 h-7 rounded-full border-2 border-[#050505]" style={{ background: bg }} />
                ))}
              </div>
              <p className="text-[11px] font-light" style={{ color: "#666" }}>
                Trusted by{" "}
                <span style={{ color: "#aaa" }}>340+ agencies</span> worldwide
              </p>
            </motion.div>
          </motion.div>

          {/* ── RIGHT: Photo + Floating UI ── */}
          <div className="relative hidden lg:flex items-center justify-center" style={{ height: "680px" }}>

            {/* Main editorial portrait */}
            <motion.div
              initial={{ opacity: 0, clipPath: "inset(0 100% 0 0 round 16px)" }}
              animate={{ opacity: 1, clipPath: "inset(0 0% 0 0 round 16px)" }}
              transition={{ duration: 1.1, delay: 0.35, ease: EASE }}
              style={{ y: imgY }}
              className="relative rounded-2xl overflow-hidden"
              aria-hidden
            >
              <div style={{ width: 400, height: 580 }}>
                <img
                  src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop"
                  alt="Editorial fashion model"
                  className="w-full h-full object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/75 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6">
                  <p className="text-white font-semibold text-sm tracking-wide">Elara Keats</p>
                  <p className="text-[10px] tracking-[0.2em] uppercase font-light mt-0.5" style={{ color: GOLD }}>Runway · Editorial</p>
                </div>
                <div
                  className="absolute top-5 right-5 px-2.5 py-1 rounded-full text-[8px] font-black tracking-widest"
                  style={{ background: "rgba(10,10,10,0.7)", color: GOLD, backdropFilter: "blur(8px)", border: "1px solid rgba(201,165,90,0.25)" }}
                >
                  PHOLIO
                </div>
              </div>
            </motion.div>

            {/* Float A: Agency Match notification */}
            <motion.div
              initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.2, duration: 0.6, ease: EASE }}
              className="absolute -right-10 top-16"
            >
              <div
                className="idle-float-a rounded-2xl p-4 w-[200px]"
                style={{ background: "rgba(15,15,15,0.9)", border: "1px solid rgba(255,255,255,0.07)", backdropFilter: "blur(12px)" }}
              >
                <div className="flex items-center gap-2 mb-2.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" style={{ boxShadow: "0 0 6px #34d399" }} />
                  <span className="text-white text-[11px] font-semibold">Agency Match</span>
                </div>
                <p className="text-[10px] leading-relaxed" style={{ color: "#666" }}>
                  6 agencies viewed your profile this week
                </p>
                <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-1.5">
                  {["#2a3a5c","#1e3a2e","#3a1e2e"].map((c, i) => (
                    <div key={i} className="w-5 h-5 rounded-full" style={{ background: c }} />
                  ))}
                  <span className="text-[9px] ml-1" style={{ color: "#555" }}>+3 more</span>
                </div>
              </div>
            </motion.div>

            {/* Float B: Profile strength */}
            <motion.div
              initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.4, duration: 0.6, ease: EASE }}
              className="absolute -left-14 bottom-28"
            >
              <div
                className="idle-float-b rounded-2xl p-4 w-[176px]"
                style={{ background: "rgba(15,15,15,0.9)", border: "1px solid rgba(255,255,255,0.07)", backdropFilter: "blur(12px)" }}
              >
                <p className="uppercase tracking-wider text-[9px] font-semibold mb-2" style={{ color: "#555" }}>Profile Strength</p>
                <div className="flex items-baseline gap-2 mb-2.5">
                  <span className="text-white text-2xl font-black" style={{ letterSpacing: "-0.03em" }}>92%</span>
                  <span className="text-emerald-400 text-[10px]">▲ 14%</span>
                </div>
                <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
                  <motion.div
                    initial={{ width: 0 }} animate={{ width: "92%" }}
                    transition={{ delay: 1.8, duration: 1.1, ease: EASE }}
                    className="h-full rounded-full" style={{ background: GOLD }}
                  />
                </div>
              </div>
            </motion.div>

            {/* Float C: Mini comp card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.6, duration: 0.6, ease: EASE }}
              className="absolute -right-3 bottom-10"
            >
              <div
                className="idle-float-a w-20 h-28 rounded-xl overflow-hidden"
                style={{ border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 20px 50px rgba(0,0,0,0.6)" }}
              >
                <img
                  src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=300&auto=format&fit=crop&crop=top"
                  alt="" className="w-full h-full object-cover object-top"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-1.5">
                  <p className="text-white text-[7px] font-bold tracking-wider">COMP CARD</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-9 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ delay: 2.2, duration: 0.6 }}
      >
        <span className="text-[8px] tracking-[0.35em] uppercase" style={{ color: "#444" }}>Scroll</span>
        <motion.div
          className="w-px rounded-full" style={{ background: "#444" }}
          animate={{ height: [10, 26, 10], opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </section>
  );
}

// ─── 2. AGENCY TICKER ─────────────────────────────────────────────────────────
function AgencyTickerSection() {
  return (
    <div
      style={{
        background: "#080808",
        borderTop: "1px solid rgba(255,255,255,0.04)",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
        padding: "18px 0",
        overflow: "hidden",
      }}
    >
      <div className="ticker-track flex w-max" style={{ gap: 0 }}>
        {[...AGENCIES, ...AGENCIES].map((name, i) => (
          <span
            key={i}
            style={{
              whiteSpace: "nowrap",
              padding: "0 2.5rem",
              color: "#3a3a3a",
              fontSize: "0.68rem",
              fontWeight: 600,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
            }}
          >
            {name}
            <span style={{ color: GOLD, marginLeft: "2.5rem" }}>·</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── 3. MANIFESTO ─────────────────────────────────────────────────────────────
function ManifestoSection() {
  return (
    <section className="py-40 px-8" style={{ background: "#FAF9F7" }}>
      <div className="max-w-[920px] mx-auto text-center">

        <Reveal>
          <div className="text-[9px] tracking-[0.45em] uppercase font-semibold mb-14" style={{ color: "#bbb" }}>
            The Pholio Promise
          </div>
        </Reveal>

        {/* Manifesto lines */}
        <div className="mb-20">
          {["The industry has always had talent.", "Now it has a standard."].map((line, i) => (
            <Reveal key={i} delay={i * 0.18} y={24}>
              <p
                className="leading-[0.95] tracking-tight"
                style={{
                  fontSize: "clamp(2.6rem, 6.5vw, 6rem)",
                  fontWeight: 900,
                  color: "#1C1C1C",
                  letterSpacing: "-0.035em",
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                {line}
              </p>
            </Reveal>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 max-w-[700px] mx-auto mb-16">
          <StatCounter value={1200} suffix="+" label="Active Portfolios" onDark={false} />
          <StatCounter value={89} suffix="%" label="Response Rate" accent onDark={false} />
          <StatCounter value={340} suffix="+" label="Partner Agencies" onDark={false} />
        </div>

        <Reveal delay={0.25}>
          <p className="font-light leading-relaxed max-w-[480px] mx-auto" style={{ color: "#999", fontSize: "1.05rem" }}>
            The fashion industry runs on first impressions. We&apos;ve built the platform
            that makes yours impossible to ignore.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

// ─── 4. HOW IT WORKS ──────────────────────────────────────────────────────────
const STEPS = [
  {
    num: "01",
    title: "Tell us who you are",
    body: "A 10-minute AI conversation — no forms, no jargon. Just your look, your experience, and where you want to go.",
  },
  {
    num: "02",
    title: "AI curates your archetype",
    body: "Our model analyzes your photos and profile, assigning you one of four casting types: Editorial Icon, Commercial Natural, Runway Model, or Beauty Face.",
  },
  {
    num: "03",
    title: "Agencies discover you",
    body: "Your portfolio goes live to 340+ partner agencies. They search by archetype, access your comp card, and reach out — all in one place.",
  },
];

function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-40 px-8 lg:px-16" style={{ background: "#050505" }}>
      <div className="max-w-[1100px] mx-auto">

        {/* Header */}
        <div className="mb-24">
          <Reveal>
            <div className="text-[9px] tracking-[0.42em] uppercase font-semibold mb-5" style={{ color: GOLD }}>
              The Process
            </div>
          </Reveal>
          <Reveal delay={0.1} y={20}>
            <h2
              className="text-white leading-tight tracking-tight"
              style={{ fontWeight: 900, fontSize: "clamp(2rem, 4vw, 3.5rem)", letterSpacing: "-0.03em" }}
            >
              From first upload to first booking.
            </h2>
          </Reveal>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Vertical line */}
          <div
            className="absolute left-8 top-0 bottom-0 hidden md:block"
            style={{ width: 1, background: "linear-gradient(to bottom, rgba(201,165,90,0.6) 0%, rgba(201,165,90,0.1) 100%)" }}
          />

          <div className="flex flex-col gap-20">
            {STEPS.map((step, i) => (
              <Reveal key={i} delay={i * 0.15}>
                <div className="md:pl-24 flex flex-col md:flex-row gap-8 md:gap-12 items-start">
                  {/* Step number (acts as dot on the line) */}
                  <div className="relative flex-shrink-0">
                    <div
                      className="hidden md:block absolute -left-[5.85rem] top-1 w-3 h-3 rounded-full"
                      style={{ background: GOLD, boxShadow: `0 0 12px ${GOLD}55` }}
                    />
                    <span
                      className="font-black"
                      style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)", color: GOLD, letterSpacing: "-0.04em", lineHeight: 1 }}
                    >
                      {step.num}
                    </span>
                  </div>
                  <div className="pt-1 md:pt-2 flex-1">
                    <h3
                      className="text-white font-black mb-4 tracking-tight"
                      style={{ fontSize: "clamp(1.3rem, 2.5vw, 1.8rem)", letterSpacing: "-0.02em" }}
                    >
                      {step.title}
                    </h3>
                    <p className="font-light leading-relaxed max-w-xl" style={{ color: "#777", fontSize: "1rem" }}>
                      {step.body}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── 5. COMP CARD SPOTLIGHT ───────────────────────────────────────────────────
const COMP_FEATURES = [
  "Two-page, print-ready PDF",
  "AI-selected best 4 images by role",
  "Measurements, archetype, and casting verdict",
  "QR code linking to live profile (Studio+)",
  "5 curated professional themes (Studio+)",
];

function CompCardSection() {
  return (
    <section className="py-40 px-8 lg:px-16" style={{ background: "#FAF9F7" }}>
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

          {/* Left: Copy */}
          <div>
            <Reveal>
              <div className="text-[9px] tracking-[0.42em] uppercase font-semibold mb-5" style={{ color: "#bbb" }}>
                The Deliverable
              </div>
            </Reveal>
            <Reveal delay={0.1} y={20}>
              <h2
                className="leading-tight tracking-tight mb-6"
                style={{
                  fontWeight: 900, fontSize: "clamp(2rem, 4vw, 3.5rem)",
                  color: "#1C1C1C", letterSpacing: "-0.03em",
                }}
              >
                Comp cards agencies actually book from.
              </h2>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="font-light leading-relaxed mb-10" style={{ color: "#999", fontSize: "1.05rem" }}>
                Not a Canva template. Not a PDF you fill out manually.
                An AI-assembled, agency-standard comp card that&apos;s
                generated from your portfolio automatically.
              </p>
            </Reveal>
            <Reveal delay={0.28}>
              <ul className="space-y-4 mb-12">
                {COMP_FEATURES.map((f, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckGold />
                    <span className="font-light text-sm" style={{ color: "#555" }}>{f}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={0.35}>
              <motion.a
                href={`${APP_URL}/signup`}
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full font-semibold text-sm"
                style={{ background: "#1C1C1C", color: "#FAF9F7", letterSpacing: "0.01em" }}
              >
                Generate Your Comp Card <ArrowRight size={14} />
              </motion.a>
            </Reveal>
          </div>

          {/* Right: 3D Tilt Comp Card */}
          <Reveal delay={0.1} y={40}>
            <div className="flex justify-center lg:justify-end">
              <TiltCard className="relative">
                {/* Back card (peeking) */}
                <div
                  className="absolute rounded-2xl"
                  style={{
                    width: 280, height: 410,
                    top: 18, right: -14,
                    background: "#E8E5E0",
                    boxShadow: "0 30px 60px rgba(0,0,0,0.12)",
                    transform: "rotate(4deg)",
                  }}
                >
                  <div className="p-5 pt-6">
                    <div className="text-[9px] uppercase tracking-widest font-semibold mb-4" style={{ color: "#bbb" }}>Measurements</div>
                    {[["Height", "5'11\""], ["Bust", "33\""], ["Waist", "24\""], ["Hips", "35\""], ["Hair", "Brown"], ["Eyes", "Hazel"]].map(([k, v]) => (
                      <div key={k} className="flex justify-between py-2" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                        <span className="text-[10px] uppercase tracking-wider font-medium" style={{ color: "#aaa" }}>{k}</span>
                        <span className="text-[11px] font-semibold" style={{ color: "#333" }}>{v}</span>
                      </div>
                    ))}
                    <p className="mt-4 italic text-[10px] leading-relaxed" style={{ color: GOLD }}>
                      &ldquo;Strong editorial presence. High booking potential.&rdquo;
                    </p>
                  </div>
                </div>

                {/* Front card */}
                <div
                  className="relative rounded-2xl overflow-hidden"
                  style={{
                    width: 280, height: 420,
                    boxShadow: "0 40px 80px rgba(0,0,0,0.22), 0 0 0 1px rgba(0,0,0,0.06)",
                  }}
                >
                  <img
                    src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop&crop=top"
                    alt="Comp card preview"
                    className="w-full h-full object-cover object-top"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />

                  {/* Archetype badge */}
                  <div
                    className="absolute top-4 right-4 px-2.5 py-1 rounded-full text-[7px] font-bold tracking-widest"
                    style={{ background: "rgba(0,0,0,0.6)", color: GOLD, backdropFilter: "blur(6px)", border: `1px solid rgba(201,165,90,0.25)` }}
                  >
                    EDITORIAL ICON
                  </div>

                  <div className="absolute bottom-0 inset-x-0 p-5">
                    <p className="text-white font-black text-base tracking-tight" style={{ letterSpacing: "-0.02em" }}>ELARA KEATS</p>
                    <p className="text-[10px] tracking-[0.2em] uppercase font-light mt-0.5" style={{ color: GOLD }}>Runway · Editorial</p>
                    <div className="mt-3 pt-3 flex justify-between items-center" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                      <span className="text-[8px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.35)" }}>pholio.studio/elara-k</span>
                      <span className="text-[8px] font-black" style={{ color: GOLD }}>PHOLIO</span>
                    </div>
                  </div>
                </div>
              </TiltCard>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

// ─── 6. DUAL PORTAL ───────────────────────────────────────────────────────────
type PersonaKey = "talent" | "agency";

const PERSONAS: Record<PersonaKey, {
  headline: string; sub: string; points: string[]; cta: string;
}> = {
  talent: {
    headline: "Built for talent that gets booked.",
    sub: "Stop chasing agencies on Instagram. Let your portfolio do the work.",
    points: [
      "AI identifies your casting archetype",
      "Generate agency-grade comp cards instantly",
      "Track exactly who's viewing your profile",
      "Apply to agencies with one click",
    ],
    cta: "Build Your Portfolio",
  },
  agency: {
    headline: "Find the right talent. Instantly.",
    sub: "No more Instagram scrolling. No more unqualified submissions.",
    points: [
      "Semantic search by look, archetype, and market",
      "Access comp cards the moment you find a match",
      "AI-filtered talent based on your brief",
      "Manage conversations and rosters in one dashboard",
    ],
    cta: "Start Discovering Talent",
  },
};

function TalentMockup() {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "#111", border: "1px solid rgba(255,255,255,0.07)" }}>
      <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/5">
        {["#ef4444","#f59e0b","#22c55e"].map((c, i) => <div key={i} className="w-2.5 h-2.5 rounded-full" style={{ background: c, opacity: 0.5 }} />)}
        <div className="flex-1 mx-3 h-5 rounded flex items-center justify-center" style={{ background: "rgba(255,255,255,0.04)" }}>
          <span className="text-[9px]" style={{ color: "#555" }}>pholio.studio/elara-k</span>
        </div>
      </div>
      <div className="p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-[#252525]" />
          <div>
            <div className="text-white text-sm font-semibold">Elara Keats</div>
            <div className="text-[11px] mt-0.5" style={{ color: "#555" }}>Editorial · Runway · New York</div>
          </div>
          <div className="ml-auto px-2.5 py-0.5 rounded-full text-[9px] font-bold" style={{ background: "rgba(201,165,90,0.1)", color: GOLD }}>Studio+</div>
        </div>
        <div className="p-3 rounded-xl" style={{ background: "rgba(201,165,90,0.06)", border: `1px solid rgba(201,165,90,0.18)` }}>
          <div className="text-[9px] uppercase tracking-wider mb-1 font-semibold" style={{ color: "#666" }}>AI Archetype</div>
          <div className="font-bold text-sm mb-1" style={{ color: GOLD }}>The Editorial Icon</div>
          <div className="text-[10px] leading-relaxed" style={{ color: "#555" }}>Strong editorial presence, 5&apos;11&quot;, hazel eyes. High booking potential.</div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[0.55, 0.35, 0.45].map((op, i) => <div key={i} className="aspect-[2/3] rounded-lg" style={{ background: `rgba(60,60,60,${op})` }} />)}
        </div>
        <div className="flex gap-2">
          <div className="flex-1 py-2 rounded-full text-center text-[10px] font-semibold cursor-pointer" style={{ background: GOLD, color: "#050505" }}>Download Comp Card</div>
          <div className="py-2 px-3 rounded-full text-[10px]" style={{ border: "1px solid rgba(255,255,255,0.1)", color: "#888" }}>Share</div>
        </div>
      </div>
    </div>
  );
}

function AgencyMockup() {
  const results = [
    { label: "Editorial Icon", match: true },
    { label: "Commercial Natural", match: false },
    { label: "Runway Model", match: false },
  ];
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "#111", border: "1px solid rgba(255,255,255,0.07)" }}>
      <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/5">
        {["#ef4444","#f59e0b","#22c55e"].map((c, i) => <div key={i} className="w-2.5 h-2.5 rounded-full" style={{ background: c, opacity: 0.5 }} />)}
        <div className="ml-3 text-[9px]" style={{ color: "#555" }}>Agency Dashboard</div>
      </div>
      <div className="p-5 space-y-4">
        <div
          className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="5.5" cy="5.5" r="4" stroke="#555" strokeWidth="1.2"/><path d="M9 9l2 2" stroke="#555" strokeWidth="1.2" strokeLinecap="round"/></svg>
          <span className="text-[11px] flex-1" style={{ color: "#555" }}>Female, 5&apos;10&quot;+, editorial, NYC</span>
          <div className="px-2 py-0.5 rounded text-[8px] font-black" style={{ background: GOLD, color: "#050505" }}>AI</div>
        </div>
        <div className="space-y-2">
          {results.map((r, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-2.5 rounded-lg"
              style={{
                background: r.match ? "rgba(201,165,90,0.07)" : "rgba(255,255,255,0.02)",
                border: r.match ? `1px solid rgba(201,165,90,0.18)` : "1px solid transparent",
              }}
            >
              <div className="w-9 h-9 rounded-lg bg-[#252525] flex-shrink-0" />
              <div className="flex-1">
                <div className="text-white text-[11px] font-semibold">Talent #{i + 1}</div>
                <div className="text-[9px]" style={{ color: r.match ? GOLD : "#555" }}>{r.label}</div>
              </div>
              {r.match && <div className="text-[8px] font-bold px-2 py-0.5 rounded" style={{ background: "rgba(201,165,90,0.15)", color: GOLD }}>Best</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DualPortalSection() {
  const [active, setActive] = useState<PersonaKey>("talent");
  const p = PERSONAS[active];

  return (
    <section className="py-40 px-8 lg:px-16" style={{ background: "#080808" }}>
      <div className="max-w-[1200px] mx-auto">

        {/* Header */}
        <div className="text-center mb-20">
          <Reveal>
            <div className="text-[9px] tracking-[0.42em] uppercase font-semibold mb-8" style={{ color: GOLD }}>
              Two Sides. One Platform.
            </div>
          </Reveal>
          {/* Toggle */}
          <div className="inline-flex p-1 rounded-full" style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}>
            {(["talent", "agency"] as PersonaKey[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActive(tab)}
                className="relative px-8 py-3 rounded-full text-sm font-medium transition-colors duration-200 cursor-pointer"
                style={{ color: active === tab ? "#050505" : "#555" }}
              >
                {active === tab && (
                  <motion.div
                    layoutId="persona-bg"
                    className="absolute inset-0 rounded-full"
                    style={{ background: "#fff" }}
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <span className="relative z-10">
                  {tab === "talent" ? "I'm Talent" : "I'm an Agency"}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.38, ease: EASE }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
          >
            {/* Copy */}
            <div>
              <h2
                className="text-white font-black leading-tight tracking-tight mb-4"
                style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", letterSpacing: "-0.03em" }}
              >
                {p.headline}
              </h2>
              <p className="font-light leading-relaxed mb-10" style={{ color: "#666", fontSize: "1rem" }}>{p.sub}</p>
              <ul className="space-y-4 mb-10">
                {p.points.map((pt, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckGold />
                    <span className="font-light text-sm" style={{ color: "#888" }}>{pt}</span>
                  </li>
                ))}
              </ul>
              <motion.a
                href={`${APP_URL}/signup`}
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full font-semibold text-sm"
                style={{ background: GOLD, color: "#050505" }}
              >
                {p.cta} <ArrowRight size={14} />
              </motion.a>
            </div>

            {/* Mockup */}
            <div>
              {active === "talent" ? <TalentMockup /> : <AgencyMockup />}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

// ─── 7. PROOF ─────────────────────────────────────────────────────────────────
const TESTIMONIALS = [
  {
    quote: "Finally a platform where talent is pre-qualified. I booked three models from my first search — no back-and-forth, no wasted time.",
    author: "Marcus K.",
    role: "Creative Director, NEON Models",
  },
  {
    quote: "Pholio turned my scattered Instagram into a comp card that actually closed my first agency deal. The AI archetype read me better than I read myself.",
    author: "Sofia Reyes",
    role: "Editorial Model, New York",
  },
  {
    quote: "We replaced our entire scouting workflow with Pholio's discovery dashboard. The quality of submissions went up overnight.",
    author: "James L.",
    role: "Head of Scouting, THE SOCIETY",
  },
];

function ProofSection() {
  return (
    <section className="py-40 px-8 lg:px-16" style={{ background: "#050505" }}>
      <div className="max-w-[1200px] mx-auto">

        <div className="mb-24 text-center">
          <Reveal>
            <div className="text-[9px] tracking-[0.42em] uppercase font-semibold mb-5" style={{ color: "#555" }}>
              The Numbers
            </div>
          </Reveal>
          <Reveal delay={0.1} y={20}>
            <h2
              className="text-white font-black tracking-tight"
              style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)", letterSpacing: "-0.03em" }}
            >
              Results that speak louder than portfolios.
            </h2>
          </Reveal>
        </div>

        {/* Giant stats */}
        <div
          className="grid grid-cols-3 mb-24"
          style={{ background: "#0A0A0A", borderRadius: 20, border: "1px solid rgba(255,255,255,0.04)", overflow: "hidden" }}
        >
          {[
            { value: 1200, suffix: "+", label: "Portfolios Created", accent: false },
            { value: 89, suffix: "%", label: "Agency Response Rate", accent: true },
            { value: 340, suffix: "+", label: "Partner Agencies", accent: false },
          ].map((s, i) => (
            <div key={i} className="py-16 flex flex-col items-center" style={{ borderRight: i < 2 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
              <StatCounter value={s.value} suffix={s.suffix} label={s.label} accent={s.accent} />
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <div
                className="p-7 rounded-2xl h-full flex flex-col"
                style={{ background: "#0D0D0D", border: "1px solid rgba(255,255,255,0.05)" }}
              >
                <div
                  className="font-black mb-4 leading-none select-none"
                  style={{ fontSize: "3.5rem", color: GOLD, lineHeight: 0.75, opacity: 0.8 }}
                >
                  &ldquo;
                </div>
                <p className="font-light leading-relaxed flex-1 mb-7" style={{ color: "#aaa", fontSize: "0.95rem" }}>
                  {t.quote}
                </p>
                <div className="pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                  <p className="text-white font-semibold text-sm">{t.author}</p>
                  <p className="text-[11px] mt-0.5 font-light" style={{ color: "#555" }}>{t.role}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── 8. PRICING ───────────────────────────────────────────────────────────────
const FREE_FEATURES = [
  "Portfolio (up to 10 images)",
  "AI Archetype analysis",
  "Basic comp card (1 theme)",
  "Public profile page",
  "Basic analytics",
];
const PRO_FEATURES = [
  "Unlimited portfolio images",
  "5 premium comp card themes",
  "QR code on comp card",
  "Agency discovery dashboard",
  "Priority application status",
  "Custom profile URL",
  "Advanced analytics + agency insights",
];

function PricingSection() {
  const [yearly, setYearly] = useState(false);

  return (
    <section className="py-40 px-8 lg:px-16" style={{ background: "#FAF9F7" }}>
      <div className="max-w-[900px] mx-auto text-center">

        <Reveal>
          <div className="text-[9px] tracking-[0.42em] uppercase font-semibold mb-5" style={{ color: "#bbb" }}>
            Pricing
          </div>
        </Reveal>
        <Reveal delay={0.08} y={20}>
          <h2
            className="leading-tight tracking-tight mb-5"
            style={{ fontWeight: 900, fontSize: "clamp(2rem, 4vw, 3.5rem)", color: "#1C1C1C", letterSpacing: "-0.03em" }}
          >
            One standard. Two paths.
          </h2>
        </Reveal>

        {/* Yearly toggle */}
        <Reveal delay={0.14}>
          <div className="flex items-center justify-center gap-4 mb-16">
            <span className="text-sm font-light" style={{ color: "#999" }}>Monthly</span>
            <button
              onClick={() => setYearly(!yearly)}
              className="relative w-12 h-6 rounded-full cursor-pointer transition-colors duration-300"
              style={{ background: yearly ? "#1C1C1C" : "#D9D9D9" }}
              aria-label="Toggle yearly billing"
            >
              <motion.div
                className="absolute top-0.5 bottom-0.5 w-5 h-5 rounded-full bg-white"
                animate={{ x: yearly ? 24 : 2 }}
                transition={{ type: "spring", stiffness: 500, damping: 38 }}
              />
            </button>
            <span className="text-sm font-light flex items-center gap-2" style={{ color: "#999" }}>
              Yearly
              <AnimatePresence>
                {yearly && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="px-2 py-0.5 rounded-full text-[9px] font-bold"
                    style={{ background: "rgba(201,165,90,0.12)", color: GOLD }}
                  >
                    Save 20%
                  </motion.span>
                )}
              </AnimatePresence>
            </span>
          </div>
        </Reveal>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* Free */}
          <Reveal delay={0.1}>
            <div
              className="text-left p-8 rounded-2xl h-full flex flex-col"
              style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.07)" }}
            >
              <div className="mb-8">
                <p className="font-bold text-sm mb-1" style={{ color: "#1C1C1C" }}>Free</p>
                <div className="flex items-baseline gap-1">
                  <span className="font-black" style={{ fontSize: "2.5rem", color: "#1C1C1C", letterSpacing: "-0.04em" }}>$0</span>
                  <span className="font-light text-sm" style={{ color: "#999" }}>/month</span>
                </div>
                <p className="font-light text-sm mt-2" style={{ color: "#aaa" }}>Everything you need to get started.</p>
              </div>
              <ul className="space-y-3 flex-1 mb-8">
                {FREE_FEATURES.map((f, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckGold />
                    <span className="font-light text-sm" style={{ color: "#666" }}>{f}</span>
                  </li>
                ))}
              </ul>
              <motion.a
                href={`${APP_URL}/signup`}
                whileHover={{ scale: 1.01 }}
                className="block text-center py-3.5 rounded-full font-semibold text-sm"
                style={{ background: "#F0EDE8", color: "#1C1C1C" }}
              >
                Get Started Free
              </motion.a>
            </div>
          </Reveal>

          {/* Studio+ */}
          <Reveal delay={0.18}>
            <div
              className="text-left p-8 rounded-2xl h-full flex flex-col relative overflow-hidden"
              style={{ background: "#1C1C1C", border: `1.5px solid ${GOLD}` }}
            >
              {/* Gold glow */}
              <div className="absolute top-0 right-0 w-48 h-48 pointer-events-none" style={{ background: "radial-gradient(ellipse at top right, rgba(201,165,90,0.12) 0%, transparent 70%)" }} />

              <div className="mb-8 relative">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-bold text-sm" style={{ color: "#fff" }}>Studio+</p>
                  <span className="px-2.5 py-0.5 rounded-full text-[8px] font-black tracking-wider" style={{ background: "rgba(201,165,90,0.15)", color: GOLD }}>
                    RECOMMENDED
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="font-black" style={{ fontSize: "2.5rem", color: "#fff", letterSpacing: "-0.04em" }}>
                    ${yearly ? "7.99" : "9.99"}
                  </span>
                  <span className="font-light text-sm" style={{ color: "#666" }}>/month</span>
                </div>
                <p className="font-light text-sm mt-2" style={{ color: "#666" }}>For serious talent and growing agencies.</p>
              </div>

              <ul className="space-y-3 flex-1 mb-8">
                {PRO_FEATURES.map((f, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckGold />
                    <span className="font-light text-sm" style={{ color: "#aaa" }}>{f}</span>
                  </li>
                ))}
              </ul>

              <MagneticButton
                href={`${APP_URL}/signup?plan=pro`}
                className="block text-center py-3.5 rounded-full font-semibold text-sm"
                style={{ background: GOLD, color: "#050505" }}
              >
                Start Studio+
              </MagneticButton>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.3}>
          <p className="mt-10 font-light text-sm" style={{ color: "#bbb" }}>
            No contracts. Cancel anytime. All plans include a 14-day free trial of Studio+.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

// ─── 9. FINAL CTA ─────────────────────────────────────────────────────────────
function CtaSection() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  return (
    <section
      ref={ref}
      className="relative py-52 px-8 overflow-hidden flex flex-col items-center justify-center text-center"
      style={{ background: "#050505" }}
    >
      {/* Parallax background glow */}
      <motion.div
        style={{ y: bgY }}
        className="absolute inset-0 pointer-events-none"
        aria-hidden
      >
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(201,165,90,0.06) 0%, transparent 70%)" }}
        />
      </motion.div>

      <div className="relative z-10 max-w-[760px]">
        <Reveal y={20}>
          <div className="text-[9px] tracking-[0.42em] uppercase font-semibold mb-8" style={{ color: GOLD }}>
            The Casting Call Is Open
          </div>
        </Reveal>

        <Reveal delay={0.1} y={28}>
          <h2
            className="text-white font-black tracking-tight mb-6"
            style={{ fontSize: "clamp(2.5rem, 6vw, 5.5rem)", letterSpacing: "-0.04em", lineHeight: "0.92" }}
          >
            Stop getting lost.
            <br />
            Start getting signed.
          </h2>
        </Reveal>

        <Reveal delay={0.2}>
          <p className="font-light leading-relaxed mb-14 max-w-[440px] mx-auto" style={{ color: "#777", fontSize: "1.05rem" }}>
            Join 1,200+ talent who&apos;ve already built portfolios that get them in the room.
          </p>
        </Reveal>

        <Reveal delay={0.28}>
          <MagneticButton
            href={`${APP_URL}/signup`}
            className="inline-flex items-center gap-2.5 px-10 py-4 rounded-full font-semibold"
            style={{ background: GOLD, color: "#050505", fontSize: "0.95rem" }}
          >
            Build Your Portfolio Free <ArrowRight size={15} />
          </MagneticButton>
        </Reveal>

        {/* Animated gold line */}
        <Reveal delay={0.4}>
          <div className="flex items-center justify-center gap-6 mt-16">
            <motion.div
              initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: EASE }}
              style={{ originX: 1, height: 1, background: `linear-gradient(to left, ${GOLD}, transparent)`, width: 120 }}
            />
            <span className="text-[9px] tracking-[0.4em] uppercase font-semibold" style={{ color: "#555" }}>Pholio</span>
            <motion.div
              initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: EASE }}
              style={{ originX: 0, height: 1, background: `linear-gradient(to right, ${GOLD}, transparent)`, width: 120 }}
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ─── 10. FOOTER ───────────────────────────────────────────────────────────────
const NAV_COLS = [
  { title: "Platform", links: ["For Talent", "For Agencies", "Pricing", "Comp Cards", "Analytics"] },
  { title: "Company", links: ["About", "Press", "Careers", "Blog"] },
  { title: "Legal", links: ["Privacy Policy", "Terms of Service", "Cookie Policy"] },
  { title: "Social", links: ["Instagram", "LinkedIn", "X / Twitter"] },
];

function FooterSection() {
  return (
    <footer style={{ background: "#030303", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
      <div className="max-w-[1200px] mx-auto px-8 lg:px-16 pt-20 pb-12">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-10 mb-16">

          {/* Brand */}
          <div className="col-span-2">
            <div
              className="font-black mb-3 tracking-tight"
              style={{ fontSize: "1.4rem", color: "#fff", letterSpacing: "-0.04em" }}
            >
              PHOLIO
            </div>
            <p className="font-light leading-relaxed mb-6" style={{ color: "#444", fontSize: "0.85rem", maxWidth: 240 }}>
              Editorial quality. Zero compromises.
              The talent platform for the next generation of bookings.
            </p>
            <MagneticButton
              href={`${APP_URL}/signup`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold"
              style={{ background: GOLD, color: "#050505" }}
            >
              Get Started Free <ArrowRight size={12} />
            </MagneticButton>
          </div>

          {/* Nav columns */}
          {NAV_COLS.map((col) => (
            <div key={col.title}>
              <p className="font-semibold text-[9px] uppercase tracking-[0.3em] mb-5" style={{ color: "#444" }}>{col.title}</p>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href={`${APP_URL}`}
                      className="font-light text-[13px] transition-colors duration-200"
                      style={{ color: "#555" }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "#555")}
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8"
          style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
        >
          <p className="text-[11px] font-light" style={{ color: "#333" }}>
            © 2026 Pholio Inc. All rights reserved.
          </p>
          <p className="text-[11px] font-light" style={{ color: "#333" }}>
            Editorial quality. Zero compromises.
          </p>
        </div>
      </div>
    </footer>
  );
}

// ─── HOME ─────────────────────────────────────────────────────────────────────
export default function Home() {
  const [preloaderDone, setPreloaderDone] = useState(false);

  return (
    <>
      <AnimatePresence>
        {!preloaderDone && (
          <Preloader key="preloader" onComplete={() => setPreloaderDone(true)} />
        )}
      </AnimatePresence>

      <CustomCursor />
      <GrainOverlay />

      <main
        className="relative w-full overflow-x-hidden"
        style={{ background: "#050505", cursor: "none" }}
      >
        <Header />
        <HeroSection />
        <AgencyTickerSection />
        <ManifestoSection />
        <HowItWorksSection />
        <CompCardSection />
        <DualPortalSection />
        <ProofSection />
        <PricingSection />
        <CtaSection />
        <FooterSection />
      </main>
    </>
  );
}
