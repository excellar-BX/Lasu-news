const express = require("express");
const router = express.Router();
const { addComment, deleteComment, getAllComments } = require("../controllers/comment.controller");
const { protect, adminOnly } = require("../middleware/auth.middleware");

router.post("/:postId", protect, addComment);
router.delete("/:id", protect, deleteComment);
router.get("/", protect, adminOnly, getAllComments);

module.exports = router;