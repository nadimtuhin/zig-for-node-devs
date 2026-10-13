import { test, expect } from '@playwright/test';

test.describe('Topic cluster internal links', () => {
  test('a chapter links to its architecture guide and sibling lessons as crawlable anchors', async ({ page }) => {
    await page.goto('/chapter/arena_allocator');
    const related = page.locator('#detailRelatedLinks');

    await expect(related.locator('a[href="/memory"]')).toBeVisible();
    await expect(related.locator('a[href="/chapter/allocators_philosophy"]')).toBeVisible();
  });

  test('switching chapters in the reader swaps the related links too', async ({ page }) => {
    await page.goto('/chapter/generics_in_practice');
    await expect(page.locator('#detailRelatedLinks a[href="/comptime"]')).toBeVisible();

    await page.locator('#btnTopNextLesson').click();
    await expect(page).toHaveURL(/\/chapter\/arraylist$/);
    await expect(page.locator('#detailRelatedLinks a[href="/chapter/generics_in_practice"]')).toBeVisible();
  });

  test('the home reader swaps related links when moving to the next chapter', async ({ page }) => {
    await page.goto('/');
    await page.locator('#btnTopNextLesson').click();
    await expect(page.locator('#detailRelatedLinks a[href="/chapter/basic_vars"]')).toBeVisible();
  });

  test('every chapter page links to guides and lessons other than itself', async ({ request }) => {
    const sitemap = await (await request.get('/sitemap.xml')).text();
    const chapterPaths = [...sitemap.matchAll(/<loc>https?:\/\/[^/]+(\/chapter\/[^<]+)<\/loc>/g)].map((m) => m[1]);
    expect(chapterPaths.length).toBe(56);

    for (const path of chapterPaths) {
      const html = await (await request.get(path)).text();
      const related = html.slice(html.indexOf('id="detailRelatedLinks"'), html.indexOf('</nav>', html.indexOf('id="detailRelatedLinks"')));
      const hrefs = [...related.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
      expect(hrefs.some((href) => !href.startsWith('/chapter/')), `${path} has no guide link`).toBe(true);
      expect(hrefs.filter((href) => href.startsWith('/chapter/')).length, `${path} has no lesson links`).toBeGreaterThan(0);
      expect(hrefs, `${path} links to itself`).not.toContain(path.replace(/\/$/, ''));
    }
  });

  test('a guide links back to the lessons in its cluster and to sibling guides', async ({ page }) => {
    await page.goto('/memory');
    const related = page.locator('#guideRelatedLinks');

    for (const href of ['/chapter/allocators_philosophy', '/chapter/arena_allocator', '/chapter/fixed_buffer_allocator']) {
      await expect(related.locator(`a[href="${href}"]`)).toBeVisible();
    }
    await expect(related.locator('a[href="/memory"]')).toHaveCount(0);
    await expect(related.locator('a[href="/troubleshooting"]')).toBeVisible();
  });

  test('every internal link on every sitemap page resolves with 200', async ({ request }) => {
    const sitemap = await (await request.get('/sitemap.xml')).text();
    const pages = [...sitemap.matchAll(/<loc>https?:\/\/[^/]+([^<]*)<\/loc>/g)].map((m) => m[1] || '/');
    expect(pages.length).toBeGreaterThan(60);

    const internalHrefs = new Set<string>();
    for (const path of pages) {
      const html = await (await request.get(path)).text();
      for (const [, href] of html.matchAll(/href="(\/[^"#?]*)/g)) internalHrefs.add(href);
    }

    const broken: string[] = [];
    for (const href of internalHrefs) {
      const res = await request.get(href);
      if (res.status() !== 200) broken.push(`${href} -> ${res.status()}`);
    }
    expect(broken).toEqual([]);
  });
});
