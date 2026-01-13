import mongoose from "mongoose";

import User from "./user.model.js";

const studentSchema = new mongoose.Schema(
  {
    uniqueId: {
      type: String,
      unique: true,
      sparse: true
    },
    bio: { type: String },
    profileImage: { type: String },
    interests: [{ type: String }],
    dateOfBirth: { type: Date },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      default: null
    },
    enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
    completedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
    points: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    badges: [
      {
        title: String,
        description: String,
        earnedAt: Date,
      },
    ],
    certificates: [
      {
        courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
        url: String,
        issuedAt: Date,
      },
    ],
    payments: [
      {
        courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
        amount: Number,
        method: String,
        date: Date,
        status: {
          type: String,
          enum: ["pending", "success", "failed", "completed"],
          default: "pending",
        },
      },
    ],
    promocodes: [{ type: String }],
    progress: [
      {
        courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
        percent: Number,
        lastLesson: String,
        updatedAt: Date,
      },
    ],
    courseProgress: [
      {
        courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
        completedLessons: [{ type: mongoose.Schema.Types.ObjectId }],
        lastAccessedLesson: { type: mongoose.Schema.Types.ObjectId },
        progressPercentage: { type: Number, default: 0 },
        startedAt: { type: Date, default: Date.now },
        lastAccessedAt: { type: Date, default: Date.now }
      }
    ],
    testResults: [
      {
        quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz" },
        lessonId: { type: mongoose.Schema.Types.ObjectId },
        courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
        attemptNumber: { type: Number, default: 1 },
        score: Number,
        totalQuestions: Number,
        correctAnswers: Number,
        passed: Boolean,
        answers: [
          {
            questionId: String,
            selectedAnswer: String,
            isCorrect: Boolean
          }
        ],
        timeElapsed: Number, // in seconds
        date: { type: Date, default: Date.now },
      },
    ],
    assignments: [
      {
        taskId: { type: mongoose.Schema.Types.ObjectId, ref: "Assignment" },
        submittedAt: Date,
        grade: String,
        feedback: String,
      },
    ],
  },
  { timestamps: true, versionKey: false }
);

// Pre-save hook to generate uniqueId
studentSchema.pre('save', async function (next) {
  if (!this.uniqueId) {
    // Generate unique ID like "68510" (5 digits)
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    this.uniqueId = randomNum.toString();

    // Check if this ID already exists
    const Student = mongoose.model('Student');
    const existing = await Student.findOne({ uniqueId: this.uniqueId });
    if (existing) {
      // Generate new one if collision
      this.uniqueId = Math.floor(10000 + Math.random() * 90000).toString();
    }
  }
  next();
});

const Student = User.discriminator("Student", studentSchema);

export default Student;
