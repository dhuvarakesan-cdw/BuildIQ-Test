import { type Task } from '../domain/task';
import {
  LOCAL_TASK_STORAGE_KEY,
  clearTasks,
  readTasks,
  writeTasks,
} from './localTaskStorage';

const createTaskFixture = (overrides: Partial<Task> = {}): Task => ({
  id: 'task-1',
  title: 'Plan launch',
  description: 'Confirm owners',
  dueDate: '2026-12-02',
  priority: 'medium',
  completed: false,
  createdAt: '2026-11-27T00:00:00.000Z',
  ...overrides,
});

type StorageDouble = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

const createThrowingStorage = (): StorageDouble => ({
  getItem: jest.fn(() => {
    throw new Error('storage unavailable');
  }),
  removeItem: jest.fn(() => {
    throw new Error('storage unavailable');
  }),
  setItem: jest.fn(() => {
    throw new Error('storage unavailable');
  }),
});

const mockFetch = (): {
  fetchMock: jest.Mock;
  restoreFetch: () => void;
} => {
  const originalFetch = Object.getOwnPropertyDescriptor(globalThis, 'fetch');
  const fetchMock = jest.fn();

  Object.defineProperty(globalThis, 'fetch', {
    configurable: true,
    writable: true,
    value: fetchMock,
  });

  return {
    fetchMock,
    restoreFetch: () => {
      if (originalFetch === undefined) {
        Reflect.deleteProperty(globalThis, 'fetch');
        return;
      }

      Object.defineProperty(globalThis, 'fetch', originalFetch);
    },
  };
};

describe('localTaskStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  /**
   * run_id: 1490a92254cb4fdaaa8bd2b6c9befd11; task_id: TASK-001;
   * AC-001: verifies the adapter writes and reads typed task arrays under the
   * stable localStorage key while storing only supported FEAT-001 fields.
   */
  it('reads and writes task arrays under the stable localStorage key', () => {
    const task = createTaskFixture() as Task & { remoteId: string };

    task.remoteId = 'server-should-not-be-saved';

    expect(writeTasks([task])).toBe(true);

    const storedTasks = localStorage.getItem(LOCAL_TASK_STORAGE_KEY);

    expect(storedTasks).not.toBeNull();
    expect(JSON.parse(storedTasks ?? '[]')).toEqual([
      {
        id: 'task-1',
        title: 'Plan launch',
        description: 'Confirm owners',
        dueDate: '2026-12-02',
        priority: 'medium',
        completed: false,
        createdAt: '2026-11-27T00:00:00.000Z',
      },
    ]);
    expect(readTasks()).toEqual([createTaskFixture()]);
  });

  /**
   * run_id: 1490a92254cb4fdaaa8bd2b6c9befd11; task_id: TASK-001;
   * AC-002: verifies missing or invalid local data returns an empty collection
   * and never invokes a backend request.
   */
  it('treats missing or invalid stored data as an empty task collection', () => {
    const { fetchMock, restoreFetch } = mockFetch();

    try {
      expect(readTasks()).toEqual([]);

      localStorage.setItem(LOCAL_TASK_STORAGE_KEY, '{bad json');
      expect(readTasks()).toEqual([]);

      localStorage.setItem(LOCAL_TASK_STORAGE_KEY, JSON.stringify({
        tasks: [createTaskFixture()],
      }));
      expect(readTasks()).toEqual([]);
      expect(fetchMock).not.toHaveBeenCalled();
    } finally {
      restoreFetch();
    }
  });

  /**
   * run_id: 1490a92254cb4fdaaa8bd2b6c9befd11; task_id: TASK-001;
   * AC-002: verifies unavailable storage and write/remove failures are
   * recoverable local errors with no backend fallback.
   */
  it('recovers from unavailable storage and write or clear failures locally', () => {
    const { fetchMock, restoreFetch } = mockFetch();
    const throwingStorage = createThrowingStorage();

    try {
      expect(readTasks(null)).toEqual([]);
      expect(readTasks(throwingStorage)).toEqual([]);
      expect(writeTasks([createTaskFixture()], null)).toBe(false);
      expect(writeTasks([createTaskFixture()], throwingStorage)).toBe(false);
      expect(clearTasks(null)).toBe(false);
      expect(clearTasks(throwingStorage)).toBe(false);
      expect(fetchMock).not.toHaveBeenCalled();
    } finally {
      restoreFetch();
    }
  });

  /**
   * run_id: 1490a92254cb4fdaaa8bd2b6c9befd11; task_id: TASK-001;
   * AC-001: verifies clearing removes only the stable task storage entry.
   */
  it('clears tasks from the stable task storage key', () => {
    localStorage.setItem('unrelated', 'keep');

    expect(writeTasks([createTaskFixture()])).toBe(true);
    expect(clearTasks()).toBe(true);

    expect(localStorage.getItem(LOCAL_TASK_STORAGE_KEY)).toBeNull();
    expect(localStorage.getItem('unrelated')).toBe('keep');
  });
});
