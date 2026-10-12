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

  test('Syntax highlighting is applied across dynamic chapter switching and architecture guides', async ({ page }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', err => pageErrors.push(err.message));

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 1. Initial Node.js snippet has syntax tokens
    const nodeTokensInitial = page.locator('#detailNodeCode code .tok-keyword');
    await expect(nodeTokensInitial.first()).toBeVisible();

    // 2. CodeMirror has custom Zig keyword and builtin tokens
    const cmBuiltin = page.locator('.CodeMirror .cm-builtin');
    await expect(cmBuiltin.first()).toBeVisible();
    const cmKeyword = page.locator('.CodeMirror .cm-keyword');
    await expect(cmKeyword.first()).toBeVisible();

    // 3. Navigate to next chapter and verify Node.js syntax tokens are preserved
    const nextBtn = page.locator('#btnTopNextLesson');
    await nextBtn.click();
    const nodeTokensAfterNext = page.locator('#detailNodeCode code .tok-keyword');
    await expect(nodeTokensAfterNext.first()).toBeVisible();

    // 4. Click another chapter in sidebar and verify highlighting remains
    const chapterItem = page.locator('.chapter-nav-item').nth(5);
    await chapterItem.click();
    const nodeTokensAfterSidebar = page.locator('#detailNodeCode code .tok-keyword');
    await expect(nodeTokensAfterSidebar.first()).toBeVisible();

    // 5. Verify architecture guides have syntax highlighted code blocks
    await page.goto('/memory');
    await page.waitForLoadState('domcontentloaded');
    const memoryCodeTokens = page.locator('pre code .tok-keyword');
    await expect(memoryCodeTokens.first()).toBeVisible();

    await page.goto('/docker');
    await page.waitForLoadState('domcontentloaded');
    const dockerCodeTokens = page.locator('pre code .tok-keyword');
    await expect(dockerCodeTokens.first()).toBeVisible();

    await page.goto('/c-interop');
    await page.waitForLoadState('domcontentloaded');
    const cInteropCodeTokens = page.locator('pre code .tok-keyword');
    await expect(cInteropCodeTokens.first()).toBeVisible();

    expect(pageErrors).toEqual([]);
  });
});
