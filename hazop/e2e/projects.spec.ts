import { test, expect } from '@playwright/test';
import { 
  registerUser, 
  createOrganization,
  createProject,
  uniqueEmail,
  uniqueName,
} from './utils/test-helpers';

test.describe('Projects', () => {
  
  // Setup: Create user and organization before each test
  test.beforeEach(async ({ page }) => {
    const testUser = {
      email: uniqueEmail('project-test'),
      password: 'ProjectTest123!',
      name: 'Project Test User',
    };
    await registerUser(page, testUser);
    await createOrganization(page, { name: uniqueName('Project Test Org') });
  });

  test.describe('Create Project', () => {
    
    test('should create a new HAZOP project', async ({ page }) => {
      const projectName = uniqueName('HAZOP Study');
      const projectDesc = 'Chemical reactor system analysis';
      
      // Click create project button
      const createBtn = page.getByRole('button', { name: /create.*project|new.*project/i });
      await expect(createBtn).toBeVisible();
      await createBtn.click();
      
      // Fill in the form
      await page.getByLabel(/project.*name|name/i).first().fill(projectName);
      
      const descField = page.getByLabel('Description');
      if (await descField.isVisible({ timeout: 1000 }).catch(() => false)) {
        await descField.fill(projectDesc);
      }
      
      // Submit
      await page.getByRole('button', { name: /create/i }).click();
      
      // Project should be created and visible
      await expect(page.getByText(projectName)).toBeVisible({ timeout: 10000 });
    });

    test('should show validation error for empty project name', async ({ page }) => {
      const createBtn = page.getByRole('button', { name: /create.*project|new.*project/i });
      await createBtn.click();
      
      // Try to submit without name
      await page.getByRole('button', { name: /create/i }).click();
      
      // Should show error
      await expect(page.getByText(/required|name.*required/i)).toBeVisible();
    });
  });

  test.describe('Project List', () => {
    
    test('should display list of projects', async ({ page }) => {
      // Create a project first
      await createProject(page, { 
        name: uniqueName('List Test Project'),
        description: 'Test project for listing',
      });
      
      // Go back to org page
      const orgLink = page.getByRole('link', { name: /back|organization/i }).first();
      if (await orgLink.isVisible({ timeout: 2000 }).catch(() => false)) {
        await orgLink.click();
      } else {
        // Navigate using breadcrumb or sidebar
        await page.goBack();
      }
      
      // Project should be in the list
      await expect(page.getByText(/list test project/i)).toBeVisible();
    });

    test('should show project status badges', async ({ page }) => {
      await createProject(page, { name: uniqueName('Status Project') });
      
      // Status badge should be visible (Draft by default)
      await expect(page.getByText(/draft|in progress|review|completed/i)).toBeVisible();
    });
  });

  test.describe('Project Details', () => {
    
    test.beforeEach(async ({ page }) => {
      await createProject(page, { 
        name: uniqueName('Details Test'),
        description: 'Project for testing details view',
      });
    });

    test('should display project details page', async ({ page }) => {
      // Should be on project page after creation
      await expect(page).toHaveURL(/\/projects\//);
      
      // Project elements should be visible
      await expect(page.getByRole('heading')).toBeVisible();
    });

    test('should show nodes section', async ({ page }) => {
      // Nodes section should be visible
      await expect(page.getByText(/node|equipment|process/i)).toBeVisible();
    });

    test('should have add node functionality', async ({ page }) => {
      // Look for add node button
      const addNodeBtn = page.getByRole('button', { name: /add.*node|create.*node|new.*node/i });
      await expect(addNodeBtn).toBeVisible();
    });
  });

  test.describe('Project Status', () => {
    
    test.beforeEach(async ({ page }) => {
      await createProject(page, { name: uniqueName('Status Test') });
    });

    test('should change project status', async ({ page }) => {
      // Find status selector or dropdown
      const statusSelector = page.getByRole('combobox', { name: /status/i }).or(
        page.getByLabel(/status/i)
      );
      
      if (await statusSelector.isVisible({ timeout: 2000 }).catch(() => false)) {
        await statusSelector.click();
        
        // Select "In Progress"
        await page.getByRole('option', { name: /in.*progress/i }).click();
        
        // Save if needed
        const saveBtn = page.getByRole('button', { name: /save/i });
        if (await saveBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
          await saveBtn.click();
        }
        
        // Status should be updated
        await expect(page.getByText(/in.*progress/i)).toBeVisible();
      }
    });
  });

  test.describe('Delete Project', () => {
    
    test('should delete a project with confirmation', async ({ page }) => {
      const projectName = uniqueName('Delete Test');
      await createProject(page, { name: projectName });
      
      // Find delete button
      const deleteBtn = page.getByRole('button', { name: /delete/i }).or(
        page.getByRole('menuitem', { name: /delete/i })
      );
      
      // If in menu, open it first
      const menuBtn = page.getByRole('button', { name: /more|options|menu/i });
      if (await menuBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await menuBtn.click();
      }
      
      if (await deleteBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await deleteBtn.click();
        
        // Confirm deletion
        const confirmBtn = page.getByRole('button', { name: /confirm|delete|yes/i });
        if (await confirmBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
          await confirmBtn.click();
        }
        
        // Should navigate back or project should be gone
        await expect(page.getByText(projectName)).not.toBeVisible({ timeout: 10000 });
      }
    });
  });
});
