import { expect, test } from '@playwright/test';
import { existsSync, statSync } from 'node:fs';

import { loadFoundationSeed, scenarioSeed, workspacePath } from '../../support/foundationSeed';

test('Source boundary areas are ready for future feature work', { tag: ['@FEAT-000', '@FAC-003'] }, async () => {
  await test.step('Given the application foundation seed data is available', async () => {
    const seed = loadFoundationSeed();
    const scenario = scenarioSeed('FAC-003');

    expect(scenario.recordIds).toEqual(
      expect.arrayContaining(seed.appShell.shellAreaIds),
    );
  });

  await test.step('When the foundation source structure is reviewed', async () => {
    for (const area of loadFoundationSeed().sourceAreas) {
      const areaPath = workspacePath(area.path);

      expect(existsSync(areaPath), `${area.name} directory exists`).toBe(true);
      expect(statSync(areaPath).isDirectory(), `${area.name} is a directory`).toBe(true);
    }
  });

  await test.step('Then the shell has dedicated areas for components, hooks, domain utilities, and storage adapters', async () => {
    const areaNames = loadFoundationSeed().sourceAreas.map((area) => area.name);

    expect(areaNames).toEqual([
      'Components',
      'Hooks',
      'Domain utilities',
      'Storage adapters',
    ]);
  });

  await test.step('And each area is available as a separate application concern', async () => {
    const areaPaths = loadFoundationSeed().sourceAreas.map((area) => area.path);

    expect(new Set(areaPaths).size).toBe(areaPaths.length);
    for (const areaPath of areaPaths) {
      expect(areaPath.startsWith('frontend/src/')).toBe(true);
    }
  });
});
