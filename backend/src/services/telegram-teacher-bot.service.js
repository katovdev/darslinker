import TelegramBot from 'node-telegram-bot-api';
import logger from '../../config/logger.js';
import User from '../models/user.model.js';
import Otp from '../models/otp.model.js';
import { normalizePhone } from '../utils/normalize.utils.js';
import { generateOtp } from '../utils/generate_otp.utils.js';
import bcrypt from 'bcrypt';
import { BCRYPT_SALT_ROUNDS, HASH_OTP, OTP_EXPIRES_SECONDS, OTP_LENGTH } from '../../config/env.js';

// Bot token
const TEACHER_BOT_TOKEN = '8529221614:AAGx_XYo4x6J6Z8qAiIA2QFaazPMrYg6SLc';

// Create bot instance
const teacherBot = new TelegramBot(TEACHER_BOT_TOKEN, { polling: true });

// Store user states (in-memory, you can use Redis for production)
const userStates = new Map();

/**
 * Initialize Teacher Telegram Bot
 */
export function initTeacherBot() {
  logger.info('🤖 Teacher Telegram Bot starting...');

  // Handle /start command
  teacherBot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const firstName = msg.from.first_name || 'Foydalanuvchi';

    logger.info('Teacher bot /start command received', {
      chatId,
      username: msg.from.username,
      firstName,
    });

    // Send welcome message with contact request button
    const welcomeMessage = `@darslinker ning rasmiy botiga xush kelibsiz!

Ro'yxatdan o'tish uchun kontaktingizni yuboring.`;

    const keyboard = {
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

    try {
      await teacherBot.sendMessage(chatId, welcomeMessage, {
        parse_mode: 'Markdown',
        reply_markup: keyboard,
      });

      // Set user state to waiting for contact
      userStates.set(chatId, { state: 'waiting_contact' });
    } catch (error) {
      logger.error('Error sending welcome message', {
        chatId,
        error: error.message,
      });
    }
  });

  // Helper function to process phone number and send OTP
  async function processPhoneNumber(chatId, phoneNumber) {
    const normalizedPhone = normalizePhone(phoneNumber);

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

      // Generate OTP
      const otp = generateOtp(parseInt(OTP_LENGTH || '6', 10));
      const expiresInSeconds = parseInt(OTP_EXPIRES_SECONDS || '1800', 10);
      const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);

      // Hash OTP if needed
      let otpToStore = otp;
      if (HASH_OTP !== 'false') {
        otpToStore = await bcrypt.hash(
          otp,
          parseInt(BCRYPT_SALT_ROUNDS || '10', 10)
        );
      }

      // Save OTP to database
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

      // Send OTP to user
      const otpMessage = `Tasdiqlash kodi: ${otp}`;

      await teacherBot.sendMessage(chatId, otpMessage);

      logger.info('Teacher OTP sent successfully', {
        chatId,
        phoneNumber: normalizedPhone,
        userId: user._id,
      });

      // Update user state
      userStates.set(chatId, {
        state: 'otp_sent',
        phone: normalizedPhone,
        userId: user._id,
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
    // Skip if it's a command or contact
    if (msg.text?.startsWith('/') || msg.contact) {
      return;
    }

    const chatId = msg.chat.id;
    const text = msg.text?.trim();
    const userState = userStates.get(chatId);

    // If user hasn't started, prompt them
    if (!userState) {
      await teacherBot.sendMessage(
        chatId,
        'Iltimos, avval /start bosing.'
      );
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

export default teacherBot;
