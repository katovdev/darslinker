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

connectToDB();

const app = express();

// CORS middleware
app.use((req, res, next) => {
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://bucolic-fairy-0e50d6.netlify.app'
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
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
