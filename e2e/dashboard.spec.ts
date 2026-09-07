/**
 * F4 Dashboard E2E tests.
 *
 * /api/analyze is MOCKED via page.route (returns deterministic fixtures).
 * Live "Find sites" returns HTTP 501 until F5a lands — that is expected and documented.
 *
 * Harness: uses window.__globeClickRegion (same hook as globe.spec.ts) to simulate
 * region selection without a real globe click.
 */
import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { AnalysisResult } from '../src/types';

const FIXTURE = readFileSync(join(process.cwd(), 'e2e', 'fixtures', 'admin1.geojson'), 'utf-8');
const FIXTURE_URL = 'https://fixture.test/admin1.geojson';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const WYOMING_RESULT: AnalysisResult = {
  country: 'USA',
  regionId: 'US-WY',
  reactorId: 'terrapower-natrium',
  pathway: 'coal-repower',
  regionSummary:
    'Wyoming offers retiring coal infrastructure with existing grid interconnects. ' +
    'Kemmerer area is well-suited for SMR coal-repower under NRC 10 CFR Part 100.',
  nextStudies: [
    'Site-specific seismic characterization per 10 CFR 100.23',
    'Water rights assessment under Wyoming prior-appropriation doctrine',
    'Grid interconnection study with NorthernGrid/WECC',
  ],
  notes: 'Screen-level assessment only. All findings require independent human review.',
  sites: [
    {
      siteId: 'us-wy-kemmerer',
      siteName: 'Naughton/Kemmerer Brownfield',
      kind: 'named',
      lat: 41.79,
      lng: -110.53,
      rank: 1,
      verdict: 'pass',
      frictionScores: {
        grid: 0.1,
        cooling: 0.45,
        permits: 0.2,
        community: 0.15,
        logistics: 0.2,
        hazards: 0.12,
      },
      matrix: [
        {
          constraint: 'Grid interconnection',
          verdict: 'pass',
          reason: 'Existing 230 kV switchyard at retiring Naughton plant; minimal interconnection work.',
          citationIds: ['us-nrc-10cfr100'],
          dataBasis: 'computable' as const,
        },
        {
          constraint: 'Water / cooling',
          verdict: 'caution',
          reason: 'Semi-arid; cooling tower or dry cooling required. Hams Fork River senior rights pre-allocated.',
          citationIds: ['us-cwa-316b'],
          dataBasis: 'requires-field-study' as const,
        },
        {
          constraint: 'Regulatory pathway',
          verdict: 'pass',
          reason: 'NRC Construction Permit already issued for Natrium at this site.',
          citationIds: ['us-nrc-10cfr100'],
          dataBasis: 'computable' as const,
        },
      ],
      citationIds: ['us-nrc-10cfr100', 'us-cwa-316b'],
      confidence: 'high',
    },
    {
      siteId: 'us-wy-dave-johnston',
      siteName: 'Dave Johnston Greenfield Zone',
      kind: 'greenfield',
      lat: 42.85,
      lng: -106.14,
      rank: 2,
      verdict: 'caution',
      frictionScores: {
        grid: 0.35,
        cooling: 0.6,
        permits: 0.4,
        community: 0.25,
        logistics: 0.35,
        hazards: 0.2,
      },
      matrix: [
        {
          constraint: 'Grid interconnection',
          verdict: 'caution',
          reason: 'Nearby 230 kV lines; new interconnection agreement required.',
          citationIds: ['us-nrc-10cfr100'],
          dataBasis: 'requires-field-study' as const,
        },
        {
          constraint: 'Water / cooling',
          verdict: 'caution',
          reason: 'North Platte River access limited; dry or hybrid cooling likely required.',
          citationIds: ['us-cwa-316b'],
          dataBasis: 'requires-field-study' as const,
        },
      ],
      citationIds: ['us-nrc-10cfr100'],
      confidence: 'medium',
    },
  ],
};

