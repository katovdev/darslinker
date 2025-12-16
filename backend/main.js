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
    // Local development
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:3000',
    'http://localhost:3001', // Moderator port
    'http://localhost:8001', // Backend port for local development
    
    // Production domains
    'http://darslinker.uz', // Main domain (HTTP)
    'https://darslinker.uz', // Main domain (HTTPS)
    'http://www.darslinker.uz', // WWW version (HTTP)
    'https://www.darslinker.uz', // WWW version (HTTPS)
    
    // Moderator subdomains
    'http://moderator.darslinker.uz', // Moderator subdomain (HTTP)
    'https://moderator.darslinker.uz', // Moderator subdomain (HTTPS)
    'http://admin.darslinker.uz', // Admin subdomain (HTTP)
    'https://admin.darslinker.uz', // Admin subdomain (HTTPS)
    
    // Vercel deployments
    'https://darslinker-azio.vercel.app', // Frontend
    'https://darslinker-4n3z.vercel.app', // Moderator (old)
    
    // Netlify deployments
    'https://bucolic-fairy-0e50d6.netlify.app', // Old frontend
    'https://heartfelt-centaur-5fc321.netlify.app' // Moderator (new)
  ];
  
  const origin = req.headers.origin;
  
  console.log('🌐 CORS Request:', {
    method: req.method,
    path: req.path,
    origin: origin,
    allowed: allowedOrigins.includes(origin),
    userAgent: req.headers['user-agent']?.substring(0, 50)
  });
  
  // Always set CORS headers for allowed origins
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    console.log('✅ Allowed origin:', origin);
  } else {
    // For development, allow any localhost origin
    if (origin && (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
      res.header('Access-Control-Allow-Origin', origin);
      console.log('🔧 Allowing localhost origin:', origin);
    } 
    // Allow any vercel.app domain
    else if (origin && origin.includes('vercel.app')) {
      res.header('Access-Control-Allow-Origin', origin);
      console.log('🔧 Allowing vercel.app origin:', origin);
    } 
    // Allow any darslinker.uz subdomain
    else if (origin && (origin.includes('darslinker.uz') || origin.endsWith('.darslinker.uz'))) {
      res.header('Access-Control-Allow-Origin', origin);
      console.log('🔧 Allowing darslinker.uz origin:', origin);
    } 
    // Allow netlify domains
    else if (origin && origin.includes('netlify.app')) {
      res.header('Access-Control-Allow-Origin', origin);
      console.log('🔧 Allowing netlify.app origin:', origin);
    } 
    // Fallback: allow the request anyway but log it
    else {
      res.header('Access-Control-Allow-Origin', origin || '*');
      console.log('⚠️ Allowing unknown origin:', origin);
    }
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400'); // 24 hours

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log('✅ Handling OPTIONS preflight request for:', req.path);
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
