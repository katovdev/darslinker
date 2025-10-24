import mongoose from "mongoose";

import User from "./user.model.js";

const studentSchema = new mongoose.Schema(
  {
    bio: { type: String },
    profileImage: { type: String },
    interests: [{ type: String }],
    dateOfBirth: { type: Date },
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
    testResults: [
      {
        quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz" },
        score: Number,
        passed: Boolean,
        date: Date,
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

const Student = User.discriminator("Student", studentSchema);

export default Student;
