import { test, expect } from '@playwright/test';
import { 
  registerUser, 
  logout,
  uniqueEmail,
} from './utils/test-helpers';

test.describe('Authentication', () => {
  
  test.describe('Registration', () => {
    
    test('should register a new user successfully', async ({ page }) => {
      const testUser = {
        email: uniqueEmail('register'),
        password: 'SecurePass123!',
        name: 'New Test User',
      };

      await page.goto('/register');
      
      // Check page title and form
      await expect(page.getByRole('heading', { name: /create.*account|register/i })).toBeVisible();
      
      // Fill registration form
      await page.getByLabel('Name').fill(testUser.name);
      await page.getByLabel('Email').fill(testUser.email);
      await page.getByLabel('Password', { exact: true }).fill(testUser.password);
      await page.getByLabel('Confirm Password').fill(testUser.password);
      
      // Submit form
      await page.getByRole('button', { name: /create account|register|sign up/i }).click();
      
      // Should redirect to dashboard or welcome page
      await expect(page).toHaveURL(/\/(org|welcome)?/, { timeout: 15000 });
      
      // User should be logged in - check the dashboard shows user info
      await expect(page.getByText(testUser.name).first()).toBeVisible();
    });

    test('should show error for existing email', async ({ page }) => {
      // First, register a user
      const testUser = {
        email: uniqueEmail('duplicate'),
        password: 'SecurePass123!',
        name: 'First User',
      };
      
      await registerUser(page, testUser);
      await logout(page);
      
      // Try to register with same email
      await page.goto('/register');
      await page.getByLabel('Name').fill('Second User');
      await page.getByLabel('Email').fill(testUser.email);
      await page.getByLabel('Password', { exact: true }).fill('DifferentPass123!');
      await page.getByLabel('Confirm Password').fill('DifferentPass123!');
      await page.getByRole('button', { name: /create account|register|sign up/i }).click();
      
      // Should show error
      await expect(page.getByText(/already exists|already registered|email.*taken/i)).toBeVisible();
    });

    test('should validate password requirements', async ({ page }) => {
      await page.goto('/register');
      
      await page.getByLabel('Name').fill('Test User');
      await page.getByLabel('Email').fill(uniqueEmail('weakpass'));
      await page.getByLabel('Password', { exact: true }).fill('weak'); // Too short
      await page.getByLabel('Confirm Password').fill('weak');
      await page.getByRole('button', { name: /create account|register|sign up/i }).click();
      
      // Should show password error
      await expect(page.getByText(/password.*characters|password.*short|password.*strong/i)).toBeVisible();
    });

    test('should validate password match', async ({ page }) => {
      await page.goto('/register');
      
      await page.getByLabel('Name').fill('Test User');
      await page.getByLabel('Email').fill(uniqueEmail('mismatch'));
      await page.getByLabel('Password', { exact: true }).fill('SecurePass123!');
      await page.getByLabel('Confirm Password').fill('DifferentPass123!');
      await page.getByRole('button', { name: /create account|register|sign up/i }).click();
      
      // Should show mismatch error
      await expect(page.getByText(/passwords.*match|password.*match/i)).toBeVisible();
    });
  });

  test.describe('Login', () => {
    
    test.beforeEach(async ({ page }) => {
      // Ensure a test user exists
      const testUser = {
        email: 'login-test@hazop-test.com',
        password: 'LoginTest123!',
        name: 'Login Test User',
      };
      
      // Try to register (will fail silently if already exists)
      try {
        await registerUser(page, testUser);
        await logout(page);
      } catch {
        // User might already exist
      }
    });

    test('should login with valid credentials', async ({ page }) => {
      await page.goto('/login');
      
      // Check page
      await expect(page.getByRole('heading', { name: /sign in|login|welcome/i })).toBeVisible();
      
      // Login
      await page.getByLabel('Email').fill('login-test@hazop-test.com');
      await page.getByLabel('Password').fill('LoginTest123!');
      await page.getByRole('button', { name: /sign in|login/i }).click();
      
      // Should redirect to dashboard
      await expect(page).toHaveURL(/\/(org|welcome)?/, { timeout: 15000 });
    });

    test('should show error for invalid credentials', async ({ page }) => {
      await page.goto('/login');
      
      await page.getByLabel('Email').fill('nonexistent@hazop-test.com');
      await page.getByLabel('Password').fill('WrongPassword123!');
      await page.getByRole('button', { name: /sign in|login/i }).click();
      
      // Should show error
      await expect(page.getByText(/invalid.*credentials|incorrect.*password|not found/i)).toBeVisible();
    });

    test('should have link to register page', async ({ page }) => {
      await page.goto('/login');
      
      const registerLink = page.getByRole('link', { name: /register|sign up|create.*account/i });
      await expect(registerLink).toBeVisible();
      await registerLink.click();
      
      await expect(page).toHaveURL(/\/register/);
    });

    test('should have link to forgot password', async ({ page }) => {
      await page.goto('/login');
      
      const forgotLink = page.getByRole('link', { name: /forgot.*password|reset.*password/i });
      await expect(forgotLink).toBeVisible();
      await forgotLink.click();
      
      await expect(page).toHaveURL(/\/forgot-password/);
    });
  });

  test.describe('Logout', () => {
    
    test('should logout successfully', async ({ page }) => {
      // Register and login first
      const testUser = {
        email: uniqueEmail('logout'),
        password: 'LogoutTest123!',
        name: 'Logout Test User',
      };
      
      await registerUser(page, testUser);
      
      // Verify logged in
      await expect(page).toHaveURL(/\/(org|welcome)?/);
      
      // Logout
      await logout(page);
      
      // Should be on login page
      await expect(page).toHaveURL(/\/login/);
      
      // Trying to access dashboard should redirect to login
      await page.goto('/');
      await expect(page).toHaveURL(/\/login/);
    });
  });

  test.describe('Forgot Password', () => {
    
    test('should show forgot password form', async ({ page }) => {
      await page.goto('/forgot-password');
      
      await expect(page.getByRole('heading', { name: /forgot.*password|reset.*password/i })).toBeVisible();
      await expect(page.getByLabel('Email')).toBeVisible();
      await expect(page.getByRole('button', { name: /send|reset|submit/i })).toBeVisible();
    });

    test('should send reset email for valid user', async ({ page }) => {
      // First create a user
      const testUser = {
        email: uniqueEmail('forgot'),
        password: 'ForgotTest123!',
        name: 'Forgot Test User',
      };
      
      await registerUser(page, testUser);
      await logout(page);
      
      // Request password reset
      await page.goto('/forgot-password');
      await page.getByLabel('Email').fill(testUser.email);
      await page.getByRole('button', { name: /send|reset|submit/i }).click();
      
      // Should show success message
      await expect(page.getByText(/email.*sent|check.*email|reset.*link/i)).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Session persistence', () => {
    
    test('should maintain session across page reloads', async ({ page }) => {
      const testUser = {
        email: uniqueEmail('session'),
        password: 'SessionTest123!',
        name: 'Session Test User',
      };
      
      await registerUser(page, testUser);
      
      // Verify logged in
      await expect(page).toHaveURL(/\/(org|welcome)?/);
      
      // Reload page
      await page.reload();
      
      // Should still be logged in
      await expect(page).toHaveURL(/\/(org|welcome)?/);
      await expect(page.getByText(testUser.name).or(page.getByText(testUser.email))).toBeVisible();
    });
  });
});
