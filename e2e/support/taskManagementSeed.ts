import { expect, Locator, Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export type TaskPriority = 'low' | 'medium' | 'high';

export type SeedTask = {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: TaskPriority;
  completed: boolean;
  createdAt: string;
};

type ScenarioSeed = {
  name: string;
  taskIds: string[];
};

type TaskManagementSeed = {
  featureId: 'FEAT-001';
  name: string;
  referenceDate: string;
  tasks: SeedTask[];
  createExamples: Record<string, Omit<SeedTask, 'id' | 'createdAt'>>;
  editExamples: Record<string, Omit<SeedTask, 'id' | 'createdAt'>>;
  filters: string[];
  viewports: Array<{
    name: string;
    width: number;
    height: number;
  }>;
  scenarios: Record<string, ScenarioSeed>;
};

const supportDir = path.dirname(fileURLToPath(import.meta.url));
const e2eRoot = path.resolve(supportDir, '..');

export function loadTaskManagementSeed(): TaskManagementSeed {
  const seedPath = path.join(
    e2eRoot,
    'fixtures',
    'feat-001-task-list-management.seed.json',
  );

  return JSON.parse(readFileSync(seedPath, 'utf-8')) as TaskManagementSeed;
}

export function taskScenario(facId: string): ScenarioSeed {
  const scenario = loadTaskManagementSeed().scenarios[facId];

  if (!scenario) {
    throw new Error(`Missing task management seed scenario for ${facId}`);
  }

  return scenario;
}

export function scenarioTasks(facId: string): SeedTask[] {
  const seed = loadTaskManagementSeed();
  const scenario = taskScenario(facId);

  return scenario.taskIds.map((taskId) => {
    const task = seed.tasks.find((candidate) => candidate.id === taskId);

    if (!task) {
      throw new Error(`Missing task fixture ${taskId} for ${facId}`);
    }

    return task;
  });
}

export async function openAppAtReferenceDate(page: Page): Promise<void> {
  const { referenceDate } = loadTaskManagementSeed();

  await page.addInitScript((dateOnly) => {
    const fixedNow = new globalThis.Date(`${dateOnly}T12:00:00.000Z`).valueOf();
    const NativeDate = globalThis.Date;

    class FixedDate extends NativeDate {
      constructor(...args: ConstructorParameters<DateConstructor>) {
        if (args.length === 0) {
          super(fixedNow);
          return;
        }

        super(...args);
      }

      static now() {
        return fixedNow;
      }
    }

    globalThis.Date = FixedDate as DateConstructor;
  }, referenceDate);

  await page.goto('/');
}

export function taskCard(page: Page, title: string): Locator {
  return page.getByRole('listitem').filter({
    has: page.getByRole('heading', { name: title, exact: true }),
  });
}

export async function fillTaskForm(
  page: Page,
  task: Omit<SeedTask, 'id' | 'createdAt'>,
): Promise<void> {
  await page.getByLabel('Title').fill(task.title);
  await page.getByLabel('Description').fill(task.description);
  await page.getByLabel('Due date').fill(task.dueDate);
  await page.getByLabel('Priority').selectOption(task.priority);

  const completed = page.getByLabel('Completed');
  if (task.completed) {
    await completed.check();
  } else {
    await completed.uncheck();
  }
}

export async function createTaskFromForm(
  page: Page,
  task: Omit<SeedTask, 'id' | 'createdAt'>,
): Promise<void> {
  await fillTaskForm(page, task);
  await page.getByRole('button', { name: 'Save task' }).click();
  await expect(taskCard(page, task.title)).toBeVisible();
}

export async function seedScenarioTasks(page: Page, facId: string): Promise<SeedTask[]> {
  const tasks = scenarioTasks(facId);

  await openAppAtReferenceDate(page);

  for (const task of tasks) {
    await createTaskFromForm(page, task);
  }

  return tasks;
}

export async function expectTaskDetails(
  page: Page,
  task: Omit<SeedTask, 'id' | 'createdAt'>,
): Promise<void> {
  const card = taskCard(page, task.title);
  const dueText = task.dueDate === '' ? 'No due date' : task.dueDate;
  const priorityText = task.priority[0].toUpperCase() + task.priority.slice(1);
  const statusText = task.completed ? 'Completed' : 'Active';

  await expect(card).toBeVisible();
  await expect(card.getByRole('heading', { name: task.title, exact: true })).toBeVisible();
  await expect(card.getByText(task.description || 'No description')).toBeVisible();
  await expect(card.getByText(dueText, { exact: true })).toBeVisible();
  await expect(card.getByText(priorityText, { exact: true })).toBeVisible();
  await expect(card.getByText(statusText, { exact: true })).toBeVisible();
}

export async function editTask(page: Page, title: string): Promise<void> {
  await taskCard(page, title).getByRole('button', { name: 'Edit task' }).click();
}

export async function chooseFilter(page: Page, name: 'All' | 'Active' | 'Completed'): Promise<void> {
  await page.getByRole('button', { name: new RegExp(`^${name}\\b`) }).click();
}
