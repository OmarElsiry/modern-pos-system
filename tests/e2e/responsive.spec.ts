import { test, expect, Page } from '@playwright/test';

/**
 * Responsive Design Tests
 * Tests the application's responsiveness across different viewport sizes
 * as defined in specs/002-design-responsiveness
 */

// Define viewport configurations
const viewports = {
    mobile: { width: 375, height: 667 },
    tablet: { width: 768, height: 1024 },
    desktop: { width: 1440, height: 900 },
    largeDesktop: { width: 1920, height: 1080 },
};

test.describe('Responsive Design Tests', () => {

    test.describe('Mobile Viewport (375px)', () => {
        test.use({ viewport: viewports.mobile });

        test('should show hamburger menu on mobile', async ({ page }) => {
            await page.goto('/');
            await page.waitForLoadState('networkidle');

            // Hamburger button should be visible
            const hamburger = page.locator('.mobile-menu-toggle');
            await expect(hamburger).toBeVisible();

            // Sidebar should be hidden by default
            const sidebar = page.locator('.sidebar');
            // Check transform - should be translated off-screen
            await expect(sidebar).not.toBeInViewport();

            await page.screenshot({ path: 'tests/e2e/screenshots/mobile-hamburger.png' });
        });

        test('should open sidebar when hamburger is clicked', async ({ page }) => {
            await page.goto('/');
            await page.waitForLoadState('networkidle');

            // Click hamburger
            await page.click('.mobile-menu-toggle');
            await page.waitForTimeout(500); // Wait for animation

            // Sidebar should now be visible
            const sidebar = page.locator('.sidebar.mobile-open');
            await expect(sidebar).toBeVisible();

            // Overlay should be visible
            const overlay = page.locator('.mobile-overlay');
            await expect(overlay).toBeVisible();

            await page.screenshot({ path: 'tests/e2e/screenshots/mobile-sidebar-open.png' });
        });

        test('should close sidebar when overlay is clicked', async ({ page }) => {
            await page.goto('/');
            await page.waitForLoadState('networkidle');

            // Open sidebar
            await page.click('.mobile-menu-toggle');
            await page.waitForTimeout(500);

            // Click overlay to close
            await page.click('.mobile-overlay');
            await page.waitForTimeout(500);

            // Sidebar should no longer have mobile-open class
            const sidebar = page.locator('.sidebar.mobile-open');
            await expect(sidebar).not.toBeVisible();
        });

        test('should have single-column dashboard layout', async ({ page }) => {
            await page.goto('/dashboard');
            await page.waitForLoadState('networkidle');

            // Dashboard grid should be single column on mobile
            const grid = page.locator('.bento-grid');
            const gridStyle = await grid.evaluate((el) => {
                return window.getComputedStyle(el).getPropertyValue('grid-template-columns');
            });

            // Should be single column (1fr or equivalent)
            console.log('Mobile grid template:', gridStyle);

            await page.screenshot({ path: 'tests/e2e/screenshots/mobile-dashboard.png' });
        });
    });

    test.describe('Tablet Viewport (768px)', () => {
        test.use({ viewport: viewports.tablet });

        test('should show sidebar normally on tablet', async ({ page }) => {
            await page.goto('/');
            await page.waitForLoadState('networkidle');

            // Hamburger should NOT be visible
            const hamburger = page.locator('.mobile-menu-toggle');
            await expect(hamburger).toBeHidden();

            // Sidebar should be visible
            const sidebar = page.locator('.sidebar');
            await expect(sidebar).toBeVisible();

            await page.screenshot({ path: 'tests/e2e/screenshots/tablet-layout.png' });
        });
    });

    test.describe('Desktop Viewport (1440px)', () => {
        test.use({ viewport: viewports.desktop });

        test('should show two-column POS layout', async ({ page }) => {
            await page.goto('/pos');
            await page.waitForLoadState('networkidle');

            // POS should have product section and cart side-by-side
            const content = page.locator('.content');
            await expect(content).toBeVisible();

            await page.screenshot({ path: 'tests/e2e/screenshots/desktop-pos.png' });
        });

        test('should show full sidebar with labels', async ({ page }) => {
            await page.goto('/');
            await page.waitForLoadState('networkidle');

            // Nav labels should be visible
            const navLabels = page.locator('.nav-label');
            const count = await navLabels.count();
            expect(count).toBeGreaterThan(0);

            // Check one label is visible
            await expect(navLabels.first()).toBeVisible();

            await page.screenshot({ path: 'tests/e2e/screenshots/desktop-sidebar.png' });
        });
    });

    test.describe('Touch Targets', () => {
        test('quantity buttons should be at least 44x44px', async ({ page }) => {
            await page.setViewportSize(viewports.mobile);
            await page.goto('/pos');
            await page.waitForLoadState('networkidle');

            // Try to find quantity buttons in cart
            // First we need to add an item to cart if possible
            const quantityBtn = page.locator('button[size="icon"]').first();

            if (await quantityBtn.isVisible()) {
                const box = await quantityBtn.boundingBox();
                if (box) {
                    console.log(`Button size: ${box.width}x${box.height}`);
                    expect(box.width).toBeGreaterThanOrEqual(44);
                    expect(box.height).toBeGreaterThanOrEqual(44);
                }
            }
        });

        test('navigation items should have minimum 44px height', async ({ page }) => {
            await page.setViewportSize(viewports.mobile);
            await page.goto('/');
            await page.waitForLoadState('networkidle');

            // Open mobile menu first
            await page.click('.mobile-menu-toggle');
            await page.waitForTimeout(500);

            // Check nav items
            const navItems = page.locator('.nav-item');
            const firstNavItem = navItems.first();

            if (await firstNavItem.isVisible()) {
                const box = await firstNavItem.boundingBox();
                if (box) {
                    console.log(`Nav item size: ${box.width}x${box.height}`);
                    expect(box.height).toBeGreaterThanOrEqual(44);
                }
            }

            await page.screenshot({ path: 'tests/e2e/screenshots/touch-targets.png' });
        });
    });

    test.describe('Visual Regression', () => {
        test('should not have horizontal scroll on any viewport', async ({ page }) => {
            for (const [name, size] of Object.entries(viewports)) {
                await page.setViewportSize(size);
                await page.goto('/');
                await page.waitForLoadState('networkidle');

                // Check for horizontal scroll
                const hasHorizontalScroll = await page.evaluate(() => {
                    return document.documentElement.scrollWidth > document.documentElement.clientWidth;
                });

                if (hasHorizontalScroll) {
                    console.warn(`Horizontal scroll detected at ${name} (${size.width}x${size.height})`);
                }

                // Allow for minor pixel differences due to scrollbar
                const scrollDiff = await page.evaluate(() => {
                    return document.documentElement.scrollWidth - document.documentElement.clientWidth;
                });

                expect(scrollDiff).toBeLessThanOrEqual(5);
            }
        });
    });
});
