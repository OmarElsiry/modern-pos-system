
import { test, expect } from '@playwright/test';

test.describe('Security & Isolation', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        // Wait for app to load
        await page.waitForSelector('.layout-container', { timeout: 10000 });
    });

    test('should not have access to Node.js require', async ({ page }) => {
        const isRequireDefined = await page.evaluate(() => {
            // @ts-ignore
            return typeof require !== 'undefined';
        });
        expect(isRequireDefined).toBe(false);
    });

    test('should have access to secure electronAPI', async ({ page }) => {
        const isApiDefined = await page.evaluate(() => {
            // @ts-ignore
            return typeof window.electronAPI !== 'undefined';
        });
        expect(isApiDefined).toBe(true);
    });

    test('should allow IPC calls through exposed API', async ({ page }) => {
        // This assumes the app is running with a backend that handles this
        // We try to call a method that should exist
        const products = await page.evaluate(async () => {
            // @ts-ignore
            return await window.electronAPI.products.search('test');
        });
        // We just check that it didn't throw and returned an array (even if empty)
        expect(Array.isArray(products)).toBe(true);
    });
});
