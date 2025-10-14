require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDatabase, disconnectDatabase } = require('./models/database');
const authRoutes = require('./routes/auth');
const experienceRoutes = require('./routes/experiences');
const prisma = require('./prisma');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3001; 
// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  optionsSuccessStatus: 200,
}));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Parse JSON with larger size limit and better error handling
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf, encoding) => {
    try {
      JSON.parse(buf);
    } catch (e) {
      console.error('Invalid JSON received:', e);
      res.status(400).json({ 
        error: 'Invalid JSON',
        message: 'The request body contains invalid JSON',
        code: 'INVALID_JSON'
      });
      throw new Error('Invalid JSON');
    }
  }
}));

// Debug middleware to log request body
app.use((req, res, next) => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    console.log('Request body:', req.body);
  }
  next();
});

app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/experiences', experienceRoutes);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Test database connection as part of health check
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ 
      status: 'ok', 
      message: 'Server is running',
      database: 'connected'
    });
  } catch (error) {
    console.error('Health check database error:', error);
    res.status(200).json({ 
      status: 'warning', 
      message: 'Server is running but database connection has issues',
      database: 'disconnected'
    });
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: {
      message: err.message || 'Internal Server Error',
      statusCode,
    }
  });
});

// Updated server startup with better error handling
const startServer = async () => {
  try {
    await prisma.$connect();
    console.log('Connected to database');
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
    }).on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Try a different port.`);
      } else {
        console.error('Failed to start server:', err);
      }
    });
  } catch (error) {
    console.error('Failed to connect to database:', error);
    // Don't exit in development
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit the process in development
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

startServer();
