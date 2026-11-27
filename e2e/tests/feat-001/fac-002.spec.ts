import { expect, test } from '@playwright/test';

import {
  editTask,
  fillTaskForm,
  loadTaskManagementSeed,
  seedScenarioTasks,
  taskCard,
  taskScenario,
} from '../../support/taskManagementSeed';

test('Reject empty titles while creating and editing', { tag: ['@FEAT-001', '@FAC-002'] }, async ({ page }) => {
  const seed = loadTaskManagementSeed();
  const emptyCreate = seed.createExamples.emptyTitleTask;
  const emptyUpdate = seed.editExamples.emptyTitleUpdate;
  let originalTaskTitle = '';
  let startingTaskCount = 0;

  await test.step('Given the task list management seed data is available', async () => {
    const scenario = taskScenario('FAC-002');
    const [existingTask] = await seedScenarioTasks(page, 'FAC-002');

    originalTaskTitle = existingTask.title;
    startingTaskCount = await page.getByRole('listitem').count();
    expect(scenario.name).toBe('Reject empty titles while creating and editing');
  });

  await test.step('When a visitor submits a new task without a title', async () => {
    await fillTaskForm(page, emptyCreate);
    await page.getByRole('button', { name: 'Save task' }).click();
  });

  await test.step('Then no new task is added', async () => {
    await expect(page.getByRole('listitem')).toHaveCount(startingTaskCount);
  });

  await test.step('And a visible title validation message is shown', async () => {
    await expect(page.getByRole('alert')).toHaveText('Title is required.');
  });

  await test.step('When the visitor edits an existing task and clears the title before saving', async () => {
    await editTask(page, originalTaskTitle);
    await fillTaskForm(page, emptyUpdate);
    await page.getByRole('button', { name: 'Save changes' }).click();
  });

  await test.step('Then the existing task is not updated', async () => {
    await expect(taskCard(page, originalTaskTitle)).toBeVisible();
    await expect(taskCard(page, originalTaskTitle).getByText(emptyUpdate.description)).toHaveCount(0);
  });

  await test.step('And the visible title validation message remains shown', async () => {
    await expect(page.getByRole('alert')).toHaveText('Title is required.');
  });
});
