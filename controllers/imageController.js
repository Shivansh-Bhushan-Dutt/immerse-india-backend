const { prisma } = require('../models/database');

// In-memory storage for when database is not available
let imagesStore = [
  {
    id: '1',
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&q=80',
    destination: 'Ladakh',
    region: 'North',
    caption: 'Breathtaking mountain landscapes of Ladakh with snow-capped peaks and pristine lakes',
    createdAt: Date.now() - (1 * 24 * 60 * 60 * 1000),
    authorId: 'admin-001'
  },
  {
    id: '2',
    url: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&h=600&fit=crop&q=80',
    destination: 'Goa',
    region: 'West',
    caption: 'Golden sandy beaches and crystal clear waters of Goa coastline',
    createdAt: Date.now() - (3 * 24 * 60 * 60 * 1000),
    authorId: 'admin-001'
  }
];

// Get all images
const getAllImages = async (req, res) => {
  try {
    // Try database first, fall back to in-memory store
    try {
      const images = await prisma.image.findMany({
        include: {
          author: {
            select: { id: true, name: true, email: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      
      res.json({
        success: true,
        data: images,
        source: 'database'
      });
    } catch (dbError) {
      console.log('Database not available, using in-memory store');
      res.json({
        success: true,
        data: imagesStore,
        source: 'memory'
      });
    }
  } catch (error) {
    console.error('Get images error:', error);
    res.status(500).json({
      error: 'Failed to fetch images'
    });
  }
};

// Get image by ID
const getImageById = async (req, res) => {
  try {
    const { id } = req.params;
    
    try {
      const image = await prisma.image.findUnique({
        where: { id },
        include: {
          author: {
            select: { id: true, name: true, email: true }
          }
        }
      });
      
      if (!image) {
        return res.status(404).json({ error: 'Image not found' });
      }
      
      res.json({
        success: true,
        data: image,
        source: 'database'
      });
    } catch (dbError) {
      const image = imagesStore.find(item => item.id === id);
      if (!image) {
        return res.status(404).json({ error: 'Image not found' });
      }
      
      res.json({
        success: true,
        data: image,
        source: 'memory'
      });
    }
  } catch (error) {
    console.error('Get image error:', error);
    res.status(500).json({
      error: 'Failed to fetch image'
    });
  }
};

// Create new image
const createImage = async (req, res) => {
  try {
    console.log('=== CREATE IMAGE REQUEST ===');
    console.log('Body:', req.body);
    console.log('File:', req.file);
    console.log('User:', req.user?.id);
    
    const { destination, region, caption, url } = req.body;
    const userId = req.user.id;
    
    // Validate required fields
    if (!destination || !region || !caption) {
      console.error('Missing required fields');
      return res.status(400).json({
        error: 'Missing required fields: destination, region, caption'
      });
    }

    // Handle image upload to Cloudinary
    let imageUrl = url; // Use provided URL if any
    
    if (req.file) {
      // Image file uploaded - upload to Cloudinary
      console.log('File detected, uploading to Cloudinary...');
      console.log('File buffer size:', req.file.buffer?.length);
      
      const { uploadToCloudinary } = require('../middleware/upload');
      try {
        const result = await uploadToCloudinary(req.file.buffer, 'immerse-india/images');
        imageUrl = result.secure_url; // Use Cloudinary URL
        console.log('✅ Image uploaded to Cloudinary:', imageUrl);
        console.log('Cloudinary result:', {
          url: result.secure_url,
          publicId: result.public_id,
          format: result.format
        });
      } catch (cloudinaryError) {
        console.error('❌ Cloudinary upload error:', cloudinaryError);
        return res.status(500).json({
          error: 'Failed to upload image to Cloudinary',
          details: cloudinaryError.message
        });
      }
    } else if (url) {
      console.log('Using provided URL:', url);
    } else {
      console.error('No file or URL provided');
      return res.status(400).json({
        error: 'Either provide an image URL or upload an image file'
      });
    }

    if (!imageUrl) {
      console.error('Image URL is still empty after processing');
      return res.status(400).json({
        error: 'Failed to get image URL'
      });
    }

    console.log('Final image URL:', imageUrl);

    const newImage = {
      id: Date.now().toString(),
      destination,
      region,
      caption,
      url: imageUrl,
      createdAt: Date.now(),
      authorId: userId
    };

    try {
      // Try database first
      const image = await prisma.image.create({
        data: {
          destination,
          region,
          caption,
          url: imageUrl,
          authorId: userId
        },
        include: {
          author: {
            select: { id: true, name: true, email: true }
          }
        }
      });

      console.log('✅ Image saved to database:', image.id);
      
      res.status(201).json({
        success: true,
        message: 'Image created successfully',
        data: image,
        source: 'database',
        cloudinary: !!req.file // Indicate if uploaded to Cloudinary
      });
    } catch (dbError) {
      console.log('Database not available, using in-memory store');
      console.error('DB Error:', dbError);
      imagesStore.push(newImage);
      
      res.status(201).json({
        success: true,
        message: 'Image created successfully',
        data: newImage,
        source: 'memory',
        cloudinary: !!req.file
      });
    }
  } catch (error) {
    console.error('Create image error:', error);
    res.status(500).json({
      error: 'Failed to create image'
    });
  }
};

// Update image
const updateImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { destination, region, caption, url } = req.body;

    // Handle image upload to Cloudinary
    let imageUrl = url;
    
    if (req.file) {
      // New image file uploaded - upload to Cloudinary
      const { uploadToCloudinary } = require('../middleware/upload');
      try {
        const result = await uploadToCloudinary(req.file.buffer, 'immerse-india/images');
        imageUrl = result.secure_url;
        console.log('Image updated on Cloudinary:', imageUrl);
      } catch (cloudinaryError) {
        console.error('Cloudinary upload error:', cloudinaryError);
        return res.status(500).json({
          error: 'Failed to upload image to Cloudinary'
        });
      }
    }

    const updateData = {
      ...(destination && { destination }),
      ...(region && { region }),
      ...(caption && { caption }),
      ...(imageUrl && { url: imageUrl })
    };

    try {
      // Try database first
      const image = await prisma.image.update({
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
        message: 'Image updated successfully',
        data: image,
        source: 'database',
        cloudinary: !!req.file
      });
    } catch (dbError) {
      console.log('Database not available, using in-memory store');
      const index = imagesStore.findIndex(item => item.id === id);
      if (index === -1) {
        return res.status(404).json({ error: 'Image not found' });
      }

      imagesStore[index] = {
        ...imagesStore[index],
        ...updateData
      };

      res.json({
        success: true,
        message: 'Image updated successfully',
        data: imagesStore[index],
        source: 'memory'
      });
    }
  } catch (error) {
    console.error('Update image error:', error);
    res.status(500).json({
      error: 'Failed to update image'
    });
  }
};

// Delete image
const deleteImage = async (req, res) => {
  try {
    const { id } = req.params;

    try {
      await prisma.image.delete({
        where: { id }
      });

      res.json({
        success: true,
        message: 'Image deleted successfully',
        source: 'database'
      });
    } catch (dbError) {
      console.log('Database not available, using in-memory store');
      const index = imagesStore.findIndex(item => item.id === id);
      if (index === -1) {
        return res.status(404).json({ error: 'Image not found' });
      }

      imagesStore.splice(index, 1);

      res.json({
        success: true,
        message: 'Image deleted successfully',
        source: 'memory'
      });
    }
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({
      error: 'Failed to delete image'
    });
  }
};

module.exports = {
  getAllImages,
  createImage,
  getImageById,
  updateImage,
  deleteImage
};