"use server";

import { revalidatePath } from "next/cache";
import mongoose from "mongoose";
import { getAuthSession } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/mongodb";
import CoinTransaction from "@/lib/models/CoinTransaction";
import Paper from "@/lib/models/Paper";
import User from "@/lib/models/User";

const APPROVAL_REWARD_COINS = 20;

function isValidObjectId(value) {
  return typeof value === "string" && mongoose.Types.ObjectId.isValid(value);
}

async function ensureAdminSession() {
  const session = await getAuthSession();

  if (!session?.user?.id) {
    return { error: "Please sign in as an admin to continue." };
  }

  if (session.user.role !== "admin") {
    return { error: "Only admins can review uploaded papers." };
  }

  return { session };
}

function revalidateModerationViews() {
  revalidatePath("/admin/papers");
  revalidatePath("/user/uploads");
  revalidatePath("/user/dashboard");
  revalidatePath("/user/wallet");
}

export async function approvePaperAction(formData) {
  const admin = await ensureAdminSession();
  if (admin.error) {
    return { ok: false, error: admin.error };
  }

  const paperId = String(formData.get("paperId") || "").trim();
  if (!isValidObjectId(paperId)) {
    return { ok: false, error: "Invalid paper id." };
  }

  const connection = await connectToDatabase();
  const dbSession = await connection.startSession();

  try {
    let response = { ok: false, error: "Paper approval failed." };

    await dbSession.withTransaction(async () => {
      const paper = await Paper.findById(paperId).session(dbSession);
      if (!paper) {
        response = { ok: false, error: "Paper not found." };
        return;
      }

      if (paper.status === "rejected") {
        response = {
          ok: false,
          error: "Rejected papers cannot be approved again.",
        };
        return;
      }

      const uploader = await User.findById(paper.uploader).session(dbSession);
      if (!uploader) {
        response = { ok: false, error: "Uploader account was not found." };
        return;
      }

      let rewardedNow = false;

      if (!paper.rewardGranted) {
        const balanceBefore = uploader.coins ?? 0;
        const balanceAfter = balanceBefore + APPROVAL_REWARD_COINS;

        uploader.coins = balanceAfter;
        await uploader.save({ session: dbSession });

        const [rewardTransaction] = await CoinTransaction.create(
          [
            {
              user: uploader._id,
              type: "credit",
              reason: "reward",
              amount: APPROVAL_REWARD_COINS,
              balanceBefore,
              balanceAfter,
              paper: paper._id,
            },
          ],
          { session: dbSession }
        );

        paper.rewardGranted = true;
        paper.rewardTransaction = rewardTransaction._id;
        rewardedNow = true;
      }

      paper.status = "published";
      paper.reviewedBy = admin.session.user.id;
      paper.reviewedAt = new Date();
      await paper.save({ session: dbSession });

      response = {
        ok: true,
        message: rewardedNow
          ? "Paper approved and 20 coins awarded."
          : "Paper approved. Reward was already granted earlier.",
      };
    });

    if (response.ok) {
      revalidateModerationViews();
    }

    return response;
  } catch {
    return { ok: false, error: "Paper approval failed. Please try again." };
  } finally {
    await dbSession.endSession();
  }
}

export async function rejectPaperAction(formData) {
  const admin = await ensureAdminSession();
  if (admin.error) {
    return { ok: false, error: admin.error };
  }

  const paperId = String(formData.get("paperId") || "").trim();
  if (!isValidObjectId(paperId)) {
    return { ok: false, error: "Invalid paper id." };
  }

  await connectToDatabase();

  const paper = await Paper.findById(paperId);
  if (!paper) {
    return { ok: false, error: "Paper not found." };
  }

  if (paper.status === "published") {
    return {
      ok: false,
      error: "Published papers cannot be rejected from this screen.",
    };
  }

  if (paper.status === "rejected") {
    return { ok: true, message: "Paper is already rejected." };
  }

  paper.status = "rejected";
  paper.reviewedBy = admin.session.user.id;
  paper.reviewedAt = new Date();
  await paper.save();

  revalidateModerationViews();

  return { ok: true, message: "Paper rejected." };
}
