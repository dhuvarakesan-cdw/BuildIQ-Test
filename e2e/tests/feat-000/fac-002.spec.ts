import { expect, test } from '@playwright/test';
import { existsSync, readFileSync } from 'node:fs';

import { loadFoundationSeed, scenarioSeed, workspacePath } from '../../support/foundationSeed';

test('Browser-only foundation avoids remote application services', { tag: ['@FEAT-000', '@FAC-002'] }, async ({ page }) => {
  const remoteRequests: string[] = [];

  await test.step('Given the application foundation seed data is available', async () => {
    const seed = loadFoundationSeed();
    const scenario = scenarioSeed('FAC-002');

    expect(seed.serviceBoundaries.map((boundary) => boundary.status)).toEqual([
      'absent',
      'absent',
      'absent',
      'absent',
    ]);
    expect(scenario.recordIds).toEqual(
      expect.arrayContaining(seed.appShell.serviceBoundaryIds),
    );
  });

  await test.step('When a visitor uses the foundation shell', async () => {
    page.on('request', (request) => {
      const url = new URL(request.url());

      if (!['127.0.0.1', 'localhost'].includes(url.hostname)) {
        remoteRequests.push(request.url());
      }
    });

    await page.goto('/');
    await page.getByRole('button', { name: /^Tasks/ }).click();
    await page.getByLabel('Persona').selectOption('student');
    await page.getByRole('button', { name: 'Calm theme' }).click();
  });

  await test.step('Then no backend service, authentication, user account, analytics, or telemetry flow is required', async () => {
    await expect(page.getByRole('heading', { name: 'Daily Tasks' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Calm theme' })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('heading', { name: 'Tasks', level: 2 })).toBeVisible();
    await expect(page.getByText('without adding accounts or a backend service')).toBeVisible();
    expect(remoteRequests).toEqual([]);

    const frontendPackage = JSON.parse(
      readFileSync(workspacePath('frontend/package.json'), 'utf-8'),
    ) as { dependencies?: Record<string, string>; devDependencies?: Record<string, string> };
    const dependencyNames = Object.keys({
      ...frontendPackage.dependencies,
      ...frontendPackage.devDependencies,
    });

    expect(dependencyNames).not.toEqual(
      expect.arrayContaining([
        'express',
        'fastify',
        'koa',
        'passport',
        'auth0-js',
        '@auth0/auth0-react',
        'firebase',
        '@supabase/supabase-js',
        'analytics',
        'posthog-js',
        '@sentry/react',
      ]),
    );
    expect(existsSync(workspacePath('backend'))).toBe(false);
  });

  await test.step('And the experience remains a local browser-only application', async () => {
    await expect(page.getByRole('status')).toHaveText(/Local storage connection ready/);
    await expect(page.getByText('Saved task data will stay on this device through browser storage.')).toBeVisible();
    await expect(page.getByText('Clearing site data will remove the saved task list.')).toBeVisible();
  });
});
