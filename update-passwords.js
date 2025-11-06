/**
 * Update User Passwords Script
 * Updates existing users with correct passwords
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function updatePasswords() {
  const prisma = new PrismaClient();
  
  console.log('🔐 Updating user passwords...\n');

  try {
    // Hash passwords
    const adminPassword = 'ZNM8B4naq&';
    const userPassword = 'immerse@2025';
    
    const adminHash = await bcrypt.hash(adminPassword, 10);
    const userHash = await bcrypt.hash(userPassword, 10);

    // Update admin
    console.log('Updating admin password...');
    await prisma.$executeRaw`
      UPDATE users 
      SET password = ${adminHash}, 
          name = 'Admin',
          role = 'admin'
      WHERE email = 'immerseindia@admin.com'
    `;
    console.log('✅ Admin password updated');

    // Update user
    console.log('Updating user password...');
    await prisma.$executeRaw`
      UPDATE users 
      SET password = ${userHash},
          name = 'User',
          role = 'user'
      WHERE email = 'user@immerseindia.com'
    `;
    console.log('✅ User password updated');

    // Update other demo users
    console.log('Updating demo users passwords...');
    await prisma.$executeRaw`
      UPDATE users 
      SET password = ${userHash}
      WHERE email LIKE '%@immerseindia.com' 
      AND email != 'immerseindia@admin.com'
    `;
    console.log('✅ All demo users updated');

    console.log('\n✅ Password update completed!\n');
    console.log('=' .repeat(80));
    console.log('LOGIN CREDENTIALS:');
    console.log('='.repeat(80));
    console.log('ADMIN:');
    console.log(`  Email:    immerseindia@admin.com`);
    console.log(`  Password: ${adminPassword}`);
    console.log('\nUSER:');
    console.log(`  Email:    user@immerseindia.com`);
    console.log(`  Password: ${userPassword}`);
    console.log('='.repeat(80));

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updatePasswords().catch(console.error);
