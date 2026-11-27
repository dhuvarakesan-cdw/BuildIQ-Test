import { useRef, useState } from 'react';

import {
  Task,
  TaskFilter,
  TaskId,
  TaskInput,
  TaskUpdate,
  TaskValidationErrors,
  createTask as createDomainTask,
  filterTasks,
  isTaskOverdue,
  mergeTaskUpdate,
  toggleTaskCompletion as toggleDomainTaskCompletion,
  validateTaskInput,
  validateTaskUpdate,
} from '../domain/task';
import {
  TASK_STORAGE_PRIVACY,
  readTasks,
  writeTasks,
} from '../storage/localTaskStorage';

const TASK_PERSISTENCE_ERROR_MESSAGE =
  'Tasks changed here, but this browser could not save them for refresh.';

export interface TaskCounts {
  all: number;
  active: number;
  completed: number;
  overdueActive: number;
}

export interface UseTasksOptions {
  initialTasks?: readonly Task[];
  today?: Date | string;
}

export const TASK_PERSISTENCE_MODE = TASK_STORAGE_PRIVACY.persistence;

export interface UseTasksResult {
  tasks: Task[];
  visibleTasks: Task[];
  filter: TaskFilter;
  validationErrors: TaskValidationErrors;
  persistenceError: string | null;
  editTarget: Task | null;
  pendingDeleteTarget: Task | null;
  counts: TaskCounts;
  createTask: (input: TaskInput) => boolean;
  updateTask: (update: TaskUpdate) => boolean;
  startEdit: (taskId: TaskId) => boolean;
  cancelEdit: () => void;
  requestDelete: (taskId: TaskId) => boolean;
  cancelDelete: () => void;
  confirmDelete: () => boolean;
  toggleTaskCompletion: (taskId: TaskId) => boolean;
  setFilter: (filter: TaskFilter) => void;
}

export const useTasks = (options: UseTasksOptions = {}): UseTasksResult => {
  const { today = new Date() } = options;
  const [tasks, setTasks] = useState<Task[]>(() => (
    options.initialTasks === undefined ? readTasks() : [...options.initialTasks]
  ));
  const tasksRef = useRef(tasks);
  const [filter, setFilter] = useState<TaskFilter>('all');
  const [validationErrors, setValidationErrors] =
    useState<TaskValidationErrors>({});
  const [persistenceError, setPersistenceError] = useState<string | null>(null);
  const [editTargetId, setEditTargetId] = useState<TaskId | null>(null);
  const [pendingDeleteTargetId, setPendingDeleteTargetId] =
    useState<TaskId | null>(null);

  const editTarget = tasks.find((task) => task.id === editTargetId) ?? null;
  const pendingDeleteTarget = tasks.find(
    (task) => task.id === pendingDeleteTargetId,
  ) ?? null;
  const activeTasks = filterTasks(tasks, 'active');
  const completedTasks = filterTasks(tasks, 'completed');
  const visibleTasks = filterTasks(tasks, filter);
  const counts: TaskCounts = {
    all: tasks.length,
    active: activeTasks.length,
    completed: completedTasks.length,
    overdueActive: tasks.filter((task) => isTaskOverdue(task, today)).length,
  };

  const commitTasks = (nextTasks: Task[]): void => {
    tasksRef.current = nextTasks;
    setTasks(nextTasks);
    setPersistenceError(
      writeTasks(nextTasks) ? null : TASK_PERSISTENCE_ERROR_MESSAGE,
    );
  };

  const createTask = (input: TaskInput): boolean => {
    const validationResult = validateTaskInput(input);

    if (!validationResult.isValid) {
      setValidationErrors(validationResult.errors);
      return false;
    }

    commitTasks([
      ...tasksRef.current,
      createDomainTask(validationResult.value),
    ]);
    setValidationErrors({});

    return true;
  };

  const updateTask = (update: TaskUpdate): boolean => {
    if (editTarget === null) {
      return false;
    }

    const validationResult = validateTaskUpdate(editTarget, update);

    if (!validationResult.isValid) {
      setValidationErrors(validationResult.errors);
      return false;
    }

    const updatedTask = mergeTaskUpdate(editTarget, update);

    commitTasks(tasksRef.current.map((task) => (
      task.id === editTarget.id ? updatedTask : task
    )));
    setEditTargetId(null);
    setValidationErrors({});

    return true;
  };

  const startEdit = (taskId: TaskId): boolean => {
    const hasTask = tasks.some((task) => task.id === taskId);

    if (!hasTask) {
      return false;
    }

    setEditTargetId(taskId);
    setValidationErrors({});

    return true;
  };

  const cancelEdit = (): void => {
    setEditTargetId(null);
    setValidationErrors({});
  };

  const requestDelete = (taskId: TaskId): boolean => {
    const hasTask = tasks.some((task) => task.id === taskId);

    if (!hasTask) {
      return false;
    }

    setPendingDeleteTargetId(taskId);

    return true;
  };

  const cancelDelete = (): void => {
    setPendingDeleteTargetId(null);
  };

  const confirmDelete = (): boolean => {
    if (pendingDeleteTarget === null) {
      return false;
    }

    commitTasks(tasksRef.current.filter(
      (task) => task.id !== pendingDeleteTarget.id,
    ));

    if (editTargetId === pendingDeleteTarget.id) {
      setEditTargetId(null);
      setValidationErrors({});
    }

    setPendingDeleteTargetId(null);

    return true;
  };

  const toggleTaskCompletion = (taskId: TaskId): boolean => {
    const hasTask = tasks.some((task) => task.id === taskId);

    if (!hasTask) {
      return false;
    }

    commitTasks(tasksRef.current.map((task) => (
      task.id === taskId ? toggleDomainTaskCompletion(task) : task
    )));

    return true;
  };

  return {
    tasks,
    visibleTasks,
    filter,
    validationErrors,
    persistenceError,
    editTarget,
    pendingDeleteTarget,
    counts,
    createTask,
    updateTask,
    startEdit,
    cancelEdit,
    requestDelete,
    cancelDelete,
    confirmDelete,
    toggleTaskCompletion,
    setFilter,
  };
};
