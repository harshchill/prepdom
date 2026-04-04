"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { purchaseCoins } from "@/app/actions/wallet/coin";

const CoinSVG = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 38 38" fill="none">
    <circle cx="19" cy="19" r="19" fill="#F2B50B" />
    <circle cx="19" cy="19" r="15" fill="#F9CC3E" />
    <circle cx="19" cy="19" r="11" fill="#F2B50B" stroke="#C98A00" strokeWidth="1" />
    <text x="19" y="24" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#7A4F00" fontFamily="DM Sans, sans-serif">V</text>
  </svg>
);

const ArrowUpSVG = () => (
  <svg width="28" height="28" viewBox="0 0 26 26" fill="none">
    <circle cx="13" cy="13" r="13" fill="#dcfce7" />
    <path d="M13 17V9M9 13l4-4 4 4" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ArrowDownSVG = () => (
  <svg width="28" height="28" viewBox="0 0 26 26" fill="none">
    <circle cx="13" cy="13" r="13" fill="#fee2e2" />
    <path d="M13 9v8M9 13l4 4 4-4" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CloseSVG = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const UploadSVG = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ShareSVG = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="18" cy="5" r="3" stroke="currentColor" strokeWidth="2" />
    <circle cx="6" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
    <circle cx="18" cy="19" r="3" stroke="currentColor" strokeWidth="2" />
    <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" stroke="currentColor" strokeWidth="2" />
  </svg>
);

const StarSVG = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const GiftSVG = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
    <path d="M12 11V22M3 7h18v4H3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M12 7s-2-5 2-5 2 5 2 5M12 7s2-5-2-5-2 5-2 5" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const ShieldSVG = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CheckSVG = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ZapSVG = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>
);

const PACKS = [
  { coins: 100, price: 20, rate: "Rs 0.20/coin", best: false },
  { coins: 200, price: 30, rate: "Rs 0.15/coin", best: true },
  { coins: 500, price: 60, rate: "Rs 0.12/coin", best: false },
];

const HOW_IT_WORKS = [
  { icon: <GiftSVG />, title: "Signup Bonus", desc: "Get 100 coins free on joining", reward: "+100" },
  { icon: <UploadSVG />, title: "Upload Papers", desc: "20-50 coins per approved paper", reward: "+20-50" },
  { icon: <ShareSVG />, title: "Refer Friends", desc: "50 coins each when a friend joins", reward: "+50" },
  { icon: <StarSVG />, title: "Daily Login", desc: "Streak bonuses up to 10 coins/day", reward: "+2-10" },
];

const PREMIUM_PERKS = [
  "AI Mock Paper Generator",
  "Unlimited paper unlocks",
  "Pattern Analysis Dashboard",
  "In-app AI Tutor",
  "Download papers as PDF",
  "Ad-free experience",
];

