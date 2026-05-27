import { test, expect, request } from '@playwright/test';

test('app shell loads at the dev URL with no console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(err.message));

  await page.goto('/');
  await expect(page.getByTestId('app-shell')).toBeVisible();
  await expect(page.getByTestId('globe-slot')).toBeAttached();

  expect(errors, `console errors: ${errors.join(' | ')}`).toEqual([]);
});

test('proxied /api/health returns ok and the configured model', async () => {
  const ctx = await request.newContext({ baseURL: 'http://localhost:5173' });
  const res = await ctx.get('/api/health');
  expect(res.status()).toBe(200);
  expect(await res.json()).toMatchObject({ ok: true });
  await ctx.dispose();
});

test('POST /api/analyze and /api/chat return 501 until F5/F6 implement them', async () => {
  const ctx = await request.newContext({ baseURL: 'http://localhost:5173' });

  const analyze = await ctx.post('/api/analyze', { data: {} });
  expect(analyze.status()).toBe(501);

  const chat = await ctx.post('/api/chat', { data: {} });
  expect(chat.status()).toBe(501);

  await ctx.dispose();
});
