import Notification from '../models/notification.model.js';
import logger from '../../config/logger.js';

/**
 * Create a new notification
 * @param {Object} data - Notification data
 * @param {string} data.userId - User ID to receive notification
 * @param {string} data.userType - User type (Student or Teacher)
 * @param {string} data.type - Notification type
 * @param {string} data.title - Notification title
 * @param {string} data.message - Notification message
 * @param {string} data.link - Optional link
 * @param {Object} data.metadata - Additional metadata
 */
export async function createNotification(data) {
  try {
    const notification = await Notification.create({
      userId: data.userId,
      userType: data.userType,
      type: data.type,
      title: data.title,
      message: data.message,
      link: data.link,
      metadata: data.metadata || {}
    });

    logger.info('Notification created', {
      notificationId: notification._id,
      userId: data.userId,
      type: data.type
    });

    return notification;
  } catch (error) {
    logger.error('Error creating notification', {
      error: error.message,
      userId: data.userId
    });
    throw error;
  }
}

/**
 * Get unread notification count for a user
 * @param {string} userId - User ID
 */
export async function getUnreadCount(userId) {
  try {
    const count = await Notification.countDocuments({
      userId,
      read: false
    });

    return count;
  } catch (error) {
    logger.error('Error getting unread count', {
      error: error.message,
      userId
    });
    return 0;
  }
}
