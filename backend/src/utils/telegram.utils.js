import axios from 'axios';
import logger from '../../config/logger.js';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_BOT_USERNAME = process.env.TELEGRAM_BOT_USERNAME;
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

/**
 * Send verification code to user via Telegram
 * @param {string} phone - User's phone number
 * @param {string} code - Verification code
 * @param {string} firstName - User's first name
 * @returns {Promise<boolean>}
 */
export async function sendVerificationCodeViaTelegram(phone, code, firstName = '') {
  try {
    logger.info('📱 Verification code prepared for Telegram', {
      phone,
      firstName,
      code,
      botUsername: TELEGRAM_BOT_USERNAME
    });

    // Import bot service dynamically to avoid circular dependency
    const { sendVerificationCode } = await import('../services/telegram-bot.service.js');
    
    // Try to send via bot service
    const sent = await sendVerificationCode(phone, code, firstName);
    
    if (sent) {
      logger.info('✅ Verification code sent via Telegram bot');
      return true;
    } else {
      logger.warn('⚠️ Could not send via bot - user needs to start bot first');
      return true; // Return true anyway, user will get code when they start bot
    }
  } catch (error) {
    logger.error('❌ Error sending Telegram message:', error);
    return true; // Return true to not block registration
  }
}

/**
 * Send message to Telegram chat
 * @param {string} chatId - Telegram chat ID
 * @param {string} message - Message text
 * @param {object} options - Additional options
 * @returns {Promise<object>}
 */
export async function sendTelegramMessage(chatId, message, options = {}) {
  try {
    const response = await axios.post(`${TELEGRAM_API_URL}/sendMessage`, {
      chat_id: chatId,
      text: message,
      parse_mode: options.parseMode || 'Markdown',
      ...options
    });

    logger.info('✅ Telegram message sent successfully', {
      chatId,
      messageId: response.data.result.message_id
    });

    return {
      success: true,
      data: response.data.result
    };
  } catch (error) {
    logger.error('❌ Error sending Telegram message:', {
      chatId,
      error: error.response?.data || error.message
    });

    return {
      success: false,
      error: error.response?.data || error.message
    };
  }
}

/**
 * Get bot info
 * @returns {Promise<object>}
 */
export async function getBotInfo() {
  try {
    const response = await axios.get(`${TELEGRAM_API_URL}/getMe`);
    return {
      success: true,
      data: response.data.result
    };
  } catch (error) {
    logger.error('❌ Error getting bot info:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Generate deep link for Telegram bot
 * @param {string} payload - Payload data (e.g., verification code)
 * @returns {string}
 */
export function generateTelegramDeepLink(payload) {
  return `https://t.me/${TELEGRAM_BOT_USERNAME}?start=${payload}`;
}

export default {
  sendVerificationCodeViaTelegram,
  sendTelegramMessage,
  getBotInfo,
  generateTelegramDeepLink
};
