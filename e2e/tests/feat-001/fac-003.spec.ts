import { expect, test } from '@playwright/test';

import {
  createTaskFromForm,
  loadTaskManagementSeed,
  seedScenarioTasks,
  taskCard,
  taskScenario,
} from '../../support/taskManagementSeed';

test('Create a task without a due date', { tag: ['@FEAT-001', '@FAC-003'] }, async ({ page }) => {
  const seed = loadTaskManagementSeed();
  const taskWithoutDueDate = seed.createExamples.noDueDateTask;

  await test.step('Given the task list management seed data is available', async () => {
    const scenario = taskScenario('FAC-003');

    expect(scenario.name).toBe('Create a task without a due date');
    await seedScenarioTasks(page, 'FAC-003');
  });

  await test.step('When a visitor creates a task with a non-empty title and leaves the due date blank', async () => {
    await createTaskFromForm(page, taskWithoutDueDate);
  });

  await test.step('Then the task is saved into the list', async () => {
    await expect(taskCard(page, taskWithoutDueDate.title)).toBeVisible();
  });

  await test.step('And the saved task clearly shows that no due date is set', async () => {
    await expect(taskCard(page, taskWithoutDueDate.title).getByText('No due date')).toBeVisible();
  });
});
