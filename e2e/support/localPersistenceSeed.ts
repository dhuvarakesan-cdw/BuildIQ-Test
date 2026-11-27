import { expect, Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  SeedTask,
  createTaskFromForm,
  editTask,
  expectTaskDetails,
  fillTaskForm,
  taskCard,
} from './taskManagementSeed';

type StorageContextSeed = {
  id: string;
  name: string;
  storageType: 'localStorage';
  storageKey: string;
  taskIds: string[];
};

type ScenarioSeed = {
  name: string;
  taskIds: string[];
  storageContextIds: string[];
};

type LocalPersistenceSeed = {
  featureId: 'FEAT-002';
  name: string;
  storageKey: string;
  referenceDate: string;
  tasks: SeedTask[];
  storageContexts: StorageContextSeed[];
  createExamples: Record<string, SeedTask>;
  editExamples: Record<string, SeedTask>;
  networkMonitoring: {
    blockedApiPatterns: string[];
    observedFlows: string[];
    forbiddenTaskFields: string[];
  };
  scenarios: Record<string, ScenarioSeed>;
};

const supportDir = path.dirname(fileURLToPath(import.meta.url));
const e2eRoot = path.resolve(supportDir, '..');
export const APP_URL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:4173/';

export function loadLocalPersistenceSeed(): LocalPersistenceSeed {
  const seedPath = path.join(
    e2eRoot,
    'fixtures',
    'feat-002-local-task-persistence.seed.json',
  );

  return JSON.parse(readFileSync(seedPath, 'utf-8')) as LocalPersistenceSeed;
}

export function localPersistenceScenario(facId: string): ScenarioSeed {
  const scenario = loadLocalPersistenceSeed().scenarios[facId];

  if (!scenario) {
    throw new Error(`Missing local persistence seed scenario for ${facId}`);
  }

  return scenario;
}

export function localTaskById(taskId: string): SeedTask {
  const task = loadLocalPersistenceSeed().tasks.find(
    (candidate) => candidate.id === taskId,
  );

  if (!task) {
    throw new Error(`Missing local persistence task fixture ${taskId}`);
  }

  return task;
}

export function localScenarioTasks(facId: string): SeedTask[] {
  return localPersistenceScenario(facId).taskIds.map(localTaskById);
}

export function localStorageContext(contextId: string): StorageContextSeed {
  const context = loadLocalPersistenceSeed().storageContexts.find(
    (candidate) => candidate.id === contextId,
  );

  if (!context) {
    throw new Error(`Missing local persistence storage context ${contextId}`);
  }

  return context;
}

export function localTasksForStorageContext(contextId: string): SeedTask[] {
  return localStorageContext(contextId).taskIds.map(localTaskById);
}

export async function addReferenceDate(page: Page): Promise<void> {
  const { referenceDate } = loadLocalPersistenceSeed();

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
}

export async function openAppWithLocalTasks(
  page: Page,
  contextId: string,
): Promise<SeedTask[]> {
  const seed = loadLocalPersistenceSeed();
  const tasks = localTasksForStorageContext(contextId);

  await addReferenceDate(page);
  await page.goto(APP_URL);
  await page.evaluate(
    ({ storageKey, seededTasks }) => {
      if (seededTasks.length === 0) {
        globalThis.localStorage.removeItem(storageKey);
        return;
      }

      globalThis.localStorage.setItem(storageKey, JSON.stringify(seededTasks));
    },
    { storageKey: seed.storageKey, seededTasks: tasks },
  );
  await page.reload();

  return tasks;
}

export async function expectLocalStorageTasks(
  page: Page,
  expectedTasks: readonly Pick<SeedTask, 'title'>[],
): Promise<void> {
  const { storageKey } = loadLocalPersistenceSeed();
  const storedTitles = await page.evaluate((key) => {
    const stored = globalThis.localStorage.getItem(key);
    const parsed = stored === null ? [] : JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter((task): task is { title: string } => (
        typeof task === 'object'
        && task !== null
        && typeof task.title === 'string'
      ))
      .map((task) => task.title);
  }, storageKey);

  expect(storedTitles.sort()).toEqual(
    expectedTasks.map((task) => task.title).sort(),
  );
}

export async function expectTaskUnavailable(
  page: Page,
  title: string,
): Promise<void> {
  await expect(
    page.getByRole('heading', { name: title, exact: true }),
  ).toHaveCount(0);
}

export async function deleteTaskWithConfirmation(
  page: Page,
  title: string,
): Promise<void> {
  const card = taskCard(page, title);

  await card.getByRole('button', { name: 'Delete task' }).click();
  await expect(
    page.getByRole('dialog', { name: `Delete "${title}"?` }),
  ).toBeVisible();
  await page.getByRole('dialog').getByRole('button', { name: 'Delete task' }).click();
  await expectTaskUnavailable(page, title);
}

export async function updateTaskFromForm(
  page: Page,
  originalTitle: string,
  update: SeedTask,
): Promise<void> {
  await editTask(page, originalTitle);
  await fillTaskForm(page, update);
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expectTaskDetails(page, update);
}

export async function createLocalTask(
  page: Page,
  task: SeedTask,
): Promise<void> {
  await createTaskFromForm(page, task);
}
