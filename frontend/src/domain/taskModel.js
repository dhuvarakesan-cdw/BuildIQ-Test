export const STATUS_VALUES = ['Pending', 'In Progress', 'Completed'];

export const PRIORITY_VALUES = ['Low', 'Medium', 'High'];

const DEFAULT_STATUS = STATUS_VALUES[0];
const BLANK_PRIORITY = '';

function normalizeText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function getTaskId() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `task-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function createTaskRecord(taskInput = {}) {
  const title = normalizeText(taskInput.title);
  const description = normalizeText(taskInput.description);
  const dueDate = normalizeText(taskInput.dueDate);
  const priority = normalizeText(taskInput.priority);
  const timestamp = new Date().toISOString();

  return {
    id: getTaskId(),
    title,
    description,
    dueDate,
    priority: PRIORITY_VALUES.includes(priority) ? priority : BLANK_PRIORITY,
    status: DEFAULT_STATUS,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}
