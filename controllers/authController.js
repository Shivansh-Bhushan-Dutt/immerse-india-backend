const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

// Email validation function for specific requirements
const validateEmail = (email) => {
  // Admin email: must be exactly 'immerseindia@admin.com'
  if (email === 'immerseindia@admin.com') {
    return { isValid: true, role: 'admin' };
  }
  
  // User email: must end with '@immerseindia.com' but not be the admin email
  if (email.endsWith('@immerseindia.com') && email !== 'immerseindia@admin.com') {
    return { isValid: true, role: 'user' };
  }
  
  return { isValid: false, role: null };
};

// Debug middleware to check incoming request bodies
const debugRequestBody = (req, res, next) => {
  console.log('Request body:', req.body);
  next();
};

// Register a new user
exports.register = async (req, res) => {
  try {
    console.log('Register endpoint called');
    console.log('Request body:', req.body);
    
    // Check if body exists
    if (!req.body) {
      return res.status(400).json({ 
        error: 'Missing request body',
        message: 'Request body is required',
        code: 'INVALID_REQUEST'
      });
    }
    
    const { name, email, password, role = 'user' } = req.body;
    
    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'Name, email and password are required',
        code: 'INVALID_INPUT'
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(409).json({
        error: 'User already exists',
        message: 'Email already in use',
        code: 'EMAIL_IN_USE'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role === 'admin' ? 'admin' : 'user'  // Ensure role is valid
      }
    });

    // Create token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    
    res.status(201).json({
      message: 'User created successfully',
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Failed to register user',
      message: error.message,
      code: 'REGISTRATION_FAILED'
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    console.log('Login endpoint called');
    console.log('Request body:', req.body);
    
    // Check if body exists
    if (!req.body) {
      return res.status(400).json({ 
        error: 'Missing request body',
        message: 'Request body is required',
        code: 'INVALID_REQUEST'
      });
    }
    
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Email and password are required',
        code: 'INVALID_INPUT'
      });
    }

    // Validate email format according to business rules
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      return res.status(400).json({
        error: 'Invalid email format',
        message: 'Email must be immerseindia@admin.com for admin or end with @immerseindia.com for users',
        code: 'INVALID_EMAIL_FORMAT'
      });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    // Check if user exists and password is correct
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid email or password',
        code: 'AUTH_FAILED'
      });
    }

    // Create token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      message: 'Login successful',
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Failed to login',
      message: error.message,
      code: 'LOGIN_FAILED'
    });
  }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User no longer exists',
        code: 'USER_NOT_FOUND'
      });
    }

    // Return user without password
    const { password, ...userWithoutPassword } = user;

    res.status(200).json({
      user: userWithoutPassword
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get user',
      message: error.message,
      code: 'GET_USER_FAILED'
    });
  }
};

module.exports.debugRequestBody = debugRequestBody;