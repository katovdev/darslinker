import { Router } from 'express';
import {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
} from '../controllers/notification.controller.js';

const notificationRouter = Router();

// Get user notifications
notificationRouter.get('/user/:userId', getUserNotifications);

// Mark notification as read
notificationRouter.patch('/:id/read', markAsRead);

// Mark all notifications as read
notificationRouter.patch('/user/:userId/read-all', markAllAsRead);

// Delete notification
notificationRouter.delete('/:id', deleteNotification);

export default notificationRouter;
