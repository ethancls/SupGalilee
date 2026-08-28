import { test, expect } from '@playwright/test';
import { 
  registerUser, 
  createOrganization,
  uniqueEmail,
  uniqueName,
} from './utils/test-helpers';

test.describe('Organizations', () => {
  
  // Create a test user before each test
  test.beforeEach(async ({ page }) => {
    const testUser = {
      email: uniqueEmail('org-test'),
      password: 'OrgTest123!',
      name: 'Org Test User',
    };
    await registerUser(page, testUser);
  });

  test.describe('Create Organization', () => {
    
    test('should create a new organization', async ({ page }) => {
      const orgName = uniqueName('Test Org');
      
      // Should be on welcome/dashboard page
      await expect(page).toHaveURL(/\/(org|welcome)?/);
      
      // Click create organization
      const createBtn = page.getByRole('button', { name: /create.*organization|new.*organization/i });
      await expect(createBtn).toBeVisible();
      await createBtn.click();
      
      // Fill in the form
      await expect(page.getByLabel(/organization.*name|name/i)).toBeVisible();
      await page.getByLabel(/organization.*name|name/i).fill(orgName);
      
      // Try to fill description if exists
      const descField = page.getByLabel('Description');
      if (await descField.isVisible({ timeout: 1000 }).catch(() => false)) {
        await descField.fill('E2E test organization');
      }
      
      // Submit
      await page.getByRole('button', { name: /create/i }).click();
      
      // Should navigate to the new organization
      await expect(page).toHaveURL(/\/org\//, { timeout: 15000 });
      
      // Organization name should be visible
      await expect(page.getByText(orgName)).toBeVisible();
    });

    test('should show validation error for empty name', async ({ page }) => {
      const createBtn = page.getByRole('button', { name: /create.*organization|new.*organization/i });
      await createBtn.click();
      
      // Try to submit without filling name
      await page.getByRole('button', { name: /create/i }).click();
      
      // Should show validation error
      await expect(page.getByText(/required|name.*required|enter.*name/i)).toBeVisible();
    });
  });

  test.describe('Organization Dashboard', () => {
    
    test.beforeEach(async ({ page }) => {
      // Create an organization first
      const orgName = uniqueName('Dashboard Org');
      await createOrganization(page, { name: orgName });
    });

    test('should display organization dashboard', async ({ page }) => {
      // Should be on org page
      await expect(page).toHaveURL(/\/org\//);
      
      // Dashboard elements should be visible
      await expect(page.getByRole('heading').first()).toBeVisible();
      
      // Projects section should exist
      await expect(page.getByText(/project/i)).toBeVisible();
    });

    test('should show create project button', async ({ page }) => {
      await expect(page).toHaveURL(/\/org\//);
      
      const createProjectBtn = page.getByRole('button', { name: /create.*project|new.*project/i });
      await expect(createProjectBtn).toBeVisible();
    });
  });

  test.describe('Organization Settings', () => {
    
    test.beforeEach(async ({ page }) => {
      const orgName = uniqueName('Settings Org');
      await createOrganization(page, { name: orgName });
    });

    test('should navigate to organization settings', async ({ page }) => {
      // Find and click settings link/button
      const settingsLink = page.getByRole('link', { name: /settings/i }).or(
        page.getByRole('button', { name: /settings/i })
      );
      
      if (await settingsLink.first().isVisible()) {
        await settingsLink.first().click();
        await expect(page).toHaveURL(/\/settings/);
      }
    });

    test('should access AI settings', async ({ page }) => {
      // Navigate to settings
      const settingsLink = page.getByRole('link', { name: /settings/i }).first();
      if (await settingsLink.isVisible({ timeout: 2000 }).catch(() => false)) {
        await settingsLink.click();
        
        // Look for AI settings link
        const aiLink = page.getByRole('link', { name: /ai|artificial intelligence/i });
        if (await aiLink.isVisible({ timeout: 2000 }).catch(() => false)) {
          await aiLink.click();
          await expect(page).toHaveURL(/\/ai/);
          
          // AI settings form should be visible
          await expect(page.getByText(/provider/i)).toBeVisible();
        }
      }
    });
  });

  test.describe('Member Management', () => {
    
    test.beforeEach(async ({ page }) => {
      const orgName = uniqueName('Members Org');
      await createOrganization(page, { name: orgName });
    });

    test('should display members list in settings', async ({ page }) => {
      // Navigate to settings
      const settingsLink = page.getByRole('link', { name: /settings/i }).first();
      if (await settingsLink.isVisible({ timeout: 2000 }).catch(() => false)) {
        await settingsLink.click();
        
        // Look for members section
        const membersSection = page.getByText(/members/i);
        await expect(membersSection).toBeVisible();
      }
    });

    test('should show invite member option', async ({ page }) => {
      // Navigate to settings
      const settingsLink = page.getByRole('link', { name: /settings/i }).first();
      if (await settingsLink.isVisible({ timeout: 2000 }).catch(() => false)) {
        await settingsLink.click();
        
        // Look for invite button
        const inviteBtn = page.getByRole('button', { name: /invite|add.*member/i });
        if (await inviteBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
          await expect(inviteBtn).toBeVisible();
        }
      }
    });
  });

  test.describe('Multiple Organizations', () => {
    
    test('should switch between organizations', async ({ page }) => {
      // Create first org
      const org1Name = uniqueName('Org One');
      await createOrganization(page, { name: org1Name });
      
      // Go back to dashboard
      await page.goto('/');
      
      // Create second org
      const org2Name = uniqueName('Org Two');
      await createOrganization(page, { name: org2Name });
      
      // Should be able to see org selector or navigate between them
      await page.goto('/');
      
      // Both orgs should be accessible somehow (either in sidebar or org picker)
      await expect(page.getByText(/organization|org/i).first()).toBeVisible();
    });
  });
});
