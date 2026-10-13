import { test, expect } from '@playwright/test';
import { readdirSync } from 'node:fs';

// dist/roadmap/index.html -> /roadmap, dist/index.html -> /
function builtPagePaths(): string[] {
  return readdirSync('dist', { recursive: true, encoding: 'utf8' })
    .filter(file => file.endsWith('index.html'))
    .map(file => '/' + file.replace(/\/?index\.html$/, ''));
}

test.describe('Production readiness', () => {
  test('every built page is in the sitemap and renders without console errors or broken same-origin assets', async ({ page, request, baseURL }) => {
    test.setTimeout(120_000);
    const sitemap = await (await request.get('/sitemap.xml')).text();
    const paths = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, loc]) => new URL(loc).pathname);
    expect([...paths].sort()).toEqual(builtPagePaths().sort());

    const problems: string[] = [];
    const origin = new URL(baseURL!).origin;
    const currentPath = () => new URL(page.url()).pathname;
    page.on('console', msg => {
      if (msg.type() === 'error') problems.push(`${currentPath()} console: ${msg.text()}`);
    });
    page.on('pageerror', err => problems.push(`${currentPath()} pageerror: ${err.message}`));
    page.on('requestfailed', req => {
      if (req.url().startsWith(origin)) problems.push(`${currentPath()} failed: ${req.url()}`);
    });
    page.on('response', res => {
      if (res.url().startsWith(origin) && res.status() >= 400) problems.push(`${currentPath()} ${res.status()}: ${res.url()}`);
    });

    for (const path of paths) {
      const response = await page.goto(path, { waitUntil: 'load' });
      expect(response?.status(), path).toBe(200);
      await page.waitForLoadState('networkidle');
    }

    expect(problems).toEqual([]);
  });

  test('discovery files are served with the right content', async ({ request }) => {
    const robots = await (await request.get('/robots.txt')).text();
    expect(robots).toContain('Sitemap: https://zig-for-node-devs.vercel.app/sitemap.xml');

    for (const path of ['/llms.txt', '/llms-small.txt', '/llms-full.txt']) {
      const response = await request.get(path);
      expect(response.status(), path).toBe(200);
      expect((await response.text()).startsWith('# '), path).toBe(true);
    }

    const index = await (await request.get('/search-index.json')).json();
    expect(index.length).toBeGreaterThan(0);
  });
});
