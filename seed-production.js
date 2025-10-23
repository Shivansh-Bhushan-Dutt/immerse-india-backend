const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🌱 Seeding production database...');

    // Hash passwords properly for production
    const adminPassword = await bcrypt.hash('admin123', 12);
    const userPassword = await bcrypt.hash('user123', 12);

    // Create admin user
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@dashboard.com' },
      update: {},
      create: {
        email: 'admin@dashboard.com',
        password: adminPassword,
        name: 'Dashboard Admin',
        role: 'admin'
      }
    });
    console.log('✅ Admin user created');

    // Create regular user
    const regularUser = await prisma.user.upsert({
      where: { email: 'user@dashboard.com' },
      update: {},
      create: {
        email: 'user@dashboard.com',
        password: userPassword,
        name: 'Dashboard User',
        role: 'user'
      }
    });
    console.log('✅ Regular user created');

    // Sample Experience 1 - Kerala
    const experience1 = await prisma.experience.upsert({
      where: { id: 'kerala-backwaters' },
      update: {},
      create: {
        id: 'kerala-backwaters',
        destination: 'Kerala',
        region: 'South',
        title: 'Kerala Backwater Paradise',
        description: 'Experience the serene beauty of Kerala backwaters with traditional houseboats, lush green landscapes, and authentic local culture.',
        highlights: JSON.stringify([
          'Traditional houseboat cruise through backwaters',
          'Authentic Kerala cuisine and spice plantation tours',
          'Ayurvedic spa treatments and wellness therapies',
          'Coconut plantation visits and toddy tapping experience',
          'Kathakali dance performances and cultural shows'
        ]),
        imageUrl: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&h=600&fit=crop&q=80',
        authorId: adminUser.id
      }
    });

    // Sample Experience 2 - Rajasthan
    const experience2 = await prisma.experience.upsert({
      where: { id: 'rajasthan-royal' },
      update: {},
      create: {
        id: 'rajasthan-royal',
        destination: 'Rajasthan',
        region: 'North',
        title: 'Royal Palaces of Rajasthan',
        description: 'Discover the grandeur of Rajasthani royalty with magnificent palaces, historic forts, and vibrant desert culture.',
        highlights: JSON.stringify([
          'City Palace Udaipur with stunning lake views',
          'Amber Fort Jaipur - architectural marvel',
          'Mehrangarh Fort Jodhpur - blue city panorama',
          'Camel safari in Thar Desert with camping',
          'Traditional Rajasthani folk music and dance'
        ]),
        imageUrl: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&h=600&fit=crop&q=80',
        authorId: adminUser.id
      }
    });

    // Sample Experience 3 - Goa
    const experience3 = await prisma.experience.upsert({
      where: { id: 'goa-beaches' },
      update: {},
      create: {
        id: 'goa-beaches',
        destination: 'Goa',
        region: 'West',
        title: 'Goa Beach Paradise',
        description: 'Relax on pristine beaches, explore Portuguese heritage, and enjoy vibrant nightlife in India\'s beach capital.',
        highlights: JSON.stringify([
          'Pristine beaches - Baga, Calangute, Anjuna',
          'Portuguese colonial architecture and churches',
          'Vibrant beach shacks and seafood cuisine',
          'Water sports - parasailing, jet skiing, diving',
          'Spice plantations and traditional Goan culture'
        ]),
        imageUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&h=600&fit=crop&q=80',
        authorId: adminUser.id
      }
    });

    console.log('✅ Sample experiences created');

    // Sample Itinerary 1 - Kerala 7 Days
    const itinerary1 = await prisma.itinerary.create({
      data: {
        destination: 'Kerala',
        region: 'South',
        title: '7-Day Kerala Backwater & Hill Station Tour',
        duration: '7 days',
        imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80',
        authorId: adminUser.id,
        days: {
          create: [
            {
              dayNumber: 1,
              activities: JSON.stringify([
                'Arrival in Kochi - Fort Kochi exploration',
                'Chinese fishing nets and spice markets',
                'Evening Kathakali performance'
              ])
            },
            {
              dayNumber: 2,
              activities: JSON.stringify([
                'Drive to Munnar (4 hours)',
                'Tea plantation visit and factory tour',
                'Overnight in hill station resort'
              ])
            },
            {
              dayNumber: 3,
              activities: JSON.stringify([
                'Eravikulam National Park visit',
                'Mattupetty Dam and Echo Point',
                'Tea museum and tasting session'
              ])
            },
            {
              dayNumber: 4,
              activities: JSON.stringify([
                'Drive to Thekkady (3 hours)',
                'Periyar Wildlife Sanctuary boat ride',
                'Spice plantation tour and Ayurvedic massage'
              ])
            },
            {
              dayNumber: 5,
              activities: JSON.stringify([
                'Drive to Alleppey backwaters (4 hours)',
                'Houseboat check-in and lunch',
                'Cruise through narrow canals and villages'
              ])
            },
            {
              dayNumber: 6,
              activities: JSON.stringify([
                'Morning backwater cruise',
                'Traditional fishing village visit',
                'Coir-making demonstration and local lunch'
              ])
            },
            {
              dayNumber: 7,
              activities: JSON.stringify([
                'Houseboat check-out',
                'Drive to Kochi airport (1.5 hours)',
                'Departure with memories of Gods Own Country'
              ])
            }
          ]
        }
      }
    });

    console.log('✅ Sample itinerary created');

    // Sample Images
    const images = [
      {
        destination: 'Kerala',
        region: 'South',
        url: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&h=600&fit=crop&q=80',
        caption: 'Traditional houseboat in Kerala backwaters during golden hour',
        authorId: adminUser.id
      },
      {
        destination: 'Rajasthan',
        region: 'North',
        url: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&h=600&fit=crop&q=80',
        caption: 'Magnificent Amber Fort overlooking Jaipur city',
        authorId: adminUser.id
      },
      {
        destination: 'Goa',
        region: 'West',
        url: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&h=600&fit=crop&q=80',
        caption: 'Sunset at pristine Goa beach with palm trees',
        authorId: adminUser.id
      }
    ];

    for (const imageData of images) {
      await prisma.image.create({ data: imageData });
    }
    console.log('✅ Sample images created');

    // Sample Updates
    const updates = [
      {
        type: 'travel-trend',
        title: 'Sustainable Tourism in Kerala',
        content: 'Kerala leads India\'s sustainable tourism initiatives with eco-friendly houseboats, organic spice plantations, and community-based tourism programs that benefit local communities while preserving the environment.',
        externalUrl: null,
        authorId: adminUser.id
      },
      {
        type: 'new-experience',
        title: 'New Rajasthan Heritage Hotels',
        content: 'Experience royal luxury in converted palace hotels across Rajasthan. Stay in the same rooms where maharajas once lived, with modern amenities and traditional hospitality.',
        externalUrl: null,
        authorId: adminUser.id
      },
      {
        type: 'newsletter',
        title: 'Monsoon Travel Tips for India',
        content: 'Make the most of monsoon season with our complete guide to traveling in India during the rains. From the best hill stations to cultural festivals, discover why monsoon is magical.',
        externalUrl: null,
        authorId: adminUser.id
      }
    ];

    for (const updateData of updates) {
      await prisma.update.create({ data: updateData });
    }
    console.log('✅ Sample updates created');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📋 LOGIN CREDENTIALS:');
    console.log('👨‍💼 Admin: admin@dashboard.com / admin123');
    console.log('👤 User: user@dashboard.com / user123');
    console.log('\n🚀 Your dashboard is ready for production!');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
