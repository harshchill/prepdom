import { model, models, Schema } from "mongoose";

const paperSchema = new Schema(
  {
    uploader: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subject: {
      type: String,
      trim: true,
      index: true,
    },
    institute: {
      type: String,
      trim: true,
      index: true,
    },
    sem: {
      type: Number,
      min: 1,
      max: 12,
    },
    specialization: {
      type: String,
      trim: true,
      index: true,
    },
   
    year: {
      type: Number,
      min: 1900,
      max: 2100,
    },
   
    fileName: {
      type: String,
      required: true,
      trim: true,
    },
    fileUrl: {
      type: String,
      required: true,
      trim: true,
    },
    storagePath: {
      type: String,
      trim: true,
      default: "",
      index: true,
    },
    fileBucket: {
      type: String,
      trim: true,
      default: "",
    },
    mimeType: {
      type: String,
      trim: true,
      default: "application/pdf",
    },
    fileSizeBytes: {
      type: Number,
      min: 1,
    },
 
    status: {
      type: String,
      enum: ["draft", "pending", "published", "rejected", "archived"],
      default: "pending",
      index: true,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    reviewedAt: {
      type: Date,
      index: true,
    },
    rewardGranted: {
      type: Boolean,
      default: false,
      index: true,
    },
    rewardTransaction: {
      type: Schema.Types.ObjectId,
      ref: "CoinTransaction",
    },
    extractionStatus: {
      type: String,
      enum: ["not_started", "processing", "completed", "failed"],
      default: "not_started",
      index: true,
    },
    hasExtraction: {
      type: Boolean,
      default: false,
    },
    isExamPaper: {
      type: Boolean,
      default: false,
      index: true,
    },
    unlockCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    saveCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    collection: "papers",
  }
);

paperSchema.index({ uploader: 1, createdAt: -1 });
paperSchema.index({ subject: 1, year: -1 });
paperSchema.index({ status: 1, createdAt: -1 });
paperSchema.index({ status: 1, reviewedAt: -1 });

const Paper = models.Paper || model("Paper", paperSchema);

export default Paper;
