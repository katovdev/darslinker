import mongoose from "mongoose";

const adviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: function(v) {
          return /^\+998 [0-9]{2} [0-9]{3} [0-9]{2} [0-9]{2}$/.test(v);
        },
        message: 'Telefon raqami formati noto\'g\'ri!'
      }
    },
    comment: {
      type: String,
      trim: true,
      default: null
    },
    status: {
      type: String,
      enum: ['pending', 'contacted', 'resolved'],
      default: 'pending'
    }
  },
  {
    timestamps: true
  }
);

// Index for better performance
adviceSchema.index({ status: 1 });
adviceSchema.index({ createdAt: -1 });
adviceSchema.index({ name: 'text', phone: 'text', comment: 'text' });

const Advice = mongoose.model("Advice", adviceSchema);

export default Advice;