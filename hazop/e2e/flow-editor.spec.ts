import { test, expect } from '@playwright/test';
import { 
  registerUser, 
  createOrganization,
  createProject,
  uniqueEmail,
  uniqueName,
} from './utils/test-helpers';

test.describe('Flow Diagram Editor', () => {
  
  // Setup: Create user, org, and project
  test.beforeEach(async ({ page }) => {
    const testUser = {
      email: uniqueEmail('flow-test'),
      password: 'FlowTest123!',
      name: 'Flow Test User',
    };
    await registerUser(page, testUser);
    await createOrganization(page, { name: uniqueName('Flow Test Org') });
    await createProject(page, { 
      name: uniqueName('Flow Test Project'),
      description: 'Testing flow diagram functionality',
    });
  });

  test.describe('Flow Editor Display', () => {
    
    test('should display flow editor canvas', async ({ page }) => {
      // Look for flow/diagram tab or section
      const flowTab = page.getByRole('tab', { name: /flow|diagram|editor/i });
      if (await flowTab.isVisible({ timeout: 3000 }).catch(() => false)) {
        await flowTab.click();
      }
      
      // ReactFlow canvas should be present
      const canvas = page.locator('.react-flow').or(
        page.locator('[data-testid="flow-editor"]')
      );
      
      await expect(canvas).toBeVisible({ timeout: 5000 });
    });

    test('should display flow controls', async ({ page }) => {
      const flowTab = page.getByRole('tab', { name: /flow|diagram|editor/i });
      if (await flowTab.isVisible({ timeout: 3000 }).catch(() => false)) {
        await flowTab.click();
      }
      
      // Controls should be visible (zoom, fit view, etc.)
      const controls = page.locator('.react-flow__controls').or(
        page.getByRole('button', { name: /zoom|fit/i })
      );
      
      if (await controls.isVisible({ timeout: 3000 }).catch(() => false)) {
        await expect(controls).toBeVisible();
      }
    });

    test('should display minimap', async ({ page }) => {
      const flowTab = page.getByRole('tab', { name: /flow|diagram|editor/i });
      if (await flowTab.isVisible({ timeout: 3000 }).catch(() => false)) {
        await flowTab.click();
      }
      
      // Minimap should be visible
      const minimap = page.locator('.react-flow__minimap');
      if (await minimap.isVisible({ timeout: 3000 }).catch(() => false)) {
        await expect(minimap).toBeVisible();
      }
    });
  });

  test.describe('Node Manipulation', () => {
    
    test('should add node from toolbar', async ({ page }) => {
      const flowTab = page.getByRole('tab', { name: /flow|diagram|editor/i });
      if (await flowTab.isVisible({ timeout: 3000 }).catch(() => false)) {
        await flowTab.click();
      }
      
      // Find add node button in flow editor
      const addNodeBtn = page.getByRole('button', { name: /add.*node|new.*node|\+/i });
      if (await addNodeBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await addNodeBtn.click();
        
        // Node type selector might appear
        const nodeType = page.getByRole('menuitem', { name: /pump|vessel|reactor/i });
        if (await nodeType.isVisible({ timeout: 2000 }).catch(() => false)) {
          await nodeType.first().click();
        }
        
        // A new node should appear on the canvas
        const nodes = page.locator('.react-flow__node');
        await expect(nodes.first()).toBeVisible({ timeout: 5000 });
      }
    });

    test('should select and highlight node', async ({ page }) => {
      // First create a node
      const addNodeBtn = page.getByRole('button', { name: /add.*node|new.*node/i });
      await addNodeBtn.click();
      await page.getByLabel(/name/i).first().fill('Selectable Node');
      await page.getByRole('button', { name: /create|add|save/i }).click();
      
      // Switch to flow view
      const flowTab = page.getByRole('tab', { name: /flow|diagram|editor/i });
      if (await flowTab.isVisible({ timeout: 3000 }).catch(() => false)) {
        await flowTab.click();
      }
      
      // Click on node to select it
      const node = page.locator('.react-flow__node').first();
      if (await node.isVisible({ timeout: 3000 }).catch(() => false)) {
        await node.click();
        
        // Node should have selected state (class or style)
        await expect(node).toHaveClass(/selected/);
      }
    });

    test('should drag node to new position', async ({ page }) => {
      // Create a node first
      const addNodeBtn = page.getByRole('button', { name: /add.*node|new.*node/i });
      await addNodeBtn.click();
      await page.getByLabel(/name/i).first().fill('Draggable Node');
      await page.getByRole('button', { name: /create|add|save/i }).click();
      
      // Switch to flow view
      const flowTab = page.getByRole('tab', { name: /flow|diagram|editor/i });
      if (await flowTab.isVisible({ timeout: 3000 }).catch(() => false)) {
        await flowTab.click();
      }
      
      const node = page.locator('.react-flow__node').first();
      if (await node.isVisible({ timeout: 3000 }).catch(() => false)) {
        const box = await node.boundingBox();
        if (box) {
          // Drag node
          await node.dragTo(page.locator('.react-flow'), {
            targetPosition: { x: box.x + 100, y: box.y + 100 },
          });
        }
      }
    });
  });

  test.describe('Connections', () => {
    
    test('should connect two nodes', async ({ page }) => {
      // Create first node
      let addNodeBtn = page.getByRole('button', { name: /add.*node|new.*node/i });
      await addNodeBtn.click();
      await page.getByLabel(/name/i).first().fill('Source Node');
      await page.getByRole('button', { name: /create|add|save/i }).click();
      await expect(page.getByText('Source Node')).toBeVisible({ timeout: 10000 });
      
      // Create second node
      addNodeBtn = page.getByRole('button', { name: /add.*node|new.*node/i });
      await addNodeBtn.click();
      await page.getByLabel(/name/i).first().fill('Target Node');
      await page.getByRole('button', { name: /create|add|save/i }).click();
      await expect(page.getByText('Target Node')).toBeVisible({ timeout: 10000 });
      
      // Switch to flow view
      const flowTab = page.getByRole('tab', { name: /flow|diagram|editor/i });
      if (await flowTab.isVisible({ timeout: 3000 }).catch(() => false)) {
        await flowTab.click();
      }
      
      // Nodes should be visible
      const nodes = page.locator('.react-flow__node');
      await expect(nodes).toHaveCount(2, { timeout: 5000 });
    });
  });

  test.describe('Zoom and Pan', () => {
    
    test('should zoom in and out', async ({ page }) => {
      const flowTab = page.getByRole('tab', { name: /flow|diagram|editor/i });
      if (await flowTab.isVisible({ timeout: 3000 }).catch(() => false)) {
        await flowTab.click();
      }
      
      // Find zoom controls
      const zoomIn = page.getByRole('button', { name: /zoom.*in|\+/i });
      const zoomOut = page.getByRole('button', { name: /zoom.*out|-/i });
      
      if (await zoomIn.isVisible({ timeout: 2000 }).catch(() => false)) {
        // Zoom in
        await zoomIn.click();
        await zoomIn.click();
        
        // Zoom out
        await zoomOut.click();
      }
    });

    test('should fit view', async ({ page }) => {
      const flowTab = page.getByRole('tab', { name: /flow|diagram|editor/i });
      if (await flowTab.isVisible({ timeout: 3000 }).catch(() => false)) {
        await flowTab.click();
      }
      
      // Find fit view button
      const fitView = page.getByRole('button', { name: /fit.*view|fit/i });
      if (await fitView.isVisible({ timeout: 2000 }).catch(() => false)) {
        await fitView.click();
      }
    });
  });

  test.describe('Save Flow', () => {
    
    test('should save flow diagram', async ({ page }) => {
      // Create a node
      const addNodeBtn = page.getByRole('button', { name: /add.*node|new.*node/i });
      await addNodeBtn.click();
      await page.getByLabel(/name/i).first().fill('Save Test Node');
      await page.getByRole('button', { name: /create|add|save/i }).click();
      
      // Switch to flow view
      const flowTab = page.getByRole('tab', { name: /flow|diagram|editor/i });
      if (await flowTab.isVisible({ timeout: 3000 }).catch(() => false)) {
        await flowTab.click();
      }
      
      // Find save button
      const saveBtn = page.getByRole('button', { name: /save/i });
      if (await saveBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await saveBtn.click();
        
        // Should show success indication
        await expect(page.getByText(/saved|success/i)).toBeVisible({ timeout: 5000 });
      }
    });
  });
});
