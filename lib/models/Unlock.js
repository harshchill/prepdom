import { model, models, Schema } from "mongoose";

const unlockSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    paper: {
      type: Schema.Types.ObjectId,
      ref: "Paper",
      required: true,
      index: true,
    },
    coinsSpent: {
      type: Number,
      required: true,
      min: 1,
    },
    sourceTransaction: {
      type: Schema.Types.ObjectId,
      ref: "CoinTransaction",
    },
    unlockedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: "unlocks",
  }
);

unlockSchema.index({ user: 1, paper: 1 }, { unique: true });
unlockSchema.index({ paper: 1, createdAt: -1 });

const Unlock = models.Unlock || model("Unlock", unlockSchema);

export default Unlock;
