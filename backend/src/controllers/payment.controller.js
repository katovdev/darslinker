import Payment from '../models/payment.model.js';
import Student from '../models/student.model.js';
import Course from '../models/course.model.js';
import Teacher from '../models/teacher.model.js';
import Notification from '../models/notification.model.js';
import logger from '../../config/logger.js';
import { catchAsync } from '../middlewares/error.middleware.js';
import { ValidationError, NotFoundError } from '../utils/error.utils.js';
import { sendPaymentNotificationToTeacher } from '../services/telegram-teacher-bot.service.js';

/**
 * Submit payment for a course
 * @route POST /payments/submit
 * @access Public
 */
const submitPayment = catchAsync(async (req, res) => {
  const { studentId, courseId, teacherId, amount, checkImageUrl } = req.body;

  logger.info('Payment submission request', {
    studentId,
    courseId,
    teacherId,
    amount
  });

  // Validate required fields
  if (!studentId || !courseId || !teacherId || !checkImageUrl) {
    throw new ValidationError('Missing required fields');
  }

  // Check if student exists
  const student = await Student.findById(studentId);
  if (!student) {
    throw new NotFoundError('Student not found');
  }

  // Check if course exists
  const course = await Course.findById(courseId);
  if (!course) {
    throw new NotFoundError('Course not found');
  }

  // Check if teacher exists
  const teacher = await Teacher.findById(teacherId);
  if (!teacher) {
    throw new NotFoundError('Teacher not found');
  }

  // Check if payment already exists for this student and course
  const existingPayment = await Payment.findOne({
    studentId,
    courseId,
    status: { $in: ['pending', 'approved'] }
  });

  if (existingPayment) {
    if (existingPayment.status === 'approved') {
      return res.status(200).json({
        success: true,
        message: 'Payment already approved',
        payment: existingPayment
      });
    } else {
      return res.status(200).json({
        success: true,
        message: 'Payment already submitted and pending approval',
        payment: existingPayment
      });
    }
  }

  // Create new payment
  const payment = new Payment({
    studentId,
    courseId,
    teacherId,
    amount: amount || course.price || 0,
    checkImageUrl
  });

  await payment.save();

  // Create notification for teacher
  await Notification.create({
    userId: teacherId,
    userType: 'Teacher',
    type: 'payment_submitted',
    title: 'New Payment Submission',
    message: `${student.firstName} ${student.lastName} submitted payment for ${course.title}`,
    metadata: {
      paymentId: payment._id,
      courseId,
      amount: payment.amount
    }
  });

  // Send Telegram notification to teacher
  try {
    await sendPaymentNotificationToTeacher(
      teacherId,
      `${student.firstName} ${student.lastName}`,
      course.title,
      payment.amount
    );
  } catch (error) {
    logger.error('Failed to send Telegram notification to teacher', {
      error: error.message,
      teacherId,
      paymentId: payment._id
    });
    // Don't fail the payment submission if Telegram fails
  }

  logger.info('Payment submitted successfully', {
    paymentId: payment._id,
    studentId,
    courseId,
    amount: payment.amount
  });

  res.status(201).json({
    success: true,
    message: 'Payment submitted successfully',
    payment
  });
});

/**
 * Get payment requests for a teacher
 * @route GET /payments/teacher/:teacherId
 * @access Private (Teacher only)
 */
const getTeacherPayments = catchAsync(async (req, res) => {
  const { teacherId } = req.params;
  const { status } = req.query;

  logger.info('Fetching teacher payments', { teacherId, status });

  const filter = { teacherId };
  if (status) {
    filter.status = status;
  }

  const payments = await Payment.find(filter)
    .populate('studentId', 'firstName lastName email phone')
    .populate('courseId', 'title price')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    payments
  });
});

/**
 * Approve payment
 * @route PATCH /payments/:paymentId/approve
 * @access Private (Teacher only)
 */
