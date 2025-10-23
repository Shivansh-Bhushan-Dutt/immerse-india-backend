const express = require('express');
const { 
  getAllImages, 
  createImage, 
  getImageById, 
  updateImage, 
  deleteImage 
} = require('../controllers/imageController');
const { authenticateToken } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

const router = express.Router();

// Public routes
router.get('/', getAllImages);
router.get('/:id', getImageById);

// Protected routes (admin only)
router.post('/', authenticateToken, upload.single('image'), createImage);
router.put('/:id', authenticateToken, upload.single('image'), updateImage);
router.delete('/:id', authenticateToken, deleteImage);

module.exports = router;