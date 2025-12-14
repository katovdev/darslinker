import express from 'express';
import {
  submitPayment,
  getTeacherPayments,
  approvePayment,
  rejectPayment,
  getStudentPaymentStatus
} from '../controllers/payment.controller.js';

const router = express.Router();

// Submit payment
router.post('/submit', submitPayment);

// Get teacher payments
router.get('/teacher/:teacherId', getTeacherPayments);

// Approve payment
router.patch('/:paymentId/approve', approvePayment);

// Reject payment
router.patch('/:paymentId/reject', rejectPayment);

// Get student payment status
router.get('/student/:studentId/course/:courseId', getStudentPaymentStatus);

export default router;