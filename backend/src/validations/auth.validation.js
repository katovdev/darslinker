import Joi from "joi";

/**
 * User checkUser Validation Schema
 * Validates user data during chechking users
 */
const checkUserSchema = Joi.object({
  identifier: Joi.alternatives()
    .try(
      Joi.string()
        .trim()
        .lowercase()
        .email({ tlds: { allow: false } })
        .messages({
          "string.email": "Please provide a valid email address",
        }),
      Joi.string()
        .trim()
        .pattern(/^\+998[0-9]{9}$/)
        .messages({
          "string.pattern.base": "Please provide a valid phone number",
        })
    )
    .required()
    .messages({
      "alternatives.match": "Please provide a valid email or phone number",
      "any.required": "Email or phone number is required",
    }),
});

/**
 * User Registration Validation Schema
 * Validates user data during registration
 */
const registerSchema = Joi.object({
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
    .pattern(/^\+998[0-9]{9}$/)
    .optional()
    .messages({
      "string.pattern.base":
        "Phone number must be a valid format (e.g., +998507525150)",
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
    .min(6)
    .required()
    .messages({
      "string.empty": "Password is required",
      "string.min": "Password must be at least 6 characters long",
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
const loginSchema = Joi.object({
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
        .pattern(/^\+998[0-9]{9}$/)
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
 * Password Change Validation Schema
 * Validates password change request
 */
const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    "string.empty": "Current password is required",
    "any.required": "Current password is required",
  }),

  newPassword: Joi.string()
    .min(6)
    .required()
    .invalid(Joi.ref("currentPassword"))
    .messages({
      "string.empty": "New password is required",
      "string.min": "New password must be at least 6 characters long",
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
 * Email Validation Schema
 * Validates standalone email (for password reset, email verification, etc.)
 */
const emailSchema = Joi.object({
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
const phoneSchema = Joi.object({
  phone: Joi.string()
    .trim()
    .pattern(/^\+998[0-9]{9}$/)
    .required()
    .messages({
      "string.pattern.base":
        "Phone number must be a valid format (e.g., +998507525150)",
      "string.empty": "Phone number is required",
      "any.required": "Phone number is required",
    }),
});

export {
  checkUserSchema,
  registerSchema,
  loginSchema,
  changePasswordSchema,
  emailSchema,
  phoneSchema,
};
