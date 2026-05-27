import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// Deterministic admin-1 fixture (3 demo-country regions + 1 non-demo region).
// Playwright runs from the project root, so resolve relative to cwd.
const FIXTURE = readFileSync(join(process.cwd(), 'e2e', 'fixtures', 'admin1.geojson'), 'utf-8');
const FIXTURE_URL = 'https://fixture.test/admin1.geojson';

test.beforeEach(async ({ page }) => {
  // Point the globe at the fixture URL. Setting window.__ADMIN1_URL__ also
  // activates the deterministic window.__globeClickRegion test hook in Globe.tsx.
  await page.addInitScript((url) => {
    (window as unknown as { __ADMIN1_URL__: string }).__ADMIN1_URL__ = url;
  }, FIXTURE_URL);
  await page.route('**/admin1.geojson', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: FIXTURE }),
  );
});

test('globe canvas mounts and loads admin-1 polygons', async ({ page }) => {
  await page.goto('/');
  const canvas = page.getByTestId('globe-canvas');
  await expect(canvas).toBeVisible();
  await expect(canvas).toHaveAttribute('data-globe-ready', 'true', { timeout: 20000 });
});

test('clicking a demo-country region selects it and fires onRegionSelected', async ({ page }) => {
  await page.goto('/');
  const canvas = page.getByTestId('globe-canvas');
  await expect(canvas).toHaveAttribute('data-globe-ready', 'true', { timeout: 20000 });

  await page.evaluate(() => {
    (window as unknown as { __globeClickRegion?: (id: string) => void }).__globeClickRegion?.('US-WY');
  });

  await expect(canvas).toHaveAttribute('data-selected-region', 'US-WY');
  const last = await page.evaluate(
    () => (window as unknown as { __lastRegion?: [string, string, string] }).__lastRegion,
  );
  expect(last).toEqual(['USA', 'US-WY', 'Wyoming']);
});

test('non-demo regions are inert (no selection change)', async ({ page }) => {
  await page.goto('/');
  const canvas = page.getByTestId('globe-canvas');
  await expect(canvas).toHaveAttribute('data-globe-ready', 'true', { timeout: 20000 });

  // Select a valid demo region first.
  await page.evaluate(() => {
    (window as unknown as { __globeClickRegion?: (id: string) => void }).__globeClickRegion?.('US-WY');
  });
  await expect(canvas).toHaveAttribute('data-selected-region', 'US-WY');

  // A non-demo id (filtered out of the demo set) must be a no-op.
  await page.evaluate(() => {
    (window as unknown as { __globeClickRegion?: (id: string) => void }).__globeClickRegion?.('FR-IDF');
  });
  await expect(canvas).toHaveAttribute('data-selected-region', 'US-WY');
  const last = await page.evaluate(
    () => (window as unknown as { __lastRegion?: [string, string, string] }).__lastRegion,
  );
  expect(last).toEqual(['USA', 'US-WY', 'Wyoming']);
});
