const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');

// Configure Cloudinary
const cloudinaryConfig = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
};

console.log('🔧 Cloudinary Configuration:');
console.log('  Cloud Name:', cloudinaryConfig.cloud_name || 'MISSING');
console.log('  API Key:', cloudinaryConfig.api_key ? `${cloudinaryConfig.api_key.slice(0, 4)}...` : 'MISSING');
console.log('  API Secret:', cloudinaryConfig.api_secret ? 'SET' : 'MISSING');

cloudinary.config(cloudinaryConfig);

// Multer configuration
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 1
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Upload to Cloudinary helper
const uploadToCloudinary = async (buffer, folder = 'travel-dashboard') => {
  console.log('📤 uploadToCloudinary called:');
  console.log('  Buffer size:', buffer?.length || 'NO BUFFER');
  console.log('  Folder:', folder);
  console.log('  Cloudinary config check:', {
    hasCloudName: !!cloudinary.config().cloud_name,
    hasApiKey: !!cloudinary.config().api_key,
    hasApiSecret: !!cloudinary.config().api_secret
  });

  if (!buffer || buffer.length === 0) {
    throw new Error('No image buffer provided to uploadToCloudinary');
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { 
        folder,
        transformation: [
          { width: 1200, height: 800, crop: 'limit' },
          { quality: 'auto', fetch_format: 'auto' }
        ]
      },
      (error, result) => {
        if (error) {
          console.error('❌ Cloudinary upload_stream error:', error);
          console.error('   Error details:', JSON.stringify(error, null, 2));
          reject(error);
        } else {
          console.log('✅ Cloudinary upload SUCCESS');
          console.log('   Result:', JSON.stringify(result, null, 2));
          resolve(result);
        }
      }
    );

    uploadStream.end(buffer);
    console.log('📡 Upload stream started...');
  });
};

module.exports = {
  upload,
  uploadToCloudinary,
  cloudinary
};