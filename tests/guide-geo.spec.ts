import { test, expect } from '@playwright/test';

const GUIDE_ROUTES = [
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
];

test.describe('Architecture guides are answer-engine ready', () => {
  for (const route of GUIDE_ROUTES) {
    test(`${route} opens with a Direct Answer box under a single h1`, async ({ page }) => {
      await page.goto(route);

      await expect(page.locator('h1')).toHaveCount(1);

      const directAnswer = page.locator('.direct-answer');
      await expect(directAnswer).toHaveCount(1);
      await expect(directAnswer).toBeVisible();
      await expect(directAnswer.locator('h2')).toHaveText('Direct Answer');
      const answerText = (await directAnswer.locator('p').first().innerText()).trim();
      expect(answerText.length).toBeGreaterThan(150);

      const headingAfterH1 = await page.evaluate(() => {
        const headings = [...document.querySelectorAll('h1, h2, h3, h4, h5, h6')];
        const h1Index = headings.findIndex(h => h.tagName === 'H1');
        return headings[h1Index + 1]?.closest('.direct-answer') !== null;
      });
      expect(headingAfterH1).toBe(true);
    });

    test(`${route} never skips a heading level`, async ({ page }) => {
      await page.goto(route);

      const skippedLevels = await page.evaluate(() => {
        const levels = [...document.querySelectorAll('main h1, main h2, main h3, main h4, main h5, main h6')]
          .map(h => ({ level: Number(h.tagName[1]), text: h.textContent?.trim() ?? '' }));
        const skips: string[] = [];
        for (let i = 1; i < levels.length; i++) {
          if (levels[i].level > levels[i - 1].level + 1) {
            skips.push(`h${levels[i - 1].level} -> h${levels[i].level}: "${levels[i].text}"`);
          }
        }
        return skips;
      });
      expect(skippedLevels).toEqual([]);
    });

    test(`${route} renders with no layout shift`, async ({ page }) => {
      await page.addInitScript(() => {
        (window as any).__cls = 0;
        new PerformanceObserver(list => {
          for (const entry of list.getEntries() as any[]) {
            if (!entry.hadRecentInput) (window as any).__cls += entry.value;
          }
        }).observe({ type: 'layout-shift', buffered: true });
      });
      await page.goto(route);
      await page.waitForLoadState('networkidle');

      const cls = await page.evaluate(() => (window as any).__cls as number);
      expect(cls).toBeLessThan(0.01);
    });
  }
});
