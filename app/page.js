"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Coins as Coin,
  Download,
  Sparkles,
  BarChart3 as BarChart,
  Trophy,
  Gift,
  Link as LinkIcon,
  UserPlus,
  Upload,
  Lock,
  Bot,
  Star,
} from "lucide-react";

// ─── Animation Variants ──────────────────────────────────────────────────────

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay, ease: [0.22, 0.61, 0.36, 1] },
  }),
};

// ─── Components ──────────────────────────────────────────────────────────────

const FadeIn = ({ children, delay = 0, className = "" }) => (
  <motion.div
    className={className}
    variants={fadeInUp}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true }}
    custom={delay}
  >
    {children}
  </motion.div>
);

const Label = ({ children }) => (
  <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wide bg-stone-100 text-stone-600 mb-2">
    {children}
  </div>
);

// ─── Data ─────────────────────────────────────────────────────────────────────

const floatingCardsSubjects = [
  "Operating Systems · Sem 5",
  "DBMS · Sem 4",
  "Digital Signal Processing · Sem 6",
  "Data Structures · Sem 3",
  "Engineering Maths II · Sem 2",
  "Computer Networks · Sem 5",
  "Microprocessors · Sem 4",
  "Compiler Design · Sem 6",
  "Web Technology · Sem 5",
  "Theory of Computation · Sem 4",
  "Software Engineering · Sem 7",
  "Probability & Statistics · Sem 3",
];

const paperCards = [
  { subject: "Operating Systems", university: "RGPV · CSE", meta: "Sem 5 · 2023", rating: "4.8", unlocks: "847", coins: 8 },
  { subject: "Digital Logic Design", university: "VTU · ECE", meta: "Sem 3 · 2022", rating: "4.7", unlocks: "562", coins: 8 },
  { subject: "Engineering Mechanics", university: "Mumbai University · Mech", meta: "Sem 1 · 2023", rating: "4.6", unlocks: "431", coins: 9 },
  { subject: "Concrete Technology", university: "Anna University · Civil", meta: "Sem 5 · 2021", rating: "4.9", unlocks: "305", coins: 10 },
  { subject: "Data Structures & Algorithms", university: "RGPV · CSE", meta: "Sem 3 · 2022", rating: "4.8", unlocks: "923", coins: 9 },
  { subject: "Signals & Systems", university: "VTU · ECE", meta: "Sem 4 · 2023", rating: "4.7", unlocks: "512", coins: 8 },
];

const leaderboardTop = [
  { name: "Priya M.", uploads: 61, position: 2 },
  { name: "Aryan S.", uploads: 84, position: 1 },
  { name: "Rahul K.", uploads: 47, position: 3 },
];

const leaderboardRest = [
  { rank: 4, name: "Neha T.", uploads: 39, delta: 3 },
  { rank: 5, name: "Rohan P.", uploads: 33, delta: 3 },
  { rank: 6, name: "Sana K.", uploads: 29, delta: 3 },
  { rank: 7, name: "Aditya V.", uploads: 22, delta: 3 },
  { rank: 8, name: "Ishita R.", uploads: 18, delta: 3 },
];

// ─── Hook ────────────────────────────────────────────────────────────────────

const useFloatingCardsConfig = () => {
  return useMemo(
    () =>
      floatingCardsSubjects.map((label, index) => {
        const column = index % 4;
        const baseX = 5 + column * 22;
        const randomOffset = (index * 13) % 10;
        return {
          label,
          x: baseX + randomOffset,
          duration: 12 + (index % 5) * 1.5,
          delay: index * 0.8,
        };
      }),
    []
  );
};

// ─── Sections ────────────────────────────────────────────────────────────────

