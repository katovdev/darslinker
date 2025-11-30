import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Course title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Course description is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Course category is required"],
      trim: true,
    },
    thumbnail: {
      type: String,
      required: [true, "Course thumbnail is required"],
    },
    courseType: {
      type: String,
      enum: ["paid", "free"],
      default: "free",
    },
    price: {
      type: Number,
      default: 0,
    },
    discountPrice: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["active", "draft", "archived"],
      default: "draft",
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: [true, "Teacher is required"],
    },
    modules: [{
      title: {
        type: String,
        required: true,
      },
      order: {
        type: Number,
        required: true,
      },
      lessons: [{
        type: {
          type: String,
          enum: ["video", "quiz", "assignment", "file"],
          required: true,
        },
        title: {
          type: String,
          required: true,
        },
        order: {
          type: Number,
          required: true,
        },
        videoUrl: String,
        fileUrl: String,
        duration: String,
        // Quiz data stored inline
        questions: [{
          question: String,
          options: [String],
          correctAnswer: Number,
        }],
        // Assignment data
        instructions: String,
        dueDate: Date,
      }],
    }],
    totalStudents: {
      type: Number,
      default: 0,
    },
    totalLessons: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
    },
    reviewsCount: {
      type: Number,
      default: 0,
    },
    revenue: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Course = mongoose.model("Course", courseSchema);

courseSchema.index({ title: 1 });
courseSchema.index({ category: 1 });
courseSchema.index({ level: 1 });
courseSchema.index({ courseType: 1 });
courseSchema.index({ createdAt: 1 });
courseSchema.index({ category: 1, level: 1 });
courseSchema.index({ courseType: 1, status: 1 });

export default Course;
