import { execSync } from 'child_process';

/**
 * Global setup for E2E tests
 * - Resets database to clean state
 * 
 * Note: This runs as a Node.js script, not a browser test
 */
async function globalSetup() {
  console.log('🔧 Setting up test environment...');

  // Reset database to clean state (apply migrations fresh)
  try {
    console.log('📦 Resetting database...');
    execSync('npx prisma migrate reset --force', {
      cwd: process.cwd(),
      stdio: 'inherit',
    });
    console.log('✅ Database reset complete');
  } catch (error) {
    console.error('❌ Failed to reset database:', error);
    // Continue anyway - database might already be clean
  }

  console.log('✅ Test environment ready');
}

export default globalSetup;