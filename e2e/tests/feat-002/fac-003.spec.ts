import { expect, test } from '@playwright/test';
import { Page } from '@playwright/test';

import {
  expectLocalStorageTasks,
  expectTaskUnavailable,
  localTaskById,
  openAppWithLocalTasks,
} from '../../support/localPersistenceSeed';
import { expectTaskDetails } from '../../support/taskManagementSeed';

test('Tasks do not appear in a different browser profile', { tag: ['@FEAT-002', '@FAC-003'] }, async ({ page }) => {
  const originalTasks = [
    localTaskById('task-local-budget-review'),
    localTaskById('task-local-library-return'),
  ];
  const differentProfileTask = localTaskById('task-isolated-profile-welcome');
  let differentPage: Page;

  await test.step('Given the local task persistence seed data is saved in the original browser profile', async () => {
    await openAppWithLocalTasks(page, 'context-original-profile');

    for (const task of originalTasks) {
      await expectTaskDetails(page, task);
    }
  });

  await test.step('When a visitor opens the application in a different browser profile', async () => {
    const browser = page.context().browser();

    expect(browser).not.toBeNull();
    const differentContext = await browser!.newContext();
    differentPage = await differentContext.newPage();

    await openAppWithLocalTasks(differentPage, 'context-different-profile');
  });

  await test.step('Then the original profile tasks are not available in that profile', async () => {
    for (const task of originalTasks) {
      await expectTaskUnavailable(differentPage, task.title);
    }
  });

  await test.step('And the different profile starts with its own separate local task list', async () => {
    await expectTaskDetails(differentPage, differentProfileTask);
    await expectLocalStorageTasks(differentPage, [differentProfileTask]);
  });
});
