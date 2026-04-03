import { connectToDatabase } from "@/lib/mongodb";
import User from "@/lib/models/User";
import { generateUniqueReferralCode } from "@/lib/auth/referral";

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

export async function syncGoogleUser(payload) {
  const normalized = normalizeGoogleUser(payload);

  if (!normalized.email) {
    throw new Error("Google account email is required");
  }

  await connectToDatabase();

  let userDoc = await User.findOne({ email: normalized.email });

  if (!userDoc) {
    let created = null;

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const referralCode = await generateUniqueReferralCode();

      try {
        created = await User.create({
          email: normalized.email,
          name: normalized.name || "Student",
          avatarUrl: normalized.avatarUrl,
          googleId: normalized.googleId,
          role: "student",
          coins: 0,
          isPremium: false,
          referralCode,
          lastLoginAt: new Date(),
        });
        break;
      } catch (error) {
        if (!(error?.code === 11000 && error?.keyPattern?.referralCode)) {
          throw error;
        }
      }
    }

    if (!created) {
      throw new Error("Failed to create user with a unique referral code");
    }

    userDoc = created;
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

  const referralCode = await ensureReferralCode(userDoc);

  return {
    id: userDoc._id.toString(),
    email: userDoc.email,
    name: userDoc.name,
    avatarUrl: userDoc.avatarUrl,
    role: userDoc.role,
    coins: userDoc.coins,
    isPremium: userDoc.isPremium,
    referralCode,
  };
}
