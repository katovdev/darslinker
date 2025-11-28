import mongoose from 'mongoose';

const verificationSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: true,
      index: true
    },
    code: {
      type: String,
      required: true
    },
    codeText: {
      type: String, // Store unhashed code temporarily for Telegram sending
      required: false
    },
    firstName: {
      type: String,
      default: ''
    },
    lastName: {
      type: String,
      default: ''
    },
    attempts: {
      type: Number,
      default: 0
    },
    verified: {
      type: Boolean,
      default: false
    },
    codeSent: {
      type: Boolean,
      default: false
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 } // TTL index - automatically delete after expiration
    }
  },
  {
    timestamps: true
  }
);

// Index for faster queries
verificationSchema.index({ phone: 1, verified: 1 });
verificationSchema.index({ expiresAt: 1 });

const Verification = mongoose.model('Verification', verificationSchema);

export default Verification;
