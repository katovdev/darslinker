import { Router } from "express";
import { validate } from "../middlewares/validation.middleware.js";
import {
  checkUserSchema,
  registerSchema,
  loginSchema,
  changePasswordSchema,
} from "../validations/auth.validation.js";
import {
  register,
  verifyRegistrationOtp,
  resendRegistrationOtp,
  login,
  changePassword,
  checkUser,
  logout,
} from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const authRouter = Router();

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
 *     OtpVerification:
 *       type: object
 *       required:
 *         - identifier
 *         - otp
 *       properties:
 *         identifier:
 *           type: string
 *           description: User's email address or phone number used during registration
 *           example: john.doe@example.com
 *         otp:
 *           type: string
 *           pattern: '^\d{6}$'
 *           description: 6-digit OTP code sent to user's email or phone
 *           example: "123456"
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
 *   name: Auth
 *   description: Authorization and authentication endpoints
 */

/**
 * @swagger
 * /auth/check-user:
 *   post:
 *     summary: Check if user identifier exists
 *     description: Verify whether a user with the given email address or phone number already exists in the system. This endpoint helps frontend applications determine whether to show login or registration form based on the identifier provided.
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - identifier
 *             properties:
 *               identifier:
 *                 type: string
 *                 description: User's email address or phone number to check
 *                 example: john.doe@example.com
 *           examples:
 *             checkWithEmail:
 *               summary: Check user with email
 *               value:
 *                 identifier: john.doe@example.com
 *             checkWithPhone:
 *               summary: Check user with phone number
 *               value:
 *                 identifier: "+998901234567"
 *     responses:
 *       200:
 *         description: Request processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 exists:
 *                   type: boolean
 *                   description: True if user exists, false otherwise
 *                   example: false
 *                 next:
 *                   type: string
 *                   description: Indicates next step for frontend - "register" if user doesn't exist, "login" if user exists
 *                   enum: [register, login]
 *                   example: register
 *             examples:
 *               userNotExists:
 *                 summary: User not found - show registration
 *                 value:
 *                   success: true
 *                   exists: false
 *                   next: register
 *               userExists:
 *                 summary: User found - show login
 *                 value:
 *                   success: true
 *                   exists: true
 *                   next: login
 *       400:
 *         description: Bad request - Missing or invalid identifier
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               missingIdentifier:
 *                 summary: Identifier not provided
 *                 value:
 *                   success: false
 *                   message: Identifier is required
 *               invalidIdentifier:
 *                 summary: Invalid identifier format
 *                 value:
 *                   success: false
 *                   message: Please provide a valid email address or phone number
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: An error occurred while checking the user
 *               error: Detailed error message
 */
authRouter.post("/check-user", validate(checkUserSchema), checkUser);

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Create a new user account with email address or phone number. Password must contain at least one uppercase letter, lowercase letter, number, and special character.
 *     tags: [Auth]
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
authRouter.post("/register", validate(registerSchema), register);

/**
 * @swagger
 * /auth/verify-registration-otp:
 *   post:
 *     summary: Verify registration OTP code
 *     description: Verify the OTP code sent to user's email address or phone number during registration. Upon successful verification, the user's account status will be changed from 'pending' to 'active'.
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OtpVerification'
 *           examples:
 *             verifyWithEmail:
 *               summary: Verify OTP Code with email
 *               value:
 *                 identifier: john.doe@example.com
 *                 otp: "123456"
 *             verifyWithPhone:
 *               summary: Verify OTP Code with phone
 *               value:
 *                 identifier: "+998901234567"
 *                 otp: "654321"
 *     responses:
 *       200:
 *         description: OTP Code verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: OTP Code verified successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/UserResponse'
 *             example:
 *               success: true
 *               message: OTP Code verified successfully
 *               data:
 *                 user:
 *                   _id: 507f1f77bcf86cd799439011
 *                   firstName: John
 *                   lastName: Doe
 *                   email: john.doe@example.com
 *                   status: active
 *                   role: student
 *                   createdAt: 2024-01-15T10:30:00Z
 *                   updatedAt: 2024-01-15T10:35:00Z
 *       400:
 *         description: Bad request - Invalid OTP Code or missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               missingFields:
 *                 summary: Missing required fields
 *                 value:
 *                   success: false
 *                   message: Identifier (email or phone) and OTP Code are required
 *               invalidOtp:
 *                 summary: Invalid OTP code
 *                 value:
 *                   success: false
 *                   message: Invalid OTP code
 *               otpNotFound:
 *                 summary: OTP Code not found or already verified
 *                 value:
 *                   success: false
 *                   message: OTP Code not found or already verified
 *       410:
 *         description: OTP Code expired
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: OTP code has expired. Please request a new one
 *       429:
 *         description: Too many attempts
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: Too many failed attempts. Please request a new OTP Code
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: An error occurred while verifying an registration otp code
 */
