import mongoose from "mongoose";
import bcrypt from "bcrypt";

const subAdminSchema = new mongoose.Schema(
  {
    // Basic Information
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: [2, "Full name must be at least 2 characters"],
      maxlength: [100, "Full name cannot exceed 100 characters"],
    },



    phone: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true,
      trim: true,
      match: [
        /^[\+]?[1-9][\d]{0,15}$/,
        "Please provide a valid phone number",
      ],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },

    // Teacher Reference
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: [true, "Teacher is required"],
      index: true,
    },

    // Status
    isActive: {
      type: Boolean,
      default: true,
    },

    // Login tracking
    lastLogin: {
      type: Date,
      default: null,
    },

    loginCount: {
      type: Number,
      default: 0,
    },

    // Permissions (can be extended later)
    permissions: {
      canViewStudents: {
        type: Boolean,
        default: true,
      },
      canViewCourses: {
        type: Boolean,
        default: true,
      },
      canViewReports: {
        type: Boolean,
        default: false,
      },
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes for performance
subAdminSchema.index({ teacher: 1, createdAt: -1 });
subAdminSchema.index({ phone: 1 });

// Pre-save middleware to hash password
subAdminSchema.pre("save", async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified("password")) return next();

  try {
    // Hash password with cost of 12
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password
subAdminSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error("Error comparing passwords");
  }
};

// Instance method to update last login
subAdminSchema.methods.updateLoginInfo = async function () {
  this.lastLogin = new Date();
  this.loginCount += 1;
  await this.save();
};

// Static method to check teacher's sub-admin limit
subAdminSchema.statics.checkTeacherLimit = async function (teacherId) {
  const count = await this.countDocuments({
    teacher: teacherId,
    isActive: true
  });
  return count < 3; // Maximum 3 sub-admins per teacher
};

// Static method to get teacher's sub-admin count
subAdminSchema.statics.getTeacherSubAdminCount = async function (teacherId) {
  return await this.countDocuments({
    teacher: teacherId,
    isActive: true
  });
};

const SubAdmin = mongoose.model("SubAdmin", subAdminSchema);

export default SubAdmin;