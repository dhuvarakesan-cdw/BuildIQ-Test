import { expect, test } from '@playwright/test';

import {
  createTaskFromForm,
  editTask,
  expectTaskDetails,
  loadTaskManagementSeed,
  seedScenarioTasks,
  taskScenario,
} from '../../support/taskManagementSeed';

test('Create a task with every supported detail', { tag: ['@FEAT-001', '@FAC-001'] }, async ({ page }) => {
  const seed = loadTaskManagementSeed();
  const createdTask = seed.createExamples.fullDetailTask;

  await test.step('Given the task list management seed data is available', async () => {
    const scenario = taskScenario('FAC-001');

    expect(scenario.name).toBe('Create a task with every supported detail');
    await seedScenarioTasks(page, 'FAC-001');
  });

  await test.step('When a visitor creates a task with a non-empty title, description, due date, priority, and completion status', async () => {
    await createTaskFromForm(page, createdTask);
  });

  await test.step('Then the task is saved into the list', async () => {
    await expect(page.getByRole('heading', { name: createdTask.title, exact: true })).toBeVisible();
  });

  await test.step('And the saved task shows its title, description, due date, priority, and status', async () => {
    await expectTaskDetails(page, createdTask);
  });

  await test.step('And those details remain available when the visitor opens the task for editing', async () => {
    await editTask(page, createdTask.title);
    await expect(page.getByRole('heading', { name: 'Update task details' })).toBeVisible();
    await expect(page.getByLabel('Title')).toHaveValue(createdTask.title);
    await expect(page.getByLabel('Description')).toHaveValue(createdTask.description);
    await expect(page.getByLabel('Due date')).toHaveValue(createdTask.dueDate);
    await expect(page.getByLabel('Priority')).toHaveValue(createdTask.priority);
    await expect(page.getByLabel('Completed')).toBeChecked();
  });
});
