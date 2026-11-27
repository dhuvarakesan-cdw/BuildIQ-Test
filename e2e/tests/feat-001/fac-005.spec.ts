import { expect, test } from '@playwright/test';

import {
  editTask,
  expectTaskDetails,
  fillTaskForm,
  loadTaskManagementSeed,
  seedScenarioTasks,
  taskCard,
  taskScenario,
} from '../../support/taskManagementSeed';

test('Save and cancel task edits', { tag: ['@FEAT-001', '@FAC-005'] }, async ({ page }) => {
  const seed = loadTaskManagementSeed();
  const savedUpdate = seed.editExamples.savedUpdate;
  const canceledUpdate = seed.editExamples.canceledUpdate;
  let taskToSave = '';
  let taskToCancel = '';
  let taskToCancelDescription = '';

  await test.step('Given the task list management seed data is available', async () => {
    const scenario = taskScenario('FAC-005');
    const [firstTask, secondTask] = await seedScenarioTasks(page, 'FAC-005');

    taskToSave = firstTask.title;
    taskToCancel = secondTask.title;
    taskToCancelDescription = secondTask.description;
    expect(scenario.name).toBe('Save and cancel task edits');
  });

  await test.step('When a visitor edits the title, description, due date, priority, and completion status of a task and saves', async () => {
    await editTask(page, taskToSave);
    await fillTaskForm(page, savedUpdate);
    await page.getByRole('button', { name: 'Save changes' }).click();
  });

  await test.step('Then the saved task shows the updated values', async () => {
    await expectTaskDetails(page, savedUpdate);
  });

  await test.step('When the visitor edits another task and cancels before saving', async () => {
    await editTask(page, taskToCancel);
    await fillTaskForm(page, canceledUpdate);
    await page.getByRole('button', { name: 'Cancel edit' }).click();
  });

  await test.step('Then none of the canceled values are saved', async () => {
    await expect(taskCard(page, taskToCancel)).toBeVisible();
    await expect(taskCard(page, taskToCancel).getByText(taskToCancelDescription)).toBeVisible();
    await expect(page.getByText(canceledUpdate.title)).toHaveCount(0);
    await expect(page.getByText(canceledUpdate.description)).toHaveCount(0);
  });
});
