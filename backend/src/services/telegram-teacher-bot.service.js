import TelegramBot from 'node-telegram-bot-api';
import logger from '../../config/logger.js';
import User from '../models/user.model.js';
import Otp from '../models/otp.model.js';
import { normalizePhone } from '../utils/normalize.utils.js';
import { generateOtp } from '../utils/generate_otp.utils.js';
import bcrypt from 'bcrypt';
import { BCRYPT_SALT_ROUNDS, HASH_OTP, OTP_EXPIRES_SECONDS, OTP_LENGTH } from '../../config/env.js';

const TEACHER_BOT_TOKEN = process.env.TEACHER_BOT_TOKEN;

let teacherBot;
if (!TEACHER_BOT_TOKEN) {
  logger.error('❌ Teacher bot token is missing. Teacher bot will not start.');
} else {
  try {
    teacherBot = new TelegramBot(TEACHER_BOT_TOKEN, {
      polling: {
        interval: 1000,
        autoStart: false
      }
    });
  } catch (error) {
    logger.error('Failed to create teacher bot instance:', error.message);
  }
}

const userStates = new Map();
const processedMessageIds = new Set();
const resendTimers = new Map();

export function initTeacherBot() {
  if (!teacherBot) {
    logger.error('❌ Teacher bot instance not available');
    return;
  }

  logger.info('🤖 Teacher Telegram Bot starting...');

  try {
    teacherBot.startPolling();
  } catch (error) {
    logger.error('Failed to start teacher bot polling:', error.message);
    return;
  }

  const contactKeyboard = {
    keyboard: [
      [
        {
          text: '📱 Telefon raqamni yuborish',
          request_contact: true,
        },
      ],
    ],
    resize_keyboard: true,
    one_time_keyboard: true,
  };

  async function promptForContact(chatId, firstName = 'Foydalanuvchi') {
    const welcomeMessage = `@darslinker ning rasmiy botiga xush kelibsiz!

${firstName}, ro'yxatdan o'tish uchun kontaktingizni yuboring.`;

    try {
      await teacherBot.sendMessage(chatId, welcomeMessage, {
        parse_mode: 'Markdown',
        reply_markup: contactKeyboard,
      });

      userStates.set(chatId, { state: 'waiting_contact' });
    } catch (error) {
      logger.error('Error sending contact request', {
        chatId,
        error: error.message,
      });
    }
  }

  teacherBot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const firstName = msg.from.first_name || 'Foydalanuvchi';

    logger.info('Teacher bot /start command received', {
      chatId,
      username: msg.from.username,
      firstName,
    });

    await promptForContact(chatId, firstName);
  });

  function scheduleOtpResend({ chatId, normalizedPhone, userId }) {
    const key = `${chatId}:${normalizedPhone}`;

    // Only one scheduled resend per chat/phone
    if (resendTimers.has(key)) {
      return;
    }

    const timer = setTimeout(async () => {
      resendTimers.delete(key);

      try {
        const pendingOtp = await Otp.findOne({
          identifier: normalizedPhone,
          purpose: 'register',
          verified: false
        }).sort({ createdAt: -1 });

        if (!pendingOtp || pendingOtp.verified || pendingOtp.expiresAt < new Date()) {
          return;
        }

        logger.info('⏳ Resending teacher OTP after delay', { chatId, phone: normalizedPhone });

        await createAndSendOtp({
          chatId,
          normalizedPhone,
          userId,
          isResend: true,
          scheduleResend: false
        });
      } catch (error) {
        logger.error('Error during delayed teacher OTP resend', {
          chatId,
          phone: normalizedPhone,
          error: error.message
        });
      }
    }, 10000);

    resendTimers.set(key, timer);
  }

  async function createAndSendOtp({
    chatId,
    normalizedPhone,
    userId,
    isResend = false,
    scheduleResend = true
  }) {
    // Replace any previous pending OTPs for this identifier
    await Otp.deleteMany({ identifier: normalizedPhone, purpose: 'register', verified: false });

    const otp = generateOtp(parseInt(OTP_LENGTH || '6', 10));
    const expiresInSeconds = parseInt(OTP_EXPIRES_SECONDS || '1800', 10);
    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);

    let otpToStore = otp;
    if (HASH_OTP !== 'false') {
      otpToStore = await bcrypt.hash(
        otp,
        parseInt(BCRYPT_SALT_ROUNDS || '10', 10)
      );
    }

    await Otp.create({
      identifier: normalizedPhone,
      otpHash: otpToStore,
      purpose: 'register',
      expiresAt,
      meta: {
        channel: 'telegram',
        chatId: chatId.toString(),
        botType: 'teacher',
      },
    });

    const otpMessage = isResend
      ? `🔁 Yangi tasdiqlash kodi: ${otp}`
      : `Tasdiqlash kodi: ${otp}`;

    await teacherBot.sendMessage(chatId, otpMessage);

    userStates.set(chatId, {
      state: 'otp_sent',
      phone: normalizedPhone,
      userId,
    });

    if (scheduleResend) {
      scheduleOtpResend({ chatId, normalizedPhone, userId });
    }
  }

  // Helper function to process phone number and send OTP
  async function processPhoneNumber(chatId, phoneNumber) {
    const normalizedPhone = normalizePhone(phoneNumber);

    // Prevent duplicate sends for the same chat/phone
    const existingState = userStates.get(chatId);
    if (existingState?.state === 'otp_sent' && existingState.phone === normalizedPhone) {
      await teacherBot.sendMessage(
        chatId,
        '✅ Tasdiqlash kodi allaqachon yuborilgan. Oxirgi kodni kiriting.'
      );
      return;
    }

    // Reuse pending OTP instead of creating a new one
    const existingOtp = await Otp.findOne({
      identifier: normalizedPhone,
      purpose: 'register',
      verified: false,
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });

    if (existingOtp) {
      await Otp.findByIdAndUpdate(
        existingOtp._id,
        {
          $set: {
            'meta.chatId': chatId.toString(),
            'meta.botType': 'teacher',
            'meta.channel': 'telegram'
          }
        },
        { new: true }
      );

      await teacherBot.sendMessage(
        chatId,
        '✅ Tasdiqlash kodi avval yuborilgan. Agar tasdiqlamasangiz, 10 soniyadan so\'ng yana yuboramiz.'
      );

      userStates.set(chatId, {
        state: 'otp_sent',
        phone: normalizedPhone,
        userId: existingState?.userId
      });

      // Schedule a single resend if user still hasn't confirmed
      scheduleOtpResend({ chatId, normalizedPhone, userId: existingState?.userId });
      return;
    }

    logger.info('Teacher bot processing phone number', {
      chatId,
      phoneNumber: normalizedPhone,
    });

    try {
      // Check if user exists with this phone number
      const user = await User.findOne({ phone: normalizedPhone });

      if (!user) {
        await teacherBot.sendMessage(
          chatId,
          '❌ Bu telefon raqam bilan ro\'yxatdan o\'tilmagan.'
        );
        userStates.delete(chatId);
        return;
      }

      // Check if user is a teacher
      if (user.role !== 'teacher') {
        await teacherBot.sendMessage(
          chatId,
          '❌ Bu bot faqat o\'qituvchilar uchun!'
        );
        userStates.delete(chatId);
        return;
      }

      await createAndSendOtp({
        chatId,
        normalizedPhone,
        userId: user._id,
        isResend: false,
        scheduleResend: true
      });
    } catch (error) {
      logger.error('Error processing teacher phone number', {
        chatId,
        error: error.message,
      });

      await teacherBot.sendMessage(
        chatId,
        '❌ Xatolik yuz berdi. Iltimos, qaytadan urinib ko\'ring yoki /start bosing.'
      );
    }
  }

  // Handle contact sharing
  teacherBot.on('contact', async (msg) => {
    if (processedMessageIds.has(msg.message_id)) {
      return;
    }
    processedMessageIds.add(msg.message_id);

    const chatId = msg.chat.id;
    const contact = msg.contact;

    if (!contact || !contact.phone_number) {
      await teacherBot.sendMessage(
        chatId,
        '❌ Telefon raqam topilmadi. Iltimos, qaytadan urinib ko\'ring.'
      );
      return;
    }

    const phoneNumber = contact.phone_number;
    await processPhoneNumber(chatId, phoneNumber);
  });

  // Handle text messages (phone numbers)
  teacherBot.on('message', async (msg) => {
    const chatId = msg.chat.id;

    // Contact messages also trigger the generic message event; dedupe them
    if (msg.contact?.phone_number) {
      if (processedMessageIds.has(msg.message_id)) {
        return;
      }
      processedMessageIds.add(msg.message_id);
      await processPhoneNumber(chatId, msg.contact.phone_number);
      return;
    }

    // Skip other commands
    if (msg.text?.startsWith('/')) {
      return;
    }

    const text = msg.text?.trim();
    const userState = userStates.get(chatId);

    // If user hasn't started, prompt them
    if (!userState) {
      await promptForContact(chatId);
      return;
    }

    // If waiting for contact
    if (userState.state === 'waiting_contact') {
      // Check if text looks like a phone number
      if (text && /[\d\s+()-]+/.test(text)) {
        // Remove all non-digit characters except +
        const cleanedPhone = text.replace(/[^\d+]/g, '');

        // Check if it's a valid phone number format
        // Accepts: +998901234567, 998901234567, 901234567, +998 90 123 45 67, etc.
        const phoneRegex = /^(\+?998)?(\d{9})$/;
        const match = cleanedPhone.match(phoneRegex);

        if (match) {
          // Extract the 9-digit number
          const phoneDigits = match[2];
          const fullPhone = `+998${phoneDigits}`;

          await teacherBot.sendMessage(
            chatId,
            `📱 Telefon raqam qabul qilindi: ${fullPhone}\n\nTekshirilmoqda...`
          );

          await processPhoneNumber(chatId, fullPhone);
        } else {
          await teacherBot.sendMessage(
            chatId,
            '❌ Noto\'g\'ri telefon raqam formati.'
          );
        }
      } else {
        await teacherBot.sendMessage(
          chatId,
          '📱 Telefon raqamingizni yuboring.'
        );
      }
    }
  });

  // Handle errors
  teacherBot.on('polling_error', (error) => {
    logger.error('Teacher bot polling error', {
      error: error.message,
      code: error.code,
    });

    // If it's a network error, stop polling to prevent spam
    if (error.code === 'EFATAL' || error.message.includes('ENOTFOUND')) {
      logger.warn('🚫 Stopping teacher bot polling due to network issues');
      teacherBot.stopPolling();
    }
  });

  logger.info('✅ Teacher Telegram Bot initialized successfully');
}

