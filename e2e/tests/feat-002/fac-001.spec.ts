import { expect, test } from '@playwright/test';

import {
  createLocalTask,
  expectLocalStorageTasks,
  loadLocalPersistenceSeed,
  localTaskById,
  openAppWithLocalTasks,
  updateTaskFromForm,
} from '../../support/localPersistenceSeed';
import { expectTaskDetails, taskCard } from '../../support/taskManagementSeed';

test('Created tasks remain available after a page refresh', { tag: ['@FEAT-002', '@FAC-001'] }, async ({ page }) => {
  const seed = loadLocalPersistenceSeed();
  const createdTask = seed.createExamples.refreshCreatedTask;

  await test.step('Given the local task persistence seed data is available for the current browser profile', async () => {
    const scenario = seed.scenarios['FAC-001'];

    expect(scenario.name).toBe('Created and edited tasks remain available after the browser page is refreshed');
    await openAppWithLocalTasks(page, 'context-current-profile');
  });

  await test.step('When a visitor creates a new local task and refreshes the page', async () => {
    await createLocalTask(page, createdTask);
    await page.reload();
  });

  await test.step('Then the newly created task remains available in the current task list', async () => {
    await expect(taskCard(page, createdTask.title)).toBeVisible();
  });

  await test.step('And the task details remain unchanged after the refresh', async () => {
    await expectTaskDetails(page, createdTask);
    await expectLocalStorageTasks(page, [
      ...seed.storageContexts
        .find((context) => context.id === 'context-current-profile')!
        .taskIds.map(localTaskById),
      createdTask,
    ]);
  });
});

test('Edited tasks remain available after a page refresh', { tag: ['@FEAT-002', '@FAC-001'] }, async ({ page }) => {
  const seed = loadLocalPersistenceSeed();
  const originalTask = localTaskById(seed.editExamples.refreshEditedTask.id);
  const editedTask = seed.editExamples.refreshEditedTask;

  await test.step('Given the local task persistence seed data is available for the current browser profile', async () => {
    const scenario = seed.scenarios['FAC-001'];

    expect(scenario.name).toBe('Created and edited tasks remain available after the browser page is refreshed');
    await openAppWithLocalTasks(page, 'context-current-profile');
  });

  await test.step('When a visitor edits an existing local task and refreshes the page', async () => {
    await updateTaskFromForm(page, originalTask.title, editedTask);
    await page.reload();
  });

  await test.step('Then the edited task remains available in the current task list', async () => {
    await expect(taskCard(page, editedTask.title)).toBeVisible();
  });

  await test.step('And the saved edits remain unchanged after the refresh', async () => {
    await expectTaskDetails(page, editedTask);
    await expect(page.getByRole('heading', { name: originalTask.title, exact: true })).toHaveCount(0);
  });
});
