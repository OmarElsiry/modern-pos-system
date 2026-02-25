
import { test, expect } from '@playwright/test';

test.describe('Transaction Persistence', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/#/pos');
        await page.waitForSelector('.pos-screen', { timeout: 10000 });

        // Seed data if needed
        await page.evaluate(async () => {
            // 1. Ensure Category
            const categories = await (window as any).electronAPI.categories.getAll();
            let categoryId = categories[0]?.id;

            if (!categoryId) {
                const newCat = await (window as any).electronAPI.categories.create({
                    name: 'General',
                    description: 'Test Category'
                });
                categoryId = newCat.id; // Assuming create returns the object with ID
                // If create returns boolean or something else, we might need to fetch again
                // But typically repositories return the created item or ID. 
                // Let's assume standard behavior or fetch again.
                if (!categoryId) {
                    const cats = await (window as any).electronAPI.categories.getAll();
                    categoryId = cats[0]?.id;
                }
            }

            // 2. Ensure Products
            const products = await (window as any).electronAPI.products.getAll();
            if (products.length < 3) {
                const sampleProducts = [
                    {
                        name: 'Test Product',
                        barcode: '123456',
                        wholesalePrice: 10,
                        retailPrice: 15,
                        purchasePrice: 8,
                        stockQuantity: 100,
                        minStockLevel: 5,
                        categoryId: categoryId,
                        metadata: {}
                    },
                    {
                        name: 'Chicken Sandwich',
                        barcode: '777888',
                        wholesalePrice: 45,
                        retailPrice: 55,
                        purchasePrice: 35,
                        stockQuantity: 50,
                        minStockLevel: 5,
                        categoryId: categoryId,
                        metadata: {}
                    },
                    {
                        name: 'Cheese Sandwich',
                        barcode: '999000',
                        wholesalePrice: 20,
                        retailPrice: 30,
                        purchasePrice: 15,
                        stockQuantity: 80,
                        minStockLevel: 5,
                        categoryId: categoryId,
                        metadata: {}
                    }
                ];

                for (const p of sampleProducts) {
                    if (!products.find((existing: any) => existing.barcode === p.barcode)) {
                        await (window as any).electronAPI.products.create(p);
                    }
                }
            }
        });

        // Reload to show seeded data
        await page.reload();
        await page.waitForSelector('.pos-screen');

        // Clear cart first via evaluation if needed, or assume fresh start effectively
        // Best effort cleanup:
        await page.evaluate(() => {
            localStorage.removeItem('currentTransaction');
        });
        // Reload again to apply clear? Or just clear state in app? 
        // App reads localStorage on mount.
        await page.reload();
        await page.waitForSelector('.pos-screen');
    });

    test('should persist cart items after reload', async ({ page }) => {
        // 1. Add an item (simulate scan or click)
        // We assume there's at least one product in the grid
        const firstProduct = page.locator('.product-card').first();
        await firstProduct.waitFor({ state: 'visible', timeout: 5000 });

        // Get product name to verify later
        const productName = await firstProduct.locator('h3').innerText();

        await firstProduct.click();

        // Check it appeared in cart
        await expect(page.locator('.cart-item')).toHaveCount(1);
        await expect(page.locator('.cart-item').first()).toHaveText(new RegExp(productName));

        // 2. Reload page
        await page.reload();
        await page.waitForSelector('.pos-screen');

        // 3. Verify item is still there
        await expect(page.locator('.cart-item')).toHaveCount(1);
        await expect(page.locator('.cart-item').first()).toHaveText(new RegExp(productName));
    });

    test('should persist active route', async ({ page }) => {
        // 1. Go to Products page
        // With HashRouter, links might allow clicking via text or partial href
        // Trying to find link by href containing products
        await page.locator('a[href*="products"]').click();
        await expect(page).toHaveURL(/.*\/products/);

        // 2. Reload
        await page.reload();

        // 3. Check we are still on products
        await expect(page).toHaveURL(/.*\/products/);
    });
});
