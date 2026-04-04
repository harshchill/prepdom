"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/lib/models/User";
import CoinTransaction from "@/lib/models/CoinTransaction";
import Unlock from "@/lib/models/Unlock";
import "@/lib/models/Paper";

const VALID_TRANSACTION_REASONS = new Set([
  "unlock",
  "reward",
  "purchase",
  "refund",
  "admin_adjustment",
  "bonus",
  "other",
]);

function normalizeReason(reason) {
  if (!reason || typeof reason !== "string") {
    return "other";
  }

  return VALID_TRANSACTION_REASONS.has(reason) ? reason : "other";
}

function mapTransaction(tx) {
  const paperTitle = tx.paper?.title || tx.unlock?.paper?.title || null;

  return {
    id: tx._id.toString(),
    type: tx.type,
    reason: tx.reason,
    amount: tx.amount,
    balanceBefore: tx.balanceBefore,
    balanceAfter: tx.balanceAfter,
    createdAt: tx.createdAt,
    paper: paperTitle ? { title: paperTitle } : null,
    unlock: tx.unlock ? { id: tx.unlock._id.toString() } : null,
  };
}

async function getAuthenticatedUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    throw new Error("Unauthorized");
  }

  await connectToDatabase();
  const user = await User.findOne({ email: session.user.email });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
}

async function fetchUserTransactions(userId, limit = 20) {
  return CoinTransaction.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("paper", "title")
    .populate({
      path: "unlock",
      select: "paper",
      populate: { path: "paper", select: "title" },
    })
    .lean();
}

// Get user's current coin balance
export async function getUserCoins() {
  try {
    const user = await getAuthenticatedUser();
    return user.coins;
  } catch (error) {
    console.error("Error getting user coins:", error);
    throw new Error("Failed to get coin balance");
  }
}

// Get user's coin transaction history
export async function getCoinTransactions(limit = 20) {
  try {
    const user = await getAuthenticatedUser();
    const transactions = await fetchUserTransactions(user._id, limit);
    return transactions.map(mapTransaction);
  } catch (error) {
    console.error("Error getting coin transactions:", error);
    throw new Error("Failed to get transaction history");
  }
}

// Wallet overview from real MongoDB docs (User + CoinTransaction + Unlock)
export async function getWalletOverview(limit = 20) {
  try {
    const user = await getAuthenticatedUser();

    const [transactions, unlockCount, totalTransactions, aggregates] = await Promise.all([
      fetchUserTransactions(user._id, limit),
      Unlock.countDocuments({ user: user._id }),
      CoinTransaction.countDocuments({ user: user._id }),
      CoinTransaction.aggregate([
        { $match: { user: user._id } },
        {
          $group: {
            _id: "$type",
            totalAmount: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const creditAggregate = aggregates.find((item) => item._id === "credit");
    const debitAggregate = aggregates.find((item) => item._id === "debit");
    const totalEarned = creditAggregate?.totalAmount || 0;
    const totalSpent = debitAggregate?.totalAmount || 0;
    const creditCount = creditAggregate?.count || 0;
    const debitCount = debitAggregate?.count || 0;

    return {
      coins: user.coins || 0,
      transactions: transactions.map(mapTransaction),
      stats: {
        totalTransactions,
        creditCount,
        debitCount,
        totalEarned,
        totalSpent,
        unlockCount,
      },
      meta: {
        planTier: user.planTier || "free",
        isPremium: Boolean(user.isPremium),
        lastLoginAt: user.lastLoginAt || null,
      },
    };
  } catch (error) {
    console.error("Error getting wallet overview:", error);
    throw new Error("Failed to load wallet");
  }
}

// Add coins to user's balance (for purchases, bonuses, etc.)
export async function addCoins(amount, reason, paperId = null, unlockId = null) {
  try {
    if (amount <= 0) {
      throw new Error("Amount must be positive");
    }

    const user = await getAuthenticatedUser();
    const normalizedReason = normalizeReason(reason);

    const balanceBefore = user.coins;
    const balanceAfter = balanceBefore + amount;

    user.coins = balanceAfter;
    await user.save();

    const transaction = new CoinTransaction({
      user: user._id,
      type: "credit",
      reason: normalizedReason,
      amount,
      balanceBefore,
      balanceAfter,
      paper: paperId,
      unlock: unlockId,
    });

    await transaction.save();

    return {
      success: true,
      newBalance: balanceAfter,
      transaction: {
        id: transaction._id.toString(),
        type: "credit",
        reason: normalizedReason,
        amount,
        balanceAfter,
        createdAt: transaction.createdAt,
      },
    };
  } catch (error) {
    console.error("Error adding coins:", error);
    throw new Error("Failed to add coins");
  }
}

// Deduct coins from user's balance (for unlocks, purchases, etc.)
export async function deductCoins(amount, reason, paperId = null, unlockId = null) {
  try {
    if (amount <= 0) {
      throw new Error("Amount must be positive");
    }

    const user = await getAuthenticatedUser();
    const normalizedReason = normalizeReason(reason);

    if (user.coins < amount) {
      throw new Error("Insufficient coins");
    }

    const balanceBefore = user.coins;
    const balanceAfter = balanceBefore - amount;

    user.coins = balanceAfter;
    await user.save();

    const transaction = new CoinTransaction({
      user: user._id,
      type: "debit",
      reason: normalizedReason,
      amount,
      balanceBefore,
      balanceAfter,
      paper: paperId,
      unlock: unlockId,
    });

    await transaction.save();

    return {
      success: true,
      newBalance: balanceAfter,
      transaction: {
        id: transaction._id.toString(),
        type: "debit",
        reason: normalizedReason,
        amount,
        balanceAfter,
        createdAt: transaction.createdAt,
      },
    };
  } catch (error) {
    console.error("Error deducting coins:", error);
    throw new Error("Failed to deduct coins");
  }
}

// Process coin purchase (simulated payment)
export async function purchaseCoins(pack) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      throw new Error("Unauthorized");
    }

    const result = await addCoins(pack.coins, "purchase", null, null);

    return {
      success: true,
      pack,
      newBalance: result.newBalance,
      transaction: result.transaction,
      message: `Successfully purchased ${pack.coins} coins!`,
    };
  } catch (error) {
    console.error("Error processing coin purchase:", error);
    throw new Error("Failed to process purchase");
  }
}
