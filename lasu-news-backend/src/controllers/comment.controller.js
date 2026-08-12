const prisma = require("../utils/prisma");

// POST /api/comments/:postId — authenticated users
const addComment = async (req, res) => {
  const { postId } = req.params;
  const { content, parentId } = req.body;

  if (!content || content.trim().length === 0) {
    return res.status(400).json({ message: "Comment content is required" });
  }

  try {
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post || !post.published) {
      return res.status(404).json({ message: "Post not found" });
    }

    // If parentId is provided, verify the parent comment exists
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({ 
        where: { id: parentId } 
      });
      if (!parentComment) {
        return res.status(404).json({ message: "Parent comment not found" });
      }
    }

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        postId,
        userId: req.user.id,
        parentId: parentId || null,
      },
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    return res.status(201).json({ comment });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/comments/:id — admin or comment owner
const deleteComment = async (req, res) => {
  const { id } = req.params;

  try {
    const comment = await prisma.comment.findUnique({ where: { id } });
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const isOwner = comment.userId === req.user.id;
    const isAdmin = req.user.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Not authorized to delete this comment" });
    }

    await prisma.comment.delete({ where: { id } });

    return res.status(200).json({ message: "Comment deleted" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// GET /api/comments — admin only, all comments
const getAllComments = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  try {
    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, name: true, email: true } },
          post: { select: { id: true, title: true, slug: true } },
        },
      }),
      prisma.comment.count(),
    ]);

    return res.status(200).json({
      comments,
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

// POST /api/comments/:id/like — authenticated users
const likeComment = async (req, res) => {
  const { id } = req.params;
  const { type } = req.body; // "LIKE" or "DISLIKE"

  if (!type || !["LIKE", "DISLIKE"].includes(type)) {
    return res.status(400).json({ message: "Invalid like type" });
  }

  try {
    const comment = await prisma.comment.findUnique({ where: { id } });
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check if user already liked/disliked this comment
    const existingLike = await prisma.commentLike.findUnique({
      where: {
        commentId_userId: {
          commentId: id,
          userId: req.user.id,
        },
      },
    });

    if (existingLike) {
      // Update existing like type
      const updatedLike = await prisma.commentLike.update({
        where: { id: existingLike.id },
        data: { type },
      });
      return res.status(200).json({ like: updatedLike });
    }

    // Create new like
    const like = await prisma.commentLike.create({
      data: {
        commentId: id,
        userId: req.user.id,
        type,
      },
    });

    return res.status(201).json({ like });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/comments/:id/like — authenticated users
const removeLike = async (req, res) => {
  const { id } = req.params;

  try {
    const like = await prisma.commentLike.findUnique({
      where: {
        commentId_userId: {
          commentId: id,
          userId: req.user.id,
        },
      },
    });

    if (!like) {
      return res.status(404).json({ message: "Like not found" });
    }

    await prisma.commentLike.delete({
      where: { id: like.id },
    });

    return res.status(200).json({ message: "Like removed" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// GET /api/comments/:postId — get comments for a specific post
const getPostComments = async (req, res) => {
  const { postId } = req.params;

  try {
    const comments = await prisma.comment.findMany({
      where: { 
        postId,
        parentId: null, // Only top-level comments
      },
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true } },
        replies: {
          include: {
            user: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: "asc" },
        },
        likes: {
          select: {
            userId: true,
            type: true,
          },
        },
      },
    });

    return res.status(200).json({ comments });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = { addComment, deleteComment, getAllComments, likeComment, removeLike, getPostComments };