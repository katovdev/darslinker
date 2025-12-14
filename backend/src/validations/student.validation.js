import Joi from "joi";

/**
 * Student Profile Creation Validation Schema
 * Validates student profile creation data
 */
export const createStudentProfileSchema = Joi.object({
  profileImage: Joi.string().trim().uri().optional().allow("").messages({
    "string.uri": "Profile image must be a valid URL",
  }),

  bio: Joi.string().trim().min(10).max(500).optional().allow("").messages({
    "string.min": "Bio must be at least 10 characters long",
    "string.max": "Bio cannot exceed 500 characters",
  }),

  interests: Joi.array()
    .items(
      Joi.string().trim().min(2).max(50).messages({
        "string.min": "Each interest must be at least 2 characters long",
        "string.max": "Each interest cannot exceed 50 characters",
      })
    )
    .max(10)
    .optional()
    .messages({
      "array.base": "Interests must be an array",
      "array.max": "Cannot have more than 10 interests",
    }),
});

/**
 * Student Profile Creation/Update Validation Schema
 * Validates student-specific profile data
 */
export const updateStudentProfileSchema = Joi.object({
  // Base User fields
  firstName: Joi.string().trim().min(2).max(50).optional().messages({
    "string.min": "First name must be at least 2 characters long",
    "string.max": "First name cannot exceed 50 characters",
  }),

  lastName: Joi.string().trim().min(2).max(50).optional().messages({
    "string.min": "Last name must be at least 2 characters long",
    "string.max": "Last name cannot exceed 50 characters",
  }),

  email: Joi.string().trim().email().optional().messages({
    "string.email": "Please provide a valid email address",
  }),

  phone: Joi.string().trim().optional().messages({
    "string.base": "Phone number must be a string",
  }),

  password: Joi.string().min(6).max(128).optional().messages({
    "string.min": "Password must be at least 6 characters long",
    "string.max": "Password cannot exceed 128 characters",
  }),

  // Student-specific fields
  bio: Joi.string().trim().min(10).max(500).optional().allow("").messages({
    "string.min": "Bio must be at least 10 characters long",
    "string.max": "Bio cannot exceed 500 characters",
  }),

  profileImage: Joi.string().trim().uri().optional().allow("").messages({
    "string.uri": "Profile image must be a valid URL",
  }),

  dateOfBirth: Joi.date().max("now").optional().messages({
    "date.base": "Date of birth must be a valid date",
    "date.max": "Date of birth cannot be in the future",
  }),

  interests: Joi.array()
    .items(
      Joi.string().trim().min(2).max(50).messages({
        "string.min": "Each interest must be at least 2 characters long",
        "string.max": "Each interest cannot exceed 50 characters",
      })
    )
    .max(10)
    .optional()
    .messages({
      "array.base": "Interests must be an array",
      "array.max": "Cannot have more than 10 interests",
    }),
})
  .min(1)
  .messages({
    "object.min": "At least one field must be provided for update",
  });

/**
 * Course Enrollment Validation Schema
 * Validates course enrollment data
 */
export const enrollCourseSchema = Joi.object({
  courseId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base":
        "Invalid course ID format. Must be a valid MongoDB ObjectId",
      "any.required": "Course ID is required",
    }),

  promocode: Joi.string().trim().optional().allow("").messages({
    "string.base": "Promocode must be a string",
  }),
});

/**
 * Course Progress Update Validation Schema
 * Validates course progress update
 */
export const updateProgressSchema = Joi.object({
  courseId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base":
        "Invalid course ID format. Must be a valid MongoDB ObjectId",
      "any.required": "Course ID is required",
    }),

  percent: Joi.number().min(0).max(100).required().messages({
    "number.base": "Progress percentage must be a number",
    "number.min": "Progress percentage cannot be less than 0",
    "number.max": "Progress percentage cannot exceed 100",
    "any.required": "Progress percentage is required",
  }),

  lastLesson: Joi.string().trim().optional().messages({
    "string.base": "Last lesson must be a string",
  }),
});

/**
 * Payment Creation Validation Schema
 * Validates payment data for course purchase
 */
export const createPaymentSchema = Joi.object({
  courseId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base":
        "Invalid course ID format. Must be a valid MongoDB ObjectId",
      "any.required": "Course ID is required",
    }),

  amount: Joi.number().positive().required().messages({
    "number.base": "Payment amount must be a number",
    "number.positive": "Payment amount must be positive",
    "any.required": "Payment amount is required",
  }),

  method: Joi.string()
    .valid("click", "payme", "uzum", "card", "cash")
    .required()
    .messages({
      "string.empty": "Payment method is required",
      "any.only":
        "Payment method must be one of: click, payme, uzum, card, or cash",
      "any.required": "Payment method is required",
    }),

  promocode: Joi.string().trim().optional().allow("").messages({
    "string.base": "Promocode must be a string",
  }),
});

/**
 * Quiz Result Submission Validation Schema
 * Validates quiz result submission
 */
export const submitQuizResultSchema = Joi.object({
  quizId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base":
        "Invalid quiz ID format. Must be a valid MongoDB ObjectId",
      "any.required": "Quiz ID is required",
    }),

  score: Joi.number().min(0).max(100).required().messages({
    "number.base": "Score must be a number",
    "number.min": "Score cannot be less than 0",
    "number.max": "Score cannot exceed 100",
    "any.required": "Score is required",
  }),

  passed: Joi.boolean().required().messages({
    "boolean.base": "Passed status must be a boolean value",
    "any.required": "Passed status is required",
  }),
});

