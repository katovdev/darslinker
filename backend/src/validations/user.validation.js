import Joi from "joi";

/**
 * User Registration Validation Schema
 * Validates user data during registration
 */
export const registerSchema = Joi.object({
  firstName: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .required()
    .pattern(/^[a-zA-Z\s]+$/)
    .messages({
      "string.empty": "First name is required",
      "string.min": "First name must be at least 2 characters long",
      "string.max": "First name cannot exceed 50 characters",
      "string.pattern.base": "First name can only contain letters and spaces",
      "any.required": "First name is required",
    }),

  lastName: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .required()
    .pattern(/^[a-zA-Z\s]+$/)
    .messages({
      "string.empty": "Last name is required",
      "string.min": "Last name must be at least 2 characters long",
      "string.max": "Last name cannot exceed 50 characters",
      "string.pattern.base": "Last name can only contain letters and spaces",
      "any.required": "Last name is required",
    }),

  phone: Joi.string()
    .trim()
    .pattern(/^(\+998)?[0-9]{9,12}$/)
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

  password: Joi.string()
    .min(8)
    .max(128)
    .required()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .messages({
      "string.empty": "Password is required",
      "string.min": "Password must be at least 8 characters long",
      "string.max": "Password cannot exceed 128 characters",
      "string.pattern.base":
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)",
      "any.required": "Password is required",
    }),

  role: Joi.string().valid("teacher", "student").default("student").messages({
    "any.only": "Role must be either 'teacher' or 'student'",
  }),
})
  .or("phone", "email")
  .messages({
    "object.missing": "Either phone or email must be provided",
  });

/**
 * User Login Validation Schema
 * Validates user credentials during login
 */
export const loginSchema = Joi.object({
  identifier: Joi.alternatives()
    .try(
      Joi.string()
        .trim()
        .email({ tlds: { allow: false } })
        .messages({
          "string.email": "Please provide a valid email address",
        }),
      Joi.string()
        .trim()
        .pattern(/^(\+998)?[0-9]{9,12}$/)
        .messages({
          "string.pattern.base": "Please provide a valid phone number",
        })
    )
    .required()
    .messages({
      "alternatives.match": "Please provide a valid email or phone number",
      "any.required": "Email or phone number is required",
    }),

  password: Joi.string().required().messages({
    "string.empty": "Password is required",
    "any.required": "Password is required",
  }),
});

/**
 * User Update Validation Schema
 * Validates user data during profile update
 */
export const updateUserSchema = Joi.object({
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
    .pattern(/^(\+998)?[0-9]{9,12}$/)
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
 * Password Change Validation Schema
 * Validates password change request
 */
export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    "string.empty": "Current password is required",
    "any.required": "Current password is required",
  }),

  newPassword: Joi.string()
    .min(8)
    .max(128)
    .required()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .invalid(Joi.ref("currentPassword"))
    .messages({
      "string.empty": "New password is required",
      "string.min": "New password must be at least 8 characters long",
      "string.max": "New password cannot exceed 128 characters",
      "string.pattern.base":
        "New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)",
      "any.invalid": "New password must be different from current password",
      "any.required": "New password is required",
    }),

  confirmPassword: Joi.string()
    .valid(Joi.ref("newPassword"))
    .required()
    .messages({
      "any.only": "Passwords do not match",
      "any.required": "Password confirmation is required",
    }),
});

/**
 * User ID Validation Schema
 * Validates MongoDB ObjectId format
 */
export const userIdSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid user ID format",
      "any.required": "User ID is required",
    }),
});

/**
 * Email Validation Schema
 * Validates standalone email (for password reset, email verification, etc.)
 */
export const emailSchema = Joi.object({
  email: Joi.string()
    .trim()
    .lowercase()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      "string.email": "Please provide a valid email address",
      "string.empty": "Email is required",
      "any.required": "Email is required",
    }),
});

/**
 * Phone Validation Schema
 * Validates standalone phone number
 */
export const phoneSchema = Joi.object({
  phone: Joi.string()
    .trim()
    .pattern(/^(\+998)?[0-9]{9,12}$/)
    .required()
    .messages({
      "string.pattern.base":
        "Phone number must be a valid format (e.g., +998901234567)",
      "string.empty": "Phone number is required",
      "any.required": "Phone number is required",
    }),
});
