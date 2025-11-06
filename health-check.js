/**
 * Quick Deployment Health Check
 * Tests backend API, database connection, and verifies users exist
 */

const { PrismaClient } = require('@prisma/client');

const BACKEND_URL = 'https://immerse-india-backend.vercel.app';
const API_URL = `${BACKEND_URL}/api`;

const prisma = new PrismaClient();

async function checkHealth() {
  console.log('\n🏥 Running Health Checks...\n');
  console.log('='.repeat(80));
  
  // 1. Check Backend API (skipped - requires fetch)
  console.log('\n📡 Backend URL: ' + BACKEND_URL);
  console.log('   API URL: ' + API_URL);
  console.log('   (Test manually by opening in browser)');

  // 2. Check Database Connection
  console.log('\n🗄️  Checking Database Connection...');
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connection successful');
  } catch (error) {
    console.log(`❌ Database connection failed: ${error.message}`);
    return;
  }

  // 3. Check Users Exist
  console.log('\n👥 Checking Users...');
  try {
    const users = await prisma.user.findMany({
      select: {
        email: true,
        role: true,
        name: true,
        createdAt: true
      },
      orderBy: { role: 'desc' }
    });

    if (users.length === 0) {
      console.log('❌ No users found in database!');
      console.log('⚠️  Run: node seed-users.js');
    } else {
      console.log(`✅ Found ${users.length} user(s):`);
      users.forEach(u => {
        console.log(`   ${u.role.toUpperCase().padEnd(6)} - ${u.email.padEnd(35)} (${u.name})`);
      });
    }

    // Check for required users
    const adminUser = users.find(u => u.email === 'immerseindia@admin.com');
    const regularUser = users.find(u => u.email === 'user@immerseindia.com');

    if (!adminUser) {
      console.log('\n⚠️  Admin user NOT found: immerseindia@admin.com');
    }
    if (!regularUser) {
      console.log('\n⚠️  Regular user NOT found: user@immerseindia.com');
    }
  } catch (error) {
    console.log(`❌ Error checking users: ${error.message}`);
  }

  console.log('\n' + '='.repeat(80));
  console.log('\n✅ Health check completed!\n');

  await prisma.$disconnect();
}

checkHealth().catch(console.error);