/** Australia fixture: sites[] is empty — statutory ban */
const AUSTRALIA_RESULT: AnalysisResult = {
  country: 'AUS',
  regionId: 'AU-SA',
  reactorId: 'westinghouse-evinci',
  pathway: 'greenfield',
  regionSummary:
    'South Australia has vast, remote land ideally suited for nuclear siting on physical criteria alone. ' +
    'However, the EPBC Act 1999 s.140A and ARPANS Act 1998 s.10 impose a dual statutory prohibition ' +
    'on nuclear power plant construction and operation anywhere in Australia. No viable sites exist ' +
    'until Commonwealth legislation is repealed.',
  nextStudies: [],
  notes:
    'Screen-level only. All findings require independent legal and human review. ' +
    'No sites passed screening — statutory ban is a hard constraint.',
  sites: [],
};

// ── Test setup ────────────────────────────────────────────────────────────────

test.beforeEach(async ({ page }) => {
  // Point globe at the small fixture (activates __globeClickRegion hook).
  await page.addInitScript((url) => {
    (window as unknown as { __ADMIN1_URL__: string }).__ADMIN1_URL__ = url;
  }, FIXTURE_URL);
  await page.route('**/admin1.geojson', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: FIXTURE }),
  );
});

// ── Helper ────────────────────────────────────────────────────────────────────

async function selectRegion(page: import('@playwright/test').Page, regionId: string) {
  const canvas = page.getByTestId('globe-canvas');
  await expect(canvas).toHaveAttribute('data-globe-ready', 'true', { timeout: 20000 });
  await page.evaluate((id) => {
    (window as unknown as { __globeClickRegion?: (id: string) => void }).__globeClickRegion?.(id);
  }, regionId);
  // Wait for dashboard to reflect the selected region
  await expect(page.getByTestId('dashboard')).toBeVisible();
}

// ── Test: dashboard mounts on page load ──────────────────────────────────────

test('dashboard panel is visible on page load', async ({ page }) => {
  await page.goto('/');
  const dashboard = page.getByTestId('dashboard');
  await expect(dashboard).toBeVisible();
});

// ── Test: initial state shows region-select hint ─────────────────────────────

test('shows click-a-region hint when no region selected', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('tab-context').click();
  const empty = page.getByTestId('panel-menu-empty');
  await expect(empty).toBeVisible();
});

// ── Test: Wyoming region populates context panels ─────────────────────────────

test('selecting Wyoming populates region context panels', async ({ page }) => {
  await page.goto('/');
  await selectRegion(page, 'US-WY');

  // Switch to context tab (it's the default but let's be explicit)
  await page.getByTestId('tab-context').click();

  const menu = page.getByTestId('panel-menu');
  await expect(menu).toBeVisible();

  // Should show the region name
  const regionName = page.getByTestId('dashboard-region-name');
  await expect(regionName).toContainText('Wyoming');

  // Should show regulator
  const regulator = page.getByTestId('panel-regulator');
  await expect(regulator).toContainText('U.S. NRC');

  // No ban alert for Wyoming
  await expect(page.getByTestId('ban-alert')).not.toBeVisible();
});

// ── Test: Australia shows ban alert in Legal-RulePack ────────────────────────

test('selecting AU-SA shows ban alert and prohibition fact', async ({ page }) => {
  await page.goto('/');
  await selectRegion(page, 'AU-SA');

  await page.getByTestId('tab-context').click();

  const menu = page.getByTestId('panel-menu');
  await expect(menu).toBeVisible();

  // Ban alert must be visible
  const banAlert = page.getByTestId('ban-alert');
  await expect(banAlert).toBeVisible();
  await expect(banAlert).toContainText('Statutory prohibition');

  // The prohibition fact should be in the Legal-RulePack group — open it and check
  // pathway facts are under Legal-RulePack via our grouping
  const pathwayPanel = page.getByTestId('panel-sa-pathway-ban');
  await expect(pathwayPanel).toBeVisible();
});

// ── Test: SiteFinder cascading pickers ───────────────────────────────────────

