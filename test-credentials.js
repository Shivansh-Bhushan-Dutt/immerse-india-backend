// Test the email validation and login credentials logic
const bcrypt = require('bcryptjs');

// Email validation function (same as in authController)
const validateEmail = (email) => {
  // Admin email: must be exactly 'immerseindia@admin.com'
  if (email === 'immerseindia@admin.com') {
    return { isValid: true, role: 'admin' };
  }
  
  // User email: must end with '@immerseindia.com' but not be the admin email
  if (email.endsWith('@immerseindia.com') && email !== 'immerseindia@admin.com') {
    return { isValid: true, role: 'user' };
  }
  
  return { isValid: false, role: null };
};

async function testCredentials() {
  console.log('🧪 Testing Email Validation Logic\n');
  
  // Test cases
  const testEmails = [
    'immerseindia@admin.com',    // Should be valid admin
    'ravi@immerseindia.com',     // Should be valid user
    'shivansh@immerseindia.com', // Should be valid user
    'user@immerseindia.com',     // Should be valid user
    'test@gmail.com',            // Should be invalid
    'admin@example.com',         // Should be invalid
    'someone@immerseindia.co',   // Should be invalid (missing 'm')
  ];
  
  console.log('Email Validation Tests:');
  console.log('='.repeat(50));
  
  testEmails.forEach(email => {
    const result = validateEmail(email);
    const status = result.isValid ? '✅ VALID' : '❌ INVALID';
    const role = result.role ? `(${result.role})` : '';
    console.log(`${status} ${email} ${role}`);
  });
  
  console.log('\n🔑 Password Hashing Test\n');
  
  // Test password hashing
  const adminPassword = 'ZNM8B4naq&';
  const userPassword = 'immerse@2025';
  
  console.log('Creating password hashes...');
  const adminHash = await bcrypt.hash(adminPassword, 10);
  const userHash = await bcrypt.hash(userPassword, 10);
  
  console.log(`Admin password hash: ${adminHash.substring(0, 20)}...`);
  console.log(`User password hash: ${userHash.substring(0, 20)}...`);
  
  // Verify the hashes work
  const adminVerify = await bcrypt.compare(adminPassword, adminHash);
  const userVerify = await bcrypt.compare(userPassword, userHash);
  
  console.log(`\nPassword verification:`);
  console.log(`Admin password verification: ${adminVerify ? '✅ SUCCESS' : '❌ FAILED'}`);
  console.log(`User password verification: ${userVerify ? '✅ SUCCESS' : '❌ FAILED'}`);
  
  console.log('\n📋 Summary of Required Credentials:');
  console.log('='.repeat(40));
  console.log('👨‍💼 ADMIN LOGIN:');
  console.log(`   Email: immerseindia@admin.com`);
  console.log(`   Password: ZNM8B4naq&`);
  console.log(`   Role: admin`);
  console.log('');
  console.log('👤 USER LOGINS:');
  console.log(`   Email: *@immerseindia.com (e.g., ravi@immerseindia.com)`);
  console.log(`   Password: immerse@2025`);
  console.log(`   Role: user`);
  console.log('');
  console.log('❌ INVALID EMAILS:');
  console.log(`   - Any email not ending with @immerseindia.com`);
  console.log(`   - Admin email used for user role`);
}

testCredentials().catch(console.error);