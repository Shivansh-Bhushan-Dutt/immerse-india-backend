const { PrismaClient } = require('@prisma/client');

// Create PrismaClient optimized for serverless
const prisma = global.prisma || new PrismaClient({
  log: ['error', 'warn'],
  errorFormat: 'minimal'
});

// Reuse prisma instance in serverless to avoid connection issues
if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

// Database connection helper with retry logic
const connectDatabase = async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Connected to database successfully');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    
    // Try again after a short delay
    try {
      console.log('🔄 Retrying connection in 2 seconds...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      await prisma.$queryRaw`SELECT 1`;
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