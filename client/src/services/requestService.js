import api from './api';

export const createRequest = async (data) => {
  const response = await api.post('/requests', data);
  return response.data;
};

export const getRequests = async (params) => {
  const response = await api.get('/requests', { params });
  return response.data;
};

export const getRequestById = async (id) => {
  const response = await api.get(`/requests/${id}`);
  return response.data;
};

export const updateRequest = async (id, data) => {
  const response = await api.put(`/requests/${id}`, data);
  return response.data;
};

export const deleteRequest = async (id) => {
  const response = await api.delete(`/requests/${id}`);
  return response.data;
};
