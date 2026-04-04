"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { signOut, useSession } from "next-auth/react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Bookmark,
  ChevronDown,
  LayoutDashboard,
  Lock,
  LogOut,
  Plus,
  ShieldCheck,
  Upload,
  UserRound,
  Wallet,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

const BASE_MAIN_LINKS = [
  { label: "Upload", href: "/user/uploads", matchPath: "/user/uploads" },
  { label: "Library", href: "/user/library", matchPath: "/user/library" },
  { label: "Leaderboard", href: "/#leaderboard", hash: "#leaderboard" },
  { label: "Premium", href: "/#premium", hash: "#premium" },
];

const BASE_ACCOUNT_LINKS = [
  { label: "My Dashboard", href: "/user/dashboard", icon: LayoutDashboard },
  { label: "My Wallet", href: "/user/wallet", icon: Wallet },
  { label: "My Profile", href: "/user/profile", icon: UserRound },
  { label: "My Uploads", href: "/user/uploads", icon: Upload },
  { label: "My Saves", href: "/user/saves", icon: Bookmark },
  { label: "My Unlocks", href: "/user/unlocks", icon: Lock },
];

function getInitials(name) {
  if (!name) {
    return "U";
  }

  const [first = "", second = ""] = name.trim().split(/\s+/);
  return `${first.charAt(0)}${second.charAt(0)}`.toUpperCase() || "U";
}

