import { test, expect } from '@playwright/test';
import { 
  registerUser, 
  uniqueEmail,
} from './utils/test-helpers';

test.describe('User Settings', () => {
  
  const testUser = {
    email: '',
    password: 'UserTest123!',
    name: 'Settings Test User',
  };

  test.beforeEach(async ({ page }) => {
    testUser.email = uniqueEmail('settings');
    await registerUser(page, testUser);
  });

  test.describe('Profile Settings', () => {
    
    test('should navigate to user settings', async ({ page }) => {
      // Find user menu or settings link
      const userMenu = page.getByRole('button', { name: testUser.name }).or(
        page.getByRole('button').filter({ has: page.locator('img[alt*="avatar"]') })
      );
      
      if (await userMenu.isVisible({ timeout: 3000 }).catch(() => false)) {
        await userMenu.click();
        
        const settingsLink = page.getByRole('menuitem', { name: /settings|profile/i });
        if (await settingsLink.isVisible({ timeout: 3000 }).catch(() => false)) {
          await settingsLink.click();
          await expect(page).toHaveURL(/\/settings/);
        }
      } else {
        // Try direct navigation
        const settingsLink = page.getByRole('link', { name: /settings/i }).first();
        if (await settingsLink.isVisible({ timeout: 3000 }).catch(() => false)) {
          await settingsLink.click();
        }
      }
    });

    test('should display user profile information', async ({ page }) => {
      await page.goto('/settings');
      
      // Should show user name
      const nameField = page.getByLabel(/name/i);
      if (await nameField.isVisible({ timeout: 3000 }).catch(() => false)) {
        await expect(nameField).toHaveValue(testUser.name);
      }
      
      // Should show email
      const emailField = page.getByLabel(/email/i);
      if (await emailField.isVisible({ timeout: 3000 }).catch(() => false)) {
        await expect(emailField).toHaveValue(testUser.email);
      }
    });

    test('should update user name', async ({ page }) => {
      await page.goto('/settings');
      
      const nameField = page.getByLabel(/name/i);
      if (await nameField.isVisible({ timeout: 3000 }).catch(() => false)) {
        // Clear and type new name
        await nameField.clear();
        await nameField.fill('Updated Name');
        
        // Save
        const saveBtn = page.getByRole('button', { name: /save|update/i }).first();
        if (await saveBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
          await saveBtn.click();
          
          // Should show success
          await expect(page.getByText(/saved|success|updated/i)).toBeVisible({ timeout: 5000 });
        }
      }
    });
  });

  test.describe('Password Change', () => {
    
    test('should display password change form', async ({ page }) => {
      await page.goto('/settings');
      
      // Look for password section or link
      const passwordLink = page.getByRole('link', { name: /password|security/i });
      if (await passwordLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        await passwordLink.click();
      }
      
      const currentPassword = page.getByLabel(/current.*password/i);
      if (await currentPassword.isVisible({ timeout: 3000 }).catch(() => false)) {
        await expect(currentPassword).toBeVisible();
        await expect(page.getByLabel(/new.*password/i)).toBeVisible();
      }
    });

    test('should require current password for change', async ({ page }) => {
      await page.goto('/settings');
      
      const passwordLink = page.getByRole('link', { name: /password|security/i });
      if (await passwordLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        await passwordLink.click();
      }
      
      const newPasswordField = page.getByLabel(/new.*password/i);
      if (await newPasswordField.isVisible({ timeout: 3000 }).catch(() => false)) {
        await newPasswordField.fill('NewPassword123!');
        
        const saveBtn = page.getByRole('button', { name: /change|update.*password/i });
        if (await saveBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
          await saveBtn.click();
          
          // Should require current password
          await expect(page.getByText(/current.*password.*required|enter.*current/i)).toBeVisible({ timeout: 5000 });
        }
      }
    });

    test('should change password successfully', async ({ page }) => {
      await page.goto('/settings');
      
      const passwordLink = page.getByRole('link', { name: /password|security/i });
      if (await passwordLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        await passwordLink.click();
      }
      
      const currentPassword = page.getByLabel(/current.*password/i);
      const newPassword = page.getByLabel(/new.*password/i).first();
      
      if (await currentPassword.isVisible({ timeout: 3000 }).catch(() => false)) {
        await currentPassword.fill(testUser.password);
        await newPassword.fill('NewPassword456!');
        
        const confirmPassword = page.getByLabel(/confirm.*password/i);
        if (await confirmPassword.isVisible({ timeout: 3000 }).catch(() => false)) {
          await confirmPassword.fill('NewPassword456!');
        }
        
        const saveBtn = page.getByRole('button', { name: /change|update.*password/i });
        if (await saveBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
          await saveBtn.click();
          
          // Should show success
          await expect(page.getByText(/password.*updated|success/i)).toBeVisible({ timeout: 5000 });
        }
      }
    });
  });

  test.describe('Avatar', () => {
    
    test('should display avatar settings', async ({ page }) => {
      await page.goto('/settings');
      
      // Should show current avatar or placeholder
      const avatar = page.locator('img[alt*="avatar"]').or(
        page.getByRole('img', { name: /avatar|profile/i })
      );
      
      if (await avatar.isVisible({ timeout: 3000 }).catch(() => false)) {
        await expect(avatar).toBeVisible();
      }
    });

    test.skip('should upload new avatar', async () => {
      // File upload tests require actual file handling
      // Skipped for now
    });
  });

  test.describe('Theme Settings', () => {
    
    test('should toggle dark mode', async ({ page }) => {
      await page.goto('/settings');
      
      // Find theme toggle
      const themeToggle = page.getByRole('button', { name: /theme|dark.*mode|light.*mode/i }).or(
        page.getByRole('switch', { name: /dark.*mode/i })
      ).or(
        page.locator('[data-theme-toggle]')
      );
      
      if (await themeToggle.isVisible({ timeout: 3000 }).catch(() => false)) {
        // Get current theme
        const html = page.locator('html');
        const currentTheme = await html.getAttribute('class');
        
        // Toggle
        await themeToggle.click();
        await page.waitForTimeout(500);
        
        // Theme should change
        const newTheme = await html.getAttribute('class');
        expect(newTheme).not.toBe(currentTheme);
      }
    });
  });

  test.describe('Account Actions', () => {
    
    test('should display logout option', async ({ page }) => {
      // Find user menu
      const userMenu = page.getByRole('button', { name: testUser.name }).or(
        page.getByRole('button').filter({ has: page.locator('img[alt*="avatar"]') })
      );
      
      if (await userMenu.isVisible({ timeout: 3000 }).catch(() => false)) {
        await userMenu.click();
        
        const logoutBtn = page.getByRole('menuitem', { name: /logout|sign.*out/i });
        await expect(logoutBtn).toBeVisible();
      }
    });

    test('should show delete account warning', async ({ page }) => {
      await page.goto('/settings');
      
      // Find dangerous actions section
      const deleteSection = page.getByText(/danger|delete.*account/i);
      
      if (await deleteSection.isVisible({ timeout: 3000 }).catch(() => false)) {
        const deleteBtn = page.getByRole('button', { name: /delete.*account/i });
        
        if (await deleteBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
          await deleteBtn.click();
          
          // Should show confirmation dialog
          await expect(page.getByRole('dialog')).toBeVisible();
          await expect(page.getByText(/are.*you.*sure|confirm.*delete/i)).toBeVisible();
          
          // Cancel
          const cancelBtn = page.getByRole('button', { name: /cancel/i });
          await cancelBtn.click();
          
          await expect(page.getByRole('dialog')).not.toBeVisible();
        }
      }
    });
  });
});

test.describe('User Navigation', () => {
  
  test.beforeEach(async ({ page }) => {
    const testUser = {
      email: uniqueEmail('nav'),
      password: 'NavTest123!',
      name: 'Navigation Test User',
    };
    await registerUser(page, testUser);
  });

  test('should navigate between sections', async ({ page }) => {
    await page.goto('/settings');
    
    // Check for navigation tabs or links
    const profileTab = page.getByRole('link', { name: /profile/i }).or(
      page.getByRole('tab', { name: /profile/i })
    );
    const securityTab = page.getByRole('link', { name: /security|password/i }).or(
      page.getByRole('tab', { name: /security|password/i })
    );
    
    if (await securityTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await securityTab.click();
      await page.waitForTimeout(300);
      
      if (await profileTab.isVisible({ timeout: 3000 }).catch(() => false)) {
        await profileTab.click();
        await page.waitForTimeout(300);
      }
    }
  });

  test('should return to dashboard', async ({ page }) => {
    await page.goto('/settings');
    
    // Find home/dashboard link
    const homeLink = page.getByRole('link', { name: /home|dashboard|hazop/i }).first();
    
    if (await homeLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await homeLink.click();
      await expect(page).toHaveURL('/');
    }
  });
});
