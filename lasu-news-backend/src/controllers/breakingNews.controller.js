const prisma = require("../utils/prisma");

// Get all active breaking news (ordered by order field)
const getBreakingNews = async (req, res) => {
  try {
    const breakingNews = await prisma.breakingNews.findMany({
      where: { active: true },
      orderBy: { order: 'asc' }
    });
    res.json(breakingNews);
  } catch (error) {
    console.error("Error fetching breaking news:", error);
    res.status(500).json({ message: "Failed to fetch breaking news" });
  }
};

// Get all breaking news (including inactive) - for admin
const getAllBreakingNews = async (req, res) => {
  try {
    const breakingNews = await prisma.breakingNews.findMany({
      orderBy: { order: 'asc' }
    });
    res.json(breakingNews);
  } catch (error) {
    console.error("Error fetching all breaking news:", error);
    res.status(500).json({ message: "Failed to fetch breaking news" });
  }
};

// Create breaking news
const createBreakingNews = async (req, res) => {
  try {
    const { content, active, order } = req.body;
    
    if (!content || content.trim() === "") {
      return res.status(400).json({ message: "Content is required" });
    }

    const breakingNews = await prisma.breakingNews.create({
      data: {
        content: content.trim(),
        active: active !== undefined ? active : true,
        order: order || 0
      }
    });

    res.status(201).json(breakingNews);
  } catch (error) {
    console.error("Error creating breaking news:", error);
    res.status(500).json({ message: "Failed to create breaking news" });
  }
};

// Update breaking news
const updateBreakingNews = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, active, order } = req.body;

    const breakingNews = await prisma.breakingNews.update({
      where: { id },
      data: {
        ...(content !== undefined && { content: content.trim() }),
        ...(active !== undefined && { active }),
        ...(order !== undefined && { order })
      }
    });

    res.json(breakingNews);
  } catch (error) {
    console.error("Error updating breaking news:", error);
    if (error.code === 'P2025') {
      return res.status(404).json({ message: "Breaking news not found" });
    }
    res.status(500).json({ message: "Failed to update breaking news" });
  }
};

// Delete breaking news
const deleteBreakingNews = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.breakingNews.delete({
      where: { id }
    });

    res.json({ message: "Breaking news deleted successfully" });
  } catch (error) {
    console.error("Error deleting breaking news:", error);
    if (error.code === 'P2025') {
      return res.status(404).json({ message: "Breaking news not found" });
    }
    res.status(500).json({ message: "Failed to delete breaking news" });
  }
};

module.exports = {
  getBreakingNews,
  getAllBreakingNews,
  createBreakingNews,
  updateBreakingNews,
  deleteBreakingNews
};
