import { expect, test } from '@playwright/test';

import {
  seedScenarioTasks,
  taskCard,
  taskScenario,
} from '../../support/taskManagementSeed';

test('Confirm or cancel task deletion', { tag: ['@FEAT-001', '@FAC-006'] }, async ({ page }) => {
  let cancelDeleteTitle = '';
  let confirmDeleteTitle = '';
  let cancelDeleteDescription = '';

  await test.step('Given the task list management seed data is available', async () => {
    const scenario = taskScenario('FAC-006');
    const [firstTask, secondTask] = await seedScenarioTasks(page, 'FAC-006');

    cancelDeleteTitle = firstTask.title;
    cancelDeleteDescription = firstTask.description;
    confirmDeleteTitle = secondTask.title;
    expect(scenario.name).toBe('Confirm or cancel task deletion');
  });

  await test.step('When a visitor chooses to delete a task', async () => {
    await taskCard(page, cancelDeleteTitle).getByRole('button', { name: 'Delete task' }).click();
  });

  await test.step('Then a confirmation prompt opens for that task', async () => {
    await expect(page.getByRole('dialog', { name: `Delete "${cancelDeleteTitle}"?` })).toBeVisible();
  });

  await test.step('And keyboard focus moves into the confirmation prompt', async () => {
    await expect(page.getByRole('dialog').getByRole('button', { name: 'Cancel' })).toBeFocused();
  });

  await test.step('When the visitor cancels the prompt', async () => {
    await page.getByRole('dialog').getByRole('button', { name: 'Cancel' }).click();
  });

  await test.step('Then the task remains in the list unchanged', async () => {
    await expect(taskCard(page, cancelDeleteTitle)).toBeVisible();
    await expect(taskCard(page, cancelDeleteTitle).getByText(cancelDeleteDescription)).toBeVisible();
  });

  await test.step('When the visitor confirms deletion for a task', async () => {
    await taskCard(page, confirmDeleteTitle).getByRole('button', { name: 'Delete task' }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Delete task' }).click();
  });

  await test.step('Then that task is removed from the list', async () => {
    await expect(taskCard(page, confirmDeleteTitle)).toHaveCount(0);
  });
});