/**
 * Assignment Submission Validation Schema
 * Validates assignment submission
 */
export const submitAssignmentSchema = Joi.object({
  taskId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base":
        "Invalid task ID format. Must be a valid MongoDB ObjectId",
      "any.required": "Task ID is required",
    }),

  submissionUrl: Joi.string().trim().uri().optional().messages({
    "string.uri": "Submission URL must be a valid URL",
  }),

  submissionText: Joi.string().trim().min(10).max(5000).optional().messages({
    "string.min": "Submission text must be at least 10 characters long",
    "string.max": "Submission text cannot exceed 5000 characters",
  }),
})
  .or("submissionUrl", "submissionText")
  .messages({
    "object.missing":
      "Either submission URL or submission text must be provided",
  });

/**
 * Badge Award Validation Schema
 * Validates awarding a badge to a student
 */
export const awardBadgeSchema = Joi.object({
  studentId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base":
        "Invalid student ID format. Must be a valid MongoDB ObjectId",
      "any.required": "Student ID is required",
    }),

  title: Joi.string().trim().min(3).max(100).required().messages({
    "string.empty": "Badge title is required",
    "string.min": "Badge title must be at least 3 characters long",
    "string.max": "Badge title cannot exceed 100 characters",
    "any.required": "Badge title is required",
  }),

  description: Joi.string().trim().min(10).max(300).required().messages({
    "string.empty": "Badge description is required",
    "string.min": "Badge description must be at least 10 characters long",
    "string.max": "Badge description cannot exceed 300 characters",
    "any.required": "Badge description is required",
  }),
});

/**
 * Certificate Issue Validation Schema
 * Validates issuing a certificate to a student
 */
export const issueCertificateSchema = Joi.object({
  studentId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base":
        "Invalid student ID format. Must be a valid MongoDB ObjectId",
      "any.required": "Student ID is required",
    }),

  courseId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base":
        "Invalid course ID format. Must be a valid MongoDB ObjectId",
      "any.required": "Course ID is required",
    }),

  url: Joi.string().trim().uri().required().messages({
    "string.empty": "Certificate URL is required",
    "string.uri": "Certificate URL must be a valid URL",
    "any.required": "Certificate URL is required",
  }),
});

/**
 * Student ID Validation Schema
 * Validates MongoDB ObjectId format for student
 */
export const studentIdSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base":
        "Invalid student ID format. Must be a valid MongoDB ObjectId",
      "any.required": "Student ID is required",
    }),
});

/**
 * Student Query Validation Schema
 * Validates query parameters for student filtering and pagination
 */
export const studentQuerySchema = Joi.object({
  level: Joi.number().integer().min(1).optional().messages({
    "number.base": "Level must be a number",
    "number.integer": "Level must be an integer",
    "number.min": "Level must be at least 1",
  }),

  minPoints: Joi.number().min(0).optional().messages({
    "number.base": "Minimum points must be a number",
    "number.min": "Minimum points cannot be less than 0",
  }),

  interest: Joi.string().trim().optional().messages({
    "string.base": "Interest must be a string",
  }),

  search: Joi.string().trim().optional().messages({
    "string.base": "Search query must be a string",
  }),

  page: Joi.number().integer().min(1).default(1).optional().messages({
    "number.base": "Page must be a number",
    "number.integer": "Page must be an integer",
    "number.min": "Page must be at least 1",
  }),

  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(20)
    .optional()
    .messages({
      "number.base": "Limit must be a number",
      "number.integer": "Limit must be an integer",
      "number.min": "Limit must be at least 1",
      "number.max": "Limit cannot exceed 100",
    }),

  sortBy: Joi.string()
    .valid("createdAt", "points", "level", "enrolledCourses")
    .default("createdAt")
    .optional()
    .messages({
      "any.only":
        "Sort field must be one of: createdAt, points, level, enrolledCourses",
    }),

  order: Joi.string().valid("asc", "desc").default("desc").optional().messages({
    "any.only": "Order must be either 'asc' or 'desc'",
  }),
});

/**
 * Update Payment Status Validation Schema
 * Validates payment status update
 */
export const updatePaymentStatusSchema = Joi.object({
  paymentId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base":
        "Invalid payment ID format. Must be a valid MongoDB ObjectId",
      "any.required": "Payment ID is required",
    }),

  status: Joi.string()
    .valid("pending", "success", "failed", "completed")
    .required()
    .messages({
      "string.empty": "Payment status is required",
      "any.only":
        "Payment status must be one of: pending, success, failed, or completed",
      "any.required": "Payment status is required",
    }),
});

/**
 * Add Points Validation Schema
 * Validates adding points to student
 */
export const addPointsSchema = Joi.object({
  studentId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base":
        "Invalid student ID format. Must be a valid MongoDB ObjectId",
      "any.required": "Student ID is required",
    }),

  points: Joi.number().integer().min(1).required().messages({
    "number.base": "Points must be a number",
    "number.integer": "Points must be an integer",
    "number.min": "Points must be at least 1",
    "any.required": "Points is required",
  }),

  reason: Joi.string().trim().min(3).max(200).optional().messages({
    "string.min": "Reason must be at least 3 characters long",
    "string.max": "Reason cannot exceed 200 characters",
  }),
});
