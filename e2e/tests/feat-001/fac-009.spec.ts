import { expect, test } from '@playwright/test';

import {
  seedScenarioTasks,
  taskCard,
  taskScenario,
} from '../../support/taskManagementSeed';

test('Complete task workflows using only the keyboard', { tag: ['@FEAT-001', '@FAC-009'] }, async ({ page }) => {
  const keyboardTitle = 'Keyboard created task';
  const keyboardDescription = 'Created without pointer input.';
  let firstSeedTask = '';
  let secondSeedTask = '';
  let thirdSeedTask = '';

  await test.step('Given the task list management seed data is available', async () => {
    const scenario = taskScenario('FAC-009');
    const [firstTask, secondTask, thirdTask] = await seedScenarioTasks(page, 'FAC-009');

    firstSeedTask = firstTask.title;
    secondSeedTask = secondTask.title;
    thirdSeedTask = thirdTask.title;
    expect(scenario.name).toBe('Complete task workflows using only the keyboard');
  });

  await test.step('When a keyboard-only visitor creates, edits, completes, filters, and starts deleting tasks', async () => {
    await page.getByLabel('Title').focus();
    await page.keyboard.insertText(keyboardTitle);
    await page.getByLabel('Description').focus();
    await page.keyboard.insertText(keyboardDescription);
    await page.getByLabel('Priority').focus();
    await page.keyboard.press('ArrowDown');
    await page.getByLabel('Completed').focus();
    await page.keyboard.press('Space');
    await page.getByRole('button', { name: 'Save task' }).focus();
    await page.keyboard.press('Enter');
    await expect(taskCard(page, keyboardTitle)).toBeVisible();

    await taskCard(page, firstSeedTask).getByRole('button', { name: 'Edit task' }).focus();
    await page.keyboard.press('Enter');
    await page.getByLabel('Title').focus();
    await page.keyboard.press(process.platform === 'darwin' ? 'Meta+A' : 'Control+A');
    await page.keyboard.insertText('Keyboard edited task');
    await page.getByRole('button', { name: 'Save changes' }).focus();
    await page.keyboard.press('Enter');
    await expect(taskCard(page, 'Keyboard edited task')).toBeVisible();

    await taskCard(page, thirdSeedTask).getByRole('button', { name: 'Mark complete' }).focus();
    await page.keyboard.press('Enter');
    await expect(taskCard(page, thirdSeedTask).getByText('Completed', { exact: true })).toBeVisible();

    await page.getByRole('button', { name: /^Active\b/ }).focus();
    await page.keyboard.press('Enter');
    await expect(taskCard(page, secondSeedTask)).toHaveCount(0);

    await page.getByLabel('Title').focus();
    await page.keyboard.press(process.platform === 'darwin' ? 'Meta+A' : 'Control+A');
    await page.keyboard.press('Backspace');
    await page.getByRole('button', { name: 'Save task' }).focus();
    await page.keyboard.press('Enter');

    await page.getByRole('button', { name: /^Completed\b/ }).focus();
    await page.keyboard.press('Enter');
    await taskCard(page, secondSeedTask).getByRole('button', { name: 'Delete task' }).focus();
    await page.keyboard.press('Enter');
  });

  await test.step('Then the task form fields have accessible labels', async () => {
    await expect(page.getByLabel('Title')).toBeVisible();
    await expect(page.getByLabel('Description')).toBeVisible();
    await expect(page.getByLabel('Due date')).toBeVisible();
    await expect(page.getByLabel('Priority')).toBeVisible();
    await expect(page.getByLabel('Completed')).toBeVisible();
  });

  await test.step('And validation messages are visible when invalid data is submitted', async () => {
    await expect(page.getByRole('alert')).toHaveText('Title is required.');
  });

  await test.step('And empty-state messages are visible when no tasks match a filter', async () => {
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: /^Active\b/ }).focus();
    await page.keyboard.press('Enter');
    await taskCard(page, 'Keyboard edited task').getByRole('button', { name: 'Mark complete' }).focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('status').filter({ hasText: 'No active tasks match this filter.' })).toBeVisible();
  });

  await test.step('And the deletion prompt keeps focus within the prompt until it is resolved', async () => {
    await page.getByRole('button', { name: /^Completed\b/ }).focus();
    await page.keyboard.press('Enter');
    await taskCard(page, secondSeedTask).getByRole('button', { name: 'Delete task' }).focus();
    await page.keyboard.press('Enter');
    const dialog = page.getByRole('dialog');

    await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(dialog.getByRole('button', { name: 'Delete task' })).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
  });
});
