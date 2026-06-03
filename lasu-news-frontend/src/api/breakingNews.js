import axios from "./axios";

export const getBreakingNews = async () => {
  const response = await axios.get("/breaking-news");
  return response.data;
};

export const getAllBreakingNews = async () => {
  const response = await axios.get("/breaking-news/admin");
  return response.data;
};

export const createBreakingNews = async (data) => {
  const response = await axios.post("/breaking-news", data);
  return response.data;
};

export const updateBreakingNews = async (id, data) => {
  const response = await axios.put(`/breaking-news/${id}`, data);
  return response.data;
};

export const deleteBreakingNews = async (id) => {
  const response = await axios.delete(`/breaking-news/${id}`);
  return response.data;
};
