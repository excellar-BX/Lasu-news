import api from './axios';

// Add a comment to a post
export const addComment = async (postId, content) => {
  const response = await api.post(`/comments/${postId}`, { content });
  return response.data;
};

// Delete a comment
export const deleteComment = async (commentId) => {
  const response = await api.delete(`/comments/${commentId}`);
  return response.data;
};

// Get all comments (admin only)
export const getAllComments = async (params = {}) => {
  const response = await api.get('/comments', { params });
  return response.data;
};
