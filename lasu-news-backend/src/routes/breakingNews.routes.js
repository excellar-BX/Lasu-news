const express = require("express");
const router = express.Router();
const {
  getBreakingNews,
  getAllBreakingNews,
  createBreakingNews,
  updateBreakingNews,
  deleteBreakingNews
} = require("../controllers/breakingNews.controller");
const { authenticate, authorizeAdmin } = require("../middleware/auth.middleware");

// Public route - get active breaking news
router.get("/", getBreakingNews);

// Admin routes - require authentication and admin role
router.get("/admin", authenticate, authorizeAdmin, getAllBreakingNews);
router.post("/", authenticate, authorizeAdmin, createBreakingNews);
router.put("/:id", authenticate, authorizeAdmin, updateBreakingNews);
router.delete("/:id", authenticate, authorizeAdmin, deleteBreakingNews);

module.exports = router;