const approvePayment = catchAsync(async (req, res) => {
  const { paymentId } = req.params;
  const { teacherId } = req.body;

  logger.info('Payment approval request', { paymentId, teacherId });

  const payment = await Payment.findById(paymentId)
    .populate('studentId', 'firstName lastName')
    .populate('courseId', 'title');

  if (!payment) {
    throw new NotFoundError('Payment not found');
  }

  if (payment.teacherId.toString() !== teacherId) {
    throw new ValidationError('Unauthorized to approve this payment');
  }

  if (payment.status === 'approved') {
    return res.status(200).json({
      success: true,
      message: 'Payment already approved',
      payment
    });
  }

  // Update payment status
  payment.status = 'approved';
  payment.approvedAt = new Date();
  payment.approvedBy = teacherId;
  await payment.save();

  // Enroll student in course
  const course = await Course.findById(payment.courseId);
  if (course) {
    if (!course.enrolledStudents) {
      course.enrolledStudents = [];
    }
    if (!course.enrolledStudents.includes(payment.studentId)) {
      course.enrolledStudents.push(payment.studentId);
      course.totalStudents = course.enrolledStudents.length;
      await course.save();
    }
  }

  // Create notification for student
  await Notification.create({
    userId: payment.studentId,
    userType: 'Student',
    type: 'payment_approved',
    title: 'Payment Approved',
    message: `Your payment for ${payment.courseId.title} has been approved! You can now start the course.`,
    link: `/course-learning/${payment.courseId._id}`,
    metadata: {
      paymentId: payment._id,
      courseId: payment.courseId._id,
      amount: payment.amount
    }
  });

  logger.info('Payment approved successfully', {
    paymentId,
    studentId: payment.studentId,
    courseId: payment.courseId._id
  });

  res.status(200).json({
    success: true,
    message: 'Payment approved successfully',
    payment
  });
});

/**
 * Reject payment
 * @route PATCH /payments/:paymentId/reject
 * @access Private (Teacher only)
 */
const rejectPayment = catchAsync(async (req, res) => {
  const { paymentId } = req.params;
  const { teacherId, reason } = req.body;

  logger.info('Payment rejection request', { paymentId, teacherId, reason });

  const payment = await Payment.findById(paymentId)
    .populate('studentId', 'firstName lastName')
    .populate('courseId', 'title');

  if (!payment) {
    throw new NotFoundError('Payment not found');
  }

  if (payment.teacherId.toString() !== teacherId) {
    throw new ValidationError('Unauthorized to reject this payment');
  }

  if (payment.status === 'rejected') {
    return res.status(200).json({
      success: true,
      message: 'Payment already rejected',
      payment
    });
  }

  // Update payment status
  payment.status = 'rejected';
  payment.rejectionReason = reason || 'Payment rejected by teacher';
  await payment.save();

  // Create notification for student
  await Notification.create({
    userId: payment.studentId,
    userType: 'Student',
    type: 'payment_rejected',
    title: 'Payment Rejected',
    message: `Your payment for ${payment.courseId.title} was rejected. ${reason || 'Please contact the teacher for more information.'}`,
    metadata: {
      paymentId: payment._id,
      courseId: payment.courseId._id,
      amount: payment.amount
    }
  });

  logger.info('Payment rejected successfully', {
    paymentId,
    studentId: payment.studentId,
    courseId: payment.courseId._id,
    reason
  });

  res.status(200).json({
    success: true,
    message: 'Payment rejected successfully',
    payment
  });
});

/**
 * Get student payment status for a course
 * @route GET /payments/student/:studentId/course/:courseId
 * @access Public
 */
const getStudentPaymentStatus = catchAsync(async (req, res) => {
  const { studentId, courseId } = req.params;

  const payment = await Payment.findOne({
    studentId,
    courseId
  }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    payment,
    hasPayment: !!payment,
    isApproved: payment?.status === 'approved'
  });
});

export {
  submitPayment,
  getTeacherPayments,
  approvePayment,
  rejectPayment,
  getStudentPaymentStatus
};