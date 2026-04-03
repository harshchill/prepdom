import { model, models, Schema } from "mongoose";

const coinTransactionSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["credit", "debit"],
      required: true,
    },
    reason: {
      type: String,
      enum: [
        "unlock",
        "reward",
        "purchase",
        "refund",
        "admin_adjustment",
        "bonus",
        "other",
      ],
      default: "other",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    balanceBefore: {
      type: Number,
      required: true,
      min: 0,
    },
    balanceAfter: {
      type: Number,
      required: true,
      min: 0,
    },
    paper: {
      type: Schema.Types.ObjectId,
      ref: "Paper",
    },
    unlock: {
      type: Schema.Types.ObjectId,
      ref: "Unlock",
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: "coin_transactions",
  }
);

coinTransactionSchema.index({ user: 1, createdAt: -1 });
coinTransactionSchema.index({ reason: 1, createdAt: -1 });

const CoinTransaction =
  models.CoinTransaction || model("CoinTransaction", coinTransactionSchema);

export default CoinTransaction;
