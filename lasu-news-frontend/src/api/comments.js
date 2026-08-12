import api from './axios';

// Add a comment to a post
export const addComment = async (postId, content, parentId = null) => {
  const response = await api.post(`/comments/${postId}`, { content, parentId });
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

// Get comments for a specific post
export const getPostComments = async (postId) => {
  const response = await api.get(`/comments/${postId}`);
  return response.data;
};

// Like or dislike a comment
export const likeComment = async (commentId, type) => {
  const response = await api.post(`/comments/${commentId}/like`, { type });
  return response.data;
};

// Remove like/dislike from a comment
export const removeLike = async (commentId) => {
  const response = await api.delete(`/comments/${commentId}/like`);
  return response.data;
};
