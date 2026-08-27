import api from './api';

export const getNotifications = async (params) => {
  const response = await api.get('/notifications', { params });
  return response.data;
};

export const getUnreadCount = async () => {
  const response = await api.get('/notifications/unread-count');
  return response.data;
};

export const markAsRead = async (id) => {
  const response = await api.put(/notifications//read);
  return response.data;
};

export const markAllAsRead = async () => {
  const response = await api.put('/notifications/read-all');
  return response.data;
};
