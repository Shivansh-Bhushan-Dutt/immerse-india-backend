const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@dashboard.com' },
    update: {},
    create: {
      email: 'admin@dashboard.com',
      password: 'admin123', // In production, this should be hashed
      name: 'Admin User',
      role: 'admin'
    }
  });

  // Create regular user
  const regularUser = await prisma.user.upsert({
    where: { email: 'user@dashboard.com' },
    update: {},
    create: {
      email: 'user@dashboard.com',
      password: 'user123', // In production, this should be hashed
      name: 'Regular User',
      role: 'user'
    }
  });

  // Create sample experiences
  const experience1 = await prisma.experience.create({
    data: {
      destination: 'Kerala',
      region: 'South',
      title: 'Backwater Paradise',
      description: 'Experience the serene beauty of Kerala backwaters with traditional houseboats and lush landscapes.',
      highlights: JSON.stringify([
        'Houseboat cruise through backwaters',
        'Traditional Kerala cuisine',
        'Ayurvedic spa treatments',
        'Coconut plantation visits'
      ]),
      imageUrl: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&h=600&fit=crop&q=80',
      authorId: adminUser.id
    }
  });

  const experience2 = await prisma.experience.create({
    data: {
      destination: 'Ladakh',
      region: 'North',
      title: 'Mountain Adventure',
      description: 'Discover the breathtaking landscapes of Ladakh with snow-capped peaks and pristine lakes.',
      highlights: JSON.stringify([
        'Pangong Tso lake visit',
        'Monastery tours',
        'Mountain biking',
        'Local culture immersion'
      ]),
      imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&q=80',
      authorId: adminUser.id
    }
  });

  // Create sample itinerary
  const itinerary1 = await prisma.itinerary.create({
    data: {
      destination: 'Goa',
      region: 'West',
      title: 'Beach Paradise Getaway',
      duration: '5 days',
      imageUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&h=600&fit=crop&q=80',
      authorId: adminUser.id,
      days: {
        create: [
          {
            dayNumber: 1,
            activities: JSON.stringify(['Arrive in Goa', 'Check into beach resort', 'Sunset at Calangute Beach'])
          },
          {
            dayNumber: 2,
            activities: JSON.stringify(['Water sports at Baga Beach', 'Visit Anjuna Flea Market', 'Beach shack dinner'])
          },
          {
            dayNumber: 3,
            activities: JSON.stringify(['Old Goa churches tour', 'Spice plantation visit', 'River cruise'])
          }
        ]
      }
    }
  });

  // Create sample images
  const image1 = await prisma.image.create({
    data: {
      destination: 'Rajasthan',
      region: 'West',
      url: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800&h=600&fit=crop&q=80',
      caption: 'Majestic palaces and forts showcasing the royal heritage of Rajasthan',
      authorId: adminUser.id
    }
  });

  const image2 = await prisma.image.create({
    data: {
      destination: 'Kashmir',
      region: 'North',
      url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&h=600&fit=crop&q=80',
      caption: 'Paradise on Earth - Kashmir valley with its pristine lakes and snow-covered mountains',
      authorId: adminUser.id
    }
  });

  // Create sample updates
  const update1 = await prisma.update.create({
    data: {
      type: 'newsletter',
      title: 'Welcome to Immersive India Tours',
      content: 'Discover the incredible beauty and rich culture of India with our curated travel experiences.',
      externalUrl: 'https://example.com/blog/welcome-to-immersive-india',
      authorId: adminUser.id
    }
  });

  const update2 = await prisma.update.create({
    data: {
      type: 'travel-trend',
      title: 'Top 5 Monsoon Destinations in India',
      content: 'Experience the magical transformation of landscapes during monsoon season in these breathtaking destinations.',
      externalUrl: 'https://example.com/blog/monsoon-destinations',
      authorId: adminUser.id
    }
  });

  console.log('✅ Database seeding completed successfully!');
  console.log('📊 Created:');
  console.log(`   - 2 users (admin and regular)`);
  console.log(`   - 2 experiences`);
  console.log(`   - 1 itinerary with 3 days`);
  console.log(`   - 2 images`);
  console.log(`   - 2 updates`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });