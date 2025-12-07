import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  lessonId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true,
  },
  lessonTitle: {
    type: String,
    required: true,
  },
  instructions: {
    type: String,
  },
  fileUrl: {
    type: String,
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  grade: {
    type: Number,
    min: 0,
  },
  feedback: {
    type: String,
  },
  status: {
    type: String,
    enum: ['submitted', 'graded'],
    default: 'submitted',
  },
}, {
  timestamps: true,
});

// Index for faster queries
submissionSchema.index({ courseId: 1, lessonId: 1, studentId: 1 });
submissionSchema.index({ teacherId: 1, status: 1 });

const Submission = mongoose.model('Submission', submissionSchema);

export default Submission;