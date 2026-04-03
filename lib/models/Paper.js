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
 
    status: {
      type: String,
      enum: ["draft", "pending", "published", "archived"],
      default: "pending",
      index: true,
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

const Paper = models.Paper || model("Paper", paperSchema);

export default Paper;
