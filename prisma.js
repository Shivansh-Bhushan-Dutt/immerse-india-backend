const { PrismaClient } = require('@prisma/client');

// Create Prisma client with logging disabled for queries
const prisma = new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'error',
    },
    {
      emit: 'event',
      level: 'warn',
    },
    {
      emit: 'event',
      level: 'info',
    },
    // 'query' is removed from logging
  ],
});

// Still log errors
prisma.$on('error', (e) => {
  console.error('Prisma error:', e);
});

// Still log warnings
prisma.$on('warn', (e) => {
  console.warn('Prisma warning:', e);
});

module.exports = prisma;