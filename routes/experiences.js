const express = require('express');
const { 
  getAllExperiences, 
  createExperience, 
  getExperienceById, 
  updateExperience, 
  deleteExperience 
} = require('../controllers/experienceController');
const { authenticateToken } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

const router = express.Router();

// Public routes
router.get('/', getAllExperiences);
router.get('/:id', getExperienceById);

// Protected routes
router.post('/', authenticateToken, upload.single('image'), createExperience);
router.put('/:id', authenticateToken, upload.single('image'), updateExperience);
router.delete('/:id', authenticateToken, deleteExperience);

module.exports = router;