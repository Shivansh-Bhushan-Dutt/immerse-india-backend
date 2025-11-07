const { prisma } = require('../models/database');

// In-memory storage for when database is not available
let itinerariesStore = [
  {
    id: '1',
    destination: 'Kerala',
    region: 'South',
    title: 'Kerala Backwater Paradise',
    duration: '7 days',
    imageUrl: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&h=600&fit=crop&q=80',
    days: [
      { day: 1, activities: ['Arrive in Kochi', 'Explore Fort Kochi area', 'Visit Chinese Fishing Nets'] },
      { day: 2, activities: ['Munnar hill station', 'Tea plantation tour', 'Mattupetty Dam visit'] },
      { day: 3, activities: ['Thekkady wildlife sanctuary', 'Spice plantation tour', 'Periyar boat ride'] }
    ],
    createdAt: Date.now() - (2 * 24 * 60 * 60 * 1000),
    authorId: 'admin-001'
  }
];

// Get all itineraries
const getAllItineraries = async (req, res) => {
  try {
    const { region, page = 1, limit = 50, search } = req.query;
    const skip = (page - 1) * limit;
    
    // Try database first, fall back to in-memory store
    try {
      const where = {};
      if (region && region !== 'All') {
        where.region = region;
      }
      
      // Add search functionality
      if (search && search.trim()) {
        where.OR = [
          { destination: { contains: search.trim(), mode: 'insensitive' } },
          { title: { contains: search.trim(), mode: 'insensitive' } }
        ];
      }

      const [itineraries, total] = await Promise.all([
        prisma.itinerary.findMany({
          where,
          include: {
            days: true,
            author: {
              select: { id: true, name: true, email: true }
            }
          },
          orderBy: { createdAt: 'desc' },
          skip: parseInt(skip),
          take: parseInt(limit)
        }),
        prisma.itinerary.count({ where })
      ]);
      
      res.json({
        success: true,
        data: itineraries,
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
    } catch (dbError) {
      console.log('Database not available, using in-memory store');
      
      // Apply filters to in-memory data
      let filteredData = [...itinerariesStore];
      
      if (region && region !== 'All') {
        filteredData = filteredData.filter(item => item.region === region);
      }
      
      if (search && search.trim()) {
        const searchTerm = search.trim().toLowerCase();
        filteredData = filteredData.filter(item => 
          item.destination.toLowerCase().includes(searchTerm) ||
          item.title.toLowerCase().includes(searchTerm)
        );
      }
      
      // Apply pagination
      const total = filteredData.length;
      const startIndex = skip;
      const endIndex = startIndex + parseInt(limit);
      const paginatedData = filteredData.slice(startIndex, endIndex);
      
      res.json({
        success: true,
        data: paginatedData,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
          hasNext: endIndex < total,
          hasPrev: page > 1
        },
        source: 'memory'
      });
    }
  } catch (error) {
    console.error('Get itineraries error:', error);
    res.status(500).json({
      error: 'Failed to fetch itineraries'
    });
  }
};

// Get itinerary by ID
const getItineraryById = async (req, res) => {
  try {
    const { id } = req.params;
    
    try {
      const itinerary = await prisma.itinerary.findUnique({
        where: { id },
        include: {
          days: true,
          author: {
            select: { id: true, name: true, email: true }
          }
        }
      });
      
      if (!itinerary) {
        return res.status(404).json({ error: 'Itinerary not found' });
      }
      
      res.json({
        success: true,
        data: itinerary,
        source: 'database'
      });
    } catch (dbError) {
      const itinerary = itinerariesStore.find(item => item.id === id);
      if (!itinerary) {
        return res.status(404).json({ error: 'Itinerary not found' });
      }
      
      res.json({
        success: true,
        data: itinerary,
        source: 'memory'
      });
    }
  } catch (error) {
    console.error('Get itinerary error:', error);
    res.status(500).json({
      error: 'Failed to fetch itinerary'
    });
  }
};

// Create new itinerary
const createItinerary = async (req, res) => {
  try {
    const { destination, region, title, duration, description, days } = req.body;
    
    // Validate required fields
    if (!destination || !region || !title || !duration || !days) {
      return res.status(400).json({
        error: 'Missing required fields: destination, region, title, duration, days'
      });
    }

    // Handle image URL or file upload to Cloudinary
    let imageUrl = req.body.imageUrl; // Support URL-based image uploads
    if (req.file) {
      console.log('📤 Uploading itinerary image to Cloudinary...');
      const { uploadToCloudinary } = require('../middleware/upload');
      const result = await uploadToCloudinary(req.file.buffer, 'travel-dashboard/itineraries');
      imageUrl = result.secure_url;
      console.log('✅ Itinerary image uploaded:', imageUrl);
    }

    // Parse days from string if needed
    const parsedDays = typeof days === 'string' ? JSON.parse(days) : days;

    try {
      // Try database first
      const itinerary = await prisma.itinerary.create({
        data: {
          destination,
          region,
          title,
          duration,
          description,
          imageUrl,
          authorId: req.user.id,
          days: {
            create: parsedDays.map(day => ({
              dayNumber: day.day,
              activities: day.activities
            }))
          }
        },
        include: {
          days: true,
          author: {
            select: { id: true, name: true, email: true }
          }
        }
      });

      res.status(201).json({
        success: true,
        message: 'Itinerary created successfully',
        data: itinerary,
        source: 'database'
      });
    } catch (dbError) {
      console.error('Database error, using in-memory store:', dbError);
      
      const newItinerary = {
        id: Date.now().toString(),
        destination,
        region,
        title,
        duration,
        imageUrl,
        days: parsedDays,
        createdAt: Date.now(),
        authorId: req.user.id
      };
      
      itinerariesStore.push(newItinerary);
      
      res.status(201).json({
        success: true,
        message: 'Itinerary created successfully',
        data: newItinerary,
        source: 'memory'
      });
    }
  } catch (error) {
    console.error('Create itinerary error:', error);
    res.status(500).json({
      error: 'Failed to create itinerary',
      message: error.message
    });
  }
};

// Update itinerary
const updateItinerary = async (req, res) => {
  try {
    const { id } = req.params;
    const { destination, region, title, duration, description, days } = req.body;

    // Handle image URL or file upload to Cloudinary
    let imageUrl = req.body.imageUrl; // Support URL-based image updates
    if (req.file) {
      console.log('📤 Uploading updated itinerary image to Cloudinary...');
      const { uploadToCloudinary } = require('../middleware/upload');
      const result = await uploadToCloudinary(req.file.buffer, 'travel-dashboard/itineraries');
      imageUrl = result.secure_url;
      console.log('✅ Updated itinerary image uploaded:', imageUrl);
    }

    const updateData = {
      ...(destination && { destination }),
      ...(region && { region }),
      ...(title && { title }),
      ...(duration && { duration }),
      ...(description !== undefined && { description }),
      ...(imageUrl && { imageUrl })
    };

    try {
      // Try database first
      const itinerary = await prisma.itinerary.update({
        where: { id },
        data: updateData,
        include: {
          days: true,
          author: {
            select: { id: true, name: true, email: true }
          }
        }
      });

      // Update days if provided
      if (days) {
        await prisma.itineraryDay.deleteMany({
          where: { itineraryId: id }
        });

        await prisma.itineraryDay.createMany({
          data: JSON.parse(days).map(day => ({
            itineraryId: id,
            dayNumber: day.day,
            activities: day.activities
          }))
        });
      }

      res.json({
        success: true,
        message: 'Itinerary updated successfully',
        data: itinerary,
        source: 'database'
      });
    } catch (dbError) {
      console.log('Database not available, using in-memory store');
      const index = itinerariesStore.findIndex(item => item.id === id);
      if (index === -1) {
        return res.status(404).json({ error: 'Itinerary not found' });
      }

      itinerariesStore[index] = {
        ...itinerariesStore[index],
        ...updateData,
        ...(days && { days: JSON.parse(days) })
      };

      res.json({
        success: true,
        message: 'Itinerary updated successfully',
        data: itinerariesStore[index],
        source: 'memory'
      });
    }
  } catch (error) {
    console.error('Update itinerary error:', error);
    res.status(500).json({
      error: 'Failed to update itinerary'
    });
  }
};

// Delete itinerary
const deleteItinerary = async (req, res) => {
  try {
    const { id } = req.params;

    try {
      await prisma.itinerary.delete({
        where: { id }
      });

      res.json({
        success: true,
        message: 'Itinerary deleted successfully',
        source: 'database'
      });
    } catch (dbError) {
      console.log('Database not available, using in-memory store');
      const index = itinerariesStore.findIndex(item => item.id === id);
      if (index === -1) {
        return res.status(404).json({ error: 'Itinerary not found' });
      }

      itinerariesStore.splice(index, 1);

      res.json({
        success: true,
        message: 'Itinerary deleted successfully',
        source: 'memory'
      });
    }
  } catch (error) {
    console.error('Delete itinerary error:', error);
    res.status(500).json({
      error: 'Failed to delete itinerary'
    });
  }
};

module.exports = {
  getAllItineraries,
  createItinerary,
  getItineraryById,
  updateItinerary,
  deleteItinerary
};