import Landing from "../models/landing.model.js";
import User from "../models/user.model.js";
import Course from "../models/course.model.js";
import logger from "../../config/logger.js";
import { catchAsync } from "../middlewares/error.middleware.js";
import { BadRequestError, NotFoundError } from "../utils/error.utils.js";

/**
 * Get or create landing page settings for teacher
 * @route GET /landing/:teacherId
 * @access Public
 */
const getLandingSettings = catchAsync(async (req, res) => {
  const { teacherId } = req.params;

  // Find teacher
  const teacher = await User.findById(teacherId);
  if (!teacher || teacher.role !== 'teacher') {
    throw new NotFoundError('Teacher not found');
  }

  // Find or create landing settings
  let landing = await Landing.findOne({ teacher: teacherId });
  
  if (!landing) {
    landing = await Landing.create({
      teacher: teacherId,
      title: `${teacher.firstName} ${teacher.lastName}'s Courses`,
      subtitle: teacher.specialization || 'Expert Instructor',
      aboutText: teacher.bio || ''
    });
  }

  res.status(200).json({
    success: true,
    landing,
    teacher: {
      _id: teacher._id,
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      email: teacher.email,
      specialization: teacher.specialization,
      bio: teacher.bio,
      profileImage: teacher.profileImage,
      city: teacher.city,
      country: teacher.country,
      ratingAverage: teacher.ratingAverage,
      reviewsCount: teacher.reviewsCount
    }
  });
});

/**
 * Update landing page settings
 * @route PUT /landing/:teacherId
 * @access Private (Teacher only)
 */
const updateLandingSettings = catchAsync(async (req, res) => {
  const { teacherId } = req.params;
  const updateData = req.body;

  // Check if user is the teacher or admin
  if (req.user._id.toString() !== teacherId && req.user.role !== 'admin') {
    throw new BadRequestError('You can only update your own landing page');
  }

  // Find or create landing settings
  let landing = await Landing.findOne({ teacher: teacherId });
  
  if (!landing) {
    landing = await Landing.create({
      teacher: teacherId,
      ...updateData
    });
  } else {
    landing = await Landing.findOneAndUpdate(
      { teacher: teacherId },
      { $set: updateData },
      { new: true, runValidators: true }
    );
  }

  logger.info('Landing page settings updated', {
    teacherId,
    updatedFields: Object.keys(updateData)
  });

  res.status(200).json({
    success: true,
    message: 'Landing page settings updated successfully',
    landing
  });
});

/**
 * Get public landing page data
 * @route GET /landing/public/:teacherId
 * @access Public
 */
const getPublicLandingPage = catchAsync(async (req, res) => {
  const { teacherId } = req.params;

  // Find teacher
  const teacher = await User.findById(teacherId);
  if (!teacher || teacher.role !== 'teacher') {
    throw new NotFoundError('Teacher not found');
  }

  // Find landing settings
  let landing = await Landing.findOne({ teacher: teacherId });
  
  if (!landing) {
    landing = {
      title: `${teacher.firstName} ${teacher.lastName}'s Courses`,
      subtitle: teacher.specialization || 'Expert Instructor',
      description: 'Discover amazing courses and start your learning journey today.',
      primaryColor: '#7ea2d4',
      backgroundColor: '#1a1a1a',
      textColor: '#ffffff',
      showCourses: true,
      showAbout: true,
      aboutText: teacher.bio || '',
      socialLinks: {
        telegram: teacher.telegramUsername || '',
        instagram: '',
        youtube: '',
        linkedin: ''
      }
    };
  }

  // Get teacher's active courses
  const courses = await Course.find({ 
    teacher: teacherId, 
    status: 'active' 
  }).select('title description thumbnail courseType price discountPrice category totalLessons');

  res.status(200).json({
    success: true,
    landing,
    teacher: {
      _id: teacher._id,
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      specialization: teacher.specialization,
      bio: teacher.bio,
      profileImage: teacher.profileImage,
      city: teacher.city,
      country: teacher.country,
      ratingAverage: teacher.ratingAverage,
      reviewsCount: teacher.reviewsCount
    },
    courses
  });
});

export { getLandingSettings, updateLandingSettings, getPublicLandingPage };