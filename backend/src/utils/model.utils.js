import mongoose from "mongoose";

import { BadRequestError, NotFoundError } from "./error.utils.js";

/**
 * Validate ObjectId and find document by ID
 * @param {mongoose.Model} Model - Mongoose model to search in
 * @param {string} id - Document ID to validate and find
 * @param {string} entityName - Name of entity for error messages (e.g., "Course", "Module", "Lesson")
 * @param {object} options - Additional options
 * @param {string|array} options.populate - Fields to populate
 * @param {object} options.select - Fields to select/exclude
 * @returns {Promise<{success: boolean, data?: object, error?: {status: number, message: string}}>}
 */
async function validateAndFindById(Model, id, entityName, options = {}) {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return {
        success: false,
        error: {
          status: 400,
          message: `Invalid ${entityName} ID format`,
        },
      };
    }

    let query = Model.findById(id);

    if (options.populate) {
      query = query.populate(options.populate);
    }

    if (options.select) {
      query = query.select(options.select);
    }

    const document = await query;

    if (!document) {
      return {
        success: false,
        error: {
          status: 404,
          message: `${entityName} not found`,
        },
      };
    }

    return {
      success: true,
      data: document,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        status: 400,
        message: `An error occurred while finding ${entityName}`,
        details: error.message,
      },
    };
  }
}

/**
 * Validate ObjectId format only (without finding document)
 * @param {string} id - ID to validate
 * @param {string} entityName - Name of entity for error messages
 * @returns {{valid: boolean, error?: {status: number, message: string}}}
 */
function validateObjectId(id, entityName) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return {
      valid: false,
      error: {
        status: 400,
        message: `Invalid ${entityName} ID format`,
      },
    };
  }

  return {
    valid: true,
  };
}

function handleValidationResult(result) {
  if (!result.success) {
    if (result.error.status === 400) {
      throw new BadRequestError(result.error.message);
    } else if (result.error.status === 404) {
      throw new NotFoundError(result.error.message);
    }
    throw new BadRequestError(result.error.message);
  }
  return result.data;
}

export { validateAndFindById, validateObjectId, handleValidationResult };
