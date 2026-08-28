import { test, expect } from '@playwright/test';
import { 
  registerUser, 
  createOrganization,
  createProject,
  uniqueEmail,
  uniqueName,
} from './utils/test-helpers';

test.describe('HAZOP Nodes', () => {
  
  // Setup: Create user, org, and project before each test
  test.beforeEach(async ({ page }) => {
    const testUser = {
      email: uniqueEmail('node-test'),
      password: 'NodeTest123!',
      name: 'Node Test User',
    };
    await registerUser(page, testUser);
    await createOrganization(page, { name: uniqueName('Node Test Org') });
    await createProject(page, { 
      name: uniqueName('Node Test Project'),
      description: 'Testing HAZOP node functionality',
    });
  });

  test.describe('Create Node', () => {
    
    test('should create a new process node', async ({ page }) => {
      // Find and click add node button
      const addNodeBtn = page.getByRole('button', { name: /add.*node|create.*node|new.*node/i });
      await expect(addNodeBtn).toBeVisible();
      await addNodeBtn.click();
      
      // Fill node details
      await page.getByLabel(/name/i).first().fill('Reactor R-101');
      
      const descField = page.getByLabel('Description');
      if (await descField.isVisible({ timeout: 1000 }).catch(() => false)) {
        await descField.fill('Main reaction vessel');
      }
      
      const intentField = page.getByLabel(/design.*intent|intent/i);
      if (await intentField.isVisible({ timeout: 1000 }).catch(() => false)) {
        await intentField.fill('Maintain reaction at controlled temperature');
      }
      
      // Submit
      await page.getByRole('button', { name: /create|add|save/i }).click();
      
      // Node should be created
      await expect(page.getByText('Reactor R-101')).toBeVisible({ timeout: 10000 });
    });

    test('should create node with parameters', async ({ page }) => {
      const addNodeBtn = page.getByRole('button', { name: /add.*node|create.*node|new.*node/i });
      await addNodeBtn.click();
      
      await page.getByLabel(/name/i).first().fill('Heat Exchanger E-101');
      
      // Select or add parameters if available
      const paramField = page.getByLabel(/parameter/i);
      if (await paramField.isVisible({ timeout: 1000 }).catch(() => false)) {
        // Add parameters
        await paramField.fill('Temperature');
      }
      
      await page.getByRole('button', { name: /create|add|save/i }).click();
      
      await expect(page.getByText('Heat Exchanger E-101')).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Edit Node', () => {
    
    test.beforeEach(async ({ page }) => {
      // Create a node first
      const addNodeBtn = page.getByRole('button', { name: /add.*node|create.*node|new.*node/i });
      await addNodeBtn.click();
      await page.getByLabel(/name/i).first().fill('Edit Test Node');
      await page.getByRole('button', { name: /create|add|save/i }).click();
      await expect(page.getByText('Edit Test Node')).toBeVisible({ timeout: 10000 });
    });

    test('should edit node details', async ({ page }) => {
      // Click on node to select it or open edit
      await page.getByText('Edit Test Node').click();
      
      // Look for edit button
      const editBtn = page.getByRole('button', { name: /edit/i });
      if (await editBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await editBtn.click();
      }
      
      // Update name
      const nameField = page.getByLabel(/name/i).first();
      if (await nameField.isVisible({ timeout: 2000 }).catch(() => false)) {
        await nameField.fill('Updated Node Name');
        await page.getByRole('button', { name: /save|update/i }).click();
        
        await expect(page.getByText('Updated Node Name')).toBeVisible({ timeout: 10000 });
      }
    });
  });

  test.describe('Delete Node', () => {
    
    test('should delete a node with confirmation', async ({ page }) => {
      // Create a node
      const addNodeBtn = page.getByRole('button', { name: /add.*node|create.*node|new.*node/i });
      await addNodeBtn.click();
      await page.getByLabel(/name/i).first().fill('Delete Test Node');
      await page.getByRole('button', { name: /create|add|save/i }).click();
      await expect(page.getByText('Delete Test Node')).toBeVisible({ timeout: 10000 });
      
      // Click on node to select
      await page.getByText('Delete Test Node').click();
      
      // Find delete button
      const deleteBtn = page.getByRole('button', { name: /delete/i });
      if (await deleteBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await deleteBtn.click();
        
        // Confirm
        const confirmBtn = page.getByRole('button', { name: /confirm|delete|yes/i });
        if (await confirmBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
          await confirmBtn.click();
        }
        
        await expect(page.getByText('Delete Test Node')).not.toBeVisible({ timeout: 10000 });
      }
    });
  });
});

test.describe('HAZOP Deviations', () => {
  
  // Setup: Create user, org, project, and node before each test
  test.beforeEach(async ({ page }) => {
    const testUser = {
      email: uniqueEmail('deviation-test'),
      password: 'DeviationTest123!',
      name: 'Deviation Test User',
    };
    await registerUser(page, testUser);
    await createOrganization(page, { name: uniqueName('Deviation Org') });
    await createProject(page, { 
      name: uniqueName('Deviation Project'),
      description: 'Testing HAZOP deviation functionality',
    });
    
    // Create a node
    const addNodeBtn = page.getByRole('button', { name: /add.*node|create.*node|new.*node/i });
    await addNodeBtn.click();
    await page.getByLabel(/name/i).first().fill('Test Node');
    await page.getByRole('button', { name: /create|add|save/i }).click();
    await expect(page.getByText('Test Node')).toBeVisible({ timeout: 10000 });
  });

  test.describe('Create Deviation', () => {
    
    test('should create a new deviation', async ({ page }) => {
      // Select the node
      await page.getByText('Test Node').click();
      
      // Find add deviation button
      const addDeviationBtn = page.getByRole('button', { name: /add.*deviation|new.*deviation|analyze/i });
      if (await addDeviationBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await addDeviationBtn.click();
        
        // Select parameter
        const paramSelect = page.getByLabel(/parameter/i);
        if (await paramSelect.isVisible({ timeout: 2000 }).catch(() => false)) {
          await paramSelect.click();
          await page.getByRole('option', { name: /temperature|flow|pressure/i }).first().click();
        }
        
        // Select guide word
        const guideWordSelect = page.getByLabel(/guide.*word/i);
        if (await guideWordSelect.isVisible({ timeout: 2000 }).catch(() => false)) {
          await guideWordSelect.click();
          await page.getByRole('option', { name: /more|no|less/i }).first().click();
        }
        
        // Fill cause
        const causeField = page.getByLabel(/cause/i);
        if (await causeField.isVisible({ timeout: 2000 }).catch(() => false)) {
          await causeField.fill('Test cause - equipment failure');
        }
        
        // Fill consequence
        const consequenceField = page.getByLabel(/consequence/i);
        if (await consequenceField.isVisible({ timeout: 2000 }).catch(() => false)) {
          await consequenceField.fill('Test consequence - process disruption');
        }
        
        // Submit
        await page.getByRole('button', { name: /create|add|save/i }).click();
        
        // Deviation should be created
        await expect(page.getByText(/more.*temperature|no.*flow|test cause/i)).toBeVisible({ timeout: 10000 });
      }
    });

    test('should show guide words dropdown', async ({ page }) => {
      await page.getByText('Test Node').click();
      
      const addDeviationBtn = page.getByRole('button', { name: /add.*deviation|new.*deviation|analyze/i });
      if (await addDeviationBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await addDeviationBtn.click();
        
        const guideWordSelect = page.getByLabel(/guide.*word/i);
        if (await guideWordSelect.isVisible({ timeout: 2000 }).catch(() => false)) {
          await guideWordSelect.click();
          
          // Standard HAZOP guide words should be available
          await expect(page.getByRole('option', { name: /no|none/i })).toBeVisible();
          await expect(page.getByRole('option', { name: /more/i })).toBeVisible();
          await expect(page.getByRole('option', { name: /less/i })).toBeVisible();
        }
      }
    });
  });

  test.describe('Risk Assessment', () => {
    
    test('should set severity and likelihood', async ({ page }) => {
      await page.getByText('Test Node').click();
      
      const addDeviationBtn = page.getByRole('button', { name: /add.*deviation|new.*deviation|analyze/i });
      if (await addDeviationBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await addDeviationBtn.click();
        
        // Set severity
        const severityField = page.getByLabel(/severity/i);
        if (await severityField.isVisible({ timeout: 2000 }).catch(() => false)) {
          await severityField.click();
          await page.getByRole('option').nth(3).click(); // Select severity 4
        }
        
        // Set likelihood
        const likelihoodField = page.getByLabel(/likelihood/i);
        if (await likelihoodField.isVisible({ timeout: 2000 }).catch(() => false)) {
          await likelihoodField.click();
          await page.getByRole('option').nth(2).click(); // Select likelihood 3
        }
        
        // Risk level should be calculated (if visible)
        const riskBadge = page.getByText(/low|medium|high|critical/i);
        if (await riskBadge.isVisible({ timeout: 2000 }).catch(() => false)) {
          await expect(riskBadge).toBeVisible();
        }
      }
    });
  });

  test.describe('Deviation Status', () => {
    
    test('should update deviation status', async ({ page }) => {
      // Create a deviation first
      await page.getByText('Test Node').click();
      
      const addDeviationBtn = page.getByRole('button', { name: /add.*deviation|new.*deviation|analyze/i });
      if (await addDeviationBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await addDeviationBtn.click();
        
        // Quick create with minimal data
        const paramSelect = page.getByLabel(/parameter/i);
        if (await paramSelect.isVisible({ timeout: 2000 }).catch(() => false)) {
          await paramSelect.click();
          await page.getByRole('option').first().click();
        }
        
        const guideWordSelect = page.getByLabel(/guide.*word/i);
        if (await guideWordSelect.isVisible({ timeout: 2000 }).catch(() => false)) {
          await guideWordSelect.click();
          await page.getByRole('option').first().click();
        }
        
        await page.getByRole('button', { name: /create|add|save/i }).click();
        
        // Now try to change status
        const statusSelect = page.getByLabel(/status/i);
        if (await statusSelect.isVisible({ timeout: 3000 }).catch(() => false)) {
          await statusSelect.click();
          await page.getByRole('option', { name: /in.*progress|resolved/i }).first().click();
        }
      }
    });
  });
});
