import axios from 'axios';
import logger from '../../config/logger.js';
import Verification from '../models/verification.model.js';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;
const BACKEND_URL = process.env.BACKEND_URL || 'https://darslinker-backend.onrender.com';

/**
 * Set webhook for Telegram bot
 */
export async function setWebhook() {
  try {
    const webhookUrl = `${BACKEND_URL}/api/telegram/webhook`;
    
    const response = await axios.post(`${TELEGRAM_API_URL}/setWebhook`, {
      url: webhookUrl,
      allowed_updates: ['message']
    });

    if (response.data.ok) {
      logger.info('✅ Telegram webhook set successfully:', { webhookUrl });
      return true;
    } else {
      logger.error('❌ Failed to set webhook:', response.data);
      return false;
    }
  } catch (error) {
    logger.error('❌ Error setting webhook:', error.message);
    return false;
  }
}

/**
 * Delete webhook
 */
export async function deleteWebhook() {
  try {
    const response = await axios.post(`${TELEGRAM_API_URL}/deleteWebhook`);
    
    if (response.data.ok) {
      logger.info('✅ Telegram webhook deleted');
      return true;
    }
    return false;
  } catch (error) {
    logger.error('❌ Error deleting webhook:', error.message);
    return false;
  }
}

/**
 * Get webhook info
 */
export async function getWebhookInfo() {
  try {
    const response = await axios.get(`${TELEGRAM_API_URL}/getWebhookInfo`);
    return response.data.result;
  } catch (error) {
    logger.error('❌ Error getting webhook info:', error.message);
    return null;
  }
}

/**
 * Handle webhook update
 */
export async function handleWebhookUpdate(update) {
  try {
    if (update.message) {
      const message = update.message;
      const chatId = message.chat.id;
      const text = message.text;

      logger.info('📨 Webhook message received:', {
        chatId,
        text,
        from: message.from.first_name
      });

      // Handle contact sharing
      if (message.contact) {
        const phoneNumber = message.contact.phone_number;
        const firstName = message.contact.first_name || message.from.first_name;
        
        logger.info('📱 Contact received via webhook:', {
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
          const code = verification.codeText;
          const firstName = verification.firstName || message.from.first_name;
          
          logger.info('📋 Verification found via webhook:', { 
            phone: normalizedPhone, 
            hasCode: !!code,
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
            
            logger.info('✅ Verification code sent via webhook:', { phone: normalizedPhone, chatId });
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
        
        const verification = await Verification.findOne({
          phone,
          verified: false,
          expiresAt: { $gt: new Date() }
        }).sort({ createdAt: -1 });

        if (verification && verification.codeText) {
          const code = verification.codeText;
          const firstName = verification.firstName || message.from.first_name;
          
          const codeMessage = `
🔐 *Tasdiqlash kodi*

Salom ${firstName}! 👋

Sizning tasdiqlash kodingiz: *${code}*

Bu kod 30 daqiqa davomida amal qiladi.

_DarsLinker jamoasi_ 📚
          `.trim();

          await sendMessage(chatId, codeMessage);
          
          verification.codeSent = true;
          await verification.save();
          
          logger.info('✅ Code sent via phone text:', { phone, chatId });
        } else {
          await sendMessage(chatId, `
❌ *Telefon raqam topilmadi*

Iltimos, avval veb-saytda ro'yxatdan o'tishni boshlang.
          `.trim());
        }
        return;
      }

      // Default response
      await sendMessage(chatId, `
ℹ️ *Yordam*

Ro'yxatdan o'tish uchun:
1. Veb-saytda ro'yxatdan o'tishni boshlang
2. Bu botga telefon raqamingizni yuboring yoki kontaktni ulashing
3. Tasdiqlash kodini oling

Savol bo'lsa: @darslinker_support
      `.trim());
    }
  } catch (error) {
    logger.error('❌ Error handling webhook update:', error);
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

export default {
  setWebhook,
  deleteWebhook,
  getWebhookInfo,
  handleWebhookUpdate
};
