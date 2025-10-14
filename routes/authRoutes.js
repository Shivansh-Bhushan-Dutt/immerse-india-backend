const express = require('express');
const { register, login, getCurrentUser, debugRequestBody } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// Add debug middleware to registration route
router.post('/register', debugRequestBody, register);
router.post('/login', login);
router.get('/me', authMiddleware, getCurrentUser);

module.exports = router;