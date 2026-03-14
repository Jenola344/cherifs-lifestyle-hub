import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should load the homepage and show title', async ({ page }) => {
    await page.goto('/');
    // Check for the main heading or brand name
    await expect(page).toHaveTitle(/Cherif/);
    await expect(page.getByText(/Cherif/i).first()).toBeVisible();
  });

  test('navbar links are working', async ({ page }) => {
    await page.goto('/');
    
    // Attempt to find the shop/gallery link
    // It might be in a dropdown on desktop or a direct link on mobile
    const artCollectionLink = page.getByRole('link', { name: /Art Collection/i });
    const galleryLink = page.getByRole('link', { name: /Gallery/i });
    
    if (await artCollectionLink.isVisible()) {
        await artCollectionLink.click();
    } else if (await galleryLink.isVisible()) {
        await galleryLink.click();
    } else {
        // Fallback: try hovering Gallery span to reveal Art Collection
        await page.getByText(/Gallery/i).first().hover();
        await page.getByRole('link', { name: /Art Collection/i }).click();
    }
    
    await expect(page).toHaveURL(/\/shop/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
});

test.describe('Authentication Flow', () => {
  test('should redirect unauthenticated users to login when visiting profile', async ({ page }) => {
    await page.goto('/profile');
    // It should redirect to /auth
    await expect(page).toHaveURL(/\/auth/);
    await expect(page.getByText(/Sign In/i).or(page.getByText(/Welcome Back/i)).first()).toBeVisible();
  });

  test('forgot password link works', async ({ page }) => {
    await page.goto('/auth');
    // Click the forgot password link
    await page.getByText(/Forgot Password\?/i).click();
    await expect(page).toHaveURL(/\/auth\/forgot-password/);
    await expect(page.locator('h1')).toContainText(/Forgot Password/i);
  });
});
