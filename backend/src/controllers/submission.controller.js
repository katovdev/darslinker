import Submission from "../models/submission.model.js";
import Course from "../models/course.model.js";
import logger from "../../config/logger.js";
import { catchAsync } from "../middlewares/error.middleware.js";
import { BadRequestError, ConflictError, NotFoundError } from "../utils/error.utils.js";

/**
 * Submit a lesson assignment
 * @route POST /submissions/lesson-assignment
 * @access Student
 */
export const submitLessonAssignment = catchAsync(async (req, res) => {
  const {
    courseId,
    lessonId,
    studentId,
    fileUrl,
    fileName,
    lessonTitle,
    instructions,
  } = req.body;

  logger.info('📝 Assignment submission request received', {
    courseId,
    lessonId,
    studentId,
    fileName,
  });

  // Verify the course exists
  const course = await Course.findById(courseId).populate('teacher');
  if (!course) {
    logger.error('❌ Course not found', { courseId });
    throw new NotFoundError('Course not found');
  }

  logger.info('✅ Course found', {
    courseId: course._id,
    courseTitle: course.title,
    teacherId: course.teacher?._id || course.teacher,
    teacherIdType: typeof course.teacher,
  });

  // Find the lesson within the course
  let foundLesson = null;
  for (const module of course.modules) {
    const lesson = module.lessons.find(l => l._id.toString() === lessonId);
    if (lesson) {
      foundLesson = lesson;
      break;
    }
  }

  if (!foundLesson || foundLesson.type !== 'assignment') {
    logger.error('❌ Assignment lesson not found', { lessonId, foundType: foundLesson?.type });
    throw new NotFoundError('Assignment lesson not found');
  }

  logger.info('✅ Assignment lesson found', {
    lessonId: foundLesson._id,
    lessonTitle: foundLesson.title,
    lessonType: foundLesson.type,
  });

  // Check if student already submitted this assignment
  const existingSubmission = await Submission.findOne({
    courseId,
    lessonId,
    studentId,
  });

  if (existingSubmission) {
    logger.warn('⚠️ Assignment already submitted', { submissionId: existingSubmission._id });
    throw new ConflictError('You have already submitted this assignment');
  }

  // Extract teacherId - handle both populated and non-populated cases
  const teacherId = course.teacher?._id || course.teacher;
  
  if (!teacherId) {
    logger.error('❌ Teacher ID not found in course', { courseId, teacher: course.teacher });
    throw new BadRequestError('Course does not have a valid teacher assigned');
  }

  logger.info('✅ Creating submission', {
    courseId,
    lessonId,
    studentId,
    teacherId,
    fileName,
  });

  // Create the submission
  const submission = new Submission({
    courseId,
    lessonId,
    studentId,
    teacherId,
    lessonTitle,
    instructions,
    fileUrl,
    fileName,
  });

  await submission.save();

  // Populate for response
  const populatedSubmission = await Submission.findById(submission._id)
    .populate('studentId', 'firstName lastName email')
    .populate('courseId', 'title')
    .populate('teacherId', 'firstName lastName');

  logger.info('✅ Lesson assignment submitted successfully', {
    submissionId: submission._id,
    courseId,
    lessonId,
    studentId,
    teacherId,
    fileName,
    lessonTitle,
  });

  const responseData = {
    success: true,
    message: 'Assignment submitted successfully',
    submission: populatedSubmission,
  };

  logger.info('📤 Sending response to client', {
    submissionId: submission._id,
    success: true,
  });

  res.status(201).json(responseData);
});

/**
 * Get submissions for a teacher
 * @route GET /submissions/teacher/:teacherId
 * @access Teacher
 */
export const getTeacherSubmissions = catchAsync(async (req, res) => {
  const { teacherId } = req.params;
  const { status, courseId, page = 1, limit = 20 } = req.query;

  logger.info('📚 Fetching teacher submissions', {
    teacherId,
    status,
    courseId,
    page,
    limit,
  });

  const filter = { teacherId };
  if (status) filter.status = status;
  if (courseId) filter.courseId = courseId;

  logger.info('🔍 Query filter:', filter);

  const skip = (page - 1) * limit;

  const submissions = await Submission.find(filter)
    .populate('studentId', 'firstName lastName email')
    .populate('courseId', 'title')
    .sort({ submittedAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Submission.countDocuments(filter);

  logger.info('✅ Teacher submissions retrieved', {
    teacherId,
    count: submissions.length,
    total,
    page,
    submissionIds: submissions.map(s => s._id),
  });

  res.status(200).json({
    success: true,
    submissions,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

/**
 * Grade a submission
 * @route PATCH /submissions/:id/grade
 * @access Teacher
 */
export const gradeSubmission = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { grade, feedback } = req.body;

  const submission = await Submission.findById(id);
  if (!submission) {
    throw new NotFoundError('Submission not found');
  }

  submission.grade = grade;
  submission.feedback = feedback;
  submission.status = 'graded';

  await submission.save();

  const populatedSubmission = await Submission.findById(submission._id)
    .populate('studentId', 'firstName lastName email')
    .populate('courseId', 'title');

  logger.info('Submission graded', {
    submissionId: id,
    grade,
    feedback: feedback ? 'provided' : 'none',
  });

  res.status(200).json({
    success: true,
    message: 'Submission graded successfully',
    submission: populatedSubmission,
  });
});

/**
 * Get student's submission for a specific lesson
 * @route GET /submissions/student/:studentId/lesson/:lessonId
 * @access Student/Teacher
 */
export const getStudentSubmission = catchAsync(async (req, res) => {
  const { studentId, lessonId } = req.params;

  const submission = await Submission.findOne({
    studentId,
    lessonId,
  })
    .populate('courseId', 'title')
    .populate('teacherId', 'firstName lastName');

  res.status(200).json({
    success: true,
    submission,
  });
});