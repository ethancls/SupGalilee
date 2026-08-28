import { Page, expect } from '@playwright/test';

/**
 * Test utilities and helpers for HAZOP Labs E2E tests
 */

// Test user credentials
export const TEST_USERS = {
  admin: {
    email: 'admin@hazop-test.com',
    password: 'TestPassword123!',
    name: 'Admin User',
  },
  member: {
    email: 'member@hazop-test.com',
    password: 'MemberPass123!',
    name: 'Member User',
  },
  viewer: {
    email: 'viewer@hazop-test.com',
    password: 'ViewerPass123!',
    name: 'Viewer User',
  },
};

// Test organization data
export const TEST_ORG = {
  name: 'Test Organization',
  slug: 'test-organization',
  description: 'Organization for E2E testing',
};

// Test project data
export const TEST_PROJECT = {
  name: 'Test HAZOP Study',
  description: 'Chemical reactor feed system for testing purposes',
};

// Test node data
export const TEST_NODE = {
  name: 'Reactor R-101',
  description: 'Main reaction vessel for process',
  designIntent: 'Maintain reaction at controlled temperature and pressure',
  parameters: ['Temperature', 'Pressure', 'Flow', 'Level'],
};

// Test deviation data
export const TEST_DEVIATION = {
  parameter: 'Temperature',
  guideWord: 'MORE',
  cause: 'Cooling water failure',
  consequence: 'Runaway reaction possible',
  safeguards: 'High temperature alarm, Emergency shutdown system',
  recommendations: 'Install redundant cooling system',
  severity: 4,
  likelihood: 2,
};

/**
 * Register a new user
 */
export async function registerUser(
  page: Page,
  user: { email: string; password: string; name: string }
) {
  await page.goto('/register');
  await page.getByLabel('Name').fill(user.name);
  await page.getByLabel('Email').fill(user.email);
  await page.getByLabel('Password', { exact: true }).fill(user.password);
  await page.getByLabel('Confirm Password').fill(user.password);
  await page.getByRole('button', { name: /create account|register/i }).click();
  
  // Wait for redirect to dashboard or welcome page
  await expect(page).toHaveURL(/\/(org|welcome)?/, { timeout: 10000 });
}

/**
 * Login with credentials
 */
export async function login(
  page: Page,
  user: { email: string; password: string }
) {
  await page.goto('/login');
  await page.getByLabel('Email').fill(user.email);
  await page.getByLabel('Password').fill(user.password);
  await page.getByRole('button', { name: /sign in|login/i }).click();
  
  // Wait for redirect to dashboard
  await expect(page).toHaveURL(/\/(org)?/, { timeout: 10000 });
}

/**
 * Logout current user
 */
export async function logout(page: Page) {
  // Look for user menu/avatar and click logout
  const userMenu = page.locator('[data-testid="user-menu"]').or(
    page.getByRole('button', { name: /account|profile|user/i })
  );
  
  if (await userMenu.isVisible()) {
    await userMenu.click();
    await page.getByRole('menuitem', { name: /logout|sign out/i }).click();
    await expect(page).toHaveURL(/\/login/);
  } else {
    // Fallback: navigate directly to logout
    await page.goto('/api/auth/logout');
  }
}

/**
 * Create a new organization
 */
export async function createOrganization(
  page: Page,
  org: { name: string; description?: string }
) {
  // Click on create organization button
  await page.getByRole('button', { name: /create.*organization|new.*organization/i }).click();
  
  // Fill in the form
  await page.getByLabel('Organization Name').fill(org.name);
  if (org.description) {
    await page.getByLabel('Description').fill(org.description);
  }
  
  // Submit
  await page.getByRole('button', { name: /create/i }).click();
  
  // Wait for navigation to new org
  await expect(page).toHaveURL(/\/org\//, { timeout: 10000 });
}

/**
 * Create a new project
 */
export async function createProject(
  page: Page,
  project: { name: string; description?: string }
) {
  // Click on create project button
  await page.getByRole('button', { name: /create.*project|new.*project/i }).click();
  
  // Fill in the form
  await page.getByLabel('Project Name').or(page.getByLabel('Name')).fill(project.name);
  if (project.description) {
    await page.getByLabel('Description').fill(project.description);
  }
  
  // Submit
  await page.getByRole('button', { name: /create/i }).click();
  
  // Wait for project to be created
  await expect(page.getByText(project.name)).toBeVisible({ timeout: 10000 });
}

/**
 * Navigate to a specific organization
 */
export async function goToOrganization(page: Page, slug: string) {
  await page.goto(`/org/${slug}`);
  await expect(page).toHaveURL(new RegExp(`/org/${slug}`));
}

/**
 * Navigate to a specific project
 */
export async function goToProject(page: Page, orgSlug: string, projectId: string) {
  await page.goto(`/org/${orgSlug}/projects/${projectId}`);
  await expect(page).toHaveURL(new RegExp(`/org/${orgSlug}/projects/${projectId}`));
}

/**
 * Wait for toast notification
 */
export async function waitForToast(page: Page, message: string | RegExp) {
  const toast = page.locator('[data-sonner-toast]').or(
    page.getByRole('status')
  );
  await expect(toast.getByText(message)).toBeVisible({ timeout: 5000 });
}

/**
 * Fill in a form field that might have different label formats
 */
export async function fillField(
  page: Page,
  labelOrPlaceholder: string,
  value: string
) {
  const field = page.getByLabel(labelOrPlaceholder).or(
    page.getByPlaceholder(labelOrPlaceholder)
  );
  await field.fill(value);
}

/**
 * Generate unique email for each test run
 */
export function uniqueEmail(prefix: string = 'test'): string {
  return `${prefix}-${Date.now()}@hazop-test.com`;
}

/**
 * Generate unique name for resources
 */
export function uniqueName(prefix: string = 'Test'): string {
  return `${prefix} ${Date.now()}`;
}

/**
 * Check if element exists (without throwing)
 */
export async function elementExists(page: Page, selector: string): Promise<boolean> {
  try {
    await page.waitForSelector(selector, { timeout: 2000 });
    return true;
  } catch {
    return false;
  }
}

/**
 * Take a screenshot for debugging
 */
export async function debugScreenshot(page: Page, name: string) {
  await page.screenshot({ 
    path: `e2e/screenshots/${name}-${Date.now()}.png`,
    fullPage: true,
  });
}
