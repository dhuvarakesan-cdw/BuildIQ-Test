import { expect, test } from '@playwright/test';

import {
  chooseFilter,
  seedScenarioTasks,
  taskCard,
  taskScenario,
} from '../../support/taskManagementSeed';

test('Filter all, active, completed, and empty task lists', { tag: ['@FEAT-001', '@FAC-004'] }, async ({ page }) => {
  let activeTitles: string[] = [];
  let completedTitles: string[] = [];

  await test.step('Given the task list management seed data is available', async () => {
    const scenario = taskScenario('FAC-004');
    const tasks = await seedScenarioTasks(page, 'FAC-004');

    activeTitles = tasks.filter((task) => !task.completed).map((task) => task.title);
    completedTitles = tasks.filter((task) => task.completed).map((task) => task.title);
    expect(scenario.name).toBe('Filter all, active, completed, and empty task lists');
  });

  await test.step('When a visitor chooses the all tasks filter', async () => {
    await chooseFilter(page, 'All');
  });

  await test.step('Then active and completed tasks are shown together', async () => {
    for (const title of [...activeTitles, ...completedTitles]) {
      await expect(taskCard(page, title)).toBeVisible();
    }
  });

  await test.step('When the visitor chooses the active tasks filter', async () => {
    await chooseFilter(page, 'Active');
  });

  await test.step('Then only active tasks are shown', async () => {
    for (const title of activeTitles) {
      await expect(taskCard(page, title)).toBeVisible();
    }

    for (const title of completedTitles) {
      await expect(taskCard(page, title)).toHaveCount(0);
    }
  });

  await test.step('When the visitor chooses the completed tasks filter', async () => {
    await chooseFilter(page, 'Completed');
  });

  await test.step('Then only completed tasks are shown', async () => {
    for (const title of completedTitles) {
      await expect(taskCard(page, title)).toBeVisible();
    }

    for (const title of activeTitles) {
      await expect(taskCard(page, title)).toHaveCount(0);
    }
  });

  await test.step('When the selected filter has no matching tasks', async () => {
    await chooseFilter(page, 'Active');

    for (const title of activeTitles) {
      await taskCard(page, title).getByRole('button', { name: 'Mark complete' }).click();
    }
  });

  await test.step('Then a visible empty-state message is shown', async () => {
    await expect(page.getByRole('status').filter({ hasText: 'No active tasks match this filter.' })).toBeVisible();
  });
});
