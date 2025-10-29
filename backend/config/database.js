import mongoose from "mongoose";
import logger from "./logger.js";

import { MONGODB_ATLAS_URL, NODE_ENV } from "./env.js";

/**
 * Connect to MongoDB database with error handling
 * Handles connection, errors, and disconnection events
 */
const connectToDB = async () => {
  try {
    const options = {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    const conn = await mongoose.connect(MONGODB_ATLAS_URL, options);

    logger.info("MongoDB connected", {
      host: conn.connection.host,
      database: conn.connection.name,
    });

    mongoose.connection.on("connected", () => {
      logger.info("Mongoose reconnected to MongoDB");
    });

    mongoose.connection.on("error", (err) => {
      logger.error("MongoDB connection error", {
        message: err.message,
      });
    });

    mongoose.connection.on("disconnected", () => {
      logger.warn("MongoDB disconnected. Attempting to reconnect...");
    });
  } catch (error) {
    logger.error("Failed to connect to MongoDB", {
      message: error.message,
      stack: error.stack,
    });
    process.exit(1);
  }
};

export default connectToDB;
