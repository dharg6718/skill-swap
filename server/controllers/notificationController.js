const Notification = require('../models/Notification');
const { successResponse, paginatedResponse } = require('../utils/apiResponse');
const AppError = require('../utils/AppError');

exports.getNotifications = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;
    const query = { user: req.user.id };
    if (req.query.unread === 'true') query.isRead = false;
    const total = await Notification.countDocuments(query);
    const notifications = await Notification.find(query).sort('-createdAt').skip(startIndex).limit(limit);
    const totalPages = Math.ceil(total / limit);
    return paginatedResponse(res, 'Notifications fetched successfully', notifications, { page, limit, total, totalPages });
  } catch (error) { next(error); }
};

exports.getUnreadCount = async (req, res, next) => {
  try {
    const count = await Notification.countDocuments({ user: req.user.id, isRead: false });
    return successResponse(res, 'Unread count fetched', { count });
  } catch (error) { next(error); }
};

exports.markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return next(new AppError('Notification not found', 404));
    if (notification.user.toString() !== req.user.id) return next(new AppError('Not authorized', 403));
    notification.isRead = true;
    await notification.save();
    return successResponse(res, 'Notification marked as read', notification);
  } catch (error) { next(error); }
};

exports.markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ user: req.user.id, isRead: false }, { isRead: true });
    return successResponse(res, 'All notifications marked as read', {});
  } catch (error) { next(error); }
};
