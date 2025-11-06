/**
 * Database Seeding Script for Immerse India Dashboard
 * 
 * This script creates the required admin and user accounts directly in Supabase
 * Run this with: node seed-users.js
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedUsers() {
  console.log('🌱 Starting database seeding...\n');

  try {
    // Admin credentials
    const adminEmail = 'immerseindia@admin.com';
    const adminPassword = 'ZNM8B4naq&';
    const adminName = 'Admin';

    // User credentials  
    const userEmail = 'user@immerseindia.com';
    const userPassword = 'immerse@2025';
    const userName = 'User';

    // Hash passwords
    console.log('🔐 Hashing passwords...');
    const adminHash = await bcrypt.hash(adminPassword, 10);
    const userHash = await bcrypt.hash(userPassword, 10);
    console.log('✅ Passwords hashed successfully\n');

    // Create or update Admin user
    console.log('👤 Creating/Updating Admin user...');
    const admin = await prisma.user.upsert({
      where: { email: adminEmail },
      update: {
        password: adminHash,
        name: adminName,
        role: 'admin'
      },
      create: {
        email: adminEmail,
        password: adminHash,
        name: adminName,
        role: 'admin'
      }
    });
    console.log(`✅ Admin user: ${admin.email} (${admin.role})`);

    // Create or update regular User
    console.log('👤 Creating/Updating User account...');
    const user = await prisma.user.upsert({
      where: { email: userEmail },
      update: {
        password: userHash,
        name: userName,
        role: 'user'
      },
      create: {
        email: userEmail,
        password: userHash,
        name: userName,
        role: 'user'
      }
    });
    console.log(`✅ User account: ${user.email} (${user.role})`);

    // Create additional demo users
    console.log('\n👥 Creating additional demo users...');
    const demoUsers = [
      { email: 'ravi@immerseindia.com', name: 'Ravi' },
      { email: 'shivansh@immerseindia.com', name: 'Shivansh' }
    ];

    for (const demoUser of demoUsers) {
      const created = await prisma.user.upsert({
        where: { email: demoUser.email },
        update: {
          password: userHash,
          name: demoUser.name,
          role: 'user'
        },
        create: {
          email: demoUser.email,
          password: userHash,
          name: demoUser.name,
          role: 'user'
        }
      });
      console.log(`✅ Demo user: ${created.email}`);
    }

    // Verify users
    console.log('\n📋 Verifying created users...');
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      },
      orderBy: [
        { role: 'desc' }, // admin first
        { email: 'asc' }
      ]
    });

    console.log('\n' + '='.repeat(80));
    console.log('📊 DATABASE USERS:');
    console.log('='.repeat(80));
    allUsers.forEach(u => {
      console.log(`  ${u.role.toUpperCase().padEnd(6)} | ${u.email.padEnd(30)} | ${u.name}`);
    });
    console.log('='.repeat(80));

    console.log('\n✅ Database seeding completed successfully!\n');
    console.log('📝 LOGIN CREDENTIALS:');
    console.log('='.repeat(80));
    console.log('ADMIN LOGIN:');
    console.log(`  Email:    ${adminEmail}`);
    console.log(`  Password: ${adminPassword}`);
    console.log('\nUSER LOGIN:');
    console.log(`  Email:    ${userEmail}`);
    console.log(`  Password: ${userPassword}`);
    console.log('='.repeat(80));

  } catch (error) {
    console.error('\n❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding function
seedUsers()
  .then(() => {
    console.log('\n🎉 Seeding process completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Seeding process failed:', error);
    process.exit(1);
  });
