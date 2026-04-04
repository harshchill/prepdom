import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/mongodb";
import CoinTransaction from "@/lib/models/CoinTransaction";
import Paper from "@/lib/models/Paper";
import Unlock from "@/lib/models/Unlock";
import User from "@/lib/models/User";
import { APPROVED_PAPER_STATUS, PAPER_UNLOCK_COST_COINS } from "@/lib/library/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isValidObjectId(value) {
  return typeof value === "string" && mongoose.Types.ObjectId.isValid(value);
}

function parseBodyPaperId(payload) {
  if (!payload || typeof payload !== "object") {
    return "";
  }

  const value = payload.paperId;
  return typeof value === "string" ? value.trim() : "";
}

function mapErrorStatus(response) {
  if (!response?.ok && response?.code === "INSUFFICIENT_COINS") {
    return 400;
  }

  if (!response?.ok && response?.code === "PAPER_NOT_FOUND") {
    return 404;
  }

  if (!response?.ok && response?.code === "USER_NOT_FOUND") {
    return 404;
  }

  return 400;
}

export async function POST(request) {
  const session = await getAuthSession();

  if (!session?.user?.id) {
    return NextResponse.json(
      { ok: false, error: "Please sign in to unlock papers." },
      { status: 401 }
    );
  }

  let payload;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid unlock payload." },
      { status: 400 }
    );
  }

  const paperId = parseBodyPaperId(payload);

  if (!isValidObjectId(paperId)) {
    return NextResponse.json(
      { ok: false, error: "Invalid paper id." },
      { status: 400 }
    );
  }

  const connection = await connectToDatabase();
  const dbSession = await connection.startSession();

  try {
    let response = {
      ok: false,
      code: "UNKNOWN",
      error: "Unlock request failed.",
    };

    await dbSession.withTransaction(async () => {
      const [paper, user, existingUnlock] = await Promise.all([
        Paper.findOne({ _id: paperId, status: APPROVED_PAPER_STATUS }).session(dbSession),
        User.findById(session.user.id).session(dbSession),
        Unlock.findOne({ user: session.user.id, paper: paperId }).session(dbSession),
      ]);

      if (!paper) {
        response = {
          ok: false,
          code: "PAPER_NOT_FOUND",
          error: "This paper is not available for unlock.",
        };
        return;
      }

      if (!user) {
        response = {
          ok: false,
          code: "USER_NOT_FOUND",
          error: "User account was not found.",
        };
        return;
      }

      if (existingUnlock) {
        response = {
          ok: true,
          alreadyUnlocked: true,
          message: "Paper already unlocked.",
          wallet: {
            coins: user.coins ?? 0,
          },
          unlock: {
            id: String(existingUnlock._id),
            paperId: String(existingUnlock.paper),
            coinsSpent: existingUnlock.coinsSpent,
          },
        };
        return;
      }

      const balanceBefore = user.coins ?? 0;

      if (balanceBefore < PAPER_UNLOCK_COST_COINS) {
        response = {
          ok: false,
          code: "INSUFFICIENT_COINS",
          error: `You need ${PAPER_UNLOCK_COST_COINS} coins to unlock this paper.`,
          wallet: {
            coins: balanceBefore,
          },
        };
        return;
      }

      const balanceAfter = balanceBefore - PAPER_UNLOCK_COST_COINS;

      user.coins = balanceAfter;
      await user.save({ session: dbSession });

      const [coinTransaction] = await CoinTransaction.create(
        [
          {
            user: user._id,
            type: "debit",
            reason: "unlock",
            amount: PAPER_UNLOCK_COST_COINS,
            balanceBefore,
            balanceAfter,
            paper: paper._id,
          },
        ],
        { session: dbSession }
      );

      const [unlock] = await Unlock.create(
        [
          {
            user: user._id,
            paper: paper._id,
            coinsSpent: PAPER_UNLOCK_COST_COINS,
            sourceTransaction: coinTransaction._id,
          },
        ],
        { session: dbSession }
      );

      coinTransaction.unlock = unlock._id;
      await coinTransaction.save({ session: dbSession });

      await Paper.updateOne(
        { _id: paper._id },
        {
          $inc: {
            unlockCount: 1,
          },
        },
        { session: dbSession }
      );

      response = {
        ok: true,
        alreadyUnlocked: false,
        message: "Paper unlocked successfully.",
        wallet: {
          coins: balanceAfter,
        },
        unlock: {
          id: String(unlock._id),
          paperId: String(unlock.paper),
          coinsSpent: unlock.coinsSpent,
        },
        transaction: {
          id: String(coinTransaction._id),
          type: coinTransaction.type,
          reason: coinTransaction.reason,
          amount: coinTransaction.amount,
          balanceBefore: coinTransaction.balanceBefore,
          balanceAfter: coinTransaction.balanceAfter,
        },
      };
    });

    if (!response.ok) {
      return NextResponse.json(response, { status: mapErrorStatus(response) });
    }

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    if (error?.code === 11000) {
      const [existingUnlock, user] = await Promise.all([
        Unlock.findOne({ user: session.user.id, paper: paperId }).lean(),
        User.findById(session.user.id).select("coins").lean(),
      ]);

      if (existingUnlock) {
        return NextResponse.json(
          {
            ok: true,
            alreadyUnlocked: true,
            message: "Paper already unlocked.",
            wallet: {
              coins: user?.coins ?? 0,
            },
            unlock: {
              id: String(existingUnlock._id),
              paperId: String(existingUnlock.paper),
              coinsSpent: existingUnlock.coinsSpent,
            },
          },
          { status: 200 }
        );
      }
    }

    return NextResponse.json(
      { ok: false, error: "Unlock request failed. Please try again." },
      { status: 500 }
    );
  } finally {
    await dbSession.endSession();
  }
}
