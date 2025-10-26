import mongoose from "mongoose";

const moduleSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    order: { type: Number, default: 0 },
    durationMinutes: { type: Number, required: true, default: 0 },
  },
  { timestamps: true, versionKey: false }
);

const Module = mongoose.model("Module", moduleSchema);

export default Module;
