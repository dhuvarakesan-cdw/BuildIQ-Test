import { expect, test } from '@playwright/test';

import {
  deleteTaskWithConfirmation,
  expectLocalStorageTasks,
  expectTaskUnavailable,
  localTaskById,
  openAppWithLocalTasks,
} from '../../support/localPersistenceSeed';
import { expectTaskDetails } from '../../support/taskManagementSeed';

test('Confirmed deleted tasks stay removed after a page refresh', { tag: ['@FEAT-002', '@FAC-002'] }, async ({ page }) => {
  const deletedTask = localTaskById('task-local-library-return');
  const remainingTasks = [
    localTaskById('task-local-budget-review'),
    localTaskById('task-local-archive-receipts'),
  ];

  await test.step('Given the local task persistence seed data is available for the current browser profile', async () => {
    await openAppWithLocalTasks(page, 'context-current-profile');
    await expect(page.getByRole('heading', { name: deletedTask.title, exact: true })).toBeVisible();
  });

  await test.step('When a visitor confirms deletion of an existing local task and refreshes the page', async () => {
    await deleteTaskWithConfirmation(page, deletedTask.title);
    await page.reload();
  });

  await test.step('Then the deleted task does not reappear in the current task list', async () => {
    await expectTaskUnavailable(page, deletedTask.title);
  });

  await test.step('And the remaining local tasks are still available', async () => {
    for (const task of remainingTasks) {
      await expectTaskDetails(page, task);
    }

    await expectLocalStorageTasks(page, remainingTasks);
  });
});
