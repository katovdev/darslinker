import Joi from "joi";

/**
 * Course Creation Validation Schema
 * Validates course data during course creation
 */
export const createCourseSchema = Joi.object({
  title: Joi.string().trim().min(3).max(200).required().messages({
    "string.empty": "Course title is required",
    "string.min": "Course title must be at least 3 characters long",
    "string.max": "Course title cannot exceed 200 characters",
    "any.required": "Course title is required",
  }),

  description: Joi.string().trim().min(10).required().messages({
    "string.empty": "Course description is required",
    "string.min": "Course description must be at least 10 characters long",
    "any.required": "Course description is required",
  }),

  shortDescription: Joi.string().trim().min(10).max(300).optional().allow("").messages({
    "string.min": "Course short description must be at least 10 characters long",
    "string.max": "Course short description cannot exceed 300 characters",
  }),

  fullDescription: Joi.string().trim().min(50).optional().allow("").messages({
    "string.min": "Course full description must be at least 50 characters long",
  }),

  category: Joi.string().trim().required().messages({
    "string.empty": "Course category is required",
    "any.required": "Course category is required",
  }),

  level: Joi.string()
    .trim()
    .valid("beginner", "intermediate", "advanced")
    .required()
    .messages({
      "string.empty": "Course level is required",
      "any.only":
        "Course level must be one of: beginner, intermediate, or advanced",
      "any.required": "Course level is required",
    }),

  language: Joi.string().trim().required().messages({
    "string.empty": "Course language is required",
    "any.required": "Course language is required",
  }),

  duration: Joi.string().trim().required().messages({
    "string.empty": "Course duration is required",
    "any.required": "Course duration is required",
  }),

  thumbnail: Joi.string().trim().uri().required().messages({
    "string.empty": "Course thumbnail URL is required",
    "string.uri": "Course thumbnail must be a valid URL",
    "any.required": "Course thumbnail is required",
  }),

  courseImage: Joi.string().trim().uri().optional().allow("").messages({
    "string.uri": "Course image must be a valid URL",
  }),

  videoUrl: Joi.string().trim().uri().optional().allow("").messages({
    "string.uri": "Video URL must be a valid URL",
  }),

  courseType: Joi.string().valid("paid", "free").default("free").messages({
    "any.only": "Course type must be either 'paid', 'free'",
  }),

  status: Joi.string().valid("active", "draft", "archived").default("draft"),

  price: Joi.number().min(0).default(0).messages({
    "number.base": "Course price must be a number",
    "number.min": "Course price cannot be negative",
  }),

  coursePrice: Joi.number().min(0).optional().messages({
    "number.base": "Course price must be a number",
    "number.min": "Course price cannot be negative",
  }),

  discountPrice: Joi.number()
    .min(0)
    .optional()
    .custom((value, helpers) => {
      const { coursePrice } = helpers.state.ancestors[0];
      if (value && coursePrice && value >= coursePrice) {
        return helpers.error("any.invalid");
      }
      return value;
    })
    .messages({
      "number.base": "Discount price must be a number",
      "number.min": "Discount price cannot be negative",
      "any.invalid": "Discount price must be less than course price",
    }),

  teacher: Joi.string().trim().required().messages({
    "string.empty": "Teacher ID is required",
    "any.required": "Teacher ID is required",
  }),

  modules: Joi.array().optional().default([]),
});

/**
 * Course Update Validation Schema
 * Validates course data during course update
 */
export const updateCourseSchema = Joi.object({
  title: Joi.string().trim().min(3).max(200).optional().messages({
    "string.min": "Course title must be at least 3 characters long",
    "string.max": "Course title cannot exceed 200 characters",
  }),

  shortDescription: Joi.string().trim().min(10).max(300).optional().messages({
    "string.min":
      "Course short description must be at least 10 characters long",
    "string.max": "Course short description cannot exceed 300 characters",
  }),

  fullDescription: Joi.string().trim().min(50).optional().messages({
    "string.min": "Course full description must be at least 50 characters long",
  }),

  category: Joi.string().trim().optional().messages({
    "string.empty": "Course category cannot be empty",
  }),

  level: Joi.string()
    .trim()
    .valid("beginner", "intermediate", "advanced")
    .optional()
    .messages({
      "any.only":
        "Course level must be one of: beginner, intermediate, or advanced",
    }),

  language: Joi.string().trim().optional().messages({
    "string.empty": "Course language cannot be empty",
  }),

  duration: Joi.string().trim().optional().messages({
    "string.empty": "Course duration cannot be empty",
  }),

  courseImage: Joi.string().trim().uri().optional().messages({
    "string.uri": "Course image must be a valid URL",
  }),

  videoUrl: Joi.string().trim().uri().optional().allow("").messages({
    "string.uri": "Video URL must be a valid URL",
  }),

  courseType: Joi.string().valid("paid", "free").optional().messages({
    "any.only": "Course type must be either 'paid' or 'free'",
  }),

  status: Joi.string().valid("active", "draft", "archived").default("draft"),

  coursePrice: Joi.number().min(0).optional().messages({
    "number.base": "Course price must be a number",
    "number.min": "Course price cannot be negative",
  }),

  discountPrice: Joi.number().min(0).optional().messages({
    "number.base": "Discount price must be a number",
    "number.min": "Discount price cannot be negative",
  }),
})
  .min(1)
  .messages({
    "object.min": "At least one field must be provided for update",
  });

/**
 * Course ID Validation Schema
 * Validates MongoDB ObjectId format
 */
export const courseIdSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base":
        "Invalid course ID format. Must be a valid MongoDB ObjectId",
      "any.required": "Course ID is required",
    }),
});

/**
 * Course Query Validation Schema
 * Validates query parameters for course filtering and pagination
 */
export const courseQuerySchema = Joi.object({
  category: Joi.string().trim().optional().messages({
    "string.base": "Category must be a string",
  }),

  level: Joi.string()
    .valid("beginner", "intermediate", "advanced")
    .optional()
    .messages({
      "any.only": "Level must be one of: beginner, intermediate, or advanced",
    }),

  courseType: Joi.string().valid("paid", "free").optional().messages({
    "any.only": "Course type must be either 'paid' or 'free'",
  }),

  language: Joi.string().trim().optional().messages({
    "string.base": "Language must be a string",
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
    .valid("createdAt", "title", "coursePrice", "updatedAt")
    .default("createdAt")
    .optional()
    .messages({
      "any.only":
        "Sort field must be one of: createdAt, title, coursePrice, updatedAt",
    }),

  order: Joi.string().valid("asc", "desc").default("desc").optional().messages({
    "any.only": "Order must be either 'asc' or 'desc'",
  }),
});