/**
 * Send OTP via Teacher Telegram Bot
 * @param {string} phoneNumber - User's phone number
 * @param {string} otp - OTP code
 * @returns {Promise<boolean>}
 */
export async function sendTeacherOtpViaTelegram(phoneNumber, otp) {
  try {
    const normalizedPhone = normalizePhone(phoneNumber);

    // Find user by phone
    const user = await User.findOne({ phone: normalizedPhone });

    if (!user) {
      logger.warn('User not found for teacher OTP', { phoneNumber: normalizedPhone });
      return false;
    }

    // Find chat ID from previous OTP records
    const previousOtp = await Otp.findOne({
      identifier: normalizedPhone,
      'meta.botType': 'teacher',
    }).sort({ createdAt: -1 });

    if (!previousOtp || !previousOtp.meta?.chatId) {
      logger.warn('No chat ID found for teacher', { phoneNumber: normalizedPhone });
      return false;
    }

    const chatId = previousOtp.meta.chatId;

    // Send OTP
    const message = `🔐 Yangi tasdiqlash kodi:

**${otp}**

⏰ Kod 30 daqiqa davomida amal qiladi.`;

    await teacherBot.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
    });

    logger.info('Teacher OTP resent via Telegram', {
      phoneNumber: normalizedPhone,
      chatId,
    });

    return true;
  } catch (error) {
    logger.error('Error sending teacher OTP via Telegram', {
      phoneNumber,
      error: error.message,
    });
    return false;
  }
}

