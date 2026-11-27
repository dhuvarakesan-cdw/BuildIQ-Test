import { expect, test } from '@playwright/test';

import {
  APP_URL,
  addReferenceDate,
  expectLocalStorageTasks,
  expectTaskUnavailable,
  localTaskById,
  openAppWithLocalTasks,
} from '../../support/localPersistenceSeed';
import { expectTaskDetails } from '../../support/taskManagementSeed';

test('Task data is stored only for the current browser profile', { tag: ['@FEAT-002', '@FAC-005'] }, async ({ page }) => {
  const currentProfileTasks = [
    localTaskById('task-local-budget-review'),
    localTaskById('task-local-library-return'),
    localTaskById('task-local-archive-receipts'),
  ];
  let isolatedPage = page;

  await test.step('Given the local task persistence seed data is available for the current browser profile', async () => {
    await openAppWithLocalTasks(page, 'context-current-profile');

    for (const task of currentProfileTasks) {
      await expectTaskDetails(page, task);
    }
  });

  await test.step('When a visitor refreshes the current browser profile and opens an isolated browser profile', async () => {
    await page.reload();

    const browser = page.context().browser();

    expect(browser).not.toBeNull();
    const isolatedContext = await browser!.newContext();
    isolatedPage = await isolatedContext.newPage();
    await addReferenceDate(isolatedPage);
    await isolatedPage.goto(APP_URL);
  });

  await test.step('Then the current browser profile keeps its local tasks', async () => {
    for (const task of currentProfileTasks) {
      await expectTaskDetails(page, task);
    }

    await expectLocalStorageTasks(page, currentProfileTasks);
  });

  await test.step('And the isolated browser profile does not receive those tasks', async () => {
    for (const task of currentProfileTasks) {
      await expectTaskUnavailable(isolatedPage, task.title);
    }

    await expect(isolatedPage.getByText('No tasks saved yet.')).toBeVisible();
  });

  await test.step('And each profile uses only its own browser storage', async () => {
    await expectLocalStorageTasks(page, currentProfileTasks);
    await expectLocalStorageTasks(isolatedPage, []);
  });
});
