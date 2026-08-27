import api from './api';

export const sendChatMessage = async (messages) => {
  const response = await api.post('/chat', { messages });
  return response.data;
};
