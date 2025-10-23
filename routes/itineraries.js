const express = require('express');
const { 
  getAllItineraries, 
  createItinerary, 
  getItineraryById, 
  updateItinerary, 
  deleteItinerary 
} = require('../controllers/itineraryController');
const { authenticateToken } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

const router = express.Router();

// Public routes
router.get('/', getAllItineraries);
router.get('/:id', getItineraryById);

// Protected routes (admin only)
router.post('/', authenticateToken, upload.single('image'), createItinerary);
router.put('/:id', authenticateToken, upload.single('image'), updateItinerary);
router.delete('/:id', authenticateToken, deleteItinerary);

module.exports = router;