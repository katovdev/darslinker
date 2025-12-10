import axios from 'axios';

const TEACHER_BOT_TOKEN = '8529221614:AAGx_XYo4x6J6Z8qAiIA2QFaazPMrYg6SLc';

async function clearWebhook() {
  try {
    console.log('🔄 Clearing teacher bot webhook...');
    
    // Delete webhook
    const deleteResponse = await axios.post(
      `https://api.telegram.org/bot${TEACHER_BOT_TOKEN}/deleteWebhook`,
      { drop_pending_updates: true }
    );
    
    console.log('✅ Webhook deleted:', deleteResponse.data);
    
    // Get webhook info to verify
    const infoResponse = await axios.get(
      `https://api.telegram.org/bot${TEACHER_BOT_TOKEN}/getWebhookInfo`
    );
    
    console.log('📡 Current webhook info:', infoResponse.data);
    
    if (!infoResponse.data.result.url) {
      console.log('✅ Webhook successfully cleared! Bot can now use polling.');
    } else {
      console.log('⚠️ Webhook still exists:', infoResponse.data.result.url);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

clearWebhook();
