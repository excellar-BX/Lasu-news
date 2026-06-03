const express = require("express");
const router = express.Router();
const {
  getBreakingNews,
  getAllBreakingNews,
  createBreakingNews,
  updateBreakingNews,
  deleteBreakingNews
} = require("../controllers/breakingNews.controller");
const { protect, adminOnly } = require("../middleware/auth.middleware");

// Public route - get active breaking news
router.get("/", getBreakingNews);

// Admin routes - require authentication and admin role
router.get("/admin", protect, adminOnly, getAllBreakingNews);
router.post("/", protect, adminOnly, createBreakingNews);
router.put("/:id", protect, adminOnly, updateBreakingNews);
router.delete("/:id", protect, adminOnly, deleteBreakingNews);

module.exports = router;
