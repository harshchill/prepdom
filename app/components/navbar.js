"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const NAV_LINKS = [
  { label: "Home", href: "#hero" },
  { label: "Library", href: "#library" },
  { label: "Leaderboard", href: "#leaderboard" },
  { label: "Premium", href: "#premium" },
];

export default function Navbar({ coins = 0 }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("Home");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setMobileOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <motion.header
      className="fixed inset-x-0 top-0 z-50"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="px-4 sm:px-6 lg:px-8">
        <div
          className="mt-3 rounded-2xl px-4 sm:px-5 transition-all duration-300"
          style={{
            background: scrolled
              ? "rgba(255,255,255,0.97)"
              : "rgba(255,255,255,0.90)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(37, 103, 30, 0.12)",
            boxShadow: scrolled
              ? "0 4px 28px rgba(37,103,30,0.12), 0 1px 6px rgba(0,0,0,0.06)"
              : "0 2px 16px rgba(37,103,30,0.07)",
          }}
        >
          {/* Main Row */}
          <div className="flex items-center justify-between py-2.5">

            {/* ── Logo ── */}
            <a
              href="#hero"
              className="group flex items-center gap-2.5 no-underline"
            >
              <div
                className="flex h-9 w-9 items-center justify-center rounded-xl shadow-sm transition-transform duration-200 group-hover:rotate-[-5deg] group-hover:scale-105"
                style={{ background: "#25671E" }}
              >
                <span className="text-base">🔐</span>
              </div>
              <span
                className="text-[15px] font-bold tracking-widest"
                style={{ color: "#25671E" }}
              >
                VAULT
              </span>
              {/* Live badge */}
              <span
                className="hidden sm:inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide"
                style={{
                  background: "rgba(37,103,30,0.08)",
                  border: "1px solid rgba(37,103,30,0.2)",
                  color: "#25671E",
                }}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full animate-pulse"
                  style={{ background: "#48A111" }}
                />
                LIVE
              </span>
            </a>

            {/* ── Desktop Nav ── */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  onClick={() => setActiveLink(label)}
                  className="relative px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-all duration-150 no-underline"
                  style={{
                    color: activeLink === label ? "#25671E" : "#4a7244",
                    background:
                      activeLink === label
                        ? "rgba(37,103,30,0.1)"
                        : "transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (activeLink !== label)
                      e.currentTarget.style.background =
                        "rgba(37,103,30,0.06)";
                  }}
                  onMouseLeave={(e) => {
                    if (activeLink !== label)
                      e.currentTarget.style.background = "transparent";
                  }}
                >
                  {label}
                </a>
              ))}
            </nav>

            {/* ── Right — Coin + CTAs ── */}
            <div className="flex items-center gap-2">
              {/* Coin pill — visible sm+ */}
              <div
                className="hidden sm:flex items-center gap-1.5 rounded-full px-2.5 py-1 cursor-pointer transition-all duration-150"
                style={{
                  background: "rgba(255,255,255,0.8)",
                  border: "1px solid rgba(242,181,11,0.45)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background =
                    "rgba(242,181,11,0.07)";
                  e.currentTarget.style.borderColor =
                    "rgba(242,181,11,0.65)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.8)";
                  e.currentTarget.style.borderColor =
                    "rgba(242,181,11,0.45)";
                }}
              >
                <div
                  className="flex h-6 w-6 items-center justify-center rounded-full text-xs"
                  style={{
                    background: "#F2B50B",
                    boxShadow: "0 0 10px rgba(242,181,11,0.45)",
                  }}
                >
                  🪙
                </div>
                <span className="text-[11px] font-medium" style={{ color: "#7ba87a" }}>
                  Coins
                </span>
                <span
                  className="text-[13px] font-bold tabular-nums"
                  style={{ color: "#25671E" }}
                >
                  {coins.toLocaleString()}
                </span>
              </div>

              {/* Sign In — desktop only */}
              <button
                className="hidden md:inline-flex rounded-full px-4 py-[7px] text-[13px] font-semibold transition-all duration-150 hover:bg-green-50 active:scale-95"
                style={{
                  border: "1px solid rgba(37,103,30,0.22)",
                  color: "#25671E",
                }}
              >
                Sign In
              </button>

              {/* Sign Up — always visible */}
              <button
                className="inline-flex rounded-full px-4 py-[7px] text-[13px] font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
                style={{
                  background: "#25671E",
                  boxShadow: "0 2px 10px rgba(37,103,30,0.30)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#1e5618";
                  e.currentTarget.style.boxShadow =
                    "0 4px 16px rgba(37,103,30,0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#25671E";
                  e.currentTarget.style.boxShadow =
                    "0 2px 10px rgba(37,103,30,0.30)";
                }}
              >
                Sign Up Free
              </button>

              {/* Hamburger — mobile only */}
              <button
                className="md:hidden flex flex-col justify-center items-center gap-[5px] p-2 rounded-xl transition-all duration-150"
                style={{
                  border: "1px solid rgba(37,103,30,0.15)",
                  background: "rgba(37,103,30,0.04)",
                }}
                onClick={() => setMobileOpen((v) => !v)}
                aria-label="Toggle menu"
              >
                <span
                  className="block h-0.5 w-[18px] rounded-full transition-all duration-250 origin-center"
                  style={{
                    background: "#25671E",
                    transform: mobileOpen
                      ? "translateY(7px) rotate(45deg)"
                      : "none",
                  }}
                />
                <span
                  className="block h-0.5 w-[18px] rounded-full transition-all duration-250"
                  style={{
                    background: "#25671E",
                    opacity: mobileOpen ? 0 : 1,
                  }}
                />
                <span
                  className="block h-0.5 w-[18px] rounded-full transition-all duration-250 origin-center"
                  style={{
                    background: "#25671E",
                    transform: mobileOpen
                      ? "translateY(-7px) rotate(-45deg)"
                      : "none",
                  }}
                />
              </button>
            </div>
          </div>

          {/* ── Mobile Menu ── */}
          <AnimatePresence>
            {mobileOpen && (
              <motion.div
                key="mobile-menu"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden md:hidden"
              >
                <div
                  className="flex flex-col gap-1 pt-2 pb-3 border-t"
                  style={{ borderColor: "rgba(37,103,30,0.1)" }}
                >
                  {NAV_LINKS.map(({ label, href }) => (
                    <a
                      key={label}
                      href={href}
                      onClick={() => {
                        setActiveLink(label);
                        setMobileOpen(false);
                      }}
                      className="px-3 py-2.5 rounded-xl text-sm font-medium no-underline transition-colors duration-150"
                      style={{
                        color:
                          activeLink === label ? "#25671E" : "#4a7244",
                        background:
                          activeLink === label
                            ? "rgba(37,103,30,0.08)"
                            : "transparent",
                      }}
                    >
                      {label}
                    </a>
                  ))}

                  {/* Mobile coin display */}
                  <div
                    className="flex items-center gap-2 px-3 py-2 mt-1 rounded-xl"
                    style={{ background: "rgba(242,181,11,0.07)" }}
                  >
                    <span className="text-base">🪙</span>
                    <span className="text-sm font-medium" style={{ color: "#7ba87a" }}>
                      Your coins:
                    </span>
                    <span
                      className="text-sm font-bold tabular-nums ml-auto"
                      style={{ color: "#25671E" }}
                    >
                      {coins.toLocaleString()}
                    </span>
                  </div>

                  {/* Mobile CTAs */}
                  <div className="flex gap-2 mt-1">
                    <button
                      className="flex-1 rounded-full py-2 text-sm font-semibold transition-colors"
                      style={{
                        border: "1px solid rgba(37,103,30,0.22)",
                        color: "#25671E",
                      }}
                    >
                      Sign In
                    </button>
                    <button
                      className="flex-1 rounded-full py-2 text-sm font-semibold text-white"
                      style={{
                        background: "#25671E",
                        boxShadow: "0 2px 10px rgba(37,103,30,0.25)",
                      }}
                    >
                      Sign Up Free
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.header>
  );
}