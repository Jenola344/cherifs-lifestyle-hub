import { test, expect } from '@playwright/test';

test.describe('Shopping Experience', () => {
    test.beforeEach(async ({ page }) => {
        // Handle the "Added to your collection!" alert automatically
        page.on('dialog', async dialog => {
            await dialog.accept();
        });
    });

    test('should add an item to the cart and verify it', async ({ page }) => {
        await page.goto('/shop');

        // Click "View Details"
        await page.getByRole('button', { name: /View Details/i }).first().click();

        // Get modal title
        const itemTitle = await page.locator('h2').first().textContent();
        
        // Add to cart
        await page.getByRole('button', { name: /Acquire for Collection/i }).click();

        // Navigate to cart
        await page.goto('/cart');

        // Verify the item title is present in the cart
        await expect(page.getByRole('heading', { level: 3, name: itemTitle || '' })).toBeVisible();
    });

    test('should handle cart quantity correctly', async ({ page }) => {
        await page.goto('/shop');
        
        // First addition
        await page.getByRole('button', { name: /View Details/i }).first().click();
        await page.getByRole('button', { name: /Acquire for Collection/i }).click();
        
        // Modal closes on add, so we re-open for the second addition
        await page.getByRole('button', { name: /View Details/i }).first().click();
        await page.getByRole('button', { name: /Acquire for Collection/i }).click();

        // Go to cart and check quantity
        await page.goto('/cart');
        
        // Ensure the item shows Qty: 2
        await expect(page.getByText(/Qty: 2/i)).toBeVisible();
    });
});

test.describe('Inquiry Flow', () => {
    test('contact form allows input', async ({ page }) => {
        await page.goto('/contact');
        
        await page.getByLabel(/Full Name/i).fill('Test User');
        await page.getByLabel(/Email Address/i).fill('test@example.com');
        await page.getByPlaceholder(/Tell us about your vision/i).fill('I am interested in the art collection.');
        
        const submitBtn = page.getByRole('button', { name: /Send Inquiry/i });
        await expect(submitBtn).toBeVisible();
    });
});
