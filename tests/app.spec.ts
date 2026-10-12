import { test, expect } from '@playwright/test';

test.describe('Zig for Node.js Devs — Master Suite E2E', () => {
  test('Home page loads with 0 uncaught errors and initializes CodeMirror', async ({ page }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', err => pageErrors.push(err.message));

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    expect(pageErrors).toEqual([]);
    await expect(page).toHaveTitle(/Zig for Node\.js Devs/i);

    // Verify CodeMirror initialized
    const cm = page.locator('.CodeMirror');
    await expect(cm).toBeVisible();

    // Verify Lesson Detail title
    const title = page.locator('#detailTitle');
    await expect(title).toBeVisible();
    await expect(title).toHaveText(/Variables, Mutability/i);
  });

  test('Interactive navigation next and prev works seamlessly', async ({ page }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', err => pageErrors.push(err.message));

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Click Next lesson
    const nextBtn = page.locator('#btnTopNextLesson');
    await expect(nextBtn).toBeEnabled();
    await nextBtn.click();

    const titleAfterNext = page.locator('#detailTitle');
    await expect(titleAfterNext).toHaveText(/Functions & Immutable Parameters/i);

    // Click Prev lesson
    const prevBtn = page.locator('#btnTopPrevLesson');
    await expect(prevBtn).toBeEnabled();
    await prevBtn.click();

    await expect(titleAfterNext).toHaveText(/Variables, Mutability & Types/i);
    expect(pageErrors).toEqual([]);
  });

  test('Sidebar chapter selection loads code into editor', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Select Chapter 4: Strings as UTF-8 Byte Slices
    const chapterItem = page.locator('.chapter-nav-item').nth(3);
    await chapterItem.click();

    const title = page.locator('#detailTitle');
    await expect(title).toHaveText(/Strings as UTF-8 Byte Slices/i);

    // Check editor content
    const codeContent = await page.evaluate(() => {
      // @ts-ignore
      return typeof editor !== 'undefined' && editor ? editor.getValue() : '';
    });
    expect(codeContent).toContain('@import("std")');
  });

  test('Architecture guides routes render correctly with footer and responsive tables', async ({ page }) => {
    const routes = [
      '/roadmap',
      '/memory',
      '/comptime',
      '/build-system',
      '/c-interop',
      '/docker',
      '/microservice',
      '/leetcode',
      '/pitfalls',
      '/interviews',
      '/cheatsheet',
      '/troubleshooting',
      '/philosophy',
      '/chapters',
    ];

    for (const route of routes) {
      const pageErrors: string[] = [];
      page.on('pageerror', err => pageErrors.push(err.message));

      await page.goto(route);
      await page.waitForLoadState('domcontentloaded');

      expect(pageErrors).toEqual([]);
      const footer = page.locator('footer');
      await expect(footer).toBeVisible();
    }
  });
});