authRouter.post("/verify-registration-otp", verifyRegistrationOtp);

/**
 * @swagger
 * /auth/resend-registration-otp:
 *   post:
 *     summary: Resend registration OTP code
 *     description: Resend a new OTP code to the user's email or phone number for registration verification. This endpoint deletes any previous unused OTPs and generates a fresh one. The user must exist in the system with 'pending' status.
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address (provide either email or phone)
 *                 example: john.doe@example.com
 *               phone:
 *                 type: string
 *                 pattern: '^(\+998)?[0-9]{9,12}$'
 *                 description: User's phone number (provide either email or phone)
 *                 example: +998901234567
 *             oneOf:
 *               - required: [email]
 *               - required: [phone]
 *           examples:
 *             resendWithEmail:
 *               summary: Resend OTP with email
 *               value:
 *                 email: john.doe@example.com
 *             resendWithPhone:
 *               summary: Resend OTP with phone
 *               value:
 *                 phone: "+998901234567"
 *             resendWithBoth:
 *               summary: Resend OTP with both (email takes priority)
 *               value:
 *                 email: john.doe@example.com
 *                 phone: "+998901234567"
 *     responses:
 *       200:
 *         description: OTP resent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: OTP Code has been resent successfully for verification
 *             example:
 *               success: true
 *               message: OTP Code has been resent successfully for verification
 *       400:
 *         description: Bad request - Missing identifier or user already verified
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               missingIdentifier:
 *                 summary: No email or phone provided
 *                 value:
 *                   success: false
 *                   message: Either email or phone number is required
 *               alreadyVerified:
 *                 summary: User already verified
 *                 value:
 *                   success: false
 *                   message: User account is already verified. No need to resend OTP Code
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: No user found with this email or phone number
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               sendingFailed:
 *                 summary: Failed to send OTP
 *                 value:
 *                   success: false
 *                   message: Failed to resend OTP Code
 *               serverError:
 *                 summary: General server error
 *                 value:
 *                   success: false
 *                   message: An error occurred while resending the registration OTP Code
 *                   error: Detailed error message
 */
