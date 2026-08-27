const Notification = require('../models/Notification');

exports.createNotification = async ({ user, type, title, message, relatedId }) => {
  try {
    const notification = await Notification.create({
      user,
      type,
      title,
      message,
      relatedId
    });
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};
