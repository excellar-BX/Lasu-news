const prisma = require("../utils/prisma");
const { slugify } = require("../utils/slugify");

// GET /api/posts — public, paginated, published only
const getAllPosts = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const category = req.query.category || undefined;
  const skip = (page - 1) * limit;

  try {
    const where = {
      published: true,
      ...(category && { category }),
    };

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          coverImage: true,
          category: true,
          published: true,
          createdAt: true,
          author: {
            select: { id: true, name: true },
          },
        },
      }),
      prisma.post.count({ where }),
    ]);

    return res.status(200).json({
      posts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// GET /api/posts/all — admin only, all posts including drafts
const getAllPostsAdmin = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  try {
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          coverImage: true,
          category: true,
          published: true,
          createdAt: true,
          updatedAt: true,
          author: {
            select: { id: true, name: true },
          },
          _count: { select: { comments: true } },
        },
      }),
      prisma.post.count(),
    ]);

    return res.status(200).json({
      posts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// GET /api/posts/:slug — public, single post with comments
const getPostBySlug = async (req, res) => {
  const { slug } = req.params;

  try {
    const post = await prisma.post.findUnique({
      where: { slug },
      include: {
        author: { select: { id: true, name: true } },
        comments: {
          orderBy: { createdAt: "desc" },
          include: {
            user: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!post || !post.published) {
      return res.status(404).json({ message: "Post not found" });
    }

    return res.status(200).json({ post });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// GET /api/posts/id/:id — admin only, get post by id (for edit form)
const getPostById = async (req, res) => {
  const { id } = req.params;

  try {
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true } },
      },
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    return res.status(200).json({ post });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// POST /api/posts — admin only
const createPost = async (req, res) => {
  const { title, content, excerpt, coverImage, category, published } = req.body;

  if (!title || !content || !excerpt || !category) {
    return res.status(400).json({ message: "title, content, excerpt and category are required" });
  }

  try {
    let slug = slugify(title);

    // Ensure slug is unique
    const existing = await prisma.post.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    const post = await prisma.post.create({
      data: {
        title,
        slug,
        content,
        excerpt,
        coverImage: coverImage || null,
        category,
        published: published ?? false,
        authorId: req.user.id,
      },
    });

    return res.status(201).json({ post });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/posts/:id — admin only
const updatePost = async (req, res) => {
  const { id } = req.params;
  const { title, content, excerpt, coverImage, category, published } = req.body;

  try {
    const existing = await prisma.post.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Only regenerate slug if title changed
    let slug = existing.slug;
    if (title && title !== existing.title) {
      slug = slugify(title);
      const slugTaken = await prisma.post.findFirst({
        where: { slug, NOT: { id } },
      });
      if (slugTaken) {
        slug = `${slug}-${Date.now()}`;
      }
    }

    const post = await prisma.post.update({
      where: { id },
      data: {
        ...(title && { title, slug }),
        ...(content && { content }),
        ...(excerpt && { excerpt }),
        ...(coverImage !== undefined && { coverImage }),
        ...(category && { category }),
        ...(published !== undefined && { published }),
      },
    });

    return res.status(200).json({ post });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/posts/:id — admin only
const deletePost = async (req, res) => {
  const { id } = req.params;

  try {
    const existing = await prisma.post.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: "Post not found" });
    }

    await prisma.post.delete({ where: { id } });

    return res.status(200).json({ message: "Post deleted" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getAllPosts,
  getAllPostsAdmin,
  getPostBySlug,
  getPostById,
  createPost,
  updatePost,
  deletePost,
};