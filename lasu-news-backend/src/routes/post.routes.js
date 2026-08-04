const express = require("express");
const router = express.Router();
const prisma = require("../utils/prisma");
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

// OG tag renderer for social crawlers
router.get("/og/:slug", async (req, res) => {
  try {
    const post = await prisma.post.findUnique({
      where: { slug: req.params.slug },
    });
    if (!post || !post.published) return res.status(404).send("Not found");

    const title = `${post.title} — LASU News`;
    const description = post.content.replace(/\s+/g, " ").trim().slice(0, 120);
    const image = post.coverImage || "https://lasunews.com.ng/logo.jpg";
    const url = `https://lasunews.com.ng/news/${post.slug}`;

    res.setHeader("Content-Type", "text/html");
    res.send(`<!DOCTYPE html>
<html>
<head>
  <title>${title}</title>
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image" content="${image}" />
  <meta property="og:url" content="${url}" />
  <meta property="og:type" content="article" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${image}" />
</head>
<body></body>
</html>`);
  } catch (err) {
    res.status(500).send("Error");
  }
});

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