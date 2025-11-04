require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Import database and routes
const { connectDatabase, disconnectDatabase, prisma } = require('./models/database');
const authRoutes = require('./routes/auth');
const experienceRoutes = require('./routes/experiences');
const itineraryRoutes = require('./routes/itineraries');
const imageRoutes = require('./routes/images');
const updateRoutes = require('./routes/updates');

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: [
    'https://immerseindia.vercel.app',
    'http://localhost:3000',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
  optionsSuccessStatus: 200,
}));

// Body parsing middleware
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

app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Debug middleware for request body (only in development)
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'development' && ['POST', 'PUT', 'PATCH'].includes(req.method)) {
    console.log('Request body:', req.body);
  }
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/experiences', experienceRoutes);
app.use('/api/itineraries', itineraryRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/updates', updateRoutes);

// Health check endpoint with database status
app.get('/api/health', async (req, res) => {
  try {
    // Test database connection as part of health check
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ 
      status: 'ok', 
      message: 'Server is running',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Health check database error:', error);
    res.status(200).json({ 
      status: 'warning', 
      message: 'Server is running but database connection has issues',
      database: 'disconnected',
      timestamp: new Date().toISOString()
    });
  }
});

// Test endpoint with available endpoints
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'API is working',
    availableEndpoints: [
      'GET /api/health',
      'GET /api/test',
      'GET /api/auth/credentials',
      'POST /api/auth/login',
      'GET /api/auth/profile',
      'GET /api/experiences',
      'POST /api/experiences (requires auth)',
      'PUT /api/experiences/:id (requires auth)',
      'DELETE /api/experiences/:id (requires auth)',
      'GET /api/itineraries',
      'POST /api/itineraries (requires auth)',
      'PUT /api/itineraries/:id (requires auth)',
      'DELETE /api/itineraries/:id (requires auth)',
      'GET /api/images',
      'POST /api/images (requires auth)',
      'PUT /api/images/:id (requires auth)',
      'DELETE /api/images/:id (requires auth)',
      'GET /api/updates',
      'POST /api/updates (requires auth)',
      'PUT /api/updates/:id (requires auth)',
      'DELETE /api/updates/:id (requires auth)'
    ]
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: err.message || 'Internal Server Error',
    code: err.code || 'SERVER_ERROR',
    statusCode
  });
});

// Start the server
const startServer = async () => {
  try {
    console.log('🚀 Starting Travel Dashboard API Server...');
    
    // Try to connect to database (optional for basic functionality)
    try {
      const connected = await connectDatabase();
      if (connected) {
        console.log('✅ Database connected - all features will work');
      } else {
        console.log('⚠️  Database not connected - auth will still work with fixed credentials');
      }
    } catch (dbError) {
      console.log('⚠️  Database connection failed - auth will still work with fixed credentials');
      console.log('Database error:', dbError.message);
    }

    // Start the Express server
    const server = app.listen(PORT, () => {
      console.log(`
🌐 Server running on port ${PORT}
📍 API Base URL: http://localhost:${PORT}/api
🔍 Health check: http://localhost:${PORT}/api/health
🧪 Test endpoint: http://localhost:${PORT}/api/test
🔑 Login credentials: http://localhost:${PORT}/api/auth/credentials

Fixed Login Credentials:
👨‍💼 Admin: admin@dashboard.com / admin123
👤 User: user@dashboard.com / user123
      `);
    }).on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use. Try a different port.`);
      } else {
        console.error('❌ Failed to start server:', err);
      }
      process.exit(1);
    });

    // Handle graceful shutdown
    const gracefulShutdown = async (signal) => {
      console.log(`\n${signal} received. Shutting down gracefully...`);
      
      server.close(async () => {
        try {
          await disconnectDatabase();
          console.log('✅ Database disconnected');
        } catch (error) {
          console.log('⚠️  Database disconnect error:', error.message);
        }
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle uncaught exceptions and unhandled rejections
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

startServer();
