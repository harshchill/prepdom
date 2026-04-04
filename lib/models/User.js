import { model, models, Schema } from "mongoose";

const userSchema = new Schema(
  {
    googleId: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["student", "admin"],
      default: "student",
    },
    coins: {
      type: Number,
      default: 0,
      min: 0,
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    planTier: {
      type: String,
      enum: ["free", "premium", "premium_plus"],
      default: "free",
      index: true,
    },
    referralCode: {
      type: String,
      trim: true,
      uppercase: true,
      unique: true,
      sparse: true,
    },
    referredBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    avatarUrl: {
      type: String,
      trim: true,
    },
    university: {
      type: String,
      trim: true,
      maxlength: 120,
    },
    program: {
      type: String,
      trim: true,
      maxlength: 120,
    },
    specialization: {
      type: String,
      trim: true,
      maxlength: 120,
    },
    semester: {
      type: Number,
      min: 1,
      max: 12,
      default: 1,
    },
    lastLoginAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    collection: "users",
  }
);

userSchema.index({ referralCode: 1 }, { unique: true, sparse: true });
userSchema.index({ googleId: 1 }, { unique: true, sparse: true });

const User = models.User || model("User", userSchema);

export default User;
