import { expect, test } from '@playwright/test';

import {
  loadTaskManagementSeed,
  seedScenarioTasks,
  taskCard,
  taskScenario,
} from '../../support/taskManagementSeed';

async function expectNoHorizontalScrolling(page: import('@playwright/test').Page) {
  const hasHorizontalScroll = await page.evaluate(() => {
    const scrollingElement = document.scrollingElement ?? document.documentElement;

    return scrollingElement.scrollWidth > scrollingElement.clientWidth;
  });

  expect(hasHorizontalScroll).toBe(false);
}

test('Use task management on desktop and mobile viewports', { tag: ['@FEAT-001', '@FAC-010'] }, async ({ page }) => {
  const seed = loadTaskManagementSeed();
  const desktop = seed.viewports.find((viewport) => viewport.name === 'Desktop') ?? seed.viewports[0];
  const mobile = seed.viewports.find((viewport) => viewport.name === 'Mobile') ?? seed.viewports[1];
  let firstTaskTitle = '';

  await test.step('Given the task list management seed data is available', async () => {
    const scenario = taskScenario('FAC-010');
    const [firstTask] = await seedScenarioTasks(page, 'FAC-010');

    firstTaskTitle = firstTask.title;
    expect(scenario.name).toBe('Use task management on desktop and mobile viewports');
  });

  await test.step('When a visitor uses the task form, task list, filters, and task actions on a desktop-width browser', async () => {
    await page.setViewportSize({ width: desktop.width, height: desktop.height });
    await expect(page.getByRole('heading', { name: 'Add a task' })).toBeVisible();
    await expect(page.getByRole('list', { name: 'Saved tasks' })).toBeVisible();
    await expect(page.getByRole('group', { name: 'Filter saved tasks' })).toBeVisible();
    await expect(taskCard(page, firstTaskTitle).getByRole('button', { name: 'Edit task' })).toBeVisible();
  });

  await test.step('Then the task management controls remain visible and usable without horizontal scrolling', async () => {
    await expectNoHorizontalScrolling(page);
  });

  await test.step('When the visitor uses the same controls on a mobile-width browser', async () => {
    await page.setViewportSize({ width: mobile.width, height: mobile.height });
    await expect(page.getByRole('heading', { name: 'Add a task' })).toBeVisible();
    await expect(page.getByRole('group', { name: 'Filter saved tasks' })).toBeVisible();
    await expect(taskCard(page, firstTaskTitle).getByRole('button', { name: 'Edit task' })).toBeVisible();
  });

  await test.step('Then the task management controls remain visible and usable without horizontal scrolling', async () => {
    await expectNoHorizontalScrolling(page);
  });
});
