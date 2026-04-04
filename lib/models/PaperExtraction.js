import { model, models, Schema } from "mongoose";

const paperExtractionSchema = new Schema(
  {
    paper: {
      type: Schema.Types.ObjectId,
      ref: "Paper",
      required: true,
    },
    status: {
      type: String,
      enum: ["processing", "completed", "failed"],
      default: "processing",
      index: true,
    },
    modelName: {
      type: String,
      default: "gemini",
      trim: true,
    },
    extractedJson: {
      type: Schema.Types.Mixed,
      default: {},
    },
    extractedAt: {
      type: Date,
      default: Date.now,
    },
    failureReason: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
    collection: "paper_extractions",
  }
);

paperExtractionSchema.index({ paper: 1 }, { unique: true });
paperExtractionSchema.index({ status: 1, updatedAt: -1 });

const PaperExtraction =
  models.PaperExtraction || model("PaperExtraction", paperExtractionSchema);

export default PaperExtraction;