const HeroSection = () => {
  const floatingCards = useFloatingCardsConfig();

  return (
    <section
      id="hero"
      className="relative flex min-h-screen items-center justify-center overflow-hidden pb-24 pt-28"
      style={{ background: "linear-gradient(160deg, #F7F0F0 0%, #eef5ec 60%, #F7F0F0 100%)" }}
    >
      {/* Subtle dot-grid texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: "radial-gradient(#25671E 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Background floating cards */}
      <div className="pointer-events-none absolute inset-0 z-0">
        {floatingCards.map((card, index) => (
          <motion.div
            key={card.label + index}
            className="absolute w-52 rounded-xl px-4 py-3"
            style={{
              left: `${card.x}%`,
              opacity: 0.55,
              background: "rgba(247, 240, 240, 0.9)",
              border: "1px solid rgba(37, 103, 30, 0.12)",
              boxShadow: "0 2px 12px rgba(37, 103, 30, 0.06)",
            }}
            initial={{ y: 120 }}
            animate={{ y: -900 }}
            transition={{ duration: card.duration, delay: card.delay, repeat: Infinity, ease: "linear" }}
          >
            <p className="text-xs font-semibold truncate" style={{ color: "#25671E" }}>
              {card.label.split("·")[0]}
            </p>
            <p className="mt-1 text-[11px]" style={{ color: "#48A111", opacity: 0.8 }}>
              {card.label.split("·")[1]?.trim()}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Foreground content */}
      <div className="relative z-10 px-4 sm:px-6 lg:px-10 w-full">
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge */}
          <motion.div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1 text-xs font-medium shadow-sm"
            style={{
              background: "rgba(72, 161, 17, 0.1)",
              border: "1px solid rgba(72, 161, 17, 0.3)",
              color: "#25671E",
            }}
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            custom={0}
          >
            <span>🎓</span>
            <span className="uppercase tracking-wide">Built for Indian College Students</span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight"
            style={{ color: "#25671E" }}
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            custom={0.1}
          >
            <span className="block">Every Exam Paper.</span>
            <span
              className="block mt-1"
              style={{
                background: "linear-gradient(135deg, #48A111 0%, #25671E 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Right Here.
            </span>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            className="mt-5 text-base sm:text-lg max-w-xl mx-auto leading-relaxed"
            style={{ color: "#25671E", opacity: 0.65 }}
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            custom={0.2}
          >
            Community-uploaded. AI-enhanced. Coin-unlocked. Access previous year papers from your college
            instantly — so you revise what actually appears in the exam.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-4"
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            custom={0.3}
          >
            <Link
              href="/auth/signup"
              className="inline-flex items-center rounded-full px-8 py-4 text-sm sm:text-base font-semibold text-white transition-all hover:-translate-y-0.5 active:scale-95"
              style={{
                background: "#25671E",
                boxShadow: "0 8px 24px rgba(37, 103, 30, 0.35)",
              }}
            >
              Get 100 Free Coins →
            </Link>
            <Link
              href="#library"
              className="inline-flex items-center rounded-full px-8 py-4 text-sm sm:text-base font-semibold transition-all hover:-translate-y-0.5"
              style={{
                background: "#FAF6EF",
                border: "1.5px solid rgba(37, 103, 30, 0.25)",
                color: "#25671E",
                boxShadow: "0 2px 10px rgba(37, 103, 30, 0.08)",
              }}
            >
              Browse Papers
            </Link>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm"
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            custom={0.4}
          >
            {["⭐ 10,000+ Papers", "🎓 200+ Colleges", "🔐 UGC Compliant"].map((badge) => (
              <span
                key={badge}
                className="rounded-full px-4 py-1.5"
                style={{
                  background: "white",
                  border: "1px solid rgba(37, 103, 30, 0.15)",
                  color: "#25671E",
                  opacity: 0.85,
                  boxShadow: "0 1px 4px rgba(37, 103, 30, 0.06)",
                }}
              >
                {badge}
              </span>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// ─── Features ─────────────────────────────────────────────────────────────────
const FEATURES = [
  {
    Icon: Search,
    title: "Smart Search",
    desc: "Filter by university, course, semester, or year. Find the exact paper in seconds.",
  },
  {
    Icon: Coin,
    title: "Coin Economy",
    desc: "Earn by uploading or referring. Each unlock costs 8–10 coins — built to stay affordable.",
  },
  {
    Icon: Download,
    title: "Offline Access",
    desc: "Save papers locally. Study without internet — perfect for exam crunch time.",
  },
  {
    Icon: Sparkles,
    title: "AI Mock Paper",
    desc: "Premium: AI-generated practice papers built on real past question patterns.",
  },
  {
    Icon: BarChart,
    title: "Pattern Analysis",
    desc: "Spot high-frequency questions and key topics across years with AI insights.",
  },
  {
    Icon: Trophy,
    title: "Leaderboards",
    desc: "Earn recognition. Climb upload and unlock leaderboards in the community.",
  },
];

const FeaturesSection = () => (
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
  { type: "earn", Icon: Gift, label: "Signup bonus", coins: "+100" },
  { type: "earn", Icon: LinkIcon, label: "Refer a friend", coins: "+50" },
  {
    type: "earn",
    Icon: UserPlus,
    label: "Friend signs up via link",
    coins: "+50",
  },
  {
    type: "earn",
    Icon: Upload,
    label: "Upload approved paper",
    coins: "+20",
  },
  {
    type: "spend",
    Icon: Lock,
    label: "Unlock a paper",
    coins: "−8 to 10",
  },
  {
    type: "spend",
    Icon: Bot,
    label: "AI Mock Paper (premium)",
    coins: "−1,000",
  },
];

const HowItWorksSection = () => (
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
              <Coin size={14} color="#374151" />
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

// ─── Referral Banner ──────────────────────────────────────────────────────────
const ReferralBanner = () => (
  <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
    <div className="max-w-2xl mx-auto">
      <FadeIn>
        <div className="rounded-2xl px-10 py-10 text-center bg-stone-50 border border-stone-200">
          <div className="flex items-center justify-center gap-1.5 mb-3">
            <LinkIcon size={11} color="#a8a29e" />
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
                  <Coin size={12} color="#065f46" />
                  <span className="font-mono text-[11.5px] font-bold text-emerald-800">
                    +50 coins
                  </span>
                </div>
              </div>
            ))}
          </div>
          <button className="inline-flex items-center gap-2 rounded-full px-7 py-2.5 text-sm font-semibold text-white bg-emerald-800 hover:bg-emerald-900 transition-colors shadow-sm">
            <LinkIcon size={13} color="#fff" />
            Get Your Referral Link
          </button>
        </div>
      </FadeIn>
    </div>
  </section>
);

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

const TestimonialsSection = () => (
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
                  <Star key={j} size={12} color="#b8860b" />
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

// ─── Final CTA ────────────────────────────────────────────────────────────────
const FinalCTA = () => (
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
          <Lock size={13} color="#fff" />
          Open the Vault — It&apos;s Free
        </button>
      </FadeIn>
    </div>
  </section>
);

// ─── Footer ───────────────────────────────────────────────────────────────────
const Footer = () => (
  <footer className="py-7 px-4 sm:px-6 lg:px-8 border-t border-stone-100">
    <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-md bg-emerald-800 flex items-center justify-center">
          <Lock size={11} color="#fff" />
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

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function VaultLandingPage() {
  return (
    <div
      style={{
        fontFamily: "'DM Sans', system-ui, sans-serif",
        color: "#1c1917",
      }}
    >
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <ReferralBanner />
      <TestimonialsSection />
      <FinalCTA />
      <Footer />
    </div>
  );
}