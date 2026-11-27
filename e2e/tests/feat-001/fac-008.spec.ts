import { expect, test } from '@playwright/test';

import {
  seedScenarioTasks,
  taskCard,
  taskScenario,
} from '../../support/taskManagementSeed';

test('Distinguish active overdue tasks from non-overdue tasks', { tag: ['@FEAT-001', '@FAC-008'] }, async ({ page }) => {
  let activeOverdueTitle = '';
  let completedPastDueTitle = '';
  let noDueDateTitle = '';

  await test.step('Given the task list management seed data is available', async () => {
    const scenario = taskScenario('FAC-008');
    const [activeOverdue, completedPastDue, noDueDate] = await seedScenarioTasks(page, 'FAC-008');

    activeOverdueTitle = activeOverdue.title;
    completedPastDueTitle = completedPastDue.title;
    noDueDateTitle = noDueDate.title;
    expect(scenario.name).toBe('Distinguish active overdue tasks from non-overdue tasks');
  });

  await test.step('When a visitor reviews tasks with the reference date applied', async () => {
    await expect(page.getByRole('list', { name: 'Saved tasks' })).toBeVisible();
  });

  await test.step('Then an active task with a past due date is visually marked overdue', async () => {
    await expect(taskCard(page, activeOverdueTitle)).toHaveAttribute('data-overdue', 'true');
    await expect(taskCard(page, activeOverdueTitle).getByText('Overdue', { exact: true })).toBeVisible();
    await expect(taskCard(page, activeOverdueTitle).getByText('Active overdue', { exact: true })).toBeVisible();
  });

  await test.step('And a completed task with a past due date is not treated as active overdue', async () => {
    await expect(taskCard(page, completedPastDueTitle)).toHaveAttribute('data-overdue', 'false');
    await expect(taskCard(page, completedPastDueTitle).getByText('Completed', { exact: true })).toBeVisible();
    await expect(taskCard(page, completedPastDueTitle).getByText('Active overdue', { exact: true })).toHaveCount(0);
  });

  await test.step('And a task without a due date is not treated as active overdue', async () => {
    await expect(taskCard(page, noDueDateTitle)).toHaveAttribute('data-overdue', 'false');
    await expect(taskCard(page, noDueDateTitle).getByText('No due date', { exact: true })).toBeVisible();
    await expect(taskCard(page, noDueDateTitle).getByText('Active overdue', { exact: true })).toHaveCount(0);
  });
});
