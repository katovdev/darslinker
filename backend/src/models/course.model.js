import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Course title is required"],
      trim: true,
    },
    shortDesciption: {
      type: String,
      required: [true, "Course short description is required"],
      trim: true,
    },
    fullDescription: {
      type: String,
      required: [true, "Course full description is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Course category is required"],
      trim: true,
    },
    level: {
      type: String,
      required: [true, "Course level is required"],
      trim: true,
    },
    language: {
      type: String,
      required: [true, "Course language is required"],
      trim: true,
    },
    duration: {
      type: String,
      required: [true, "Course duration is required"],
      trim: true,
    },
    courseImage: {
      type: String,
      required: [true, "Course image is required"],
    },
    videoUrl: {
      type: String,
      required: false,
    },
    courseType: {
      type: String,
      enum: ["paid", "free", "active", "draft", "archived"],
      default: "free",
    },
    coursePrice: {
      type: Number,
      required: [true, "Course price is required"],
    },
    discountPrice: {
      type: Number,
      required: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Course = mongoose.model("Course", courseSchema);

export default Course;
