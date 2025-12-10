import teacherBot from './telegram-teacher-bot.service.js';
import logger from '../../config/logger.js';
import Teacher from '../models/teacher.model.js';
import Otp from '../models/otp.model.js';

/**
 * Send notification to teacher via Telegram bot
 * @param {string} teacherId - Teacher's user ID
 * @param {string} message - Notification message
 */
export async function sendTeacherNotification(teacherId, message) {
  try {
    // Get teacher data
    const teacher = await Teacher.findById(teacherId);
    
    if (!teacher || !teacher.phone) {
      logger.warn('Teacher not found or no phone number', { teacherId });
      return false;
    }

    // Find teacher's chat ID from OTP records
    const otpRecord = await Otp.findOne({
      identifier: teacher.phone,
      'meta.botType': 'teacher',
      'meta.chatId': { $exists: true }
    }).sort({ createdAt: -1 });

    if (!otpRecord || !otpRecord.meta?.chatId) {
      logger.warn('Teacher chat ID not found', { teacherId, phone: teacher.phone });
      return false;
    }

    const chatId = otpRecord.meta.chatId;

    // Send notification via Telegram
    await teacherBot.sendMessage(chatId, message);

    logger.info('Notification sent to teacher via Telegram', {
      teacherId,
      chatId,
      message
    });

    return true;
  } catch (error) {
    logger.error('Error sending teacher notification via Telegram', {
      teacherId,
      error: error.message
    });
    return false;
  }
}

/**
 * Notify teacher about new student registration
 * @param {string} teacherId - Teacher's user ID
 * @param {Object} studentData - Student information
 */
export async function notifyTeacherNewStudent(teacherId, studentData) {
  const message = `🎓 Yangi o'quvchi ro'yxatdan o'tdi!\n\n👤 ${studentData.firstName} ${studentData.lastName}`;
  
  return await sendTeacherNotification(teacherId, message);
}
