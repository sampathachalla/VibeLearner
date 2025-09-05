#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Running prebuild script...');

try {
  // Check if package-lock.json exists
  const packageLockPath = path.join(process.cwd(), 'package-lock.json');
  
  if (fs.existsSync(packageLockPath)) {
    console.log('📦 Removing old package-lock.json...');
    fs.unlinkSync(packageLockPath);
  }
  
  console.log('📦 Running npm install...');
  execSync('npm install --legacy-peer-deps', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });
  
  console.log('✅ Prebuild script completed successfully!');
} catch (error) {
  console.error('❌ Prebuild script failed:', error.message);
  process.exit(1);
}
