import { connectToDatabase } from "@/lib/mongodb";
import User from "@/lib/models/User";
import CoinTransaction from "@/lib/models/CoinTransaction";
import { generateUniqueReferralCode } from "@/lib/auth/referral";
import { PLAN_TIERS, resolvePlanTierFromUser } from "@/lib/premium/plans";

const SIGNUP_BONUS_COINS = 100;

function normalizeGoogleUser({ email, name, image, googleId }) {
  return {
    email: email?.trim().toLowerCase(),
    name: name?.trim(),
    avatarUrl: image?.trim(),
    googleId: googleId?.trim(),
  };
}

async function ensureReferralCode(userDoc) {
  if (userDoc.referralCode) {
    return userDoc.referralCode;
  }

  const referralCode = await generateUniqueReferralCode();
  userDoc.referralCode = referralCode;
  await userDoc.save();

  return referralCode;
}

async function createGoogleUserWithSignupBonus(normalized, connection) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const referralCode = await generateUniqueReferralCode();
    const session = await connection.startSession();

    try {
      let createdUser = null;

      await session.withTransaction(async () => {
        [createdUser] = await User.create(
          [
            {
              email: normalized.email,
              name: normalized.name || "Student",
              avatarUrl: normalized.avatarUrl,
              googleId: normalized.googleId,
              role: "student",
              coins: SIGNUP_BONUS_COINS,
              isPremium: false,
              planTier: PLAN_TIERS.FREE,
              referralCode,
              lastLoginAt: new Date(),
            },
          ],
          { session }
        );

        await CoinTransaction.create(
          [
            {
              user: createdUser._id,
              type: "credit",
              reason: "bonus",
              amount: SIGNUP_BONUS_COINS,
              balanceBefore: 0,
              balanceAfter: SIGNUP_BONUS_COINS,
            },
          ],
          { session }
        );
      });

      return createdUser;
    } catch (error) {
      const isDuplicateReferralCode =
        error?.code === 11000 && error?.keyPattern?.referralCode;
      const isDuplicateIdentity =
        error?.code === 11000 &&
        (error?.keyPattern?.email || error?.keyPattern?.googleId);

      if (isDuplicateIdentity) {
        return null;
      }

      if (!isDuplicateReferralCode) {
        throw error;
      }
    } finally {
      await session.endSession();
    }
  }

  throw new Error("Failed to create user with a unique referral code");
}

export async function syncGoogleUser(payload) {
  const normalized = normalizeGoogleUser(payload);

  if (!normalized.email) {
    throw new Error("Google account email is required");
  }

  const connection = await connectToDatabase();

  let userDoc = await User.findOne({ email: normalized.email });

  if (!userDoc) {
    const created = await createGoogleUserWithSignupBonus(normalized, connection);
    userDoc = created || (await User.findOne({ email: normalized.email }));
  } else {
    const updates = {
      lastLoginAt: new Date(),
    };

    if (normalized.name) {
      updates.name = normalized.name;
    }

    if (normalized.avatarUrl) {
      updates.avatarUrl = normalized.avatarUrl;
    }

    if (normalized.googleId) {
      updates.googleId = normalized.googleId;
    }

    userDoc = await User.findByIdAndUpdate(userDoc._id, { $set: updates }, { new: true });
  }

  if (!userDoc) {
    throw new Error("Failed to create or load the authenticated user");
  }

  const resolvedPlanTier = resolvePlanTierFromUser(userDoc);

  if (!userDoc.planTier) {
    userDoc.planTier = resolvedPlanTier;
    await userDoc.save();
  }

  const referralCode = await ensureReferralCode(userDoc);

  return {
    id: userDoc._id.toString(),
    email: userDoc.email,
    name: userDoc.name,
    avatarUrl: userDoc.avatarUrl,
    role: userDoc.role,
    coins: userDoc.coins,
    isPremium: userDoc.isPremium,
    planTier: userDoc.planTier || resolvedPlanTier,
    referralCode,
  };
}
