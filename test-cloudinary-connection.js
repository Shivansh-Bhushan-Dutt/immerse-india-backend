require('dotenv').config();
const { v2: cloudinary } = require('cloudinary');

async function testCloudinaryConfig() {
  console.log('☁️ Testing Cloudinary Configuration\n');

  if (!process.env.CLOUDINARY_CLOUD_NAME || 
      !process.env.CLOUDINARY_API_KEY || 
      !process.env.CLOUDINARY_API_SECRET) {
    console.log('❌ Missing Cloudinary environment variables');
    console.log('Please add them to your .env file:');
    console.log('CLOUDINARY_CLOUD_NAME="your_cloud_name"');
    console.log('CLOUDINARY_API_KEY="your_api_key"');
    console.log('CLOUDINARY_API_SECRET="your_api_secret"');
    return;
  }

  // Configure Cloudinary
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  try {
    console.log('🔌 Testing Cloudinary connection...');
    
    // Fetch account details as a connection test
    const result = await cloudinary.api.ping();
    
    console.log('✅ Cloudinary connection successful!');
    console.log(`Account status: ${result.status}`);
    
    return true;
  } catch (error) {
    console.log('❌ Cloudinary connection failed');
    console.log(`Error: ${error.message}`);
    console.log('\n💡 Common fixes:');
    console.log('  • Verify your Cloudinary credentials are correct');
    console.log('  • Check your internet connection');
    console.log('  • Make sure your account is active');
    
    return false;
  }
}

testCloudinaryConfig();