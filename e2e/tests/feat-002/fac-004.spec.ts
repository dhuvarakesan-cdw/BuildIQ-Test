import { expect, test } from '@playwright/test';

import {
  createLocalTask,
  deleteTaskWithConfirmation,
  loadLocalPersistenceSeed,
  localTaskById,
  openAppWithLocalTasks,
  updateTaskFromForm,
} from '../../support/localPersistenceSeed';
import { chooseFilter, expectTaskDetails, taskCard } from '../../support/taskManagementSeed';

test('Task workflows do not send task data to a backend API', { tag: ['@FEAT-002', '@FAC-004'] }, async ({ page }) => {
  const seed = loadLocalPersistenceSeed();
  const createdTask = seed.createExamples.refreshCreatedTask;
  const viewedTask = localTaskById('task-local-budget-review');
  const editedTask = seed.editExamples.refreshEditedTask;
  const deletedTask = localTaskById('task-local-library-return');
  const completedTask = localTaskById('task-local-archive-receipts');
  const taskDataRequests: string[] = [];

  await test.step('Given network monitoring is active for task data requests', async () => {
    const forbiddenValues = [
      ...seed.tasks.flatMap((task) => [
        task.title,
        task.description,
        task.dueDate,
        task.priority,
        String(task.completed),
      ]),
      ...Object.values(seed.createExamples).flatMap((task) => [
        task.title,
        task.description,
        task.dueDate,
        task.priority,
        String(task.completed),
      ]),
      ...Object.values(seed.editExamples).flatMap((task) => [
        task.title,
        task.description,
        task.dueDate,
        task.priority,
        String(task.completed),
      ]),
    ].filter(Boolean);

    page.on('request', (request) => {
      const url = new URL(request.url());
      const postData = request.postData() ?? '';
      const isBackendTaskEndpoint = seed.networkMonitoring.blockedApiPatterns.some(
        (pattern) => url.pathname === pattern || url.pathname.startsWith(`${pattern}/`),
      );
      const sendsTaskData = forbiddenValues.some(
        (value) => postData.includes(value),
      );

      if (isBackendTaskEndpoint || sendsTaskData) {
        taskDataRequests.push(`${request.method()} ${request.url()} ${postData}`);
      }
    });
  });

  await test.step('And the local task persistence seed data is available for the current browser profile', async () => {
    await openAppWithLocalTasks(page, 'context-current-profile');
  });

  await test.step('When a visitor creates, views, edits, deletes, completes, and filters local tasks', async () => {
    await createLocalTask(page, createdTask);
    await expectTaskDetails(page, viewedTask);
    await updateTaskFromForm(page, viewedTask.title, editedTask);
    await deleteTaskWithConfirmation(page, deletedTask.title);
    await taskCard(page, completedTask.title).getByRole('button', { name: 'Mark active' }).click();
    await expect(taskCard(page, completedTask.title).getByText('Active', { exact: true })).toBeVisible();
    await chooseFilter(page, 'Active');
    await expect(page.getByRole('status').filter({ hasText: 'Showing active tasks.' })).toBeVisible();
    await chooseFilter(page, 'Completed');
    await expect(page.getByRole('status').filter({ hasText: 'Showing completed tasks.' })).toBeVisible();
    await chooseFilter(page, 'All');
  });

  await test.step('Then no backend API receives task titles, descriptions, due dates, priorities, or completion states', async () => {
    expect(taskDataRequests).toEqual([]);
  });

  await test.step('And the task list remains usable from browser storage only', async () => {
    await page.reload();
    await expectTaskDetails(page, createdTask);
    await expectTaskDetails(page, editedTask);
    await expectTaskDetails(page, { ...completedTask, completed: false });
  });
});
