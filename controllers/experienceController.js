const { prisma } = require('../models/database');
const { uploadToCloudinary } = require('../middleware/upload');

const getAllExperiences = async (req, res) => {
  try {
    const { region, page = 1, limit = 50, search } = req.query;
    const skip = (page - 1) * limit;
    
    const where = {};
    if (region && region !== 'All') {
      where.region = region;
    }
    
    // Add search functionality
    if (search && search.trim()) {
      where.OR = [
        { destination: { contains: search.trim(), mode: 'insensitive' } },
        { title: { contains: search.trim(), mode: 'insensitive' } },
        { description: { contains: search.trim(), mode: 'insensitive' } }
      ];
    }

    const [experiences, total] = await Promise.all([
      prisma.experience.findMany({
        where,
        include: { 
          author: { 
            select: { name: true, id: true } 
          } 
        },
        orderBy: { createdAt: 'desc' },
        skip: parseInt(skip),
        take: parseInt(limit)
      }),
      prisma.experience.count({ where })
    ]);

    res.json({
      success: true,
      data: experiences,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
        hasNext: (page * limit) < total,
        hasPrev: page > 1
      },
      source: 'database'
    });
  } catch (error) {
    console.error('Get experiences error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch experiences',
      code: 'FETCH_EXPERIENCES_FAILED'
    });
  }
};

const createExperience = async (req, res) => {
  try {
    let imageUrl = req.body.imageUrl;

    // Handle file upload
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, 'travel-dashboard/experiences');
      imageUrl = result.secure_url;
    }

    const { destination, region, title, description, highlights } = req.body;

    // Validation
    if (!destination || !region || !title || !description) {
      return res.status(400).json({ 
        error: 'Destination, region, title, and description are required',
        code: 'MISSING_REQUIRED_FIELDS'
      });
    }

    // Parse highlights if it's a string
    let parsedHighlights = [];
    if (highlights) {
      try {
        parsedHighlights = typeof highlights === 'string' ? JSON.parse(highlights) : highlights;
      } catch (error) {
        return res.status(400).json({ 
          error: 'Invalid highlights format',
          code: 'INVALID_HIGHLIGHTS_FORMAT'
        });
      }
    }

    const experience = await prisma.experience.create({
      data: {
        destination,
        region,
        title,
        description,
        highlights: parsedHighlights,
        imageUrl,
        authorId: req.user.id,
      },
      include: { 
        author: { 
          select: { name: true, id: true } 
        } 
      }
    });

    res.status(201).json({
      success: true,
      data: experience
    });
  } catch (error) {
    console.error('Create experience error:', error);
    res.status(500).json({ 
      error: 'Failed to create experience',
      code: 'CREATE_EXPERIENCE_FAILED'
    });
  }
};

const getExperienceById = async (req, res) => {
  try {
    const { id } = req.params;

    const experience = await prisma.experience.findUnique({
      where: { id },
      include: { 
        author: { 
          select: { name: true, id: true } 
        } 
      }
    });

    if (!experience) {
      return res.status(404).json({ 
        error: 'Experience not found',
        code: 'EXPERIENCE_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      data: experience
    });
  } catch (error) {
    console.error('Get experience error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch experience',
      code: 'FETCH_EXPERIENCE_FAILED'
    });
  }
};

const updateExperience = async (req, res) => {
  try {
    const { id } = req.params;
    let { destination, region, title, description, highlights, imageUrl } = req.body;

    // Check if experience exists and user owns it
    const existingExperience = await prisma.experience.findUnique({
      where: { id }
    });

    if (!existingExperience) {
      return res.status(404).json({ 
        error: 'Experience not found',
        code: 'EXPERIENCE_NOT_FOUND'
      });
    }

    if (existingExperience.authorId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        error: 'Not authorized to update this experience',
        code: 'UNAUTHORIZED'
      });
    }

    // Handle file upload
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, 'travel-dashboard/experiences');
      imageUrl = result.secure_url;
    }

    // Parse highlights if provided
    let parsedHighlights = existingExperience.highlights;
    if (highlights) {
      try {
        parsedHighlights = typeof highlights === 'string' ? JSON.parse(highlights) : highlights;
      } catch (error) {
        return res.status(400).json({ 
          error: 'Invalid highlights format',
          code: 'INVALID_HIGHLIGHTS_FORMAT'
        });
      }
    }

    const experience = await prisma.experience.update({
      where: { id },
      data: {
        ...(destination && { destination }),
        ...(region && { region }),
        ...(title && { title }),
        ...(description && { description }),
        ...(parsedHighlights && { highlights: parsedHighlights }),
        ...(imageUrl && { imageUrl }),
      },
      include: { 
        author: { 
          select: { name: true, id: true } 
        } 
      }
    });

    res.json({
      success: true,
      data: experience
    });
  } catch (error) {
    console.error('Update experience error:', error);
    res.status(500).json({ 
      error: 'Failed to update experience',
      code: 'UPDATE_EXPERIENCE_FAILED'
    });
  }
};

const deleteExperience = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if experience exists and user owns it
    const existingExperience = await prisma.experience.findUnique({
      where: { id }
    });

    if (!existingExperience) {
      return res.status(404).json({ 
        error: 'Experience not found',
        code: 'EXPERIENCE_NOT_FOUND'
      });
    }

    if (existingExperience.authorId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        error: 'Not authorized to delete this experience',
        code: 'UNAUTHORIZED'
      });
    }

    await prisma.experience.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Experience deleted successfully'
    });
  } catch (error) {
    console.error('Delete experience error:', error);
    res.status(500).json({ 
      error: 'Failed to delete experience',
      code: 'DELETE_EXPERIENCE_FAILED'
    });
  }
};

module.exports = {
  getAllExperiences,
  createExperience,
  getExperienceById,
  updateExperience,
  deleteExperience
};