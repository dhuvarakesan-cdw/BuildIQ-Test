import { expect, test } from '@playwright/test';

import { loadFoundationSeed, scenarioSeed } from '../../support/foundationSeed';

test('Responsive accessible shell supports keyboard and viewport use', { tag: ['@FEAT-000', '@FAC-004'] }, async ({ page }) => {
  await test.step('Given the application foundation seed data is available', async () => {
    const seed = loadFoundationSeed();
    const scenario = scenarioSeed('FAC-004');

    expect(seed.viewports.map((viewport) => viewport.id)).toEqual([
      'viewport-desktop',
      'viewport-mobile',
    ]);
    expect(scenario.recordIds).toEqual(
      expect.arrayContaining(['persona-keyboard-user', 'viewport-desktop', 'viewport-mobile']),
    );
  });

  await test.step('When a visitor navigates the shell on desktop and mobile viewports', async () => {
    const seed = loadFoundationSeed();
    const desktop = seed.viewports.find((viewport) => viewport.id === 'viewport-desktop');
    const mobile = seed.viewports.find((viewport) => viewport.id === 'viewport-mobile');

    expect(desktop).toBeDefined();
    expect(mobile).toBeDefined();

    await page.setViewportSize({ width: desktop!.width, height: desktop!.height });
    await page.goto('/');
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('main')).toBeFocused();

    await page.setViewportSize({ width: mobile!.width, height: mobile!.height });
    await expect(page.getByRole('heading', { name: 'Daily Tasks' })).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Primary' })).toBeVisible();
    await expect(page.getByRole('main')).toBeVisible();
  });

  await test.step('Then the skip link, topbar, and main landmark are available to keyboard users', async () => {
    await expect(page.getByRole('link', { name: 'Skip to main content' })).toHaveAttribute('href', '#main-content');
    await expect(page.getByRole('banner', { name: 'Application header' })).toBeVisible();
    await expect(page.getByRole('main')).toHaveAttribute('id', 'main-content');
  });

  await test.step('And the responsive layout remains usable without horizontal scrolling', async () => {
    for (const viewport of loadFoundationSeed().viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });

      const metrics = await page.evaluate(() => ({
        bodyScrollWidth: document.body.scrollWidth,
        documentScrollWidth: document.documentElement.scrollWidth,
        viewportWidth: window.innerWidth,
      }));

      expect(metrics.bodyScrollWidth).toBeLessThanOrEqual(metrics.viewportWidth);
      expect(metrics.documentScrollWidth).toBeLessThanOrEqual(metrics.viewportWidth);
    }
  });
});
