const { PrismaClient } = require('@prisma/client');

// Create PrismaClient with connection pooling and optimizations for serverless
const prisma = new PrismaClient({
  log: ['error', 'warn'], // Only log errors and warnings
  errorFormat: 'minimal',
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  },
  // Connection pool configuration for serverless
  connection: {
    connectionLimit: 10,
    pool: {
      min: 2,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000
    }
  }
});

// Global prisma instance to reuse connections
global.prisma = global.prisma || prisma;

// Database connection helper with retry logic
const connectDatabase = async () => {
  try {
    // Test connection with a simple query
    await global.prisma.$queryRaw`SELECT 1`;
    console.log('✅ Connected to database successfully');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    
    // Try again after a short delay
    try {
      console.log('🔄 Retrying connection in 2 seconds...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      await global.prisma.$queryRaw`SELECT 1`;
      console.log('✅ Retry successful, connected to database');
      return true;
    } catch (retryError) {
      console.error('❌ Retry failed:', retryError.message);
      return false;
    }
  }
};

// Graceful disconnect
const disconnectDatabase = async () => {
  try {
    await global.prisma.$disconnect();
    console.log('🔌 Disconnected from database');
  } catch (error) {
    console.error('❌ Error disconnecting from database:', error);
  }
};

module.exports = {
  prisma: global.prisma,
  connectDatabase,
  disconnectDatabase
};