test('SiteFinder: tech → company → model cascading works', async ({ page }) => {
  await page.goto('/');
  await selectRegion(page, 'US-WY');
  await page.getByTestId('tab-find').click();

  const techSelect = page.getByTestId('select-technology');
  const companySelect = page.getByTestId('select-company');
  const modelSelect = page.getByTestId('select-model');

  await expect(techSelect).toBeVisible();

  // Company and model start disabled
  await expect(companySelect).toBeDisabled();
  await expect(modelSelect).toBeDisabled();

  // Pick SFR technology
  await techSelect.selectOption({ value: 'SFR' });

  // Company becomes enabled
  await expect(companySelect).not.toBeDisabled();

  // Pick TerraPower
  await companySelect.selectOption({ label: 'TerraPower' });

  // Model becomes enabled
  await expect(modelSelect).not.toBeDisabled();

  // Pick Natrium
  await modelSelect.selectOption({ value: 'terrapower-natrium' });

  // Specs preview should appear
  const specs = page.getByTestId('reactor-specs');
  await expect(specs).toBeVisible();
  await expect(specs).toContainText('345 MWe');
});

// ── Test: Find Sites → ranked cards with friction bars ────────────────────────

test('Find Sites (mocked) renders ranked site cards with friction bars ≤100%', async ({ page }) => {
  // Mock /api/analyze to return Wyoming fixture
  await page.route('**/api/analyze', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(WYOMING_RESULT),
    }),
  );

  await page.goto('/');
  await selectRegion(page, 'US-WY');
  await page.getByTestId('tab-find').click();

  // Select reactor: SFR → TerraPower → Natrium
  await page.getByTestId('select-technology').selectOption({ value: 'SFR' });
  await page.getByTestId('select-company').selectOption({ label: 'TerraPower' });
  await page.getByTestId('select-model').selectOption({ value: 'terrapower-natrium' });
  await page.getByTestId('select-pathway').selectOption({ value: 'coal-repower' });

  // Click Find sites
  await page.getByTestId('find-sites-btn').click();

  // Wait for results
  const results = page.getByTestId('site-results');
  await expect(results).toBeVisible({ timeout: 10000 });

  // Region summary
  await expect(page.getByTestId('region-summary')).toContainText('Wyoming');

  // Site cards rendered
  const cards = page.getByTestId('site-cards');
  await expect(cards).toBeVisible();

  // First site card
  const card1 = page.getByTestId('site-card-us-wy-kemmerer');
  await expect(card1).toBeVisible();

  // Verdict badge
  const verdict1 = page.getByTestId('verdict-badge-us-wy-kemmerer');
  await expect(verdict1).toContainText('PASS');

  // Kind badge
  const kind1 = page.getByTestId('kind-badge-us-wy-kemmerer');
  await expect(kind1).toContainText('named');

  // Friction bars present and widths ≤100%
  const frictionBars = page.getByTestId('friction-bars-us-wy-kemmerer');
  await expect(frictionBars).toBeVisible();

  // Check each friction bar: width must be ≤ 100%
  const fills = await page.locator('[data-testid^="friction-us-wy-kemmerer-"]').all();
  expect(fills.length).toBeGreaterThan(0);
  for (const fill of fills) {
    const style = await fill.getAttribute('style');
    expect(style).toBeTruthy();
    const match = style!.match(/width:\s*([\d.]+)%/);
    expect(match).toBeTruthy();
    const pct = parseFloat(match![1]);
    expect(pct).toBeGreaterThanOrEqual(0);
    expect(pct).toBeLessThanOrEqual(100);
  }

  // Matrix rows visible
  const matrix1 = page.getByTestId('matrix-us-wy-kemmerer');
  await expect(matrix1).toBeVisible();

  // Citation links on matrix rows
  const citLinks = page.locator('[data-testid^="citation-link-"]');
  await expect(citLinks.first()).toBeVisible();

  // Next studies
  await expect(page.getByTestId('next-studies')).toBeVisible();

  // Second site card also rendered
  const card2 = page.getByTestId('site-card-us-wy-dave-johnston');
  await expect(card2).toBeVisible();
});

