import express from 'express';
import { handleWebhookUpdate } from '../services/telegram-webhook.service.js';
import logger from '../../config/logger.js';

const router = express.Router();

/**
 * Telegram webhook endpoint
 * @route POST /telegram/webhook
 * @access Public (Telegram only)
 */
router.post('/webhook', async (req, res) => {
  try {
    const update = req.body;
    
    logger.info('📥 Webhook update received:', {
      updateId: update.update_id,
      hasMessage: !!update.message
    });

    // Handle update asynchronously
    handleWebhookUpdate(update).catch(error => {
      logger.error('❌ Error in webhook handler:', error);
    });

    // Respond immediately to Telegram
    res.status(200).json({ ok: true });
  } catch (error) {
    logger.error('❌ Webhook error:', error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

export default router;
