"use client";

import { motion, useInView } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import Navbar from "@/app/components/navbar";

/*
  Font: add to layout.tsx / _document.tsx
  <link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,500;0,600;0,700;1,500&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />
*/

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const Icons = {
  Lock: ({ size = 16, color = "currentColor" }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  Coin: ({ size = 16, color = "currentColor" }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M14.8 9A2 2 0 0 0 13 8h-2a2 2 0 0 0 0 4h2a2 2 0 0 1 0 4h-2a2 2 0 0 1-1.8-1" />
      <path d="M12 7v1m0 8v1" />
    </svg>
  ),
  Search: ({ size = 16, color = "currentColor" }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  ),
  Download: ({ size = 16, color = "currentColor" }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
  Bot: ({ size = 16, color = "currentColor" }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="11" width="18" height="10" rx="2" />
      <circle cx="12" cy="5" r="2" />
      <path d="M12 7v4" />
      <line x1="8" y1="16" x2="8" y2="16" />
      <line x1="16" y1="16" x2="16" y2="16" />
    </svg>
  ),
  BarChart: ({ size = 16, color = "currentColor" }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
      <line x1="2" y1="20" x2="22" y2="20" />
    </svg>
  ),
  Trophy: ({ size = 16, color = "currentColor" }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="6 9 6 2 18 2 18 9" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-1a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-2" />
      <rect x="6" y="18" width="12" height="4" />
    </svg>
  ),
  Star: ({ size = 13, color = "#b8860b" }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  ArrowRight: ({ size = 14, color = "currentColor" }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  ),
  Gift: ({ size = 16, color = "currentColor" }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 12 20 22 4 22 4 12" />
      <rect x="2" y="7" width="20" height="5" />
      <line x1="12" y1="22" x2="12" y2="7" />
      <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
      <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
    </svg>
  ),
  Users: ({ size = 16, color = "currentColor" }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  BookOpen: ({ size = 16, color = "currentColor" }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  ),
  Building: ({ size = 16, color = "currentColor" }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01M16 6h.01M12 6h.01M8 10h.01M16 10h.01M12 10h.01M8 14h.01M16 14h.01M12 14h.01" />
    </svg>
  ),
  Check: ({ size = 16, color = "currentColor" }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Upload: ({ size = 16, color = "currentColor" }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  ),
  UserPlus: ({ size = 16, color = "currentColor" }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <line x1="20" y1="8" x2="20" y2="14" />
      <line x1="23" y1="11" x2="17" y2="11" />
    </svg>
  ),
  Plus: ({ size = 16, color = "currentColor" }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Link: ({ size = 16, color = "currentColor" }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  ),
  FileText: ({ size = 16, color = "currentColor" }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  Sparkles: ({ size = 16, color = "currentColor" }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z" />
      <path d="M5 3l.75 2.25L8 6l-2.25.75L5 9l-.75-2.25L2 6l2.25-.75z" />
      <path d="M19 15l.75 2.25L22 18l-2.25.75L19 21l-.75-2.25L16 18l2.25-.75z" />
    </svg>
  ),
  Zap: ({ size = 16, color = "currentColor" }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
};

// ─── Animated Counter ─────────────────────────────────────────────────────────
function AnimatedCounter({ target, suffix = "" }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    const duration = 1800;
    const startTime = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      setCount(Math.floor((1 - Math.pow(1 - progress, 3)) * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, target]);
  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

// ─── Scroll reveal ────────────────────────────────────────────────────────────
function FadeIn({ children, delay = 0, y = 20, className = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function Label({ children }) {
  return (
    <p className="text-xs font-semibold tracking-[0.18em] uppercase text-stone-400 mb-3">
      {children}
    </p>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function HeroSection() {
  const papers = [
    { subject: "Data Structures", code: "CS301", year: "2023", coins: 8 },
    { subject: "Operating Systems", code: "CS401", year: "2023", coins: 9 },
    { subject: "Database Management", code: "CS302", year: "2022", coins: 8 },
    { subject: "Computer Networks", code: "CS501", year: "2023", coins: 10 },
  ];
  const stats = [
    { label: "Papers", target: 12400, suffix: "+", Icon: Icons.FileText },
    { label: "Students", target: 8200, suffix: "+", Icon: Icons.Users },
    { label: "Universities", target: 340, suffix: "+", Icon: Icons.Building },
  ];

  return (
    <section className="relative min-h-screen flex items-center pt-28 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden bg-stone-50">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(rgba(0,0,0,0.04) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-stone-50 via-transparent to-emerald-50/20" />

      <div className="relative max-w-6xl mx-auto w-full">
        <div className="grid lg:grid-cols-5 gap-16 items-center">
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.08 }}
              className="inline-flex items-center gap-2 rounded-full px-3.5 py-1 mb-8 text-xs font-medium bg-white border border-stone-200 text-stone-500 shadow-sm"
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
              </span>
              Student-powered exam paper platform
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.7,
                delay: 0.16,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="font-bold leading-[1.07] mb-6 text-green-900 tracking-tight"
              style={{
                fontSize: "clamp(2.4rem,5vw,3.75rem)",
                letterSpacing: "-0.034em",
                fontFamily: "'Lora', Georgia, serif",
              }}
            >
              Every exam paper,
              <br />
              <span className="text-green-700">one unlock away.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.28 }}
              className="text-base mb-9 max-w-md text-stone-500 leading-relaxed"
            >
              Browse previous-year and semester papers uploaded by students like
              you. Unlock with coins, save offline, and study smarter.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.38 }}
              className="flex flex-wrap gap-3 mb-14"
            >
              <button className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white bg-emerald-800 hover:bg-emerald-900 transition-all duration-200 hover:-translate-y-px shadow-md shadow-emerald-900/15 active:scale-95">
                <Icons.Lock size={13} color="#fff" />
                Get Started — 100 coins free
              </button>
              <button className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-stone-600 bg-white border border-stone-200 hover:border-stone-300 hover:bg-stone-50 transition-all duration-200 active:scale-95 shadow-sm">
                <Icons.Search size={13} color="#57534e" />
                Browse Papers
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex gap-8"
            >
              {stats.map(({ label, target, suffix, Icon }) => (
                <div key={label}>
                  <div className="flex items-center gap-1.5">
                    <Icon size={13} color="#059669" />
                    <span
                      className="text-xl font-bold text-stone-800"
                      style={{ fontFamily: "'Lora', serif" }}
                    >
                      <AnimatedCounter target={target} suffix={suffix} />
                    </span>
                  </div>
                  <span className="text-[11px] text-stone-400">{label}</span>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.75,
              delay: 0.24,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="lg:col-span-2 relative"
          >
            <div className="rounded-2xl p-5 bg-white border border-stone-200 shadow-xl shadow-stone-200/50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1.5">
                  <Icons.BookOpen size={12} color="#78716c" />
                  <span className="text-[10.5px] font-semibold tracking-widest text-stone-400 uppercase">
                    Recent Papers
                  </span>
                </div>
                <div className="flex items-center gap-1.5 rounded-full px-2.5 py-1 bg-amber-50 border border-amber-200/60">
                  <Icons.Coin size={11} color="#92400e" />
                  <span className="text-[11px] font-semibold text-amber-800">
                    124 coins
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                {papers.map((p, i) => (
                  <motion.div
                    key={p.code}
                    initial={{ opacity: 0, x: 14 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.48 + i * 0.09, duration: 0.4 }}
                    className="flex items-center justify-between rounded-xl px-3 py-2.5 bg-stone-50 border border-stone-100 hover:border-stone-200 hover:bg-white transition-all duration-150 cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-stone-100 group-hover:bg-emerald-50 flex items-center justify-center flex-shrink-0 transition-colors">
                        <Icons.FileText size={13} color="#57534e" />
                      </div>
                      <div>
                        <p className="text-[12px] font-semibold text-stone-700">
                          {p.subject}
                        </p>
                        <p className="text-[10.5px] text-stone-400">
                          {p.code} · {p.year}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 rounded-full px-2 py-0.5 bg-stone-100">
                      <Icons.Coin size={10} color="#78716c" />
                      <span className="text-[11px] font-semibold text-stone-500">
                        {p.coins}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="flex items-center justify-between mt-3 rounded-xl px-3.5 py-2 bg-stone-50 border border-stone-100">
                <div className="flex items-center gap-1.5">
                  <Icons.Plus size={10} color="#a8a29e" />
                  <span className="text-[11px] text-stone-400">
                    47 papers added today
                  </span>
                </div>
                <div className="flex items-center gap-1 cursor-pointer">
                  <span className="text-[11px] font-semibold text-emerald-700">
                    View all
                  </span>
                  <Icons.ArrowRight size={11} color="#047857" />
                </div>
              </div>
            </div>

            <motion.div
              animate={{ y: [0, -7, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute -bottom-5 -left-7 rounded-xl px-4 py-3 bg-white border border-amber-200/70 shadow-lg shadow-amber-100/40"
              style={{ minWidth: 150 }}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <Icons.Gift size={10} color="#92400e" />
                <span className="text-[9.5px] font-semibold tracking-wider text-amber-700 uppercase">
                  Signup Bonus
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Icons.Coin size={13} color="#92400e" />
                <span className="text-[13.5px] font-bold text-amber-900">
                  100 coins free
                </span>
              </div>
              <span className="text-[9.5px] text-amber-500/80">
                No card required
              </span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── Features ─────────────────────────────────────────────────────────────────
const FEATURES = [
  {
    Icon: Icons.Search,
    title: "Smart Search",
    desc: "Filter by university, course, semester, or year. Find the exact paper in seconds.",
  },
  {
    Icon: Icons.Coin,
    title: "Coin Economy",
    desc: "Earn by uploading or referring. Each unlock costs 8–10 coins — built to stay affordable.",
  },
  {
    Icon: Icons.Download,
    title: "Offline Access",
    desc: "Save papers locally. Study without internet — perfect for exam crunch time.",
  },
  {
    Icon: Icons.Sparkles,
    title: "AI Mock Paper",
    desc: "Premium: AI-generated practice papers built on real past question patterns.",
  },
  {
    Icon: Icons.BarChart,
    title: "Pattern Analysis",
    desc: "Spot high-frequency questions and key topics across years with AI insights.",
  },
  {
    Icon: Icons.Trophy,
    title: "Leaderboards",
    desc: "Earn recognition. Climb upload and unlock leaderboards in the community.",
  },
];

function FeaturesSection() {
  return (
    <section className="py-28 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        <FadeIn className="text-center mb-14">
          <Label>Features</Label>
          <h2
            className="text-3xl font-bold text-stone-900 tracking-tight"
            style={{ fontFamily: "'Lora', serif" }}
          >
            Everything you need to ace your exams
          </h2>
        </FadeIn>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(({ Icon, title, desc }, i) => (
            <FadeIn key={title} delay={i * 0.06}>
              <div className="group rounded-xl p-6 h-full bg-stone-50 border border-stone-100 hover:border-stone-200 hover:bg-white hover:shadow-sm transition-all duration-200 cursor-default">
                <div className="w-10 h-10 rounded-xl bg-white border border-stone-200 flex items-center justify-center mb-4 group-hover:border-emerald-200 group-hover:bg-emerald-50 transition-colors duration-200 shadow-sm">
                  <Icon size={17} color="#374151" />
                </div>
                <h3 className="text-[13.5px] font-semibold text-stone-800 mb-1.5">
                  {title}
                </h3>
                <p className="text-[12.5px] text-stone-400 leading-relaxed">
                  {desc}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── How It Works ─────────────────────────────────────────────────────────────
const STEPS = [
  {
    n: "01",
    title: "Sign up & get 100 coins",
    desc: "Create your account in under a minute. 100 coins land in your wallet instantly — no card, no catch.",
  },
  {
    n: "02",
    title: "Find your paper",
    desc: "Search by university, subject, semester, or year. Browse a library growing every single day.",
  },
  {
    n: "03",
    title: "Unlock & study offline",
    desc: "Spend 8–10 coins to unlock any paper. Save it offline and study whenever, wherever.",
  },
];

const COIN_EVENTS = [
  { type: "earn", Icon: Icons.Gift, label: "Signup bonus", coins: "+100" },
  { type: "earn", Icon: Icons.Link, label: "Refer a friend", coins: "+50" },
  {
    type: "earn",
    Icon: Icons.UserPlus,
    label: "Friend signs up via link",
    coins: "+50",
  },
  {
    type: "earn",
    Icon: Icons.Upload,
    label: "Upload approved paper",
    coins: "+20",
  },
  {
    type: "spend",
    Icon: Icons.Lock,
    label: "Unlock a paper",
    coins: "−8 to 10",
  },
  {
    type: "spend",
    Icon: Icons.Bot,
    label: "AI Mock Paper (premium)",
    coins: "−1,000",
  },
];

function HowItWorksSection() {
  return (
    <section className="py-28 px-4 sm:px-6 lg:px-8 bg-stone-50">
      <div className="max-w-6xl mx-auto">
        <FadeIn className="text-center mb-14">
          <Label>How it works</Label>
          <h2
            className="text-3xl font-bold text-stone-900 tracking-tight"
            style={{ fontFamily: "'Lora', serif" }}
          >
            Three steps to your next paper
          </h2>
        </FadeIn>
        <div className="grid lg:grid-cols-2 gap-20 items-start">
          <div className="relative">
            <div className="absolute left-[19px] top-12 bottom-8 w-px hidden lg:block bg-gradient-to-b from-stone-300 to-transparent" />
            <div className="flex flex-col gap-10">
              {STEPS.map((s, i) => (
                <FadeIn key={s.n} delay={i * 0.1}>
                  <div className="flex gap-5">
                    <div className="flex-shrink-0 w-9 h-9 rounded-full bg-emerald-800 text-white flex items-center justify-center text-[11px] font-bold z-10">
                      {s.n}
                    </div>
                    <div className="pt-0.5">
                      <h3 className="text-[14.5px] font-semibold text-stone-800 mb-1.5">
                        {s.title}
                      </h3>
                      <p className="text-[13px] text-stone-400 leading-relaxed">
                        {s.desc}
                      </p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>

          <FadeIn delay={0.18}>
            <div className="rounded-xl p-6 bg-white border border-stone-200 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <Icons.Coin size={14} color="#374151" />
                <span className="text-[13px] font-semibold text-stone-700">
                  Coin breakdown
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {COIN_EVENTS.map(({ type, Icon, label, coins }) => (
                  <div
                    key={label}
                    className={`flex items-center justify-between rounded-lg px-3.5 py-2.5 border
                      ${type === "earn" ? "bg-emerald-50/50 border-emerald-100" : "bg-stone-50 border-stone-100"}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        size={13}
                        color={type === "earn" ? "#065f46" : "#78716c"}
                      />
                      <span className="text-[12px] text-stone-600">
                        {label}
                      </span>
                    </div>
                    <span
                      className={`font-mono text-[12px] font-semibold ${type === "earn" ? "text-emerald-700" : "text-stone-400"}`}
                    >
                      {coins}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

// ─── Referral Banner ──────────────────────────────────────────────────────────
function ReferralBanner() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-2xl mx-auto">
        <FadeIn>
          <div className="rounded-2xl px-10 py-10 text-center bg-stone-50 border border-stone-200">
            <div className="flex items-center justify-center gap-1.5 mb-3">
              <Icons.Link size={11} color="#a8a29e" />
              <Label>Referrals</Label>
            </div>
            <h2
              className="text-2xl font-bold text-stone-900 mb-2 tracking-tight"
              style={{ fontFamily: "'Lora', serif" }}
            >
              Share the vault, earn together
            </h2>
            <p className="text-sm text-stone-400 mb-7 max-w-xs mx-auto leading-relaxed">
              When a friend signs up using your link, both of you get 50 coins
              instantly.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-7">
              {["You receive", "Your friend receives"].map((label, i) => (
                <div key={i} className="flex items-center gap-2">
                  {i === 1 && (
                    <span className="text-xs text-stone-300 hidden sm:block">
                      &amp;
                    </span>
                  )}
                  <div className="flex items-center gap-2 rounded-full px-4 py-2 bg-white border border-stone-200 shadow-sm">
                    <span className="text-[11.5px] text-stone-500">
                      {label}
                    </span>
                    <Icons.Coin size={12} color="#065f46" />
                    <span className="font-mono text-[11.5px] font-bold text-emerald-800">
                      +50 coins
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <button className="inline-flex items-center gap-2 rounded-full px-7 py-2.5 text-sm font-semibold text-white bg-emerald-800 hover:bg-emerald-900 transition-colors shadow-sm">
              <Icons.Link size={13} color="#fff" />
              Get Your Referral Link
            </button>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

// ─── Pricing ──────────────────────────────────────────────────────────────────
const FREE_FEATURES = [
  "100 coins on signup",
  "Browse full paper library",
  "Unlock papers (8–10 coins)",
  "Save papers offline",
  "Upload papers & earn",
  "Leaderboard access",
  "1× AI Mock Paper preview",
];
const PREMIUM_FEATURES = [
  "Everything in Free",
  "Unlimited AI Mock Papers",
  "AI pattern & topic analysis",
  "Download papers as files",
  "Ad-free experience",
  "Priority paper approval",
  "Early access to features",
];

function PricingSection() {
  return (
    <section className="py-28 px-4 sm:px-6 lg:px-8 bg-stone-900">
      <div className="max-w-5xl mx-auto">
        <FadeIn className="text-center mb-14">
          <p className="text-xs font-semibold tracking-[0.18em] uppercase text-stone-600 mb-3">
            Pricing
          </p>
          <h2
            className="text-3xl font-bold text-stone-100 tracking-tight"
            style={{ fontFamily: "'Lora', serif" }}
          >
            Start free, upgrade when ready
          </h2>
        </FadeIn>

        <div className="grid sm:grid-cols-2 gap-5 max-w-3xl mx-auto">
          {/* Free */}
          <FadeIn delay={0.08}>
            <div className="rounded-xl p-7 h-full bg-stone-800/50 border border-stone-700/50">
              <p className="text-[10.5px] font-semibold tracking-widest text-stone-500 uppercase mb-1">
                Free
              </p>
              <p
                className="text-4xl font-bold text-stone-100 mb-0.5"
                style={{ fontFamily: "'Lora', serif" }}
              >
                ₹0
              </p>
              <p className="text-xs text-stone-600 mb-7">Forever free</p>
              <div className="flex flex-col gap-2.5 mb-7">
                {FREE_FEATURES.map((f) => (
                  <div key={f} className="flex items-start gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-stone-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icons.Check size={9} color="#6b7280" />
                    </div>
                    <span className="text-[12px] text-stone-500">{f}</span>
                  </div>
                ))}
              </div>
              <button className="w-full rounded-lg py-2.5 text-sm font-medium text-stone-400 border border-stone-700 hover:bg-stone-700/40 transition-colors">
                Get started free
              </button>
            </div>
          </FadeIn>

          {/* Premium */}
          <FadeIn delay={0.15}>
            <div className="rounded-xl p-7 h-full bg-white relative overflow-hidden">
              {/* Recommended pill */}
              <div className="absolute -top-px left-1/2 -translate-x-1/2">
                <div className="rounded-b-full px-4 py-1.5 text-[9.5px] font-bold tracking-wider uppercase text-white bg-emerald-800">
                  Recommended
                </div>
              </div>

              <div className="mt-4">
                {/* AI badge — clean, dark, refined */}
                <div className="flex items-center gap-1.5 mb-4">
                  <div className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 bg-stone-900 border border-stone-800">
                    <Icons.Sparkles size={10} color="#9ca3af" />
                    <span className="text-[9.5px] font-semibold tracking-widest text-stone-400 uppercase">
                      AI Powered
                    </span>
                  </div>
                </div>

                <p className="text-[10.5px] font-semibold tracking-widest text-emerald-700 uppercase mb-1">
                  Premium
                </p>
                <div className="flex items-baseline gap-1 mb-0.5">
                  <p
                    className="text-4xl font-bold text-stone-900"
                    style={{ fontFamily: "'Lora', serif" }}
                  >
                    ₹79
                  </p>
                  <span className="text-xs text-stone-400">/month</span>
                </div>
                <p className="text-xs text-stone-400 mb-7">
                  Billed monthly · cancel anytime
                </p>

                <div className="flex flex-col gap-2.5 mb-7">
                  {PREMIUM_FEATURES.map((f) => (
                    <div key={f} className="flex items-start gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Icons.Check size={9} color="#065f46" />
                      </div>
                      <span className="text-[12px] text-stone-600">{f}</span>
                    </div>
                  ))}
                </div>

                <button className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-semibold text-white bg-emerald-800 hover:bg-emerald-900 transition-colors shadow-sm">
                  <Icons.Zap size={13} color="#fff" />
                  Upgrade to Premium
                </button>
              </div>
            </div>
          </FadeIn>
        </div>

        {/* AI feature callout — dark, minimal */}
        <FadeIn delay={0.22}>
          <div className="mt-6 max-w-3xl mx-auto rounded-xl p-5 border border-stone-800 bg-stone-800/30">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-stone-800 border border-stone-700 flex items-center justify-center">
                <Icons.Sparkles size={16} color="#6b7280" />
              </div>
              <div>
                <h4 className="text-[12.5px] font-semibold text-stone-300 mb-1">
                  What does AI Mock Paper do?
                </h4>
                <p className="text-[12px] text-stone-500 leading-relaxed max-w-xl">
                  Our model analyses 10+ years of real question papers for your
                  subject and generates a unique practice paper — matching real
                  exam difficulty, section weightage, and topic distribution.
                </p>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

// ─── Testimonials ─────────────────────────────────────────────────────────────
const TESTIMONIALS = [
  {
    initial: "A",
    name: "Aditya Sharma",
    college: "BITS Pilani",
    quote:
      "Found 4 years of CS papers in under 10 minutes. The coin system makes sense — you contribute, you get access.",
    stars: 5,
  },
  {
    initial: "P",
    name: "Priya Menon",
    college: "VIT Vellore",
    quote:
      "Offline saving is a lifesaver during exam season when hostel WiFi dies. Vault is the first study app I've actually kept.",
    stars: 5,
  },
  {
    initial: "R",
    name: "Rahul Nair",
    college: "Manipal University",
    quote:
      "Uploaded 12 papers and earned enough coins to unlock the whole semester's worth. Fair system, great community.",
    stars: 5,
  },
];

function TestimonialsSection() {
  return (
    <section className="py-28 px-4 sm:px-6 lg:px-8 bg-stone-50">
      <div className="max-w-6xl mx-auto">
        <FadeIn className="text-center mb-14">
          <Label>Testimonials</Label>
          <h2
            className="text-3xl font-bold text-stone-900 tracking-tight"
            style={{ fontFamily: "'Lora', serif" }}
          >
            Students love Vault
          </h2>
        </FadeIn>
        <div className="grid sm:grid-cols-3 gap-4">
          {TESTIMONIALS.map((t, i) => (
            <FadeIn key={t.name} delay={i * 0.09}>
              <div className="rounded-xl p-6 h-full bg-white border border-stone-200">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(t.stars)].map((_, j) => (
                    <Icons.Star key={j} size={12} color="#b8860b" />
                  ))}
                </div>
                <p className="text-[13px] text-stone-500 leading-relaxed mb-6 italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center text-xs font-bold">
                    {t.initial}
                  </div>
                  <div>
                    <p className="text-[12.5px] font-semibold text-stone-700">
                      {t.name}
                    </p>
                    <p className="text-[11px] text-stone-400">{t.college}</p>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Final CTA ────────────────────────────────────────────────────────────────
function FinalCTA() {
  return (
    <section className="py-28 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-xl mx-auto text-center">
        <FadeIn>
          <h2
            className="font-bold mb-4 text-stone-900 tracking-tight leading-[1.1]"
            style={{
              fontSize: "clamp(1.9rem,4vw,2.9rem)",
              fontFamily: "'Lora', serif",
            }}
          >
            Your exam papers are waiting in the Vault.
          </h2>
          <p className="text-sm text-stone-400 mb-9 leading-relaxed">
            Join thousands of students sharing and unlocking papers. Start with
            100 free coins — no credit card needed.
          </p>
          <button className="inline-flex items-center gap-2 rounded-full px-10 py-3.5 text-sm font-semibold text-white bg-emerald-800 hover:bg-emerald-900 transition-all duration-200 hover:-translate-y-px shadow-md shadow-emerald-900/15 active:scale-95">
            <Icons.Lock size={13} color="#fff" />
            Open the Vault — It&apos;s Free
          </button>
        </FadeIn>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="py-7 px-4 sm:px-6 lg:px-8 border-t border-stone-100">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-emerald-800 flex items-center justify-center">
            <Icons.Lock size={11} color="#fff" />
          </div>
          <span className="text-[11.5px] font-bold tracking-[0.22em] text-stone-700 uppercase">
            Vault
          </span>
        </div>
        <p className="text-[11px] text-stone-400">
          © 2025 Vault. Content is user-generated. Platform operates under UGC
          safe harbour.
        </p>
        <div className="flex gap-5">
          {["Privacy", "Terms", "Contact"].map((l) => (
            <a
              key={l}
              href="#"
              className="text-[11.5px] text-stone-400 hover:text-stone-600 no-underline transition-colors"
            >
              {l}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function VaultLandingPage() {
  return (
    <div
      style={{
        fontFamily: "'DM Sans', system-ui, sans-serif",
        color: "#1c1917",
      }}
    >
      <Navbar coins={124} />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <ReferralBanner />
      <PricingSection />
      <TestimonialsSection />
      <FinalCTA />
      <Footer />
    </div>
  );
}
