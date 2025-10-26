import Joi from "joi";

/**
 * Teacher Profile Creation/Update Validation Schema
 * Validates teacher-specific profile data
 */
export const updateTeacherProfileSchema = Joi.object({
  bio: Joi.string().trim().min(10).max(1000).optional().allow("").messages({
    "string.min": "Bio must be at least 10 characters long",
    "string.max": "Bio cannot exceed 1000 characters",
  }),

  specialization: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .optional()
    .allow("")
    .messages({
      "string.min": "Specialization must be at least 2 characters long",
      "string.max": "Specialization cannot exceed 100 characters",
    }),

  profileImage: Joi.string().trim().uri().optional().allow("").messages({
    "string.uri": "Profile image must be a valid URL",
  }),

  city: Joi.string().trim().min(2).max(100).optional().allow("").messages({
    "string.min": "City must be at least 2 characters long",
    "string.max": "City cannot exceed 100 characters",
  }),

  country: Joi.string().trim().min(2).max(100).optional().allow("").messages({
    "string.min": "Country must be at least 2 characters long",
    "string.max": "Country cannot exceed 100 characters",
  }),

  aiSettings: Joi.object({
    enableAIAssistant: Joi.boolean().optional().messages({
      "boolean.base": "AI Assistant setting must be a boolean value",
    }),
  }).optional(),
})
  .min(1)
  .messages({
    "object.min": "At least one field must be provided for update",
  });

/**
 * Teacher Payment Method Validation Schema
 * Validates teacher payment method information
 */
export const updatePaymentMethodsSchema = Joi.object({
  click: Joi.string()
    .trim()
    .pattern(/^[0-9]{4}\s?[0-9]{4}\s?[0-9]{4}\s?[0-9]{4}$/)
    .optional()
    .allow("")
    .messages({
      "string.pattern.base":
        "Click card number must be in valid format (16 digits)",
    }),

  payme: Joi.string()
    .trim()
    .pattern(/^[0-9]{4}\s?[0-9]{4}\s?[0-9]{4}\s?[0-9]{4}$/)
    .optional()
    .allow("")
    .messages({
      "string.pattern.base":
        "Payme card number must be in valid format (16 digits)",
    }),

  uzum: Joi.string()
    .trim()
    .pattern(/^[0-9]{4}\s?[0-9]{4}\s?[0-9]{4}\s?[0-9]{4}$/)
    .optional()
    .allow("")
    .messages({
      "string.pattern.base":
        "Uzum card number must be in valid format (16 digits)",
    }),

  bankAccount: Joi.string()
    .trim()
    .pattern(/^[0-9]{20}$/)
    .optional()
    .allow("")
    .messages({
      "string.pattern.base": "Bank account number must be 20 digits",
    }),
})
  .min(1)
  .messages({
    "object.min": "At least one payment method must be provided",
  });

/**
 * Teacher Certificate Add Validation Schema
 * Validates adding a new certificate to teacher profile
 */
export const addCertificateSchema = Joi.object({
  title: Joi.string().trim().min(3).max(200).required().messages({
    "string.empty": "Certificate title is required",
    "string.min": "Certificate title must be at least 3 characters long",
    "string.max": "Certificate title cannot exceed 200 characters",
    "any.required": "Certificate title is required",
  }),

  issuer: Joi.string().trim().min(2).max(200).required().messages({
    "string.empty": "Certificate issuer is required",
    "string.min": "Certificate issuer must be at least 2 characters long",
    "string.max": "Certificate issuer cannot exceed 200 characters",
    "any.required": "Certificate issuer is required",
  }),

  issueDate: Joi.date().max("now").required().messages({
    "date.base": "Issue date must be a valid date",
    "date.max": "Issue date cannot be in the future",
    "any.required": "Issue date is required",
  }),

  url: Joi.string().trim().uri().optional().allow("").messages({
    "string.uri": "Certificate URL must be a valid URL",
  }),
});

/**
 * Teacher Review Add Validation Schema
 * Validates adding a review for a teacher
 */
export const addReviewSchema = Joi.object({
  teacherId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base":
        "Invalid teacher ID format. Must be a valid MongoDB ObjectId",
      "any.required": "Teacher ID is required",
    }),

  rating: Joi.number().integer().min(1).max(5).required().messages({
    "number.base": "Rating must be a number",
    "number.integer": "Rating must be an integer",
    "number.min": "Rating must be at least 1",
    "number.max": "Rating cannot exceed 5",
    "any.required": "Rating is required",
  }),

  comment: Joi.string().trim().min(10).max(500).required().messages({
    "string.empty": "Review comment is required",
    "string.min": "Review comment must be at least 10 characters long",
    "string.max": "Review comment cannot exceed 500 characters",
    "any.required": "Review comment is required",
  }),
});

/**
 * Teacher Payout Request Validation Schema
 * Validates teacher payout request
 */
export const requestPayoutSchema = Joi.object({
  amount: Joi.number().positive().required().messages({
    "number.base": "Payout amount must be a number",
    "number.positive": "Payout amount must be positive",
    "any.required": "Payout amount is required",
  }),

  method: Joi.string()
    .valid("click", "payme", "uzum", "bankAccount")
    .required()
    .messages({
      "string.empty": "Payment method is required",
      "any.only":
        "Payment method must be one of: click, payme, uzum, or bankAccount",
      "any.required": "Payment method is required",
    }),
});

/**
 * Teacher ID Validation Schema
 * Validates MongoDB ObjectId format for teacher
 */
export const teacherIdSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base":
        "Invalid teacher ID format. Must be a valid MongoDB ObjectId",
      "any.required": "Teacher ID is required",
    }),
});

/**
 * Teacher Query Validation Schema
 * Validates query parameters for teacher filtering and pagination
 */
export const teacherQuerySchema = Joi.object({
  specialization: Joi.string().trim().optional().messages({
    "string.base": "Specialization must be a string",
  }),

  city: Joi.string().trim().optional().messages({
    "string.base": "City must be a string",
  }),

  country: Joi.string().trim().optional().messages({
    "string.base": "Country must be a string",
  }),

  minRating: Joi.number().min(0).max(5).optional().messages({
    "number.base": "Minimum rating must be a number",
    "number.min": "Minimum rating cannot be less than 0",
    "number.max": "Minimum rating cannot exceed 5",
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
    .valid(
      "createdAt",
      "ratingAverage",
      "studentCount",
      "courseCount",
      "totalEarnings"
    )
    .default("createdAt")
    .optional()
    .messages({
      "any.only":
        "Sort field must be one of: createdAt, ratingAverage, studentCount, courseCount, totalEarnings",
    }),

  order: Joi.string().valid("asc", "desc").default("desc").optional().messages({
    "any.only": "Order must be either 'asc' or 'desc'",
  }),
});

/**
 * Update Payout Status Validation Schema
 * Validates payout status update (admin only)
 */
export const updatePayoutStatusSchema = Joi.object({
  payoutId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base":
        "Invalid payout ID format. Must be a valid MongoDB ObjectId",
      "any.required": "Payout ID is required",
    }),

  status: Joi.string()
    .valid("pending", "completed", "failed")
    .required()
    .messages({
      "string.empty": "Payout status is required",
      "any.only": "Payout status must be one of: pending, completed, or failed",
      "any.required": "Payout status is required",
    }),
});
