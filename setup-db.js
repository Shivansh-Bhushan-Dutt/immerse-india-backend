// Setup specific users with exact credentials as specified
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function setupSpecificUsers() {
  try {
    console.log('🔄 Setting up users with specific credentials...');
    
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Clear existing users (optional - for fresh setup)
    await prisma.user.deleteMany({});
    console.log('🧹 Cleared existing users');
    
    // Create admin user with specific credentials
    console.log('👤 Creating admin user...');
    const adminPassword = await bcrypt.hash('ZNM8B4naq&', 10);
    const adminUser = await prisma.user.create({
      data: {
        name: 'Admin',
        email: 'immerseindia@admin.com',
        password: adminPassword,
        role: 'admin'
      }
    });
    console.log('✅ Admin user created:', adminUser.email);
    
    // Create sample users with @immerseindia.com emails
    console.log('👥 Creating sample users...');
    const userPassword = await bcrypt.hash('immerse@2025', 10);
    
    const sampleUsers = [
      { name: 'Ravi', email: 'ravi@immerseindia.com' },
      { name: 'Shivansh', email: 'shivansh@immerseindia.com' },
      { name: 'User Demo', email: 'user@immerseindia.com' }
    ];
    
    for (const userData of sampleUsers) {
      const user = await prisma.user.create({
        data: {
          name: userData.name,
          email: userData.email,
          password: userPassword,
          role: 'user'
        }
      });
      console.log(`✅ User created: ${user.email}`);
    }
    
    // List all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });
    
    console.log('\n📋 All users in database:');
    console.log('='.repeat(50));
    users.forEach(user => {
      console.log(`👤 ${user.name}`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   🎯 Role: ${user.role}`);
      console.log(`   📅 Created: ${user.createdAt.toISOString().split('T')[0]}`);
      console.log('');
    });
    
    console.log('🎉 Database setup completed successfully!');
    console.log('\n🔑 Login Credentials:');
    console.log('='.repeat(30));
    console.log('👨‍💼 ADMIN:');
    console.log('   Email: immerseindia@admin.com');
    console.log('   Password: ZNM8B4naq&');
    console.log('');
    console.log('👤 USERS (all use same password):');
    console.log('   Emails: *@immerseindia.com (e.g., ravi@immerseindia.com)');
    console.log('   Password: immerse@2025');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    console.error('Error details:', error.message);
    
    if (error.code === 'P1001') {
      console.log('\n💡 Troubleshooting:');
      console.log('1. Check if Supabase database is running');
      console.log('2. Verify DATABASE_URL in .env file');
      console.log('3. Check Supabase dashboard for connection issues');
    }
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Database connection closed');
  }
}

setupSpecificUsers();