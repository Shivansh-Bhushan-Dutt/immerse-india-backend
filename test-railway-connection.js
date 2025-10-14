require('dotenv').config();
const { Client } = require('pg');

async function testRailwayConnection() {
  console.log('🚂 Testing Railway PostgreSQL Connection\n');
  console.log('📋 Step 1: You need to create a Railway account at https://railway.app');
  console.log('📋 Step 2: Create a new project with PostgreSQL database');
  console.log('📋 Step 3: Get the connection string from Connect → Postgres Connection URL\n');
  
  if (!process.env.DATABASE_URL) {
    console.log('❌ No DATABASE_URL found in .env file');
    console.log('Please add it and try again.');
    return;
  }
  
  // Mask the password in the URL for safe logging
  const maskedUrl = process.env.DATABASE_URL.replace(
    /(postgresql:\/\/[^:]+:)([^@]+)(@.*)/,
    '$1*********$3'
  );
  
  console.log(`🔗 Testing connection to: ${maskedUrl}\n`);
  
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });
  
  try {
    console.log('🔌 Connecting to Railway PostgreSQL...');
    await client.connect();
    console.log('✅ Connected successfully!\n');
    
    console.log('📊 Running test query...');
    const result = await client.query('SELECT version() as version');
    console.log(`✅ PostgreSQL Version: ${result.rows[0].version.split(' ')[1]}\n`);

    console.log('🎉 Railway connection is working properly!');
    console.log('🚀 You can now run: npx prisma db push\n');
    
    await client.end();
    return true;
  } catch (error) {
    console.log('❌ Connection failed');
    console.log(`Error: ${error.message}\n`);
    console.log('💡 Common fixes:');
    console.log('  • Make sure your Railway project is created and running');
    console.log('  • Verify your DATABASE_URL is correctly copied from Railway');
    console.log('  • Check your internet connection');
    
    await client.end().catch(() => {});
    return false;
  }
}

testRailwayConnection();
