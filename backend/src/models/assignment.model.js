import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    submittedAt: { type: Date, default: Date.now },
    files: [{ type: String }], // URL or path
    grade: { type: Number },
    feedback: { type: String },
  },
  { _id: false }
);

const assignmentSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String },
    dueDate: { type: Date, required: true },
    resources: [{ type: String }], // URL or path to extra materials
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },
    maxGrade: { type: Number, required: true, default: 0 },
    status: {
      type: String,
      enum: ["pending", "active", "closed"],
      default: "pending",
    },
    submissions: [submissionSchema],
  },
  { timestamps: true, versionKey: false }
);

const Assignment = mongoose.model("Assignment", assignmentSchema);

export default Assignment;
