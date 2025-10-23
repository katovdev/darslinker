import dotenv from "dotenv";

dotenv.config();

export const {
  PORT,
  MONGODB_ATLAS_URL,
  NODEMAILER_USER_EMAIL,
  NODEMAILER_USER_PASSWORD,
  OTP_LENGTH,
  OTP_EXPIRES_SECONDS,
  OTP_MAX_ATTEMPTS,
  HASH_OTP,
  BCRYPT_SALT_ROUNDS,
} = process.env;
