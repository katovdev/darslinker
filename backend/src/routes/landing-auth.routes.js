import express from 'express';
import {
  sendVerificationCode,
  verifyAndRegister,
  resendVerificationCode,
  login,
  forgotPassword
} from '../controllers/landing-auth.controller.js';

const router = express.Router();

/**
 * @route POST /api/landing-auth/send-verification
 * @desc Send verification code via Telegram for landing page registration
 * @access Public
 */
router.post('/send-verification', sendVerificationCode);

/**
 * @route POST /api/landing-auth/verify-and-register
 * @desc Verify code and complete registration for landing page
 * @access Public
 */
router.post('/verify-and-register', verifyAndRegister);

/**
 * @route POST /api/landing-auth/resend-verification
 * @desc Resend verification code for landing page
 * @access Public
 */
router.post('/resend-verification', resendVerificationCode);

/**
 * @route POST /api/landing-auth/login
 * @desc Login with phone and password for landing page users
 * @access Public
 */
router.post('/login', login);

/**
 * @route POST /api/landing-auth/forgot-password
 * @desc Forgot password - send message to Telegram bot
 * @access Public
 */
router.post('/forgot-password', forgotPassword);

export default router;
