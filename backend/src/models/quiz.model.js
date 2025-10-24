import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswerIndex: { type: Number, required: true },
    points: { type: Number, default: 1 },
  },
  { _id: false }
);

const submissionSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    studentFirstName: { type: String, required: true },
    studentLastName: { type: String, required: true },
    answers: [{ questionIndex: Number, selectedOptionIndex: Number }],
    score: { type: Number, default: 0 },
    submittedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const quizSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String },
    questions: [questionSchema],
    maxScore: { type: Number, required: true },
    timeLimitMinutes: { type: Number },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "passed", "failed"],
      default: "pending",
    },
    submissions: [submissionSchema],
  },
  { timestamps: true, versionKey: false }
);

const Quiz = mongoose.model("Quiz", quizSchema);

export default Quiz;
