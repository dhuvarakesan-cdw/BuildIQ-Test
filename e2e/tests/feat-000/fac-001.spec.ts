import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';

import { loadFoundationSeed, scenarioSeed, workspacePath } from '../../support/foundationSeed';

test('Static React application opens from the root route', { tag: ['@FEAT-000', '@FAC-001'] }, async ({ page }) => {
  let rootPath = '/';

  await test.step('Given the application foundation seed data is available', async () => {
    const seed = loadFoundationSeed();
    const scenario = scenarioSeed('FAC-001');

    rootPath = seed.rootRoute.path;
    expect(seed.appShell.runtime).toBe('Vite React TypeScript');
    expect(scenario.recordIds).toEqual(
      expect.arrayContaining([
        seed.appShell.id,
        seed.rootRoute.id,
        'persona-local-visitor',
      ]),
    );
  });

  await test.step('When a visitor opens the root application route', async () => {
    await page.goto(rootPath);
  });

  await test.step('Then the static Vite React application shell is shown', async () => {
    await expect(page).toHaveTitle('Personal Task Manager');
    await expect(page.getByRole('heading', { name: 'Daily Tasks', level: 1 })).toBeVisible();
    await expect(page.getByRole('banner', { name: 'Application header' })).toBeVisible();
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Today', level: 2 })).toBeVisible();
    await expect(page.getByText('Local storage connection ready')).toBeVisible();
  });

  await test.step('And the shell is mounted through the TypeScript application entry point', async () => {
    const indexHtml = readFileSync(workspacePath('frontend/index.html'), 'utf-8');
    const mainSource = readFileSync(workspacePath('frontend/src/main.tsx'), 'utf-8');

    expect(indexHtml).toContain('<div id="root"></div>');
    expect(indexHtml).toContain('/src/main.tsx');
    expect(mainSource).toContain("import App from './App'");
    expect(mainSource).toContain("document.getElementById('root')");
    expect(mainSource).toContain('createRoot(rootElement).render');
  });
});
