"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/lib/models/User";

function sanitizeProfilePayload(payload = {}) {
  return {
    name: String(payload.name || "").trim(),
    avatarUrl: String(payload.avatarUrl || "").trim(),
    university: String(payload.university || "").trim(),
    program: String(payload.program || "").trim(),
    specialization: String(payload.specialization || "").trim(),
    semester: Number(payload.semester || 1),
  };
}

async function getAuthUser() {
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

export async function getUserProfile() {
  try {
    const user = await getAuthUser();

    return {
      success: true,
      data: {
        id: user._id.toString(),
        email: user.email,
        name: user.name || "",
        avatarUrl: user.avatarUrl || "",
        university: user.university || "",
        program: user.program || "",
        specialization: user.specialization || "",
        semester: user.semester || 1,
        coins: user.coins || 0,
        isPremium: Boolean(user.isPremium),
        planTier: user.planTier || "free",
        referralCode: user.referralCode || "",
        referredBy: user.referredBy ? user.referredBy.toString() : null,
        role: user.role || "student",
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt || null,
      },
    };
  } catch (error) {
    console.error("Error getting user profile:", error);
    return { success: false, error: error.message || "Failed to load profile" };
  }
}

export async function updateUserProfile(payload) {
  try {
    const values = sanitizeProfilePayload(payload);

    if (!values.name) {
      return { success: false, error: "Name is required" };
    }

    if (!Number.isInteger(values.semester) || values.semester < 1 || values.semester > 12) {
      return { success: false, error: "Semester must be between 1 and 12" };
    }

    const user = await getAuthUser();

    user.name = values.name;
    user.avatarUrl = values.avatarUrl;
    user.university = values.university;
    user.program = values.program;
    user.specialization = values.specialization;
    user.semester = values.semester;

    await user.save();

    return {
      success: true,
      message: "Profile updated successfully",
      data: {
        id: user._id.toString(),
        name: user.name,
        avatarUrl: user.avatarUrl || "",
        university: user.university || "",
        program: user.program || "",
        specialization: user.specialization || "",
        semester: user.semester || 1,
      },
    };
  } catch (error) {
    console.error("Error updating user profile:", error);
    return { success: false, error: error.message || "Failed to update profile" };
  }
}

export async function changePassword() {
  return {
    success: false,
    error: "Password updates are unavailable for Google sign-in accounts in this build.",
  };
}
