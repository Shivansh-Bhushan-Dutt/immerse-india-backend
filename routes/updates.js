const express = require('express');
const { 
  getAllUpdates, 
  createUpdate, 
  getUpdateById, 
  updateUpdate, 
  deleteUpdate 
} = require('../controllers/updateController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getAllUpdates);
router.get('/:id', getUpdateById);

// Protected routes (admin only)
router.post('/', authenticateToken, createUpdate);
router.put('/:id', authenticateToken, updateUpdate);
router.delete('/:id', authenticateToken, deleteUpdate);

module.exports = router;