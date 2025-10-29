import Joi from "joi";

/**
 * User Update Validation Schema
 * Validates user data during profile update
 */
const updateUserSchema = Joi.object({
  firstName: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .pattern(/^[a-zA-Z\s]+$/)
    .optional()
    .messages({
      "string.min": "First name must be at least 2 characters long",
      "string.max": "First name cannot exceed 50 characters",
      "string.pattern.base": "First name can only contain letters and spaces",
    }),

  lastName: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .pattern(/^[a-zA-Z\s]+$/)
    .optional()
    .messages({
      "string.min": "Last name must be at least 2 characters long",
      "string.max": "Last name cannot exceed 50 characters",
      "string.pattern.base": "Last name can only contain letters and spaces",
    }),

  phone: Joi.string()
    .trim()
    .pattern(/^\+998[0-9]{9}$/)
    .optional()
    .messages({
      "string.pattern.base":
        "Phone number must be a valid format (e.g., +998901234567)",
    }),

  email: Joi.string()
    .trim()
    .lowercase()
    .email({ tlds: { allow: false } })
    .optional()
    .messages({
      "string.email": "Please provide a valid email address",
    }),

  status: Joi.string()
    .valid("pending", "active", "inactive", "blocked")
    .optional()
    .messages({
      "any.only":
        "Status must be one of: pending, active, inactive, or blocked",
    }),

  role: Joi.string().valid("teacher", "student").optional().messages({
    "any.only": "Role must be either 'teacher' or 'student'",
  }),
}).min(1);

/**
 * User ID Validation Schema
 * Validates MongoDB ObjectId format
 */
const userIdSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid user ID format",
      "any.required": "User ID is required",
    }),
});

export { updateUserSchema, userIdSchema };
