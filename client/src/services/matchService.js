import api from './api';

export const getMatches = async () => {
  const response = await api.get('/matches');
  return response.data;
};
