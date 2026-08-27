import api from './api';

export const getUsers = async (params) => {
  const response = await api.get('/admin/users', { params });
  return response.data;
};

export const updateUserStatus = async (id, data) => {
  const response = await api.put(`/admin/users/${id}/status`, data);
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await api.delete(`/admin/users/${id}`);
  return response.data;
};

export const getStats = async () => {
  const response = await api.get('/admin/stats');
  return response.data;
};
