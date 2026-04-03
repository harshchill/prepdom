import { model, models, Schema } from "mongoose";

const savedSchema = new Schema(
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
    savedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: "saved",
  }
);

savedSchema.index({ user: 1, paper: 1 }, { unique: true });
savedSchema.index({ user: 1, savedAt: -1 });

const Saved = models.Saved || model("Saved", savedSchema);

export default Saved;
