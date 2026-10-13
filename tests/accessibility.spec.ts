import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const PAGES = [
  '/',
  '/chapter/basic_vars',
  '/chapters',
  '/roadmap',
  '/cheatsheet',
  '/pitfalls',
  '/memory',
  '/comptime',
  '/c-interop',
  '/build-system',
  '/docker',
  '/microservice',
  '/leetcode',
  '/interviews',
  '/philosophy',
  '/troubleshooting',
];

for (const path of PAGES) {
  test(`${path} has no WCAG 2.1 AA violations`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    const summary = results.violations.map((v) => ({
      rule: v.id,
      nodes: v.nodes.slice(0, 5).map((n) => `${n.target.join(' ')} :: ${n.failureSummary?.split('\n')[1]?.trim()}`),
    }));
    expect(summary).toEqual([]);
  });
}

test('every page exposes exactly one main landmark with id main-content', async ({ page }) => {
  for (const path of PAGES) {
    await page.goto(path);
    await expect(page.locator('main#main-content'), path).toHaveCount(1);
  }
});

test('skip link is the first tab stop, visible on focus, and moves focus to main', async ({ page }) => {
  await page.goto('/chapter/basic_vars');
  await page.keyboard.press('Tab');
  const skip = page.locator('a.skip-to-content');
  await expect(skip).toBeFocused();
  await expect(skip).toBeInViewport();

  await page.keyboard.press('Enter');
  await expect(page.locator('#main-content')).toBeFocused();
});

test('sidebar chapters are crawlable links that mark the current page', async ({ page }) => {
  await page.goto('/chapter/basic_vars');
  const toc = page.getByRole('navigation', { name: 'Table of Contents' });
  const current = toc.locator('a[aria-current="page"]');
  await expect(current).toHaveCount(1);
  await expect(current).toHaveAttribute('href', '/chapter/basic_vars');

  const next = toc.locator('a.chapter-nav-item').nth(3);
  const nextHref = await next.getAttribute('href');
  await next.click();
  await expect(toc.locator('a[aria-current="page"]')).toHaveAttribute('href', nextHref!);
});

test('a directly loaded chapter page keeps its own lesson and URL after hydration', async ({ page }) => {
  await page.goto('/chapter/basic_vars');
  const link = page.locator('a.chapter-nav-item').nth(3);
  const href = (await link.getAttribute('href'))!;
  const title = (await link.locator('.chapter-nav-title').textContent())!.trim();

  await page.goto(href, { waitUntil: 'networkidle' });
  await expect(page.locator('#detailTitle')).toHaveText(title);
  await expect(page.locator('a.chapter-nav-item[aria-current="page"]')).toHaveAttribute('href', href);
  expect(new URL(page.url()).pathname).toBe(href);
});

test('clicking a sidebar chapter puts that chapter in the URL path', async ({ page }) => {
  await page.goto('/chapter/basic_vars', { waitUntil: 'networkidle' });
  const link = page.locator('a.chapter-nav-item').nth(5);
  const href = (await link.getAttribute('href'))!;
  await link.click();
  await expect(page).toHaveURL(href);
});

// Google's "good" Core Web Vitals threshold for Cumulative Layout Shift.
const GOOD_CLS = 0.1;

for (const path of ['/', '/chapter/basic_vars', '/roadmap']) {
  test(`${path} stays under the good CLS threshold while the editor and insights hydrate`, async ({ page }) => {
    await page.addInitScript(() => {
      (window as any).__cls = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as any[]) {
          if (!entry.hadRecentInput) (window as any).__cls += entry.value;
        }
      }).observe({ type: 'layout-shift', buffered: true });
    });
    await page.goto(path, { waitUntil: 'networkidle' });
    const cls = await page.evaluate(() => (window as any).__cls as number);
    expect(cls).toBeLessThan(GOOD_CLS);
  });
}

test('every copy button has an accessible clipboard label', async ({ page }) => {
  await page.goto('/chapter/basic_vars');
  const copyButtons = await page.locator('button:has-text("Copy")').all();
  expect(copyButtons.length).toBeGreaterThan(0);
  for (const button of copyButtons) {
    await expect(button).toHaveAccessibleName(/clipboard/i);
  }
});
