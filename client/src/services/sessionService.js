import api from './api';

export const createSession = async (data) => {
  const response = await api.post('/sessions', data);
  return response.data;
};

export const getSessions = async (params) => {
  const response = await api.get('/sessions', { params });
  return response.data;
};

export const getSessionById = async (id) => {
  const response = await api.get(`/sessions/${id}`);
  return response.data;
};

export const updateSession = async (id, data) => {
  const response = await api.put(`/sessions/${id}`, data);
  return response.data;
};
