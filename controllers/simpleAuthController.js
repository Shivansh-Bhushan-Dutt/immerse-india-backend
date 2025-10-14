// Simplified authentication with fixed credentials
const jwt = require('jsonwebtoken');

// Fixed credentials
const FIXED_USERS = {
  admin: {
    id: 'admin-001',
    email: 'admin@dashboard.com',
    password: 'admin123',
    name: 'Admin User',
    role: 'admin'
  },
  user: {
    id: 'user-001',
    email: 'user@dashboard.com',
    password: 'user123',
    name: 'Regular User',
    role: 'user'
  }
};

// Login with fixed credentials
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required'
      });
    }

    // Find user by email
    const user = Object.values(FIXED_USERS).find(u => u.email === email);

    if (!user || user.password !== password) {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    // Create simple token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET || 'default-secret-key',
      { expiresIn: '24h' }
    );

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Login successful',
      user: userWithoutPassword,
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Login failed'
    });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    // req.user is set by the auth middleware
    const userId = req.user.id;
    
    // Find user by ID
    const user = Object.values(FIXED_USERS).find(u => u.id === userId);

    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Failed to get profile'
    });
  }
};

// Get available login credentials (for demo purposes)
const getCredentials = (req, res) => {
  const credentials = Object.values(FIXED_USERS).map(user => ({
    email: user.email,
    password: user.password,
    role: user.role,
    name: user.name
  }));

  res.json({
    success: true,
    message: 'Available login credentials',
    credentials
  });
};

module.exports = {
  login,
  getProfile,
  getCredentials
};