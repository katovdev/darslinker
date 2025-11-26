import mongoose from "mongoose";

import User from "./user.model.js";

const teacherSchema = new mongoose.Schema(
  {
    bio: { type: String },
    specialization: { type: String },
    profileImage: { type: String },
    ratingAverage: { type: Number, default: 0 },
    reviewsCount: { type: Number, default: 0 },
    reviews: [
      {
        studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
        rating: Number,
        comment: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    certificates: [
      {
        title: String,
        issuer: String,
        issueDate: Date,
        url: String,
      },
    ],
    courseCount: { type: Number, default: 0 },
    studentCount: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    courses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
    balance: { type: Number, default: 0 },
    paymentMethods: {
      click: { type: String },
      payme: { type: String },
      uzum: { type: String },
      bankAccount: { type: String },
    },
    payouts: [
      {
        amount: Number,
        date: Date,
        method: String,
        status: {
          type: String,
          enum: ["pending", "completed", "failed"],
          default: "pending",
        },
      },
    ],
    aiSettings: {
      enableAIAssistant: { type: Boolean, default: true },
    },
    city: { type: String },
    country: { type: String },
    telegramUsername: { type: String },
    socialLinks: {
      linkedin: { type: String },
      github: { type: String },
      website: { type: String },
      telegram: { type: String }
    },
    landingPageSettings: {
      isPublished: { type: Boolean, default: false },
      featuredCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
      featuredTestimonials: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
      themeColor: { type: String, default: "#7c3aed" },
      customUrl: { type: String }
    },
  },
  { timestamps: true, versionKey: false }
);

const Teacher = User.discriminator("Teacher", teacherSchema);

export default Teacher;
