import { Router } from "express";
import { validate } from "../middlewares/validation.middleware.js";
import { registerSchema } from "../validations/user.validation.js";
import { register } from "../controllers/user.controller.js";

const userRouter = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     UserRegistration:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - password
 *       properties:
 *         firstName:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *           pattern: '^[a-zA-Z\s]+$'
 *           description: User's first name (letters and spaces only)
 *           example: John
 *         lastName:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *           pattern: '^[a-zA-Z\s]+$'
 *           description: User's last name (letters and spaces only)
 *           example: Doe
 *         phone:
 *           type: string
 *           pattern: '^(\+998)?[0-9]{9,12}$'
 *           description: User's phone number (Uzbekistan format)
 *           example: +998901234567
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *           example: john.doe@example.com
 *         password:
 *           type: string
 *           minLength: 8
 *           maxLength: 128
 *           pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]'
 *           description: User's password (must contain uppercase, lowercase, number, and special character)
 *           example: Pass@123
 *         role:
 *           type: string
 *           enum: [teacher, student]
 *           default: student
 *           description: User's role in the system
 *           example: student
 *       oneOf:
 *         - required: [phone]
 *         - required: [email]
 *       description: Either phone or email must be provided
 *
 *     UserResponse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: MongoDB ObjectId
 *           example: 507f1f77bcf86cd799439011
 *         firstName:
 *           type: string
 *           example: John
 *         lastName:
 *           type: string
 *           example: Doe
 *         phone:
 *           type: string
 *           example: +998901234567
 *         email:
 *           type: string
 *           example: john.doe@example.com
 *         status:
 *           type: string
 *           enum: [pending, active, inactive, blocked]
 *           example: pending
 *         role:
 *           type: string
 *           enum: [teacher, student]
 *           example: student
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: 2024-01-15T10:30:00Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: 2024-01-15T10:30:00Z
 *
 *     ValidationError:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: Validation failed
 *         errors:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               field:
 *                 type: string
 *                 example: email
 *               message:
 *                 type: string
 *                 example: Please provide a valid email address
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: Error message description
 *
 *     SuccessResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: Operation completed successfully
 *         data:
 *           $ref: '#/components/schemas/UserResponse'
 */

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management and authentication endpoints
 */

/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Register a new user
 *     description: Create a new user account with email or phone number. Password must contain at least one uppercase letter, lowercase letter, number, and special character.
 *     tags: [Users]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserRegistration'
 *           examples:
 *             studentWithEmail:
 *               summary: Student registration with email
 *               value:
 *                 firstName: John
 *                 lastName: Doe
 *                 email: john.doe@example.com
 *                 password: Pass@123
 *                 role: student
 *             teacherWithPhone:
 *               summary: Teacher registration with phone
 *               value:
 *                 firstName: Jane
 *                 lastName: Smith
 *                 phone: "+998901234567"
 *                 password: Teacher@456
 *                 role: teacher
 *             withBothContacts:
 *               summary: Registration with both email and phone
 *               value:
 *                 firstName: Alex
 *                 lastName: Johnson
 *                 email: alex.johnson@example.com
 *                 phone: +998907654321
 *                 password: Secure@789
 *                 role: student
 *     responses:
 *       201:
 *         description: User successfully registered
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               message: User registered successfully
 *               data:
 *                 _id: 507f1f77bcf86cd799439011
 *                 firstName: John
 *                 lastName: Doe
 *                 email: john.doe@example.com
 *                 status: pending
 *                 role: student
 *                 createdAt: 2024-01-15T10:30:00Z
 *                 updatedAt: 2024-01-15T10:30:00Z
 *       400:
 *         description: Validation error or bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *             examples:
 *               validationError:
 *                 summary: Validation failed
 *                 value:
 *                   success: false
 *                   message: Validation failed
 *                   errors:
 *                     - field: email
 *                       message: Please provide a valid email address
 *                     - field: password
 *                       message: Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)
 *               missingContact:
 *                 summary: Missing email or phone
 *                 value:
 *                   success: false
 *                   message: Validation failed
 *                   errors:
 *                     - field: phone
 *                       message: Either phone or email must be provided
 *       409:
 *         description: User already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: User with this email already exists
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: An error occurred while registering the user
 */
userRouter.post("/register", validate(registerSchema), register);

export default userRouter;
