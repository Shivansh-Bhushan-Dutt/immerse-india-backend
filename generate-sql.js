// Generate actual password hashes for the SQL script
const bcrypt = require('bcryptjs');

async function generateHashes() {
  console.log('Generating password hashes for SQL script...\n');
  
  const adminPassword = 'ZNM8B4naq&';
  const userPassword = 'immerse@2025';
  
  const adminHash = await bcrypt.hash(adminPassword, 10);
  const userHash = await bcrypt.hash(userPassword, 10);
  
  console.log('='.repeat(80));
  console.log('COMPLETE SQL SCRIPT FOR SUPABASE');
  console.log('='.repeat(80));
  console.log(`
-- SQL script to create users directly in Supabase
-- Copy and run this in your Supabase SQL Editor

-- First, ensure the users table exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Clear existing users (optional)
DELETE FROM users;

-- Insert admin user
INSERT INTO users (name, email, password, role) VALUES 
('Admin', 'immerseindia@admin.com', '${adminHash}', 'admin');

-- Insert sample users
INSERT INTO users (name, email, password, role) VALUES 
('Ravi', 'ravi@immerseindia.com', '${userHash}', 'user'),
('Shivansh', 'shivansh@immerseindia.com', '${userHash}', 'user'),
('User Demo', 'user@immerseindia.com', '${userHash}', 'user');

-- Verify the users were created
SELECT id, name, email, role, created_at FROM users ORDER BY role, email;
`);
  
  console.log('='.repeat(80));
  console.log('INSTRUCTIONS:');
  console.log('='.repeat(80));
  console.log('1. Copy the SQL script above');
  console.log('2. Go to your Supabase dashboard: https://supabase.com/dashboard/project/xanqiofkniprdatviojz');
  console.log('3. Navigate to "SQL Editor" in the left sidebar');
  console.log('4. Paste and run the SQL script');
  console.log('5. This will create the users table and insert the required users');
  
  console.log('\n' + '='.repeat(80));
  console.log('LOGIN CREDENTIALS AFTER SETUP:');
  console.log('='.repeat(80));
  console.log('👨‍💼 ADMIN:');
  console.log('   Email: immerseindia@admin.com');
  console.log('   Password: ZNM8B4naq&');
  console.log('');
  console.log('👤 USERS:');
  console.log('   Emails: ravi@immerseindia.com, shivansh@immerseindia.com, user@immerseindia.com');
  console.log('   Password: immerse@2025');
  console.log('');
  console.log('📝 NOTE: Any new user with email ending @immerseindia.com can be added');
  console.log('         and will use password: immerse@2025');
}

generateHashes().catch(console.error);