const express = require("express");
const router = express.Router();
const {
  getAllPosts,
  getAllPostsAdmin,
  getPostBySlug,
  getPostById,
  createPost,
  updatePost,
  deletePost,
} = require("../controllers/post.controller");
const { protect, adminOnly } = require("../middleware/auth.middleware");

// Public
router.get("/", getAllPosts);
router.get("/slug/:slug", getPostBySlug);

// Admin only
router.get("/all", protect, adminOnly, getAllPostsAdmin);
router.get("/id/:id", protect, adminOnly, getPostById);
router.post("/", protect, adminOnly, createPost);
router.put("/:id", protect, adminOnly, updatePost);
router.delete("/:id", protect, adminOnly, deletePost);

module.exports = router;