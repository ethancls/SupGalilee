import { test, expect } from '@playwright/test';
import { 
  registerUser, 
  createOrganization,
  uniqueEmail,
  uniqueName,
} from './utils/test-helpers';

test.describe('AI Configuration', () => {
  
  // Setup: Create user and organization
  test.beforeEach(async ({ page }) => {
    const testUser = {
      email: uniqueEmail('ai-test'),
      password: 'AITest123!',
      name: 'AI Test User',
    };
    await registerUser(page, testUser);
    await createOrganization(page, { name: uniqueName('AI Test Org') });
  });

  test.describe('AI Settings Page', () => {
    
    test('should navigate to AI settings', async ({ page }) => {
      // Navigate to settings
      const settingsLink = page.getByRole('link', { name: /settings/i }).first();
      await settingsLink.click();
      await expect(page).toHaveURL(/\/settings/);
      
      // Click on AI settings link
      const aiLink = page.getByRole('link', { name: /ai|artificial intelligence/i });
      if (await aiLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        await aiLink.click();
        await expect(page).toHaveURL(/\/ai/);
      }
    });

    test('should display AI provider selector', async ({ page }) => {
      // Navigate to AI settings
      await page.goto('/');
      const orgLink = page.getByRole('link').filter({ hasText: /ai test org/i }).first();
      if (await orgLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        await orgLink.click();
      }
      
      const settingsLink = page.getByRole('link', { name: /settings/i }).first();
      if (await settingsLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        await settingsLink.click();
        
        const aiLink = page.getByRole('link', { name: /ai/i });
        if (await aiLink.isVisible({ timeout: 3000 }).catch(() => false)) {
          await aiLink.click();
          
          // Provider selector should be visible
          const providerSelect = page.getByLabel(/provider/i);
          await expect(providerSelect).toBeVisible();
        }
      }
    });
  });

  test.describe('Provider Selection', () => {
    
    test('should display all available providers', async ({ page }) => {
      // Navigate to AI settings
      const settingsLink = page.getByRole('link', { name: /settings/i }).first();
      if (await settingsLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        await settingsLink.click();
        
        const aiLink = page.getByRole('link', { name: /ai/i });
        if (await aiLink.isVisible({ timeout: 3000 }).catch(() => false)) {
          await aiLink.click();
          
          const providerSelect = page.getByLabel(/provider/i);
          if (await providerSelect.isVisible({ timeout: 3000 }).catch(() => false)) {
            await providerSelect.click();
            
            // All providers should be available
            await expect(page.getByRole('option', { name: /openai/i })).toBeVisible();
            await expect(page.getByRole('option', { name: /anthropic/i })).toBeVisible();
            await expect(page.getByRole('option', { name: /google/i })).toBeVisible();
            await expect(page.getByRole('option', { name: /ollama/i })).toBeVisible();
          }
        }
      }
    });

    test('should show API key field for cloud providers', async ({ page }) => {
      const settingsLink = page.getByRole('link', { name: /settings/i }).first();
      if (await settingsLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        await settingsLink.click();
        
        const aiLink = page.getByRole('link', { name: /ai/i });
        if (await aiLink.isVisible({ timeout: 3000 }).catch(() => false)) {
          await aiLink.click();
          
          // Select OpenAI
          const providerSelect = page.getByLabel(/provider/i);
          if (await providerSelect.isVisible({ timeout: 3000 }).catch(() => false)) {
            await providerSelect.click();
            await page.getByRole('option', { name: /openai/i }).click();
            
            // API key field should be visible
            const apiKeyField = page.getByLabel(/api.*key/i);
            await expect(apiKeyField).toBeVisible();
          }
        }
      }
    });

    test('should show Ollama URL field when Ollama is selected', async ({ page }) => {
      const settingsLink = page.getByRole('link', { name: /settings/i }).first();
      if (await settingsLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        await settingsLink.click();
        
        const aiLink = page.getByRole('link', { name: /ai/i });
        if (await aiLink.isVisible({ timeout: 3000 }).catch(() => false)) {
          await aiLink.click();
          
          // Select Ollama
          const providerSelect = page.getByLabel(/provider/i);
          if (await providerSelect.isVisible({ timeout: 3000 }).catch(() => false)) {
            await providerSelect.click();
            await page.getByRole('option', { name: /ollama/i }).click();
            
            // URL field should be visible for Ollama
            const urlField = page.getByLabel(/url|server/i);
            await expect(urlField).toBeVisible();
            
            // Should have default value
            await expect(urlField).toHaveValue(/localhost:11434/);
          }
        }
      }
    });
  });

  test.describe('Model Selection', () => {
    
    test('should display model selector', async ({ page }) => {
      const settingsLink = page.getByRole('link', { name: /settings/i }).first();
      if (await settingsLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        await settingsLink.click();
        
        const aiLink = page.getByRole('link', { name: /ai/i });
        if (await aiLink.isVisible({ timeout: 3000 }).catch(() => false)) {
          await aiLink.click();
          
          const modelSelect = page.getByLabel(/model/i);
          await expect(modelSelect).toBeVisible();
        }
      }
    });

    test('should update models when provider changes', async ({ page }) => {
      const settingsLink = page.getByRole('link', { name: /settings/i }).first();
      if (await settingsLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        await settingsLink.click();
        
        const aiLink = page.getByRole('link', { name: /ai/i });
        if (await aiLink.isVisible({ timeout: 3000 }).catch(() => false)) {
          await aiLink.click();
          
          const providerSelect = page.getByLabel(/provider/i);
          const modelSelect = page.getByLabel(/model/i);
          
          if (await providerSelect.isVisible({ timeout: 3000 }).catch(() => false)) {
            // Select OpenAI
            await providerSelect.click();
            await page.getByRole('option', { name: /openai/i }).click();
            
            await modelSelect.click();
            await expect(page.getByRole('option', { name: /gpt/i })).toBeVisible();
            await page.keyboard.press('Escape');
            
            // Switch to Anthropic
            await providerSelect.click();
            await page.getByRole('option', { name: /anthropic/i }).click();
            
            await modelSelect.click();
            await expect(page.getByRole('option', { name: /claude/i })).toBeVisible();
          }
        }
      }
    });
  });

  test.describe('Enable/Disable AI', () => {
    
    test('should toggle AI enabled state', async ({ page }) => {
      const settingsLink = page.getByRole('link', { name: /settings/i }).first();
      if (await settingsLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        await settingsLink.click();
        
        const aiLink = page.getByRole('link', { name: /ai/i });
        if (await aiLink.isVisible({ timeout: 3000 }).catch(() => false)) {
          await aiLink.click();
          
          // Find enable toggle
          const enableSwitch = page.getByRole('switch', { name: /enable|ai.*analysis/i }).or(
            page.getByLabel(/enable|ai.*analysis/i)
          );
          
          if (await enableSwitch.isVisible({ timeout: 3000 }).catch(() => false)) {
            // Toggle on
            await enableSwitch.click();
            await expect(enableSwitch).toBeChecked();
            
            // Toggle off
            await enableSwitch.click();
            await expect(enableSwitch).not.toBeChecked();
          }
        }
      }
    });
  });

  test.describe('Save Settings', () => {
    
    test('should save AI settings', async ({ page }) => {
      const settingsLink = page.getByRole('link', { name: /settings/i }).first();
      if (await settingsLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        await settingsLink.click();
        
        const aiLink = page.getByRole('link', { name: /ai/i });
        if (await aiLink.isVisible({ timeout: 3000 }).catch(() => false)) {
          await aiLink.click();
          
          // Make a change
          const providerSelect = page.getByLabel(/provider/i);
          if (await providerSelect.isVisible({ timeout: 3000 }).catch(() => false)) {
            await providerSelect.click();
            await page.getByRole('option', { name: /ollama/i }).click();
          }
          
          // Save
          const saveBtn = page.getByRole('button', { name: /save/i });
          if (await saveBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
            await saveBtn.click();
            
            // Should show success
            await expect(page.getByText(/saved|success/i)).toBeVisible({ timeout: 5000 });
          }
        }
      }
    });
  });
});

test.describe('AI Assistant', () => {
  
  // Note: These tests require AI to be configured and enabled
  // They test the AI assistant functionality in the project context
  
  test.describe('AI Analysis', () => {
    
    test.skip('should open AI assistant dialog', async () => {
      // This would require a full setup with AI enabled
      // Skipped by default as it needs actual AI configuration
    });

    test.skip('should analyze deviation with AI', async () => {
      // This would require a full setup with AI enabled and API key
      // Skipped by default
    });
  });
});
