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
 * Check if custom URL is available
 * @route GET /landing/check-url/:customUrl
 * @access Private (Teacher only)
 */
const checkUrlAvailability = catchAsync(async (req, res) => {
  const { customUrl } = req.params;
  const { teacherId } = req.query;

  if (!customUrl || !customUrl.trim()) {
    return res.status(200).json({
      success: true,
      available: true,
      message: 'Custom URL is available'
    });
  }

  // Validate format
  const urlPattern = /^[a-z0-9-]+$/;
  if (!urlPattern.test(customUrl.trim().toLowerCase())) {
    throw new BadRequestError('Custom URL can only contain lowercase letters, numbers, and hyphens');
  }

  // Validate length (subdomain constraints: 3-63 characters)
  const trimmedUrl = customUrl.trim().toLowerCase();
  if (trimmedUrl.length < 3) {
    throw new BadRequestError('Custom URL must be at least 3 characters');
  }
  if (trimmedUrl.length > 63) {
    throw new BadRequestError('Custom URL must be less than 63 characters');
  }

  // Check if URL is already taken by another teacher
  const existingLanding = await Landing.findOne({
    customUrl: trimmedUrl,
    teacher: { $ne: teacherId } // Exclude current teacher if checking for own URL
  });

  const available = !existingLanding;

  res.status(200).json({
    success: true,
    available,
    message: available ? 'Custom URL is available' : 'This custom URL is already taken'
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

  // Check if user is authenticated and is the teacher or admin
  if (req.user && req.user._id) {
    if (req.user._id.toString() !== teacherId && req.user.role !== 'admin') {
      throw new BadRequestError('You can only update your own landing page');
    }
  }

  // Validate customUrl if provided
  if (updateData.customUrl !== undefined) {
    const customUrl = updateData.customUrl?.trim().toLowerCase() || '';

    if (customUrl) {
      // Validate format
      const urlPattern = /^[a-z0-9-]+$/;
      if (!urlPattern.test(customUrl)) {
        throw new BadRequestError('Custom URL can only contain lowercase letters, numbers, and hyphens');
      }

      // Validate length
      if (customUrl.length < 3) {
        throw new BadRequestError('Custom URL must be at least 3 characters');
      }
      if (customUrl.length > 63) {
        throw new BadRequestError('Custom URL must be less than 63 characters');
      }

      // Check if URL is already taken by another teacher
      const existingLanding = await Landing.findOne({
        customUrl: customUrl,
        teacher: { $ne: teacherId }
      });

      if (existingLanding) {
        throw new BadRequestError('This custom URL is already taken by another teacher');
      }
    }

    // Set customUrl (empty string if not provided)
    updateData.customUrl = customUrl;
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
    updatedFields: Object.keys(updateData),
    customUrl: updateData.customUrl
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
 * Supports both teacherId and customUrl (subdomain) lookup
 */
const checkUrlAvailability = catchAsync(async (req, res) => {
  const { customUrl } = req.params;
  const { teacherId } = req.query; // Optional: exclude current teacher's URL

  if (!customUrl || !/^[a-z0-9-]+$/.test(customUrl)) {
    throw new BadRequestError('Invalid custom URL format');
  }

  const query = { customUrl: customUrl.toLowerCase() };
  if (teacherId) {
    query.teacher = { $ne: teacherId };
  }

  const existing = await Landing.findOne(query);

  res.status(200).json({
    success: true,
    available: !existing,
    message: existing ? 'This URL is already taken' : 'URL is available'
  });
});

/**
 * Get public landing page data by custom URL or teacher ID
 * @route GET /landing/public/:identifier
 * @access Public
 * Supports both teacherId and customUrl (subdomain) lookup
 */
const getPublicLandingPage = catchAsync(async (req, res) => {
  const { teacherId } = req.params;
  const { customUrl } = req.query;

  let teacher;
  let landing;

  // If customUrl is provided (subdomain lookup), find by customUrl first
  if (customUrl && customUrl.trim()) {
    landing = await Landing.findOne({ customUrl: customUrl.trim().toLowerCase() });

    if (landing) {
      // Find teacher by landing.teacher
      teacher = await User.findById(landing.teacher);
      if (!teacher || teacher.role !== 'teacher') {
        throw new NotFoundError('Teacher not found for this custom URL');
      }
    } else {
      // If customUrl doesn't exist, try to find by teacherId as fallback
      teacher = await User.findById(teacherId);
      if (!teacher || teacher.role !== 'teacher') {
        throw new NotFoundError('Landing page not found');
      }
    }
  } else {
    // Standard lookup by teacherId
    teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== 'teacher') {
      throw new NotFoundError('Teacher not found');
    }
  }

  // If landing not found yet, find by teacher
  if (!landing) {
    landing = await Landing.findOne({ teacher: teacher._id });
  }

  // If still no landing settings, create default
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
      customUrl: '',
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
    teacher: teacher._id,
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

export { getLandingSettings, updateLandingSettings, getPublicLandingPage, checkUrlAvailability };