/**
 * Send payment notification to teacher via Telegram
 * @param {string} teacherId - Teacher's ID
 * @param {string} studentName - Student's full name
 * @param {string} courseName - Course name
 * @param {number} amount - Payment amount
 * @returns {Promise<boolean>}
 */
export async function sendPaymentNotificationToTeacher(teacherId, studentName, courseName, amount) {
  try {
    if (!teacherBot) {
      logger.error('Teacher bot instance not available');
      return false;
    }

    // Find teacher by ID
    const teacher = await User.findById(teacherId);
    if (!teacher) {
      logger.warn('Teacher not found for payment notification', { teacherId });
      return false;
    }

    // Find chat ID from previous OTP records
    const previousOtp = await Otp.findOne({
      identifier: teacher.phone,
      'meta.botType': 'teacher',
    }).sort({ createdAt: -1 });

    if (!previousOtp || !previousOtp.meta?.chatId) {
      logger.warn('No chat ID found for teacher payment notification', {
        teacherId,
        phone: teacher.phone
      });
      return false;
    }

    const chatId = previousOtp.meta.chatId;

    // Create payment notification message
    const message = `💰 Yangi to'lov!

👤 **${studentName}** 
📚 **${courseName}** kursi uchun to'lov qildi

💵 Miqdor: **${amount.toLocaleString()} UZS**

📱 Dasturda ko'rib chiqing va tasdiqlang.`;

    await teacherBot.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
    });

    logger.info('Payment notification sent to teacher via Telegram', {
      teacherId,
      chatId,
      studentName,
      courseName,
      amount
    });

    return true;
  } catch (error) {
    logger.error('Error sending payment notification to teacher via Telegram', {
      teacherId,
      studentName,
      courseName,
      amount,
      error: error.message,
    });
    return false;
  }
}

export default teacherBot;
