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
        error: 'Invalid configuration',
        message: 'Access restricted. Only authorized email domains are allowed.',
        code: 'INVALID_EMAIL_FORMAT'
      });
    }

    // Find or create user based on email type
    let user = await prisma.user.findUnique({
      where: { email }
    });

    // Handle admin login - fixed credentials only
    if (email === 'immerseindia@admin.com') {
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({
          error: 'Invalid configuration',
          message: 'Authentication failed',
          code: 'INVALID_CREDENTIALS'
        });
      }
    }
    // Handle user login - auto-create if doesn't exist with correct password
    else if (email.endsWith('@immerseindia.com')) {
      const correctUserPassword = 'immerse@2025';
      
      // If user doesn't exist, create them automatically
      if (!user) {
        // Check if password is correct before creating user
        if (password !== correctUserPassword) {
          return res.status(401).json({
            error: 'Invalid configuration',
            message: 'Authentication failed',
            code: 'INVALID_CREDENTIALS'
          });
        }

        console.log(`Creating new user: ${email}`);
        const hashedPassword = await bcrypt.hash(correctUserPassword, 10);
        const name = email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1);
        
        user = await prisma.user.create({
          data: {
            name: name,
            email: email,
            password: hashedPassword,
            role: 'user'
          }
        });
        console.log(`New user created: ${email}`);
      } else {
        // For existing users, verify the hashed password
        if (!(await bcrypt.compare(password, user.password))) {
          return res.status(401).json({
            error: 'Invalid configuration',
            message: 'Authentication failed',
            code: 'INVALID_CREDENTIALS'
          });
        }
      }
    }

    // Create token
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET environment variable is not set');
      return res.status(500).json({
        error: 'Server configuration error',
        message: 'Authentication service not properly configured',
        code: 'CONFIG_ERROR'
      });
    }

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

// Get current user profile (alias for getCurrentUser)
exports.getProfile = exports.getCurrentUser;

module.exports.debugRequestBody = debugRequestBody;