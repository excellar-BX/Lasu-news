const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/auth.routes");
const postRoutes = require("./routes/post.routes");
const commentRoutes = require("./routes/comment.route");
const breakingNewsRoutes = require("./routes/breakingNews.routes");
const sitemapRoutes = require("./routes/sitemap.routes");
const morgan = require('morgan')


const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        'https://lasunews.vercel.app',
        'https://lasunews.com.ng',
        'https://api.lasunews.com.ng',
        process.env.CLIENT_URL,
        'http://localhost:5173',
        'https://lasu-news.vercel.app'
      ].filter(Boolean);

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, origin);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'))


// Routes
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/breaking-news", breakingNewsRoutes);
app.use("/sitemap.xml", sitemapRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
  });
});

module.exports = app;