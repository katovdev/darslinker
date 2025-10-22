import dotenv from "dotenv";

dotenv.config();

export const { PORT, MONGODB_ATLAS_URL } = process.env;
