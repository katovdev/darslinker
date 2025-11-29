import axios from 'axios';
import logger from '../../config/logger.js';
import Verification from '../models/verification.model.js';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

let isPolling = false;
let lastUpdateId = 0;

// Store user chat IDs temporarily (in production, use database)
const userChatIds = new Map(); // phone -> chatId

/**
 * Start Telegram bot polling
 */
export async function startTelegramBot() {
  if (isPolling) {
    logger.info('Telegram bot is already running');
    return;
  }

  try {
    // Get bot info
    const botInfo = await axios.get(`${TELEGRAM_API_URL}/getMe`);
    logger.info('🤖 Telegram bot started:', {
      username: botInfo.data.result.username,
      firstName: botInfo.data.result.first_name
    });

    isPolling = true;
    pollUpdates();
  } catch (error) {
    logger.error('❌ Failed to start Telegram bot:', error.message);
  }
}

/**
 * Stop Telegram bot polling
 */
export function stopTelegramBot() {
  isPolling = false;
  logger.info('🛑 Telegram bot stopped');
}

/**
 * Poll for updates from Telegram
 */
async function pollUpdates() {
  while (isPolling) {
    try {
      const response = await axios.get(`${TELEGRAM_API_URL}/getUpdates`, {
        params: {
          offset: lastUpdateId + 1,
          timeout: 30
        }
      });

      const updates = response.data.result;

      for (const update of updates) {
        lastUpdateId = update.update_id;
        await handleUpdate(update);
      }
    } catch (error) {
      // Ignore timeout and conflict errors (they're normal for long polling)
      const errorMessage = error.message || String(error);
      const statusCode = error.response?.status;
      
      if (
        error.code !== 'ETIMEDOUT' && 
        error.code !== 'ECONNABORTED' && 
        statusCode !== 409 && // Conflict - another instance is polling
        !errorMessage.includes('409')
      ) {
        logger.error('❌ Error polling updates:', errorMessage);
      }
      
      // Wait longer on conflict errors
      const waitTime = statusCode === 409 ? 5000 : 1000;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
}

/**
 * Handle incoming update from Telegram
 */
async function handleUpdate(update) {
  try {
    if (update.message) {
      const message = update.message;
      const chatId = message.chat.id;
      const text = message.text;
      const userId = message.from.id;

      logger.info('📨 Received message:', {
        chatId,
        userId,
        text,
        from: message.from.first_name
      });

      // Handle contact sharing
      if (message.contact) {
        const phoneNumber = message.contact.phone_number;
        const firstName = message.contact.first_name || message.from.first_name;
        
        logger.info('📱 Contact received:', {
          chatId,
          phoneNumber,
          firstName
        });

        // Normalize phone number
        let normalizedPhone = phoneNumber;
        if (!normalizedPhone.startsWith('+')) {
          normalizedPhone = '+' + normalizedPhone;
        }

        // Find verification code for this phone
        const verification = await Verification.findOne({
          phone: normalizedPhone,
          verified: false,
          expiresAt: { $gt: new Date() }
        }).sort({ createdAt: -1 });

        if (verification) {
          // Store chat ID for this phone (both in memory and database)
          userChatIds.set(normalizedPhone, chatId);
          verification.chatId = chatId.toString();
          await verification.save();
          
          // Send verification code immediately
          const code = verification.codeText;
          const firstName = verification.firstName || message.from.first_name;
          
          logger.info('📋 Verification found:', { 
            phone: normalizedPhone, 
            hasCode: !!code,
            codeText: code,
            codeSent: verification.codeSent 
          });
          
          if (code) {
            const codeMessage = `
🔐 *Tasdiqlash kodi*

Salom ${firstName}! 👋

Sizning tasdiqlash kodingiz: *${code}*

Bu kod 30 daqiqa davomida amal qiladi.

Agar siz bu kodni so'ramagan bo'lsangiz, bu xabarni e'tiborsiz qoldiring.

_DarsLinker jamoasi_ 📚
            `.trim();

            await sendMessage(chatId, codeMessage, {
              reply_markup: {
                remove_keyboard: true
              }
            });
            
            // Mark as sent
            verification.codeSent = true;
            await verification.save();
            
            logger.info('✅ Verification code sent via contact:', { phone: normalizedPhone, chatId, code });
          } else {
            logger.error('❌ No codeText in verification:', { 
              phone: normalizedPhone,
              verificationId: verification._id 
            });
            
            await sendMessage(chatId, `
❌ *Xatolik yuz berdi*

Iltimos, veb-saytda qaytadan ro'yxatdan o'tishni boshlang.
            `.trim());
          }
          
          return;
        } else {
          await sendMessage(chatId, `
❌ *Telefon raqam topilmadi*

Iltimos, avval veb-saytda ro'yxatdan o'tishni boshlang:
👉 https://darslinker.uz

Keyin bu botga qaytib keling.
          `.trim());
        }
        return;
      }

      // Handle /start command
      if (text === '/start') {
        await sendMessageWithButton(chatId, `
🎓 *@darslinker.uz ning rasmiy botiga xush kelibsiz!*

Ro'yxatdan o'tish uchun tasdiqlash kodini olish uchun quyidagi tugmani bosing.
        `.trim());
        return;
      }

      // Handle phone number (text format)
      if (text && text.startsWith('+998')) {
        const phone = text.trim();
        
        // Find verification code for this phone
        const verification = await Verification.findOne({
          phone,
          verified: false,
          expiresAt: { $gt: new Date() }
        }).sort({ createdAt: -1 });

        if (verification) {
          // Store chat ID for this phone
          userChatIds.set(phone, chatId);
          
          await sendMessage(chatId, `
✅ *Telefon raqam topildi!*

Sizning tasdiqlash kodingiz keyingi xabarda yuboriladi.

Agar kod kelmasa, iltimos, ro'yxatdan o'tish jarayonini qaytadan boshlang.
          `.trim());
          
          logger.info('📱 Phone number registered:', { phone, chatId });
        } else {
          await sendMessage(chatId, `
❌ *Telefon raqam topilmadi*

Iltimos, avval veb-saytda ro'yxatdan o'tishni boshlang, keyin bu yerga telefon raqamingizni yuboring.
          `.trim());
        }
        return;
      }

      // Default response
      await sendMessage(chatId, `
ℹ️ *Yordam*

Ro'yxatdan o'tish uchun:
1. Veb-saytda ro'yxatdan o'tishni boshlang
2. Bu botga telefon raqamingizni yuboring (+998 bilan)
3. Tasdiqlash kodini oling

Savol bo'lsa: @darslinker_support
      `.trim());
    }
  } catch (error) {
    logger.error('❌ Error handling update:', error);
  }
}

/**
 * Send message to Telegram chat
 */
async function sendMessage(chatId, text, options = {}) {
  try {
    await axios.post(`${TELEGRAM_API_URL}/sendMessage`, {
      chat_id: chatId,
      text,
      parse_mode: 'Markdown',
      ...options
    });
    
    logger.info('✅ Message sent to chat:', { chatId });
  } catch (error) {
    logger.error('❌ Error sending message:', {
      chatId,
      error: error.response?.data || error.message
    });
  }
}

/**
 * Send message with contact request button
 */
async function sendMessageWithButton(chatId, text) {
  try {
    await axios.post(`${TELEGRAM_API_URL}/sendMessage`, {
      chat_id: chatId,
      text,
      parse_mode: 'Markdown',
      reply_markup: {
        keyboard: [
          [
            {
              text: '📱 Kontaktni yuborish',
              request_contact: true
            }
          ]
        ],
        resize_keyboard: true,
        one_time_keyboard: true
      }
    });
    
    logger.info('✅ Message with button sent to chat:', { chatId });
  } catch (error) {
    logger.error('❌ Error sending message with button:', {
      chatId,
      error: error.response?.data || error.message
    });
  }
}

/**
 * Send verification code to user
 */
export async function sendVerificationCode(phone, code, firstName) {
  try {
    // Try to get chatId from memory first
    let chatId = userChatIds.get(phone);
    
    // If not in memory, try to get from database
    if (!chatId) {
      const verification = await Verification.findOne({
        phone,
        verified: false,
        expiresAt: { $gt: new Date() }
      }).sort({ createdAt: -1 });
      
      if (verification && verification.chatId) {
        chatId = verification.chatId;
        userChatIds.set(phone, chatId); // Cache it
        logger.info('📋 Chat ID found in database:', { phone, chatId });
      }
    }
    
    if (!chatId) {
      logger.warn('⚠️ Chat ID not found for phone:', { phone });
      return false;
    }

    const message = `
🔐 *Tasdiqlash kodi*

Salom ${firstName}! 👋

Sizning tasdiqlash kodingiz: *${code}*

Bu kod 30 daqiqa davomida amal qiladi.

Agar siz bu kodni so'ramagan bo'lsangiz, bu xabarni e'tiborsiz qoldiring.

_DarsLinker jamoasi_ 📚
    `.trim();

    await sendMessage(chatId, message, {
      reply_markup: {
        remove_keyboard: true
      }
    });
    
    logger.info('✅ Verification code sent:', { phone, chatId });
    return true;
  } catch (error) {
    logger.error('❌ Error sending verification code:', error);
    return false;
  }
}

export default {
  startTelegramBot,
  stopTelegramBot,
  sendVerificationCode
};
