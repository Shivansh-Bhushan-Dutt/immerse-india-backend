const { prisma } = require('../models/database');

// In-memory storage for when database is not available
let updatesStore = [
  {
    id: '1',
    type: 'newsletter',
    title: 'Welcome to Immersive India Tours',
    content: 'Discover the incredible beauty and rich culture of India with our curated travel experiences.',
    externalUrl: 'https://example.com/blog/welcome-to-immersive-india',
    createdAt: Date.now() - (1 * 24 * 60 * 60 * 1000),
    authorId: 'admin-001'
  },
  {
    id: '2',
    type: 'travel-trend',
    title: 'Top 5 Monsoon Destinations in India',
    content: 'Experience the magical transformation of landscapes during monsoon season in these breathtaking destinations.',
    externalUrl: 'https://example.com/blog/monsoon-destinations',
    createdAt: Date.now() - (2 * 24 * 60 * 60 * 1000),
    authorId: 'admin-001'
  }
];

// Get all updates
const getAllUpdates = async (req, res) => {
  try {
    // Try database first, fall back to in-memory store
    try {
      const updates = await prisma.update.findMany({
        include: {
          author: {
            select: { id: true, name: true, email: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      
      res.json({
        success: true,
        data: updates,
        source: 'database'
      });
    } catch (dbError) {
      console.log('Database not available, using in-memory store');
      res.json({
        success: true,
        data: updatesStore,
        source: 'memory'
      });
    }
  } catch (error) {
    console.error('Get updates error:', error);
    res.status(500).json({
      error: 'Failed to fetch updates'
    });
  }
};

// Get update by ID
const getUpdateById = async (req, res) => {
  try {
    const { id } = req.params;
    
    try {
      const update = await prisma.update.findUnique({
        where: { id },
        include: {
          author: {
            select: { id: true, name: true, email: true }
          }
        }
      });
      
      if (!update) {
        return res.status(404).json({ error: 'Update not found' });
      }
      
      res.json({
        success: true,
        data: update,
        source: 'database'
      });
    } catch (dbError) {
      const update = updatesStore.find(item => item.id === id);
      if (!update) {
        return res.status(404).json({ error: 'Update not found' });
      }
      
      res.json({
        success: true,
        data: update,
        source: 'memory'
      });
    }
  } catch (error) {
    console.error('Get update error:', error);
    res.status(500).json({
      error: 'Failed to fetch update'
    });
  }
};

// Create new update
const createUpdate = async (req, res) => {
  try {
    const { type, title, content, externalUrl } = req.body;
    const userId = req.user.id;
    
    // Validate required fields
    if (!type || !title || !content) {
      return res.status(400).json({
        error: 'Missing required fields: type, title, content'
      });
    }

    // Validate update type
    const validTypes = ['newsletter', 'travel-trend', 'new-experience'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        error: 'Invalid update type. Must be one of: newsletter, travel-trend, new-experience'
      });
    }

    const newUpdate = {
      id: Date.now().toString(),
      type,
      title,
      content,
      externalUrl: externalUrl || null,
      createdAt: Date.now(),
      authorId: userId
    };

    try {
      // Try database first
      const update = await prisma.update.create({
        data: {
          type,
          title,
          content,
          externalUrl,
          authorId: userId
        },
        include: {
          author: {
            select: { id: true, name: true, email: true }
          }
        }
      });

      res.status(201).json({
        success: true,
        message: 'Update created successfully',
        data: update,
        source: 'database'
      });
    } catch (dbError) {
      console.log('Database not available, using in-memory store');
      updatesStore.push(newUpdate);
      
      res.status(201).json({
        success: true,
        message: 'Update created successfully',
        data: newUpdate,
        source: 'memory'
      });
    }
  } catch (error) {
    console.error('Create update error:', error);
    res.status(500).json({
      error: 'Failed to create update'
    });
  }
};

// Update existing update
const updateUpdate = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, title, content, externalUrl } = req.body;

    // Validate update type if provided
    if (type) {
      const validTypes = ['newsletter', 'travel-trend', 'new-experience'];
      if (!validTypes.includes(type)) {
        return res.status(400).json({
          error: 'Invalid update type. Must be one of: newsletter, travel-trend, new-experience'
        });
      }
    }

    const updateData = {
      ...(type && { type }),
      ...(title && { title }),
      ...(content && { content }),
      ...(externalUrl !== undefined && { externalUrl })
    };

    try {
      // Try database first
      const update = await prisma.update.update({
        where: { id },
        data: updateData,
        include: {
          author: {
            select: { id: true, name: true, email: true }
          }
        }
      });

      res.json({
        success: true,
        message: 'Update updated successfully',
        data: update,
        source: 'database'
      });
    } catch (dbError) {
      console.log('Database not available, using in-memory store');
      const index = updatesStore.findIndex(item => item.id === id);
      if (index === -1) {
        return res.status(404).json({ error: 'Update not found' });
      }

      updatesStore[index] = {
        ...updatesStore[index],
        ...updateData
      };

      res.json({
        success: true,
        message: 'Update updated successfully',
        data: updatesStore[index],
        source: 'memory'
      });
    }
  } catch (error) {
    console.error('Update update error:', error);
    res.status(500).json({
      error: 'Failed to update update'
    });
  }
};

// Delete update
const deleteUpdate = async (req, res) => {
  try {
    const { id } = req.params;

    try {
      await prisma.update.delete({
        where: { id }
      });

      res.json({
        success: true,
        message: 'Update deleted successfully',
        source: 'database'
      });
    } catch (dbError) {
      console.log('Database not available, using in-memory store');
      const index = updatesStore.findIndex(item => item.id === id);
      if (index === -1) {
        return res.status(404).json({ error: 'Update not found' });
      }

      updatesStore.splice(index, 1);

      res.json({
        success: true,
        message: 'Update deleted successfully',
        source: 'memory'
      });
    }
  } catch (error) {
    console.error('Delete update error:', error);
    res.status(500).json({
      error: 'Failed to delete update'
    });
  }
};

module.exports = {
  getAllUpdates,
  createUpdate,
  getUpdateById,
  updateUpdate,
  deleteUpdate
};