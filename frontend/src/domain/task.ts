export const TASK_PRIORITIES = ['low', 'medium', 'high'] as const;

export const TASK_FILTERS = ['all', 'active', 'completed'] as const;

export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export type TaskFilter = (typeof TASK_FILTERS)[number];

export type TaskId = string;

export interface Task {
  id: TaskId;
  title: string;
  description: string;
  dueDate: string;
  priority: TaskPriority;
  completed: boolean;
  createdAt: string;
}

export interface TaskInput {
  title: string;
  description?: string;
  dueDate?: string;
  priority?: TaskPriority;
  completed?: boolean;
}

export type TaskUpdate = Partial<TaskInput>;

export interface NormalizedTaskInput {
  title: string;
  description: string;
  dueDate: string;
  priority: TaskPriority;
  completed: boolean;
}

export interface TaskValidationErrors {
  title?: string;
}

export interface TaskValidationResult {
  isValid: boolean;
  errors: TaskValidationErrors;
  value: NormalizedTaskInput;
}

const DEFAULT_PRIORITY: TaskPriority = 'medium';

const TITLE_REQUIRED_MESSAGE = 'Title is required.';

const toTrimmedString = (value: unknown): string => (
  typeof value === 'string' ? value.trim() : ''
);

const isTaskPriority = (value: unknown): value is TaskPriority => (
  typeof value === 'string' && TASK_PRIORITIES.includes(value as TaskPriority)
);

const createTaskId = (): TaskId => {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `task-${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

export const normalizeTaskInput = (input: TaskInput): NormalizedTaskInput => ({
  title: toTrimmedString(input.title),
  description: toTrimmedString(input.description),
  dueDate: toTrimmedString(input.dueDate),
  priority: isTaskPriority(input.priority) ? input.priority : DEFAULT_PRIORITY,
  completed: input.completed ?? false,
});

export const validateTaskInput = (input: TaskInput): TaskValidationResult => {
  const value = normalizeTaskInput(input);
  const errors: TaskValidationErrors = {};

  if (value.title === '') {
    errors.title = TITLE_REQUIRED_MESSAGE;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    value,
  };
};

export const createTask = (
  input: TaskInput,
  createdAt = new Date().toISOString(),
): Task => {
  const normalizedInput = normalizeTaskInput(input);

  return {
    id: createTaskId(),
    ...normalizedInput,
    createdAt,
  };
};

export const mergeTaskUpdate = (task: Task, update: TaskUpdate): Task => {
  const nextTitle = update.title === undefined
    ? task.title
    : toTrimmedString(update.title);
  const nextDescription = update.description === undefined
    ? task.description
    : toTrimmedString(update.description);
  const nextDueDate = update.dueDate === undefined
    ? task.dueDate
    : toTrimmedString(update.dueDate);
  const nextPriority = update.priority === undefined
    ? task.priority
    : update.priority;
  const nextCompleted = update.completed ?? task.completed;

  return {
    ...task,
    title: nextTitle,
    description: nextDescription,
    dueDate: nextDueDate,
    priority: nextPriority,
    completed: nextCompleted,
  };
};

export const validateTaskUpdate = (
  task: Task,
  update: TaskUpdate,
): TaskValidationResult => {
  const mergedTask = mergeTaskUpdate(task, update);

  return validateTaskInput({
    title: mergedTask.title,
    description: mergedTask.description,
    dueDate: mergedTask.dueDate,
    priority: mergedTask.priority,
    completed: mergedTask.completed,
  });
};

export const filterTasks = (tasks: readonly Task[], filter: TaskFilter): Task[] => {
  if (filter === 'active') {
    return tasks.filter((task) => !task.completed);
  }

  if (filter === 'completed') {
    return tasks.filter((task) => task.completed);
  }

  return [...tasks];
};

export const toggleTaskCompletion = (task: Task): Task => ({
  ...task,
  completed: !task.completed,
});

const toDateOnlyTime = (value: string): number | null => {
  const dateOnly = value.trim();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) {
    return null;
  }

  const [year, month, day] = dateOnly.split('-').map(Number);

  return Date.UTC(year, month - 1, day);
};

const toTodayTime = (today: Date | string): number | null => {
  if (today instanceof Date) {
    return Date.UTC(
      today.getUTCFullYear(),
      today.getUTCMonth(),
      today.getUTCDate(),
    );
  }

  return toDateOnlyTime(today);
};

export const isTaskOverdue = (
  task: Task,
  today: Date | string = new Date(),
): boolean => {
  if (task.completed || task.dueDate === '') {
    return false;
  }

  const dueDateTime = toDateOnlyTime(task.dueDate);
  const todayTime = toTodayTime(today);

  if (dueDateTime === null || todayTime === null) {
    return false;
  }

  return dueDateTime < todayTime;
};
