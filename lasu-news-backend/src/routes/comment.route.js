const express = require("express");
const router = express.Router();
const { addComment, deleteComment, getAllComments, likeComment, removeLike, getPostComments } = require("../controllers/comment.controller");
const { protect, adminOnly } = require("../middleware/auth.middleware");

router.post("/:postId", protect, addComment);
router.delete("/:id", protect, deleteComment);
router.get("/", protect, adminOnly, getAllComments);
router.get("/:postId", protect, getPostComments);
router.post("/:id/like", protect, likeComment);
router.delete("/:id/like", protect, removeLike);

module.exports = router;