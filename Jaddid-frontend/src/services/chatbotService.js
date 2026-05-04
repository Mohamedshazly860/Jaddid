// Chatbot Service
import api from './api';

/**
 * Send a message to the chatbot
 * @param {string} message - User's message
 * @returns {Promise} API response with bot reply
 */
export const sendChatMessage = async (message) => {
  try {
    const response = await api.post('/chatbot/chat/', { message });
    return response.data;
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw error;
  }
};

/**
 * Get chat history for authenticated user
 * @returns {Promise} Chat history
 */
export const getChatHistory = async () => {
  try {
    const response = await api.get('/chatbot/history/');
    return response.data;
  } catch (error) {
    console.error('Error fetching chat history:', error);
    throw error;
  }
};

export default {
  sendChatMessage,
  getChatHistory,
};