// ── Test: clicking a site card fires onFocusSite ─────────────────────────────

test('clicking a site card fires onFocusSite with the siteId', async ({ page }) => {
  await page.route('**/api/analyze', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(WYOMING_RESULT),
    }),
  );

  await page.goto('/');
  await selectRegion(page, 'US-WY');
  await page.getByTestId('tab-find').click();

  await page.getByTestId('select-technology').selectOption({ value: 'SFR' });
  await page.getByTestId('select-company').selectOption({ label: 'TerraPower' });
  await page.getByTestId('select-model').selectOption({ value: 'terrapower-natrium' });
  await page.getByTestId('find-sites-btn').click();

  await expect(page.getByTestId('site-results')).toBeVisible({ timeout: 10000 });

  // Click the first site card
  await page.getByTestId('site-card-us-wy-kemmerer').click();

  // window.__lastFocusSite should be set
  const focusSite = await page.evaluate(
    () => (window as unknown as { __lastFocusSite?: string }).__lastFocusSite,
  );
  expect(focusSite).toBe('us-wy-kemmerer');
});

// ── Test: Australia → no viable sites ────────────────────────────────────────

test('Australia (AU-SA): shows "No viable sites" when sites[] is empty', async ({ page }) => {
  await page.route('**/api/analyze', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(AUSTRALIA_RESULT),
    }),
  );

  await page.goto('/');
  await selectRegion(page, 'AU-SA');
  await page.getByTestId('tab-find').click();

  // Pick any reactor that works (microreactor)
  await page.getByTestId('select-technology').selectOption({ value: 'microreactor' });
  await page.getByTestId('select-company').selectOption({ label: 'Westinghouse Electric' });
  await page.getByTestId('select-model').selectOption({ value: 'westinghouse-evinci' });
  await page.getByTestId('find-sites-btn').click();

  const results = page.getByTestId('site-results');
  await expect(results).toBeVisible({ timeout: 10000 });

  // "No viable sites" message must be shown
  const noSites = page.getByTestId('no-viable-sites');
  await expect(noSites).toBeVisible();
  await expect(noSites).toContainText('No viable sites');

  // No site cards
  await expect(page.getByTestId('site-cards')).not.toBeVisible();
});

// ── Test: switching reactors changes the result ───────────────────────────────

test('switching reactor after first result and re-running shows new results', async ({ page }) => {
  let callCount = 0;

  // First call → Wyoming with 2 sites; second call → Australia with 0 sites (simulates different result)
  await page.route('**/api/analyze', (route) => {
    callCount++;
    const body = callCount === 1 ? WYOMING_RESULT : AUSTRALIA_RESULT;
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(body),
    });
  });

  await page.goto('/');
  await selectRegion(page, 'US-WY');
  await page.getByTestId('tab-find').click();

  // First run
  await page.getByTestId('select-technology').selectOption({ value: 'SFR' });
  await page.getByTestId('select-company').selectOption({ label: 'TerraPower' });
  await page.getByTestId('select-model').selectOption({ value: 'terrapower-natrium' });
  await page.getByTestId('find-sites-btn').click();
  await expect(page.getByTestId('site-results')).toBeVisible({ timeout: 10000 });
  await expect(page.getByTestId('site-card-us-wy-kemmerer')).toBeVisible();

  // Switch to microreactor
  await page.getByTestId('select-technology').selectOption({ value: 'microreactor' });
  await page.getByTestId('select-company').selectOption({ label: 'Westinghouse Electric' });
  await page.getByTestId('select-model').selectOption({ value: 'westinghouse-evinci' });
  await page.getByTestId('find-sites-btn').click();

  // Second result: no viable sites
  await expect(page.getByTestId('no-viable-sites')).toBeVisible({ timeout: 10000 });
  expect(callCount).toBe(2);
});
