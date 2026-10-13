import { test, expect, type Page } from '@playwright/test';
import { serializeJsonLd } from '../src/lib/structuredData';

type Node = Record<string, any>;

async function readJsonLdGraph(page: Page): Promise<Node[]> {
  const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
  expect(blocks.length).toBeGreaterThan(0);
  return blocks.flatMap((raw) => {
    const parsed = JSON.parse(raw);
    return parsed['@graph'] ?? [parsed];
  });
}

function findByType(graph: Node[], type: string): Node | undefined {
  return graph.find((node) => [node['@type']].flat().includes(type));
}

const GUIDE_PATHS = [
  '/roadmap', '/memory', '/comptime', '/build-system', '/c-interop', '/docker', '/microservice',
  '/philosophy', '/pitfalls', '/troubleshooting', '/interviews', '/cheatsheet', '/leetcode',
];

test.describe('Schema.org structured data', () => {
  test('Course node declares level, teaches and a Person author', async ({ page }) => {
    await page.goto('/');
    const course = findByType(await readJsonLdGraph(page), 'Course');

    expect(course?.educationalLevel).toBe('Intermediate to Advanced Systems Engineering');
    expect(course?.teaches).toContain('comptime metaprogramming');
    expect(course?.author).toMatchObject({
      '@type': 'Person',
      name: 'Nadim Tuhin',
      sameAs: 'https://github.com/nadimtuhin',
    });
  });

  test('Chapter page exposes TechArticle, code sample, FAQ and breadcrumbs', async ({ page }) => {
    await page.goto('/chapter/arrays_and_slices');
    const graph = await readJsonLdGraph(page);

    const article = findByType(graph, 'TechArticle');
    expect(article?.headline).toBe('Arrays, Slices & Memory Views');
    expect(article?.position).toBe(3);
    expect(article?.articleSection).toBe('Part 1: The Core Mental Model & Syntax Jump');
    expect(article?.author?.name).toBe('Nadim Tuhin');
    expect(article?.hasPart?.['@type']).toBe('SoftwareSourceCode');
    expect(article?.hasPart?.programmingLanguage).toBe('Zig');
    expect(article?.hasPart?.text).toContain('numbers[1..4]');

    const faq = findByType(graph, 'FAQPage');
    const questions = faq?.mainEntity ?? [];
    expect(questions).toHaveLength(2);
    expect(questions[0].name).toBe('How does Arrays, Slices & Memory Views in Zig differ from Node.js / JavaScript?');
    expect(questions[0].acceptedAnswer.text).toContain('Array.prototype.slice()');
    expect(questions[1].name).toBe('What is the common pitfall or footgun in Zig for Arrays, Slices & Memory Views?');

    const breadcrumbs = findByType(graph, 'BreadcrumbList')?.itemListElement ?? [];
    expect(breadcrumbs.map((crumb: Node) => crumb.name)).toEqual(['Home', 'Curriculum', 'Arrays, Slices & Memory Views']);
  });

  for (const path of GUIDE_PATHS) {
    test(`Guide ${path} has a 140-160 char description, TechArticle and FAQ`, async ({ page }) => {
      await page.goto(path);
      const description = await page.locator('meta[name="description"]').getAttribute('content');
      expect(description?.length).toBeGreaterThanOrEqual(140);
      expect(description?.length).toBeLessThanOrEqual(160);

      const graph = await readJsonLdGraph(page);
      expect(findByType(graph, 'TechArticle')?.description).toBe(description);
      const faqEntries = findByType(graph, 'FAQPage')?.mainEntity ?? [];
      expect(faqEntries.length).toBeGreaterThanOrEqual(2);
      for (const entry of faqEntries) {
        await expect(page.locator('.guide-faq summary', { hasText: entry.name })).toBeAttached();
      }
    });
  }
});

test('serializeJsonLd keeps code samples from closing the script tag', () => {
  const json = serializeJsonLd({ text: 'const x = "</script><script>alert(1)</script>";' });
  expect(json).not.toContain('</');
  expect(JSON.parse(json).text).toBe('const x = "</script><script>alert(1)</script>";');
});

test('Pages without article props emit no TechArticle or FAQPage', async ({ page }) => {
  for (const path of ['/', '/chapters']) {
    await page.goto(path);
    const graph = await readJsonLdGraph(page);
    expect(findByType(graph, 'TechArticle')).toBeUndefined();
    expect(findByType(graph, 'FAQPage')).toBeUndefined();
  }
});
