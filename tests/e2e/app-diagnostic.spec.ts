import { test, expect } from '@playwright/test';

test.describe('POS Application Diagnostic Tests', () => {
  test('should load the application without errors', async ({ page }) => {
    // Listen for console messages
    const consoleMessages: string[] = [];
    const errorMessages: string[] = [];
    
    page.on('console', msg => {
      consoleMessages.push(`[${msg.type()}] ${msg.text()}`);
      console.log(`Browser console [${msg.type()}]:`, msg.text());
    });
    
    page.on('pageerror', error => {
      errorMessages.push(error.message);
      console.error('Page error:', error.message);
    });

    // Navigate to the application
    console.log('Navigating to application...');
    await page.goto('/', { waitUntil: 'networkidle' });

    // Take a screenshot for visual inspection
    await page.screenshot({ path: 'tests/e2e/screenshots/initial-load.png', fullPage: true });

    // Check if root element exists
    const rootElement = await page.locator('#root');
    await expect(rootElement).toBeVisible();

    // Check if the app rendered
    const appContent = await page.locator('#root').innerHTML();
    console.log('Root element HTML length:', appContent.length);

    // Wait a bit for React to render
    await page.waitForTimeout(2000);

    // Take another screenshot after waiting
    await page.screenshot({ path: 'tests/e2e/screenshots/after-wait.png', fullPage: true });

    // Check for error messages in the DOM
    const errorElements = await page.locator('[style*="color: red"], [style*="background: #d32f2f"]').count();
    console.log('Error elements found:', errorElements);

    // Log all console messages
    console.log('\n=== All Console Messages ===');
    consoleMessages.forEach(msg => console.log(msg));

    // Log all errors
    if (errorMessages.length > 0) {
      console.log('\n=== Page Errors ===');
      errorMessages.forEach(err => console.log(err));
    }

    // Check if there are any visible errors
    expect(errorMessages.length).toBe(0);
  });

  test('should check if navigation buttons are present', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Take screenshot
    await page.screenshot({ path: 'tests/e2e/screenshots/navigation-check.png', fullPage: true });

    // Check for navigation elements
    const bodyText = await page.locator('body').textContent();
    console.log('Page contains text:', bodyText?.substring(0, 500));

    // Try to find any buttons
    const buttons = await page.locator('button').count();
    console.log('Number of buttons found:', buttons);

    // Try to find navigation
    const nav = await page.locator('nav').count();
    console.log('Number of nav elements found:', nav);
  });

  test('should check database initialization', async ({ page }) => {
    const consoleMessages: string[] = [];
    
    page.on('console', msg => {
      consoleMessages.push(msg.text());
    });

    await page.goto('/');
    await page.waitForTimeout(3000);

    // Take screenshot
    await page.screenshot({ path: 'tests/e2e/screenshots/database-check.png', fullPage: true });

    // Look for database-related messages
    const dbMessages = consoleMessages.filter(msg => 
      msg.toLowerCase().includes('database') || 
      msg.toLowerCase().includes('sqlite') ||
      msg.toLowerCase().includes('connection')
    );

    console.log('\n=== Database-related messages ===');
    dbMessages.forEach(msg => console.log(msg));

    // Check if there are any error indicators
    const pageContent = await page.content();
    const hasError = pageContent.includes('Error') || pageContent.includes('error');
    
    if (hasError) {
      console.log('\n=== Page contains error text ===');
      const errorText = await page.locator('body').textContent();
      console.log(errorText);
    }
  });
});
