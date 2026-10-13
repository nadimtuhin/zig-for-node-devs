import { test, expect } from '@playwright/test';
import { chaptersData } from '../src/data/chapters';

const chapterKeys = Object.keys(chaptersData);

test('the curriculum has 56 chapters', () => {
  expect(chapterKeys).toHaveLength(56);
});

test.describe('chapter reference content', () => {
  for (const key of chapterKeys) {
    test(`${key} renders clean metadata, rendered inline code, and a line-by-line walkthrough`, async ({ page }) => {
      await page.goto(`/chapter/${key}`);

      for (const selector of ['name="description"', 'property="og:description"', 'name="twitter:description"']) {
        const content = await page.locator(`head meta[${selector}]`).getAttribute('content');
        expect(content, selector).toBeTruthy();
        expect(content, selector).not.toContain('`');
      }

      await expect(page.locator('#detailDesc')).not.toContainText('`');
      const why = page.locator('#detailZigWhy');
      await expect(why).not.toContainText('`');
      expect((await why.innerText()).split(/\s+/).length).toBeGreaterThanOrEqual(120);

      const steps = page.locator('#detailWalkthrough li');
      expect(await steps.count()).toBeGreaterThanOrEqual(4);
      await expect(steps.first().locator('code').first()).toBeVisible();
      await expect(page.locator('#detailWalkthrough')).not.toContainText('`');
    });
  }
});

test('client-side chapter switching renders the same walkthrough as the server', async ({ page }) => {
  await page.goto('/chapter/basic_vars');
  await page.locator('#btnNextLesson').click();

  const next = chaptersData[chapterKeys[1]];
  await expect(page.locator('#detailTitle')).toHaveText(next.title);
  await expect(page.locator('#detailWalkthrough li')).toHaveCount(next.walkthrough.length);
  await expect(page.locator('#detailZigWhy code').first()).toBeVisible();
  await expect(page.locator('#detailZigWhy')).not.toContainText('`');
});

test('chapter insights render inline code on the server and after client-side switching', async ({ page }) => {
  await page.goto('/chapter/basic_vars');
  for (const id of ['#detailInsightMentalModel', '#detailInsightFootgun']) {
    await expect(page.locator(`${id} code`).first()).toBeVisible();
    await expect(page.locator(id)).not.toContainText('`');
  }

  await page.locator('#btnNextLesson').click();
  await expect(page.locator('#detailTitle')).toHaveText(chaptersData[chapterKeys[1]].title);
  for (const id of ['#detailInsightMentalModel', '#detailInsightFootgun']) {
    await expect(page.locator(id)).not.toBeEmpty();
    await expect(page.locator(id)).not.toContainText('`');
  }
  await expect(page.locator('#detailInsightMentalModel code').first()).toBeVisible();
});