export default function Navbar({ coins = 0 }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [currentHash, setCurrentHash] = useState("");

  const mobileShellRef = useRef(null);
  const userMenuRef = useRef(null);

  const isAuthenticated = status === "authenticated" && Boolean(session?.user);
  const displayName = session?.user?.name || "Prepdom User";
  const displayEmail = session?.user?.email || "";
  const displayAvatar = session?.user?.image || null;
  const displayCoins = isAuthenticated
    ? Math.max(0, Number(session?.user?.coins ?? 0) || 0)
    : Math.max(0, Number(coins ?? 0) || 0);
  const isPremiumMember = Boolean(session?.user?.isPremium);
  const isAdmin = session?.user?.role === "admin";

  const mainLinks = useMemo(() => {
    if (!isAdmin) {
      return BASE_MAIN_LINKS;
    }

    return [
      ...BASE_MAIN_LINKS,
      { label: "Admin", href: "/admin/papers", matchPath: "/admin/papers" },
    ];
  }, [isAdmin]);

  const accountLinks = useMemo(() => {
    if (!isAdmin) {
      return BASE_ACCOUNT_LINKS;
    }

    return [
      { label: "Admin Papers", href: "/admin/papers", icon: ShieldCheck },
      ...BASE_ACCOUNT_LINKS,
    ];
  }, [isAdmin]);

  const callbackUrl = useMemo(() => {
    const queryString = searchParams?.toString();
    const path = pathname || "/";
    const hashPart = pathname === "/" ? currentHash : "";
    return `${path}${queryString ? `?${queryString}` : ""}${hashPart}`;
  }, [pathname, searchParams, currentHash]);

  const loginHref = useMemo(
    () => `/user/login?callbackUrl=${encodeURIComponent(callbackUrl || "/")}`,
    [callbackUrl]
  );

  const coinPillHref = isAuthenticated ? "/user/wallet" : loginHref;

  useEffect(() => {
    const syncHash = () => setCurrentHash(window.location.hash || "");
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) {
        setMobileOpen(false);
      }
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    function handleOutsideClick(event) {
      const target = event.target;

      if (
        mobileOpen &&
        mobileShellRef.current &&
        !mobileShellRef.current.contains(target)
      ) {
        setMobileOpen(false);
      }

      if (
        userMenuOpen &&
        userMenuRef.current &&
        !userMenuRef.current.contains(target)
      ) {
        setUserMenuOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setMobileOpen(false);
        setUserMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [mobileOpen, userMenuOpen]);

  const isMainLinkActive = (link) => {
    if (link.matchPath) {
      return pathname?.startsWith(link.matchPath);
    }

    if (pathname !== "/") {
      return false;
    }

    if (link.hash === "#hero") {
      return currentHash === "" || currentHash === "#hero";
    }

    return currentHash === link.hash;
  };

  async function handleSignOut() {
    if (loggingOut) {
      return;
    }

    setLoggingOut(true);
    await signOut({ callbackUrl: "/" });
  }

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
          <div className="flex items-center justify-between py-2.5">
            <Link href="/#hero" className="group flex items-center gap-2.5 no-underline">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-xl shadow-sm transition-transform duration-200 group-hover:rotate-[-5deg] group-hover:scale-105"
                style={{ background: "#25671E" }}
              >
                <span className="text-base">🔐</span>
              </div>
              <span className="text-[15px] font-bold tracking-widest" style={{ color: "#25671E" }}>
                VAULT
              </span>
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
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {mainLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="relative rounded-full px-3.5 py-1.5 text-[13px] font-medium no-underline transition-all duration-150"
                  style={{
                    color: isMainLinkActive(link) ? "#25671E" : "#4a7244",
                    background: isMainLinkActive(link)
                      ? "rgba(37,103,30,0.1)"
                      : "transparent",
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2" ref={mobileShellRef}>
              <Link
                href={coinPillHref}
                className="hidden cursor-pointer items-center gap-1.5 rounded-full px-2.5 py-1 transition-all duration-150 sm:flex"
                style={{
                  background: "rgba(255,255,255,0.8)",
                  border: "1px solid rgba(242,181,11,0.45)",
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
                <span className="text-[13px] font-bold tabular-nums" style={{ color: "#25671E" }}>
                  {displayCoins.toLocaleString()}
                </span>
                <span
                  className="inline-flex h-5 w-5 items-center justify-center rounded-full"
                  style={{
                    color: "#25671E",
                    background: "rgba(37,103,30,0.10)",
                  }}
                  aria-hidden="true"
                >
                  <Plus className="h-3 w-3" />
                </span>
              </Link>

              {!isAuthenticated && status !== "loading" ? (
                <>
                  <Link
                    href={loginHref}
                    className="hidden rounded-full px-4 py-1.75 text-[13px] font-semibold no-underline transition-all duration-150 hover:bg-green-50 active:scale-95 md:inline-flex"
                    style={{
                      border: "1px solid rgba(37,103,30,0.22)",
                      color: "#25671E",
                    }}
                  >
                    Sign In
                  </Link>

                  <Link
                    href={loginHref}
                    className="hidden rounded-full px-4 py-1.75 text-[13px] font-semibold text-white no-underline transition-all duration-200 hover:-translate-y-0.5 active:scale-95 md:inline-flex"
                    style={{
                      background: "#25671E",
                      boxShadow: "0 2px 10px rgba(37,103,30,0.30)",
                    }}
                  >
                    Sign Up Free
                  </Link>
                </>
              ) : null}

              {isAuthenticated ? (
                <div className="relative hidden md:block" ref={userMenuRef}>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-full px-2 py-1.5 transition-all duration-150"
                    style={{
                      border: "1px solid rgba(37,103,30,0.22)",
                      background: userMenuOpen
                        ? "rgba(37,103,30,0.08)"
                        : "rgba(255,255,255,0.85)",
                    }}
                    onClick={() => setUserMenuOpen((open) => !open)}
                    aria-expanded={userMenuOpen}
                    aria-haspopup="menu"
                    aria-label="Toggle user menu"
                  >
                    {displayAvatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={displayAvatar}
                        alt={`${displayName} profile`}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <span
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold"
                        style={{
                          color: "#25671E",
                          background: "rgba(37,103,30,0.13)",
                        }}
                      >
                        {getInitials(displayName)}
                      </span>
                    )}
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-150 ${
                        userMenuOpen ? "rotate-180" : ""
                      }`}
                      style={{ color: "#25671E" }}
                    />
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        key="desktop-user-menu"
                        initial={{ opacity: 0, y: -8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.98 }}
                        transition={{ duration: 0.18 }}
                        className="absolute right-0 top-full mt-2 w-72 rounded-2xl p-2"
                        style={{
                          background: "rgba(255,255,255,0.98)",
                          border: "1px solid rgba(37,103,30,0.14)",
                          boxShadow: "0 14px 40px rgba(15,23,42,0.16)",
                        }}
                      >
                        <div className="rounded-xl px-3 py-3" style={{ background: "rgba(37,103,30,0.06)" }}>
                          <p className="text-sm font-semibold" style={{ color: "#25671E" }}>
                            {displayName}
                          </p>
                          {displayEmail ? (
                            <p className="mt-0.5 break-all text-xs text-zinc-500">{displayEmail}</p>
                          ) : null}
                          <div className="mt-2 flex items-center gap-2 text-[11px]">
                            <span
                              className="rounded-full px-2 py-1 font-semibold"
                              style={{
                                color: "#25671E",
                                background: "rgba(242,181,11,0.2)",
                              }}
                            >
                              Coins: {displayCoins.toLocaleString()}
                            </span>
                            <span
                              className="rounded-full px-2 py-1 font-semibold"
                              style={{
                                color: "#25671E",
                                background: "rgba(37,103,30,0.15)",
                              }}
                            >
                              {isPremiumMember ? "Premium" : "Free"}
                            </span>
                          </div>
                        </div>

                        <div className="mt-2 flex flex-col gap-1">
                          {accountLinks.map(({ label, href, icon: Icon }) => (
                            <Link
                              key={label}
                              href={href}
                              className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium no-underline transition-colors"
                              style={{ color: "#2f4a2d" }}
                              onClick={() => setUserMenuOpen(false)}
                            >
                              <Icon className="h-4 w-4" style={{ color: "#25671E" }} />
                              {label}
                            </Link>
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={handleSignOut}
                          disabled={loggingOut}
                          className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors disabled:opacity-70"
                          style={{
                            border: "1px solid rgba(220,38,38,0.28)",
                            color: "#b91c1c",
                            background: "rgba(254,242,242,0.95)",
                          }}
                        >
                          <LogOut className="h-4 w-4" />
                          {loggingOut ? "Signing out..." : "Log out"}
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : null}

              <button
                type="button"
                className="flex flex-col items-center justify-center gap-1.25 rounded-xl p-2 transition-all duration-150 md:hidden"
                style={{
                  border: "1px solid rgba(37,103,30,0.15)",
                  background: "rgba(37,103,30,0.04)",
                }}
                onClick={() => setMobileOpen((v) => !v)}
                aria-label="Toggle menu"
              >
                <span
                  className="block h-0.5 w-4.5 origin-center rounded-full transition-all duration-250"
                  style={{
                    background: "#25671E",
                    transform: mobileOpen
                      ? "translateY(7px) rotate(45deg)"
                      : "none",
                  }}
                />
                <span
                  className="block h-0.5 w-4.5 rounded-full transition-all duration-250"
                  style={{
                    background: "#25671E",
                    opacity: mobileOpen ? 0 : 1,
                  }}
                />
                <span
                  className="block h-0.5 w-4.5 origin-center rounded-full transition-all duration-250"
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
                  className="flex flex-col gap-1 border-t pb-3 pt-2"
                  style={{ borderColor: "rgba(37,103,30,0.1)" }}
                >
                  {mainLinks.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="rounded-xl px-3 py-2.5 text-sm font-medium no-underline transition-colors duration-150"
                      style={{
                        color: isMainLinkActive(link) ? "#25671E" : "#4a7244",
                        background: isMainLinkActive(link)
                          ? "rgba(37,103,30,0.08)"
                          : "transparent",
                      }}
                    >
                      {link.label}
                    </Link>
                  ))}

                  <div
                    className="mt-1 flex items-center gap-2 rounded-xl px-3 py-2"
                    style={{ background: "rgba(242,181,11,0.07)" }}
                  >
                    <span className="text-base">🪙</span>
                    <span className="text-sm font-medium" style={{ color: "#7ba87a" }}>
                      Your coins:
                    </span>
                    <span className="ml-auto text-sm font-bold tabular-nums" style={{ color: "#25671E" }}>
                      {displayCoins.toLocaleString()}
                    </span>
                  </div>

                  {isAuthenticated ? (
                    <>
                      <div className="mt-1 rounded-xl p-3" style={{ background: "rgba(37,103,30,0.08)" }}>
                        <p className="text-sm font-semibold" style={{ color: "#25671E" }}>
                          {displayName}
                        </p>
                        {displayEmail ? (
                          <p className="mt-0.5 break-all text-xs text-zinc-500">{displayEmail}</p>
                        ) : null}
                        <p className="mt-1 text-xs font-medium text-zinc-600">
                          {isPremiumMember ? "Premium Member" : "Free Member"}
                        </p>
                      </div>

                      <div className="mt-1 flex flex-col gap-1">
                        {accountLinks.map(({ label, href, icon: Icon }) => (
                          <Link
                            key={label}
                            href={href}
                            onClick={() => setMobileOpen(false)}
                            className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium no-underline transition-colors duration-150"
                            style={{ color: "#2f4a2d" }}
                          >
                            <Icon className="h-4 w-4" style={{ color: "#25671E" }} />
                            {label}
                          </Link>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={handleSignOut}
                        disabled={loggingOut}
                        className="mt-1 rounded-xl py-2.5 text-sm font-semibold transition-colors disabled:opacity-70"
                        style={{
                          border: "1px solid rgba(220,38,38,0.28)",
                          color: "#b91c1c",
                          background: "rgba(254,242,242,0.95)",
                        }}
                      >
                        {loggingOut ? "Signing out..." : "Log out"}
                      </button>
                    </>
                  ) : (
                    <div className="mt-1 flex gap-2">
                      <Link
                        href={loginHref}
                        onClick={() => setMobileOpen(false)}
                        className="flex-1 rounded-full py-2 text-center text-sm font-semibold no-underline transition-colors"
                        style={{
                          border: "1px solid rgba(37,103,30,0.22)",
                          color: "#25671E",
                        }}
                      >
                        Sign In
                      </Link>
                      <Link
                        href={loginHref}
                        onClick={() => setMobileOpen(false)}
                        className="flex-1 rounded-full py-2 text-center text-sm font-semibold text-white no-underline"
                        style={{
                          background: "#25671E",
                          boxShadow: "0 2px 10px rgba(37,103,30,0.25)",
                        }}
                      >
                        Sign Up Free
                      </Link>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.header>
  );
}
