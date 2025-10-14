require('dotenv').config();
const readline = require('readline');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { exec } = require('child_process');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function generateRandomString(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

function question(query) {
  return new Promise(resolve => {
    rl.question(query, resolve);
  });
}

async function setupEnvironment() {
  console.log('\n🚂 Travel Dashboard Backend Setup Wizard\n');

  // Check for existing .env file
  const envPath = path.join(__dirname, '.env');
  const envExamplePath = path.join(__dirname, '.env.example');
  
  let envFileExists = fs.existsSync(envPath);
  let envConfig = {};
  
  if (envFileExists) {
    console.log('📋 Found existing .env file');
    const useExisting = await question('Do you want to use the existing .env file? (y/n): ');
    
    if (useExisting.toLowerCase() === 'y') {
      // Load existing .env file
      const envContent = fs.readFileSync(envPath, 'utf-8');
      envContent.split('\n').forEach(line => {
        if (line.trim() && !line.startsWith('#')) {
          const [key, value] = line.split('=');
          if (key && value) {
            envConfig[key.trim()] = value.trim().replace(/"/g, '');
          }
        }
      });
    } else {
      envFileExists = false;
    }
  }
  
  if (!envFileExists) {
    console.log('\n📝 Creating new .env file...');
    
    // Database URL (Railway)
    console.log('\n📊 Database Configuration');
    console.log('You can get a PostgreSQL database on Railway at https://railway.app');
    
    const dbUrl = await question('Enter your Railway DATABASE_URL (leave blank to configure later): ');
    envConfig.DATABASE_URL = dbUrl || '"postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway"';
    
    // JWT Secret
    console.log('\n🔑 JWT Authentication');
    const jwtSecret = generateRandomString();
    envConfig.JWT_SECRET = `"${jwtSecret}"`;
    envConfig.JWT_EXPIRES_IN = '"7d"';
    
    // Server config
    console.log('\n⚙️ Server Configuration');
    const port = await question('Enter server port (default: 5000): ');
    envConfig.PORT = port || '5000';
    envConfig.NODE_ENV = '"development"';
    
    // Cloudinary
    console.log('\n☁️ Cloudinary Configuration');
    console.log('You can get these from your Cloudinary dashboard at https://cloudinary.com/console');
    
    const cloudName = await question('Enter your Cloudinary cloud name (leave blank to configure later): ');
    const apiKey = cloudName ? await question('Enter your Cloudinary API key: ') : '';
    const apiSecret = apiKey ? await question('Enter your Cloudinary API secret: ') : '';
    
    envConfig.CLOUDINARY_CLOUD_NAME = cloudName ? `"${cloudName}"` : '"your_cloud_name"';
    envConfig.CLOUDINARY_API_KEY = apiKey ? `"${apiKey}"` : '"your_api_key"';
    envConfig.CLOUDINARY_API_SECRET = apiSecret ? `"${apiSecret}"` : '"your_api_secret"';
  }
  
  // Write to .env file if needed
  if (!envFileExists) {
    const envContent = Object.entries(envConfig)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');
    
    fs.writeFileSync(envPath, envContent);
    console.log('\n✅ .env file created successfully!');
  }

  // Ask about running database connection test
  console.log('\n📋 Next Steps:');
  console.log('1. Test your database connection');
  console.log('2. Set up Prisma ORM');
  console.log('3. Test Cloudinary connection');
  console.log('4. Start the server');
  
  const testDb = await question('\nTest database connection now? (y/n): ');
  
  if (testDb.toLowerCase() === 'y') {
    console.log('\n🔌 Testing database connection...');
    exec('node test-railway-connection.js', (error, stdout, stderr) => {
      console.log(stdout);
      
      if (!error) {
        const setupPrisma = question('\nSet up Prisma ORM now? (y/n): ');
        setupPrisma.then(answer => {
          if (answer.toLowerCase() === 'y') {
            console.log('\n🔧 Setting up Prisma...');
            exec('npx prisma generate && npx prisma db push', (error, stdout, stderr) => {
              console.log(stdout);
              
              if (!error) {
                console.log('\n✅ Prisma setup complete!');
                console.log('\nYou can now start the server with:');
                console.log('npm run dev');
              }
              
              rl.close();
            });
          } else {
            rl.close();
          }
        });
      } else {
        console.log('\nPlease fix your database connection in the .env file and try again.');
        rl.close();
      }
    });
  } else {
    console.log('\nYou can test the database connection later with:');
    console.log('node test-railway-connection.js');
    rl.close();
  }
}

setupEnvironment();
