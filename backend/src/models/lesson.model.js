import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema(
  {
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Module",
      required: true,
    },
    title: { type: String, required: true },
    content: { type: String },
    videoUrl: { type: String },
    order: { type: Number, default: 0 },
    durationMinutes: { type: Number, required: true, default: 0 },
  },
  { timestamps: true, versionKey: false }
);

const Lesson = mongoose.model("Lesson", lessonSchema);

lessonSchema.index({ moduleId: 1, order: 1 });

export default Lesson;
