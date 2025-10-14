const express = require('express');
const { login, getProfile, getCredentials } = require('../controllers/simpleAuthController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/login', login);
router.get('/credentials', getCredentials); // For demo - shows available login credentials

// Protected routes
router.get('/profile', authenticateToken, getProfile);

module.exports = router;