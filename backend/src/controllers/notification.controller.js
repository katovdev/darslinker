import Notification from '../models/notification.model.js';
import { catchAsync } from '../middlewares/error.middleware.js';
import { NotFoundError } from '../utils/error.utils.js';

/**
 * Get user notifications
 */
export const getUserNotifications = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const { unreadOnly, userType } = req.query;

  const query = { userId };

  // Add userType filter if provided
  if (userType) {
    query.userType = userType;
  }

  if (unreadOnly === 'true') {
    query.read = false;
  }

  console.log('🔍 Notification query:', query);

  const notifications = await Notification.find(query)
    .sort({ createdAt: -1 })
    .limit(50);

  const unreadCount = await Notification.countDocuments({
    userId,
    read: false,
    ...(userType && { userType })
  });

  console.log('📊 Found notifications:', { count: notifications.length, unreadCount });

  res.status(200).json({
    success: true,
    notifications,
    unreadCount
  });
});

/**
 * Mark notification as read
 */
export const markAsRead = catchAsync(async (req, res) => {
  const { id } = req.params;

  const notification = await Notification.findByIdAndUpdate(
    id,
    { read: true },
    { new: true }
  );

  if (!notification) {
    throw new NotFoundError('Notification not found');
  }

  res.status(200).json({
    success: true,
    notification
  });
});

/**
 * Mark all notifications as read
 */
export const markAllAsRead = catchAsync(async (req, res) => {
  const { userId } = req.params;

  await Notification.updateMany(
    { userId, read: false },
    { read: true }
  );

  res.status(200).json({
    success: true,
    message: 'All notifications marked as read'
  });
});

/**
 * Delete notification
 */
export const deleteNotification = catchAsync(async (req, res) => {
  const { id } = req.params;

  const notification = await Notification.findByIdAndDelete(id);

  if (!notification) {
    throw new NotFoundError('Notification not found');
  }

  res.status(200).json({
    success: true,
    message: 'Notification deleted'
  });
});

/**
 * Create notification (internal use)
 */
export const createNotification = async (data) => {
  try {
    const notification = await Notification.create(data);
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};
