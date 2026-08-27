import api from './api';

export const createReview = async (data) => {
  const response = await api.post('/reviews', data);
  return response.data;
};

export const getReviewsByUser = async (userId) => {
  const response = await api.get(`/reviews/user/${userId}`);
  return response.data;
};
