import crypto from "node:crypto";
import User from "@/lib/models/User";

const REFERRAL_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function createReferralCode(length = 8) {
  const bytes = crypto.randomBytes(length);
  let code = "";

  for (let i = 0; i < length; i += 1) {
    code += REFERRAL_ALPHABET[bytes[i] % REFERRAL_ALPHABET.length];
  }

  return code;
}

export async function generateUniqueReferralCode(maxAttempts = 12) {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const candidate = createReferralCode(8);
    const existing = await User.exists({ referralCode: candidate });

    if (!existing) {
      return candidate;
    }
  }

  throw new Error("Unable to generate a unique referral code");
}
