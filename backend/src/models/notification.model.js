import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'userType'
    },
    userType: {
      type: String,
      required: true,
      enum: ['Student', 'Teacher']
    },
    type: {
      type: String,
      required: true,
      enum: ['assignment_graded', 'course_update', 'new_assignment', 'general']
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    link: {
      type: String
    },
    read: {
      type: Boolean,
      default: false
    },
    metadata: {
      assignmentId: mongoose.Schema.Types.ObjectId,
      courseId: mongoose.Schema.Types.ObjectId,
      lessonId: mongoose.Schema.Types.ObjectId,
      grade: Number
    }
  },
  {
    timestamps: true
  }
);

notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
