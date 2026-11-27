import { expect, test } from '@playwright/test';

import {
  chooseFilter,
  seedScenarioTasks,
  taskCard,
  taskScenario,
} from '../../support/taskManagementSeed';

test('Toggle tasks between active and completed filters', { tag: ['@FEAT-001', '@FAC-007'] }, async ({ page }) => {
  let activeTaskTitle = '';
  let completedTaskTitle = '';

  await test.step('Given the task list management seed data is available', async () => {
    const scenario = taskScenario('FAC-007');
    const [activeTask, completedTask] = await seedScenarioTasks(page, 'FAC-007');

    activeTaskTitle = activeTask.title;
    completedTaskTitle = completedTask.title;
    expect(scenario.name).toBe('Toggle tasks between active and completed filters');
  });

  await test.step('When a visitor marks an active task complete', async () => {
    await taskCard(page, activeTaskTitle).getByRole('button', { name: 'Mark complete' }).click();
  });

  await test.step('Then the task is shown under the completed filter', async () => {
    await chooseFilter(page, 'Completed');
    await expect(taskCard(page, activeTaskTitle)).toBeVisible();
  });

  await test.step('And the task is no longer shown under the active filter', async () => {
    await chooseFilter(page, 'Active');
    await expect(taskCard(page, activeTaskTitle)).toHaveCount(0);
  });

  await test.step('When the visitor marks a completed task active', async () => {
    await chooseFilter(page, 'Completed');
    await taskCard(page, completedTaskTitle).getByRole('button', { name: 'Mark active' }).click();
  });

  await test.step('Then the task is shown under the active filter', async () => {
    await chooseFilter(page, 'Active');
    await expect(taskCard(page, completedTaskTitle)).toBeVisible();
  });

  await test.step('And the task is no longer shown under the completed filter', async () => {
    await chooseFilter(page, 'Completed');
    await expect(taskCard(page, completedTaskTitle)).toHaveCount(0);
  });
});
