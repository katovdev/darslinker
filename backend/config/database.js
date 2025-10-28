import mongoose from "mongoose";
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

    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);

    mongoose.connection.on("connected", () => {
      if (NODE_ENV === "development") {
        console.log("🔗 Mongoose connected to MongoDB");
      }
    });

    mongoose.connection.on("error", (err) => {
      console.error(`❌ MongoDB connection error: ${err.message}`);
      if (NODE_ENV === "development") {
        console.error("Error details:", err);
      }
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️  MongoDB disconnected. Attempting to reconnect...");
    });

    process.on("SIGINT", async () => {
      try {
        await mongoose.connection.close();
        console.log("🔌 MongoDB connection closed through app termination");
        process.exit(0);
      } catch (err) {
        console.error("❌ Error closing MongoDB connection:", err.message);
        process.exit(1);
      }
    });
  } catch (error) {
    console.error("❌ Failed to connect to MongoDB");
    console.error(`Error: ${error.message}`);

    if (NODE_ENV === "development") {
      console.error("Full error details:", error);
    }

    console.error("🚫 Server cannot start without database connection");
    process.exit(1);
  }
};

export default connectToDB;
