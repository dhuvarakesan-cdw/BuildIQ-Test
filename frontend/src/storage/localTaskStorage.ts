import { isTaskPriority, type Task } from '../domain/task';

export const LOCAL_TASK_STORAGE_KEY = 'ptma.tasks.v1';

type TaskStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

const getBrowserTaskStorage = (): TaskStorage | null => {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
};

const isRecord = (value: unknown): value is Record<string, unknown> => (
  typeof value === 'object' && value !== null && !Array.isArray(value)
);

const serializeTask = (task: Task): Task => ({
  id: task.id,
  title: task.title,
  description: task.description,
  dueDate: task.dueDate,
  priority: task.priority,
  completed: task.completed,
  createdAt: task.createdAt,
});

const deserializeTask = (value: unknown): Task | null => {
  if (!isRecord(value)) {
    return null;
  }

  const {
    id,
    title,
    description,
    dueDate,
    priority,
    completed,
    createdAt,
  } = value;

  if (
    typeof id !== 'string'
    || typeof title !== 'string'
    || typeof description !== 'string'
    || typeof dueDate !== 'string'
    || !isTaskPriority(priority)
    || typeof completed !== 'boolean'
    || typeof createdAt !== 'string'
  ) {
    return null;
  }

  return {
    id,
    title,
    description,
    dueDate,
    priority,
    completed,
    createdAt,
  };
};

export const readTasks = (
  storage: TaskStorage | null = getBrowserTaskStorage(),
): Task[] => {
  if (storage === null) {
    return [];
  }

  try {
    const storedTasks = storage.getItem(LOCAL_TASK_STORAGE_KEY);

    if (storedTasks === null) {
      return [];
    }

    const parsedTasks: unknown = JSON.parse(storedTasks);

    if (!Array.isArray(parsedTasks)) {
      return [];
    }

    return parsedTasks.reduce<Task[]>((tasks, parsedTask) => {
      const task = deserializeTask(parsedTask);

      if (task !== null) {
        tasks.push(task);
      }

      return tasks;
    }, []);
  } catch {
    return [];
  }
};

export const writeTasks = (
  tasks: readonly Task[],
  storage: TaskStorage | null = getBrowserTaskStorage(),
): boolean => {
  if (storage === null) {
    return false;
  }

  try {
    storage.setItem(
      LOCAL_TASK_STORAGE_KEY,
      JSON.stringify(tasks.map((task) => serializeTask(task))),
    );

    return true;
  } catch {
    return false;
  }
};

export const clearTasks = (
  storage: TaskStorage | null = getBrowserTaskStorage(),
): boolean => {
  if (storage === null) {
    return false;
  }

  try {
    storage.removeItem(LOCAL_TASK_STORAGE_KEY);

    return true;
  } catch {
    return false;
  }
};
