import mongoose from "mongoose";
import { MONGODB_ATLAS_URL } from "./env.js";

async function connectToDB() {
  try {
    const conn = await mongoose.connect(MONGODB_ATLAS_URL);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(
      `An error occured from connecting to MongoDB database: ${error.message}`
    );
    throw new Error(
      `An error occured from connecting to MongoDB database: ${error.message}`
    );
  }
}

export default connectToDB;
