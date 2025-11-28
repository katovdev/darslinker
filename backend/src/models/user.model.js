import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "FirstName is required"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "LastName is required"],
      trim: true,
    },
    phone: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    status: {
      type: String,
      enum: ["pending", "active", "inactive", "blocked"],
      default: "pending",
    },
    role: {
      type: String,
      enum: ["teacher", "student"],
      default: "student",
      required: true,
    },
    // Teacher-specific fields
    specialization: {
      type: String,
      trim: true,
    },
    bio: {
      type: String,
      trim: true,
    },
    profileImage: {
      type: String,
    },
    city: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      trim: true,
    },
    ratingAverage: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewsCount: {
      type: Number,
      default: 0,
    },
    certificates: [{
      title: {
        type: String,
        required: true,
      },
      issuer: {
        type: String,
        required: true,
      },
      year: {
        type: String,
      },
      issueDate: {
        type: Date,
      },
      url: {
        type: String,
        required: true,
      },
    }],
    socialLinks: {
      telegram: String,
      instagram: String,
      youtube: String,
      linkedin: String,
    },
    landingPageSettings: {
      themeColor: {
        type: String,
        default: '#7ea2d4',
      },
      heroTitle: String,
      featuredCourses: [String],
      featuredTestimonials: [String],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const User = mongoose.model("User", userSchema);

userSchema.index({ email: 1 }, { unique: true, sparse: true });
userSchema.index({ phone: 1 }, { unique: true, sparse: true });
userSchema.index({ role: 1 });
userSchema.index({ status: 1 });

export default User;
