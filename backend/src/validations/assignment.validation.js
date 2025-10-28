import Joi from "joi";

/**
 * Assignment Creation Validation Schema
 * Validates assignment data during assignment creation
 */
export const createAssignmentSchema = Joi.object({
  courseId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base":
        "Invalid course ID format. Must be a valid MongoDB ObjectId",
      "any.required": "Course ID is required",
    }),

  title: Joi.string().trim().min(3).max(200).required().messages({
    "string.empty": "Assignment title is required",
    "string.min": "Assignment title must be at least 3 characters long",
    "string.max": "Assignment title cannot exceed 200 characters",
    "any.required": "Assignment title is required",
  }),

  description: Joi.string().trim().optional().allow("").messages({
    "string.base": "Description must be a string",
  }),

  dueDate: Joi.date().iso().greater("now").required().messages({
    "date.base": "Due date must be a valid date",
    "date.greater": "Due date must be in the future",
    "any.required": "Due date is required",
  }),

  resources: Joi.array()
    .items(Joi.string().uri().messages({ "string.uri": "Invalid resource URL" }))
    .optional()
    .messages({
      "array.base": "Resources must be an array of URLs",
    }),

  createdBy: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base":
        "Invalid teacher ID format. Must be a valid MongoDB ObjectId",
      "any.required": "Teacher ID (createdBy) is required",
    }),

  maxGrade: Joi.number().min(0).required().messages({
    "number.base": "Max grade must be a number",
    "number.min": "Max grade cannot be negative",
    "any.required": "Max grade is required",
  }),
});

/**
 * Assignment Update Validation Schema
 * Validates assignment data during assignment update
 */
export const updateAssignmentSchema = Joi.object({
  title: Joi.string().trim().min(3).max(200).optional().messages({
    "string.min": "Assignment title must be at least 3 characters long",
    "string.max": "Assignment title cannot exceed 200 characters",
  }),

  description: Joi.string().trim().optional().allow("").messages({
    "string.base": "Description must be a string",
  }),

  dueDate: Joi.date().iso().greater("now").optional().messages({
    "date.base": "Due date must be a valid date",
    "date.greater": "Due date must be in the future",
  }),

  resources: Joi.array()
    .items(Joi.string().uri().messages({ "string.uri": "Invalid resource URL" }))
    .optional()
    .messages({
      "array.base": "Resources must be an array of URLs",
    }),

  maxGrade: Joi.number().min(0).optional().messages({
    "number.base": "Max grade must be a number",
    "number.min": "Max grade cannot be negative",
  }),

  status: Joi.string().valid("pending", "graded").optional().messages({
    "any.only": "Status must be either 'pending' or 'graded'",
  }),
})
  .min(1)
  .messages({
    "object.min": "At least one field must be provided for update",
  });

/**
 * Assignment ID Validation Schema
 * Validates MongoDB ObjectId format for assignment
 */
export const assignmentIdSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base":
        "Invalid assignment ID format. Must be a valid MongoDB ObjectId",
      "any.required": "Assignment ID is required",
    }),
});

/**
 * Assignment Query Validation Schema
 * Validates query parameters for assignment filtering and pagination
 */
export const assignmentQuerySchema = Joi.object({
  courseId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional()
    .messages({
      "string.pattern.base":
        "Invalid course ID format. Must be a valid MongoDB ObjectId",
    }),

  status: Joi.string().valid("pending", "graded").optional().messages({
    "any.only": "Status must be either 'pending' or 'graded'",
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
    .valid("createdAt", "title", "dueDate", "maxGrade", "status")
    .default("createdAt")
    .optional()
    .messages({
      "any.only":
        "Sort field must be one of: createdAt, title, dueDate, maxGrade, status",
    }),

  order: Joi.string().valid("asc", "desc").default("desc").optional().messages({
    "any.only": "Order must be either 'asc' or 'desc'",
  }),
});

/**
 * Get Assignments by Course ID Validation Schema
 * Validates course ID for getting all assignments
 */
export const getAssignmentsByCourseSchema = Joi.object({
  courseId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base":
        "Invalid course ID format. Must be a valid MongoDB ObjectId",
      "any.required": "Course ID is required",
    }),
});

/**
 * Submit Assignment Validation Schema
 * Validates assignment submission by student
 */
export const submitAssignmentSchema = Joi.object({
  studentId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base":
        "Invalid student ID format. Must be a valid MongoDB ObjectId",
      "any.required": "Student ID is required",
    }),

  files: Joi.array()
    .items(Joi.string().uri().messages({ "string.uri": "Invalid file URL" }))
    .min(1)
    .required()
    .messages({
      "array.base": "Files must be an array of URLs",
      "array.min": "At least one file is required for submission",
      "any.required": "Files are required for submission",
    }),
});

/**
 * Grade Assignment Validation Schema
 * Validates grading assignment by teacher
 */
export const gradeAssignmentSchema = Joi.object({
  studentId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base":
        "Invalid student ID format. Must be a valid MongoDB ObjectId",
      "any.required": "Student ID is required",
    }),

  grade: Joi.number().min(0).required().messages({
    "number.base": "Grade must be a number",
    "number.min": "Grade cannot be negative",
    "any.required": "Grade is required",
  }),

  feedback: Joi.string().trim().optional().allow("").messages({
    "string.base": "Feedback must be a string",
  }),
});