authRouter.post("/resend-registration-otp", resendRegistrationOtp);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login
 *     description: Authenticate user with email/phone and password. Returns JWT access and refresh tokens upon successful authentication. The user account must be in 'active' status (verified via OTP) to login.
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - identifier
 *               - password
 *             properties:
 *               identifier:
 *                 oneOf:
 *                   - type: string
 *                     format: email
 *                     description: User's email address
 *                   - type: string
 *                     pattern: '^(\+998)?[0-9]{9,12}$'
 *                     description: User's phone number (Uzbekistan format)
 *                 example: john.doe@example.com
 *               password:
 *                 type: string
 *                 description: User's password
 *                 example: Pass@123
 *           examples:
 *             loginWithEmail:
 *               summary: Login with email address
 *               value:
 *                 identifier: john.doe@example.com
 *                 password: Pass@123
 *             loginWithPhone:
 *               summary: Login with phone number
 *               value:
 *                 identifier: "+998901234567"
 *                 password: Teacher@456
 *     responses:
 *       200:
 *         description: Login successful - Returns JWT tokens and user profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Logged In successfully
 *                 accessToken:
 *                   type: string
 *                   description: JWT access token (expires in 12 hours) - Contains userId, email, phone, role, status
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NWE3YjNjMmQxMjM0NTY3ODkwYWJjZGUiLCJlbWFpbCI6ImpvaG4uZG9lQGV4YW1wbGUuY29tIiwicm9sZSI6InN0dWRlbnQiLCJpYXQiOjE2MzQ1Njc4OTAsImV4cCI6MTYzNDYxMTA5MH0.abc123xyz789
 *                 refreshToken:
 *                   type: string
 *                   description: JWT refresh token (expires in 7 days) - Contains userId, email, phone, role, status
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NWE3YjNjMmQxMjM0NTY3ODkwYWJjZGUiLCJpYXQiOjE2MzQ1Njc4OTAsImV4cCI6MTYzNTE3MjY5MH0.def456uvw123
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/UserResponse'
 *             example:
 *               success: true
 *               message: Logged In successfully
 *               accessToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NWE3YjNjMmQxMjM0NTY3ODkwYWJjZGUiLCJlbWFpbCI6ImpvaG4uZG9lQGV4YW1wbGUuY29tIiwicm9sZSI6InN0dWRlbnQiLCJpYXQiOjE2MzQ1Njc4OTAsImV4cCI6MTYzNDYxMTA5MH0.abc123xyz789
 *               refreshToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NWE3YjNjMmQxMjM0NTY3ODkwYWJjZGUiLCJpYXQiOjE2MzQ1Njc4OTAsImV4cCI6MTYzNTE3MjY5MH0.def456uvw123
 *               data:
 *                 user:
 *                   _id: 507f1f77bcf86cd799439011
 *                   firstName: John
 *                   lastName: Doe
 *                   email: john.doe@example.com
 *                   status: active
 *                   role: student
 *                   createdAt: 2024-01-15T10:30:00Z
 *                   updatedAt: 2024-01-15T10:30:00Z
 *       400:
 *         description: Bad request - Missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               missingFields:
 *                 summary: Identifier or password not provided
 *                 value:
 *                   success: false
 *                   message: Identifier and password are required
 *               validationError:
 *                 summary: Validation failed
 *                 value:
 *                   success: false
 *                   message: Validation failed
 *                   errors:
 *                     - field: identifier
 *                       message: Please provide a valid email or phone number
 *       401:
 *         description: Unauthorized - Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: Invalid credentials
 *       403:
 *         description: Forbidden - Account not active (pending verification)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: Account not active. Please verify your account
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: An error occurred while log in to system
 *               error: Detailed error message
 */
authRouter.post("/login", validate(loginSchema), login);

/**
 * @swagger
 * /auth/change-password:
 *   patch:
 *     summary: Change user password
 *     description: Change password for authenticated user. User must provide current password and new password. New password must meet security requirements (minimum 8 characters, contain uppercase, lowercase, number, and special character).
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *               - confirmNewPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 description: User's current password
 *                 example: OldPass@123
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *                 maxLength: 128
 *                 pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]'
 *                 description: New password (must contain uppercase, lowercase, number, and special character)
 *                 example: NewPass@456
 *               confirmPassword:
 *                 type: string
 *                 description: Confirmation of new password (must match newPassword)
 *                 example: NewPass@456
 *           examples:
 *             changePassword:
 *               summary: Change password example
 *               value:
 *                 currentPassword: OldPass@123
 *                 newPassword: NewPass@456
 *                 confirmPassword: NewPass@456
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Password changed successfully
 *             example:
 *               success: true
 *               message: Password changed successfully
 *       400:
 *         description: Bad request - Validation error or passwords don't match
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               passwordMismatch:
 *                 summary: New passwords don't match
 *                 value:
 *                   success: false
 *                   message: New password and confirmation password do not match
 *               invalidPassword:
 *                 summary: Invalid password format
 *                 value:
 *                   success: false
 *                   message: Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)
 *               samePassword:
 *                 summary: New password same as current
 *                 value:
 *                   success: false
 *                   message: New password must be different from current password
 *       401:
 *         description: Unauthorized - Invalid current password or no authentication token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               invalidCurrentPassword:
 *                 summary: Current password is incorrect
 *                 value:
 *                   success: false
 *                   message: Current password is incorrect
 *               noToken:
 *                 summary: No authentication token provided
 *                 value:
 *                   success: false
 *                   message: Authentication token required
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: User not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: An error occurred while changing password
 *               error: Detailed error message
 */
authRouter.patch(
  "/change-password",
  authenticate,
  validate(changePasswordSchema),
  changePassword
);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout from current device
 *     description: Logout user from the current device by deleting the session
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Logged out successfully
 *       401:
 *         description: Unauthorized - No token or invalid token
 *       404:
 *         description: Session not found
 *       500:
 *         description: Internal server error
 */
authRouter.post("/logout", authenticate, logout);

export default authRouter;
