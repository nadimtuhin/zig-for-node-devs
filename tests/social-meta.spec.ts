import { test, expect, type Page } from '@playwright/test';

const ORIGIN = 'https://zig-for-node-devs.vercel.app';

const metaContent = (page: Page, selector: string) =>
  page.locator(`head meta[${selector}]`).getAttribute('content');

const PAGES = [
  { path: '/', ogImage: `${ORIGIN}/og/index.png` },
  { path: '/chapters', ogImage: `${ORIGIN}/og/chapters.png` },
  { path: '/chapter/basic_vars', ogImage: `${ORIGIN}/og/chapter/basic_vars.png` },
];

test.describe('Open Graph & social metadata', () => {
  for (const { path, ogImage } of PAGES) {
    test(`${path} exposes a complete large-image preview card`, async ({ page, request }) => {
      await page.goto(path);

      expect(await metaContent(page, 'property="og:image"')).toBe(ogImage);
      expect(await metaContent(page, 'property="og:image:width"')).toBe('1200');
      expect(await metaContent(page, 'property="og:image:height"')).toBe('630');
      expect(await metaContent(page, 'property="og:image:type"')).toBe('image/png');
      expect(await metaContent(page, 'property="og:image:alt"')).toContain('56 Interactive Lessons');
      expect(await metaContent(page, 'property="og:site_name"')).toBe('Zig for Node.js Devs');

      expect(await metaContent(page, 'name="twitter:card"')).toBe('summary_large_image');
      expect(await metaContent(page, 'name="twitter:image"')).toBe(ogImage);
      expect(await metaContent(page, 'name="twitter:image:alt"')).toBeTruthy();
      expect(await metaContent(page, 'name="twitter:title"')).toBe(await page.title());
      expect(await metaContent(page, 'name="twitter:description"')).toBeTruthy();
      expect(await metaContent(page, 'name="twitter:site"')).toMatch(/^@\w+$/);
      expect(await metaContent(page, 'name="twitter:creator"')).toMatch(/^@\w+$/);

      expect(await metaContent(page, 'name="robots"')).toBe(
        'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1',
      );
      expect(await metaContent(page, 'name="author"')).toBe('Nadim Tuhin');
      expect(await metaContent(page, 'name="theme-color"')).toBe('#f7a41d');
      expect(await metaContent(page, 'name="keywords"')).toContain('Zig');

      const image = await request.get(new URL(ogImage).pathname);
      expect(image.status()).toBe(200);
      expect(image.headers()['content-type']).toBe('image/png');
      const png = await image.body();
      expect(png.subarray(1, 4).toString()).toBe('PNG');
      expect(png.readUInt32BE(16)).toBe(1200);
      expect(png.readUInt32BE(20)).toBe(630);
    });
  }

  test('chapter keywords come from the chapter, not the site defaults', async ({ page }) => {
    await page.goto('/chapter/basic_vars');
    expect(await metaContent(page, 'name="keywords"')).toContain('Variables, Mutability & Types');
  });

  test('every sitemap page has its own OG card that resolves', async ({ page, request }) => {
    const sitemap = await (await request.get('/sitemap.xml')).text();
    const paths = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, loc]) => new URL(loc).pathname);
    expect(paths.length).toBeGreaterThan(60);

    for (const path of paths) {
      await page.goto(path);
      const ogImage = await metaContent(page, 'property="og:image"');
      expect(ogImage, path).not.toBe(`${ORIGIN}/og-image.png`);
      expect((await request.get(new URL(ogImage!).pathname)).status(), path).toBe(200);
    }
  });

  test('default /og-image.png fallback is a 1200x630 PNG', async ({ request }) => {
    const png = await (await request.get('/og-image.png')).body();
    expect(png.readUInt32BE(16)).toBe(1200);
    expect(png.readUInt32BE(20)).toBe(630);
  });
});
