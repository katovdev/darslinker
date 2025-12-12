import express from "express";

import swaggerDocs from "./config/swagger.js";
import connectToDB from "./config/database.js";
import mainRouter from "./src/routes/index.js";

import { NODE_ENV, PORT } from "./config/env.js";
import {
  globalErrorHandler,
  notFoundHandler,
} from "./src/middlewares/error.middleware.js";

import logger from "./config/logger.js";
import { setWebhook, getWebhookInfo } from "./src/services/telegram-webhook.service.js";

connectToDB();

// Setup Student Telegram bot - use webhook or polling based on USE_WEBHOOK env variable
if (process.env.TELEGRAM_BOT_TOKEN) {
  const useWebhook = process.env.USE_WEBHOOK === 'true';
  
  if (useWebhook) {
    // Use webhook (for production/deployed servers)
    setTimeout(async () => {
      const webhookInfo = await getWebhookInfo();
      logger.info('📡 Current webhook info:', webhookInfo);
      
      const success = await setWebhook();
      if (success) {
        logger.info('✅ Student Telegram webhook configured successfully');
      } else {
        logger.error('❌ Failed to configure Student Telegram webhook');
      }
    }, 3000);
  } else {
    // Use polling (for local development)
    const { startTelegramBot } = await import("./src/services/telegram-bot.service.js");
    startTelegramBot();
    logger.info('🤖 Student Telegram bot polling started (local development)');
  }
} else {
  logger.warn('⚠️ Student Telegram bot token not found. Bot will not start.');
}

// Setup Teacher Telegram bot (always use polling for now)
try {
  const { initTeacherBot } = await import("./src/services/telegram-teacher-bot.service.js");
  initTeacherBot();
  logger.info('🎓 Teacher Telegram bot started successfully');
} catch (error) {
  logger.error('❌ Failed to start Teacher Telegram bot:', error.message);
  logger.warn('⚠️ Server will continue without Teacher Telegram bot');
}

const app = express();

// CORS middleware - must be before other middleware
app.use((req, res, next) => {
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:3000',
    'https://bucolic-fairy-0e50d6.netlify.app'
  ];
  
  const origin = req.headers.origin;
  
  console.log('🌐 CORS Request:', {
    method: req.method,
    path: req.path,
    origin: origin,
    allowed: allowedOrigins.includes(origin)
  });
  
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400'); // 24 hours

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log('✅ Handling OPTIONS preflight request');
    return res.status(200).end();
  }
  
  next();
});

app.use(express.json());

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Dars Linker API is running',
    version: '1.0.0',
    endpoints: {
      api: '/api',
      docs: '/api-docs',
      health: '/health'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.use("/api", mainRouter);

swaggerDocs(app);

app.use(notFoundHandler);
app.use(globalErrorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server started successfully on port ${PORT}`);
  console.log(`📚 Swagger URL: http://localhost:${PORT}/api-docs`);
  console.log(`🔧 Environment: ${NODE_ENV || "development"}`);

  logger.info(`Server started successfully on port ${PORT}`, {
    environment: NODE_ENV,
  });
});
