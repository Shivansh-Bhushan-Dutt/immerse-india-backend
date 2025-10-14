require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Only import database for experiences, not auth
const { connectDatabase, disconnectDatabase, prisma } = require('./models/database');
const authRoutes = require('./routes/auth');
const experienceRoutes = require('./routes/experiences');

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  optionsSuccessStatus: 200,
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware (simplified)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/experiences', experienceRoutes);

// Health check endpoint (simplified - no database check for basic functionality)
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Simple test endpoint
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'API is working',
    availableEndpoints: [
      'GET /api/health',
      'GET /api/auth/credentials',
      'POST /api/auth/login',
      'GET /api/auth/profile',
      'GET /api/experiences',
      'POST /api/experiences (requires auth)'
    ]
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.statusCode || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

// Start the server
const startServer = async () => {
  try {
    console.log('🚀 Starting Travel Dashboard API Server...');
    
    // Try to connect to database for experiences (optional)
    try {
      const connected = await connectDatabase();
      if (connected) {
        console.log('✅ Database connected - experiences will work');
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

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

startServer();