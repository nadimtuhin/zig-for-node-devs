import { test, expect, type Page } from '@playwright/test';

const MODIFIER = process.platform === 'darwin' ? 'Meta' : 'Control';

async function openPalette(page: Page) {
  await page.keyboard.press(`${MODIFIER}+k`);
  const input = page.getByRole('combobox', { name: /search lessons and guides/i });
  await expect(input).toBeFocused();
  return input;
}

test.describe('Cmd+K search palette', () => {
  for (const path of ['/', '/chapter/hashmap', '/cheatsheet', '/docker']) {
    test(`Cmd+K focuses the search input on ${path}`, async ({ page }) => {
      await page.goto(path);
      await openPalette(page);
    });
  }

  test('empty query shows suggested queries that run a search when clicked', async ({ page }) => {
    await page.goto('/cheatsheet');
    const input = await openPalette(page);
    const suggestions = page.getByRole('group', { name: /suggested searches/i });
    for (const query of ['allocator', 'comptime', 'c-interop', 'error', 'slice']) {
      await expect(suggestions.getByRole('button', { name: query, exact: true })).toBeVisible();
    }
    await suggestions.getByRole('button', { name: 'comptime', exact: true }).click();
    await expect(input).toHaveValue('comptime');
    await expect(page.getByRole('option').first()).toBeVisible();
  });

  test('results include both lessons and architecture guides', async ({ page }) => {
    await page.goto('/memory');
    const input = await openPalette(page);
    await input.fill('allocator');
    const listbox = page.getByRole('listbox');
    await expect(listbox.getByRole('option', { name: /Arena Allocator/i }).first()).toBeVisible();
    await expect(listbox.getByRole('option', { name: /Memory & Allocator Architecture/i })).toBeVisible();
  });

  for (const [query, expected] of [
    ['sqlite', /SQLite/i],
    ['docker', /Production Docker Recipes/i],
    ['c-interop', /C Interoperability/i],
    ['defer', /defer/i],
  ] as const) {
    test(`"${query}" finds ${expected}`, async ({ page }) => {
      await page.goto('/');
      const input = await openPalette(page);
      await input.fill(query);
      await expect(page.getByRole('option', { name: expected }).first()).toBeVisible();
    });
  }

  test('Arrow keys move the active option and Enter navigates to it', async ({ page }) => {
    await page.goto('/cheatsheet');
    const input = await openPalette(page);
    await input.fill('docker');
    const options = page.getByRole('option');
    await expect(options.first()).toHaveAttribute('aria-selected', 'true');

    await input.press('ArrowDown');
    await expect(options.nth(1)).toHaveAttribute('aria-selected', 'true');
    await expect(input).toHaveAttribute('aria-activedescendant', (await options.nth(1).getAttribute('id'))!);
    await input.press('ArrowUp');
    await expect(options.first()).toHaveAttribute('aria-selected', 'true');

    const href = await options.first().locator('a').getAttribute('href');
    await input.press('Enter');
    await expect(page).toHaveURL(new RegExp(`${href}$`));
  });

  test('a query with no matches shows an empty state with suggestions', async ({ page }) => {
    await page.goto('/');
    const input = await openPalette(page);
    await input.fill('qwertyzzz');
    await expect(page.getByText(/no lessons or guides match/i)).toBeVisible();
    await expect(page.getByRole('group', { name: /suggested searches/i })).toBeVisible();
  });

  test('Escape closes the palette', async ({ page }) => {
    await page.goto('/philosophy');
    const input = await openPalette(page);
    await input.fill('comptime');
    await input.press('Escape');
    await expect(input).toBeHidden();
  });

  test('lesson shortcuts do not fire while typing in the palette', async ({ page }) => {
    await page.goto('/chapter/hashmap');
    const input = await openPalette(page);
    await input.fill('arena');
    await input.press('Alt+ArrowRight');
    await expect(page).toHaveURL(/\/chapter\/hashmap$/);
    await input.press(`${MODIFIER}+ArrowLeft`);
    await expect(page).toHaveURL(/\/chapter\/hashmap$/);
    await expect(input).toBeFocused();
  });
});

test.describe('Rosetta Stone cheatsheet', () => {
  test('maps core JS/TS types, collections, control flow, and memory to Zig', async ({ page }) => {
    await page.goto('/cheatsheet');
    const rows: [RegExp, RegExp][] = [
      [/^string$/, /\[\]const u8/],
      [/^boolean$/, /^bool$/],
      [/^any$/, /anytype/],
      [/^Array<T>/, /std\.ArrayList\(T\)/],
      [/^Set<T>/, /std\.AutoHashMap\(T, void\)/],
      [/^new Foo\(\)/, /allocator\.create\(Foo\)/],
      [/^new Array\(n\)/, /allocator\.alloc\(T, n\)/],
    ];
    for (const [jsCell, zigCell] of rows) {
      const row = page.getByRole('row').filter({ has: page.getByRole('cell', { name: jsCell }) });
      await expect(row.getByRole('cell').nth(1)).toHaveText(zigCell);
    }
  });

  test('every cheatsheet table has scoped column headers and a caption', async ({ page }) => {
    await page.goto('/cheatsheet');
    const tables = page.locator('main table');
    const count = await tables.count();
    expect(count).toBeGreaterThanOrEqual(6);
    for (let i = 0; i < count; i++) {
      await expect(tables.nth(i).locator('caption')).toHaveCount(1);
      await expect(tables.nth(i).locator('th[scope="col"]')).toHaveCount(3);
    }
  });
});
