const { prisma } = require('../models/database');
const bcrypt = require('bcryptjs');

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seed...');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 12);
    const admin = await prisma.user.upsert({
      where: { email: 'admin@travel.com' },
      update: {},
      create: {
        email: 'admin@travel.com',
        password: adminPassword,
        name: 'Admin User',
        role: 'admin'
      }
    });

    // Create regular user
    const userPassword = await bcrypt.hash('user123', 12);
    const user = await prisma.user.upsert({
      where: { email: 'user@travel.com' },
      update: {},
      create: {
        email: 'user@travel.com',
        password: userPassword,
        name: 'Demo User',
        role: 'user'
      }
    });

    // Sample experience
    await prisma.experience.upsert({
      where: { id: 'sample-experience-1' },
      update: {},
      create: {
        id: 'sample-experience-1',
        destination: 'Rajasthan',
        region: 'North India',
        title: 'Royal Palaces of Rajasthan',
        description: 'Experience the grandeur of Rajasthan with visits to magnificent palaces and forts.',
        highlights: ['City Palace Udaipur', 'Amber Fort Jaipur', 'Mehrangarh Fort Jodhpur'],
        imageUrl: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da',
        authorId: admin.id
      }
    });

    console.log('✅ Database seeded successfully!');
    console.log('👤 Admin: admin@travel.com / admin123');
    console.log('👤 User: user@travel.com / user123');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedDatabase();