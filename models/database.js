const { PrismaClient } = require('@prisma/client');

// Create PrismaClient with minimal logging to reduce console noise
const prisma = new PrismaClient({
  log: ['error', 'warn'], // Only log errors and warnings, not queries
  errorFormat: 'minimal'
});

// Database connection helper
const connectDatabase = async () => {
  try {
    // Test connection with a simple query
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Connected to database successfully');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    
    // Try again after a short delay
    try {
      console.log('🔄 Retrying connection in 2 seconds...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      await prisma.$queryRaw`SELECT 1`;
      console.log('✅ Retry successful, connected to database');
      return true;
    } catch (retryError) {
      console.error('❌ Retry failed, database connection error:', retryError);
      return false;
    }
  }
};

// Graceful disconnect
const disconnectDatabase = async () => {
  try {
    await prisma.$disconnect();
    console.log('🔌 Disconnected from database');
  } catch (error) {
    console.error('❌ Error disconnecting from database:', error);
  }
};

module.exports = {
  prisma,
  connectDatabase,
  disconnectDatabase
};