function Toast({ toasts, remove }) {
  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow text-sm font-medium"
            style={{
              background: t.type === "success" ? "#f0fdf4" : "#fef2f2",
              border: `1px solid ${t.type === "success" ? "#bbf7d0" : "#fecaca"}`,
              color: t.type === "success" ? "#166534" : "#b91c1c",
              minWidth: 240,
            }}
          >
            <span className="flex-1">{t.message}</span>
            <button onClick={() => remove(t.id)} className="opacity-40 hover:opacity-80 transition-opacity" aria-label="close toast">
              <CloseSVG />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export default function WalletClient({
  initialCoins,
  initialTransactions,
  initialStats = {},
  initialMeta = {},
}) {
  const [coins, setCoins] = useState(initialCoins);
  const [transactions, setTransactions] = useState(initialTransactions);
  const [buying, setBuying] = useState(null);
  const [toasts, setToasts] = useState([]);
  const tid = useRef(0);

  const addToast = (message, type = "success") => {
    const id = ++tid.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  };

  const handleBuy = async (pack, idx) => {
    if (buying !== null) return;

    setBuying(idx);
    try {
      const result = await purchaseCoins(pack);
      setCoins(result.newBalance);
      setTransactions((prev) => [
        {
          id: result.transaction.id,
          type: result.transaction.type,
          reason: result.transaction.reason,
          amount: result.transaction.amount,
          balanceAfter: result.transaction.balanceAfter,
          createdAt: result.transaction.createdAt,
          paper: null,
          unlock: null,
        },
        ...prev,
      ]);
      addToast(result.message);
    } catch (error) {
      addToast(error.message || "Purchase failed", "error");
    } finally {
      setBuying(null);
    }
  };

  const formatTransaction = (tx) => {
    const date = new Date(tx.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    let sub;
    if (diffDays === 0) {
      sub = "Today";
    } else if (diffDays === 1) {
      sub = "Yesterday";
    } else {
      sub = `${diffDays} days ago`;
    }

    let label;
    switch (tx.reason) {
      case "unlock":
        label = tx.paper ? `Unlocked ${tx.paper.title}` : "Paper unlock";
        break;
      case "reward":
        label = "Reward earned";
        break;
      case "purchase":
        label = "Coin purchase";
        break;
      case "refund":
        label = "Refund";
        break;
      case "admin_adjustment":
        label = "Admin adjustment";
        break;
      case "bonus":
        label = "Bonus";
        break;
      default:
        label = "Transaction";
    }

    return {
      id: tx.id,
      label,
      sub,
      amount: tx.type === "credit" ? tx.amount : -tx.amount,
      type: tx.type === "credit" ? "up" : "down",
    };
  };

  const formattedTransactions = transactions.map(formatTransaction);
  const creditCount = formattedTransactions.filter((tx) => tx.amount > 0).length;
  const debitCount = formattedTransactions.filter((tx) => tx.amount < 0).length;
  const totalEarned = formattedTransactions
    .filter((tx) => tx.amount > 0)
    .reduce((sum, tx) => sum + tx.amount, 0);
  const totalSpent = formattedTransactions
    .filter((tx) => tx.amount < 0)
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
  const totalTransactions = initialStats.totalTransactions ?? transactions.length;
  const creditCountDisplay = initialStats.creditCount ?? creditCount;
  const debitCountDisplay = initialStats.debitCount ?? debitCount;
  const totalEarnedDisplay = initialStats.totalEarned ?? totalEarned;
  const totalSpentDisplay = initialStats.totalSpent ?? totalSpent;
  const unlockCount = initialStats.unlockCount ?? 0;
  const premiumStatus = initialMeta.isPremium ? "Premium Active" : "Free Plan";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&display=swap');
        *, *::before, *::after { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }

        :root {
          --wallet-bg: #f2f2f2;
          --wallet-card: #ffffff;
          --wallet-ink: #111111;
          --wallet-muted: #6b7280;
          --wallet-border: #e5e7eb;
          --wallet-green: #25671e;
          --wallet-lime: #a3e635;
          --wallet-gold: #f2b50b;
          --wallet-slate: #1e293b;
        }

        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 0.85s linear infinite; }

        .wallet-shell {
          min-height: 100vh;
          background: radial-gradient(circle at top right, rgba(163, 230, 53, 0.11), transparent 36%), var(--wallet-bg);
          padding-top: 0px;
          padding-bottom: 72px;
        }

        .wallet-wrap {
          max-width: 1180px;
          margin: 0 auto;
          padding: 30px 24px 0;
        }

        .wallet-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.45fr) minmax(0, 1fr);
          gap: 18px;
          align-items: start;
        }

        .stack {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .panel {
          background: var(--wallet-card);
          border: 1px solid rgba(17, 17, 17, 0.05);
          box-shadow: 0 12px 32px rgba(17, 24, 39, 0.05);
          border-radius: 18px;
        }

        .title {
          color: var(--wallet-ink);
          font-size: 28px;
          line-height: 1.15;
          font-weight: 800;
          letter-spacing: -0.02em;
        }

        .muted {
          color: var(--wallet-muted);
          font-size: 13px;
          margin-top: 5px;
        }

        .balance-panel {
          padding: 24px;
          background: linear-gradient(130deg, #111111 0%, #1f2937 52%, #25671e 160%);
          border: none;
          color: #fff;
          position: relative;
          overflow: hidden;
        }

        .balance-panel::after {
          content: "";
          position: absolute;
          right: -70px;
          top: -70px;
          width: 220px;
          height: 220px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(163, 230, 53, 0.4), transparent 62%);
          pointer-events: none;
        }

        .balance-value {
          font-size: clamp(38px, 7vw, 58px);
          font-weight: 800;
          letter-spacing: -0.04em;
          line-height: 1;
          color: var(--wallet-lime);
        }

        .vault-btn {
          border: 1px solid rgba(163, 230, 53, 0.4);
          background: rgba(163, 230, 53, 0.15);
          color: #eafdc3;
          padding: 10px 14px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: transform .15s ease, background .15s ease;
        }

        .vault-btn:hover {
          background: rgba(163, 230, 53, 0.24);
          transform: translateY(-1px);
        }

        .mini-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }

        .mini-stat {
          padding: 14px 16px;
          border-radius: 14px;
          border: 1px solid var(--wallet-border);
          background: #fcfcfc;
        }

        .mini-stat p:first-child {
          color: #6b7280;
          font-size: 12px;
          margin: 0 0 5px;
        }

        .mini-stat p:last-child {
          color: #111827;
          font-size: 22px;
          font-weight: 700;
          margin: 0;
        }

        .section {
          padding: 20px;
        }

        .section h2 {
          margin: 0 0 14px;
          font-size: 18px;
          color: #111827;
          font-weight: 700;
        }

        .insight-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
        }

        .insight-tile {
          border: 1px solid var(--wallet-border);
          border-radius: 12px;
          padding: 12px;
          background: #fcfcfc;
        }

        .insight-tile p {
          margin: 0;
        }

        .insight-tile p:first-child {
          color: #6b7280;
          font-size: 11px;
          margin-bottom: 4px;
        }

        .insight-tile p:last-child {
          color: #111827;
          font-size: 20px;
          font-weight: 800;
          letter-spacing: -0.02em;
        }

        .trust-card {
          border: 1px dashed rgba(37, 103, 30, 0.28);
          border-radius: 14px;
          background: linear-gradient(130deg, rgba(163, 230, 53, 0.1), rgba(37, 103, 30, 0.05));
          padding: 14px;
        }

        .trust-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 9px 0;
          border-bottom: 1px solid rgba(17, 24, 39, 0.08);
          font-size: 13px;
        }

        .trust-row:last-child {
          border-bottom: none;
        }

        .tx-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          max-height: 425px;
          overflow: auto;
          padding-right: 2px;
        }

        .tx-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 11px 12px;
          border-radius: 11px;
          transition: background .14s ease;
        }

        .tx-row:hover { background: #f8fafc; }

        .tx-amount {
          font-size: 15px;
          font-weight: 700;
        }

        .pack {
          border: 1px solid var(--wallet-border);
          border-radius: 14px;
          background: #f9fafb;
          padding: 14px;
          width: 100%;
          text-align: left;
          cursor: pointer;
          transition: transform .14s ease, box-shadow .14s ease, border-color .14s ease;
          position: relative;
        }

        .pack:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 10px 22px rgba(15, 23, 42, 0.08);
        }

        .pack:disabled {
          cursor: not-allowed;
          opacity: 0.7;
        }

        .pack.best {
          border: 2px solid #0ea5e9;
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
        }

        .badge {
          position: absolute;
          top: -9px;
          right: 10px;
          background: #0ea5e9;
          color: #fff;
          border-radius: 999px;
          padding: 3px 8px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: .02em;
        }

        .earn-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px;
          border-radius: 12px;
          transition: background .13s;
        }

        .earn-row:hover {
          background: #f5f5f3;
        }

        .earn-icon {
          width: 34px;
          height: 34px;
          border-radius: 9px;
          background: #f0f9ff;
          color: #0369a1;
          display: grid;
          place-items: center;
          flex-shrink: 0;
        }

        .reward-pill {
          margin-left: auto;
          background: #f0fdf4;
          color: #166534;
          font-size: 11px;
          font-weight: 700;
          border-radius: 999px;
          padding: 5px 8px;
          white-space: nowrap;
        }

        .premium {
          background: linear-gradient(138deg, #0f172a 0%, #1e293b 54%, #334155 100%);
          color: #f8fafc;
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .premium ul {
          margin: 0;
          padding: 0;
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 9px;
        }

        .premium li {
          display: flex;
          align-items: center;
          gap: 9px;
          font-size: 14px;
        }

        .premium-btn {
          width: 100%;
          margin-top: 16px;
          border: none;
          border-radius: 12px;
          padding: 11px 14px;
          background: var(--wallet-lime);
          color: #111;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: transform .15s ease, filter .15s ease;
        }

        .premium-btn:hover {
          filter: brightness(0.93);
          transform: translateY(-1px);
        }

        @media (max-width: 1020px) {
          .wallet-grid {
            grid-template-columns: 1fr;
          }

          .wallet-wrap {
            padding-left: 14px;
            padding-right: 14px;
          }

          .balance-panel {
            padding: 20px;
          }
        }

        @media (max-width: 640px) {
          .title {
            font-size: 24px;
          }

          .mini-grid {
            grid-template-columns: 1fr;
          }

          .insight-grid {
            grid-template-columns: 1fr;
          }

          .section {
            padding: 16px;
          }
        }
      `}</style>

      <Toast toasts={toasts} remove={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />

      <div className="wallet-shell">
        <div className="wallet-wrap">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }}>
            <h1 className="title">Coin Wallet</h1>
            <p className="muted">Manage your coins, top up instantly, and keep track of every activity.</p>
          </motion.div>

          <div style={{ height: 16 }} />

          <div className="wallet-grid">


            <div className="stack">

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.04 }}
                style={{
                  background: "#fffbeb",
                  border: "1.5px solid #fde68a",
                  borderRadius: 14,
                  padding: "16px 20px",
                  display: "flex",
                  justifyContent: "flex-start",
                  alignItems: "center",
                  gap: 16,
                  
                  marginRight: "auto",
                  marginLeft: 0,
                  maxWidth: "fit-content",
                }}
              >
                <div style={{
                  width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                  background: "#fef3c7", display: "flex", alignItems: "center", justifyContent: "flex-start",
                  color: "#d97706",
                }}>
                  <StarSVG size={17} />
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#92400e", marginBottom: 3 }}>
                    {coins} coins = {Math.floor(coins / 9)} papers ready to unlock
                  </p>
                  <p style={{ fontSize: 13, color: "#a16207" }}>
                    That&apos;s a full revision set -{" "}
                    <strong style={{ color: "#92400e" }}>start unlocking before your exam week hits.</strong>
                  </p>
                </div>
              </motion.div>

              <motion.section
                className="panel balance-panel"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.32 }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 14, position: "relative", zIndex: 1 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <CoinSVG size={42} />
                      <span className="balance-value">{coins.toLocaleString()}</span>
                    </div>
                    <p style={{ marginTop: 10, color: "#d1d5db", fontSize: 14 }}>Available Coins</p>
                  </div>
                  <button className="vault-btn" type="button">Vault Active</button>
                </div>
              </motion.section>

              <motion.section
                className="mini-grid"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.36 }}
              >
                <div className="mini-stat">
                  <p>Total Transactions</p>
                  <p>{totalTransactions}</p>
                </div>
                <div className="mini-stat">
                  <p>Total Unlocks</p>
                  <p>{unlockCount}</p>
                </div>
              </motion.section>

              <motion.section
                className="panel section"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.38 }}
              >
                <h2>Wallet Insights</h2>
                <div className="insight-grid">
                  <div className="insight-tile">
                    <p>Credits</p>
                    <p>{creditCountDisplay}</p>
                  </div>
                  <div className="insight-tile">
                    <p>Total Earned</p>
                    <p>{totalEarnedDisplay.toLocaleString()}</p>
                  </div>
                  <div className="insight-tile">
                    <p>Total Spent</p>
                    <p>{totalSpentDisplay.toLocaleString()}</p>
                  </div>
                </div>
                <div className="trust-card" style={{ marginTop: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#25671e", fontWeight: 700, marginBottom: 2 }}>
                    <ShieldSVG size={16} />
                    <span>Wallet Status</span>
                  </div>
                  <div className="trust-row">
                    <span style={{ color: "#4b5563" }}>Plan</span>
                    <strong style={{ color: "#166534" }}>{premiumStatus}</strong>
                  </div>
                  <div className="trust-row">
                    <span style={{ color: "#4b5563" }}>Credits</span>
                    <strong style={{ color: "#166534" }}>{creditCountDisplay}</strong>
                  </div>
                  <div className="trust-row">
                    <span style={{ color: "#4b5563" }}>Debits</span>
                    <strong style={{ color: "#166534" }}>{debitCountDisplay}</strong>
                  </div>
                </div>
              </motion.section>

              <motion.section
                className="panel section"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <h2>Recent Activity</h2>
                <div className="tx-list">
                  {formattedTransactions.length > 0 ? (
                    formattedTransactions.map((tx) => (
                      <div key={tx.id} className="tx-row">
                        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                          {tx.type === "up" ? <ArrowUpSVG /> : <ArrowDownSVG />}
                          <div style={{ minWidth: 0 }}>
                            <p style={{ margin: 0, color: "#111827", fontSize: 14, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{tx.label}</p>
                            <p style={{ margin: "3px 0 0", color: "#6b7280", fontSize: 12 }}>{tx.sub}</p>
                          </div>
                        </div>
                        <span className="tx-amount" style={{ color: tx.amount > 0 ? "#16a34a" : "#dc2626" }}>
                          {tx.amount > 0 ? "+" : ""}
                          {tx.amount}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div style={{ textAlign: "center", padding: "36px 12px", color: "#6b7280" }}>
                      <p style={{ margin: 0, fontSize: 14 }}>No transactions yet</p>
                      <p style={{ margin: "4px 0 0", fontSize: 12 }}>Your coin activity will appear here</p>
                    </div>
                  )}
                </div>
              </motion.section>
            </div>

            <div className="stack">
              <motion.section
                className="panel section"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.42 }}
              >
                <h2>Buy Coins</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {PACKS.map((pack, idx) => (
                    <button
                      key={pack.coins}
                      type="button"
                      className={`pack ${pack.best ? "best" : ""}`}
                      onClick={() => handleBuy(pack, idx)}
                      disabled={buying !== null}
                    >
                      {pack.best && <span className="badge">BEST VALUE</span>}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                        <div>
                          <p style={{ margin: 0, color: "#111827", fontWeight: 700, fontSize: 16 }}>{pack.coins} Coins</p>
                          <p style={{ margin: "3px 0 0", color: "#6b7280", fontSize: 12 }}>{pack.rate}</p>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <p style={{ margin: 0, color: "#111827", fontWeight: 800, fontSize: 18 }}>Rs {pack.price}</p>
                          {buying === idx && (
                            <span className="spin" style={{ display: "inline-flex", marginTop: 4, color: "#25671e" }}>
                              <ZapSVG size={15} />
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                <p style={{ margin: "12px 0 0", color: "#6b7280", fontSize: 11, textAlign: "center" }}>
                  Secure payment powered by Razorpay
                </p>
              </motion.section>

              <motion.section
                className="panel section"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.46 }}
              >
                <h2>How To Earn Coins</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {HOW_IT_WORKS.map((item) => (
                    <div className="earn-row" key={item.title}>
                      <div className="earn-icon">{item.icon}</div>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#111827" }}>{item.title}</p>
                        <p style={{ margin: "2px 0 0", fontSize: 12, color: "#6b7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {item.desc}
                        </p>
                      </div>
                      <span className="reward-pill">{item.reward}</span>
                    </div>
                  ))}
                </div>
              </motion.section>

              <motion.section
                className="panel section premium"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                  <ShieldSVG />
                  <h2 style={{ margin: 0, color: "#f8fafc" }}>Premium Perks</h2>
                </div>

                <ul>
                  {PREMIUM_PERKS.map((perk) => (
                    <li key={perk}>
                      <CheckSVG />
                      <span>{perk}</span>
                    </li>
                  ))}
                </ul>

                <button type="button" className="premium-btn">Upgrade To Premium</button>
              </motion.section>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}

