#!/usr/bin/env node

/**
 * Memory Optimization Script for Next.js
 * This script helps optimize memory usage during builds
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🔧 Running memory optimization checks...');

// Check current Node.js version
const nodeVersion = process.version;
console.log(`Node.js version: ${nodeVersion}`);

// Check available memory
const totalMemory = require('os').totalmem();
const freeMemory = require('os').freemem();
const usedMemory = totalMemory - freeMemory;

console.log(`Total memory: ${Math.round(totalMemory / 1024 / 1024 / 1024)} GB`);
console.log(`Free memory: ${Math.round(freeMemory / 1024 / 1024 / 1024)} GB`);
console.log(`Used memory: ${Math.round(usedMemory / 1024 / 1024 / 1024)} GB`);

// Recommended memory settings based on available memory
const totalMemoryGB = totalMemory / 1024 / 1024 / 1024;
let recommendedMemory;

if (totalMemoryGB >= 16) {
  recommendedMemory = 8192; // 8GB
} else if (totalMemoryGB >= 8) {
  recommendedMemory = 6144; // 6GB
} else if (totalMemoryGB >= 4) {
  recommendedMemory = 4096; // 4GB
} else {
  recommendedMemory = 2048; // 2GB
}

console.log(`Recommended max-old-space-size: ${recommendedMemory}MB`);

// Clean up caches and temporary files
console.log('🧹 Cleaning up caches...');

const dirsToClean = [
  '.next',
  'node_modules/.cache',
  'out',
];

dirsToClean.forEach(dir => {
  const fullPath = path.join(process.cwd(), dir);
  if (fs.existsSync(fullPath)) {
    console.log(`Cleaning ${dir}...`);
    try {
      if (process.platform === 'win32') {
        execSync(`rmdir /s /q "${fullPath}"`, { stdio: 'ignore' });
      } else {
        execSync(`rm -rf "${fullPath}"`, { stdio: 'ignore' });
      }
    } catch (error) {
      console.warn(`Warning: Could not clean ${dir}: ${error.message}`);
    }
  }
});

// Run garbage collection if available
if (global.gc) {
  console.log('🗑️ Running garbage collection...');
  global.gc();
}

// Memory usage tips
console.log('\n💡 Memory Optimization Tips:');
console.log('1. Use the build:memory-safe script for large builds');
console.log('2. Close unnecessary applications during builds');
console.log('3. Consider using webpack instead of turbopack for memory-constrained environments');
console.log('4. Use dynamic imports to reduce bundle size');
console.log('5. Optimize images and assets');

console.log('\n✅ Memory optimization checks completed!');
