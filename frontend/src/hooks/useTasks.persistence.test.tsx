import { act, renderHook } from '@testing-library/react';

import { type Task } from '../domain/task';
import { LOCAL_TASK_STORAGE_KEY } from '../storage/localTaskStorage';
import { useTasks } from './useTasks';

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

const readStoredTasks = (): Task[] => (
  JSON.parse(localStorage.getItem(LOCAL_TASK_STORAGE_KEY) ?? '[]') as Task[]
);

const writeStoredTasks = (tasks: readonly Task[]): void => {
  localStorage.setItem(LOCAL_TASK_STORAGE_KEY, JSON.stringify(tasks));
};

const mockNetworkApis = (): {
  fetchMock: jest.Mock;
  sendBeaconMock: jest.Mock;
  restoreNetworkApis: () => void;
} => {
  const originalFetch = Object.getOwnPropertyDescriptor(globalThis, 'fetch');
  const originalSendBeacon = Object.getOwnPropertyDescriptor(
    Navigator.prototype,
    'sendBeacon',
  );
  const fetchMock = jest.fn();
  const sendBeaconMock = jest.fn();

  Object.defineProperty(globalThis, 'fetch', {
    configurable: true,
    writable: true,
    value: fetchMock,
  });
  Object.defineProperty(Navigator.prototype, 'sendBeacon', {
    configurable: true,
    writable: true,
    value: sendBeaconMock,
  });

  return {
    fetchMock,
    sendBeaconMock,
    restoreNetworkApis: () => {
      if (originalFetch === undefined) {
        Reflect.deleteProperty(globalThis, 'fetch');
      } else {
        Object.defineProperty(globalThis, 'fetch', originalFetch);
      }

      if (originalSendBeacon === undefined) {
        Reflect.deleteProperty(Navigator.prototype, 'sendBeacon');
      } else {
        Object.defineProperty(
          Navigator.prototype,
          'sendBeacon',
          originalSendBeacon,
        );
      }
    },
  };
};

const expectNoNetworkTransmission = (
  fetchMock: jest.Mock,
  sendBeaconMock: jest.Mock,
): void => {
  expect(fetchMock).not.toHaveBeenCalled();
  expect(sendBeaconMock).not.toHaveBeenCalled();
};

describe('useTasks persistence', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  /**
   * run_id: 1490a92254cb4fdaaa8bd2b6c9befd11; task_id: TASK-005;
   * AC-008: verifies tasks rehydrate from current browser-profile localStorage
   * after a refresh simulation without sending task data over network APIs.
   */
  it('rehydrates tasks from localStorage for the current browser profile only', () => {
    const { fetchMock, restoreNetworkApis, sendBeaconMock } = mockNetworkApis();
    const storedTask = createTaskFixture({
      id: 'profile-task',
      title: 'Profile-local task',
    });

    try {
      writeStoredTasks([storedTask]);

      const { result, unmount } = renderHook(() => useTasks({
        today: '2026-11-27',
      }));

      expect(result.current.tasks).toEqual([storedTask]);
      expect(result.current.visibleTasks).toEqual([storedTask]);
      expectNoNetworkTransmission(fetchMock, sendBeaconMock);

      unmount();
      localStorage.clear();

      const isolatedProfile = renderHook(() => useTasks({
        today: '2026-11-27',
      }));

      expect(isolatedProfile.result.current.tasks).toEqual([]);
      expectNoNetworkTransmission(fetchMock, sendBeaconMock);
      isolatedProfile.unmount();
    } finally {
      restoreNetworkApis();
    }
  });

  /**
   * run_id: 1490a92254cb4fdaaa8bd2b6c9befd11; task_id: TASK-005;
   * AC-008: verifies create, edit, completion toggle, and confirmed delete
   * persist through remounts while task data remains local.
   */
  it('persists create, edit, toggle, and confirmed delete across remounts', () => {
    const { fetchMock, restoreNetworkApis, sendBeaconMock } = mockNetworkApis();

    try {
      const createRender = renderHook(() => useTasks({
        today: '2026-11-27',
      }));

      act(() => {
        expect(createRender.result.current.createTask({
          title: '  Plan launch  ',
          description: '  Confirm owners  ',
          dueDate: '2026-12-02',
          priority: 'high',
        })).toBe(true);
      });

      const createdTask = createRender.result.current.tasks[0];

      expect(readStoredTasks()).toEqual([createdTask]);
      createRender.unmount();

      const editRender = renderHook(() => useTasks({
        today: '2026-11-27',
      }));

      act(() => {
        expect(editRender.result.current.startEdit(createdTask.id)).toBe(true);
      });
      act(() => {
        expect(editRender.result.current.updateTask({
          title: 'Finalize launch plan',
          priority: 'medium',
        })).toBe(true);
      });

      const editedTask = editRender.result.current.tasks[0];

      expect(editedTask).toMatchObject({
        id: createdTask.id,
        title: 'Finalize launch plan',
        priority: 'medium',
      });
      expect(readStoredTasks()).toEqual([editedTask]);
      editRender.unmount();

      const toggleRender = renderHook(() => useTasks({
        today: '2026-11-27',
      }));

      act(() => {
        expect(toggleRender.result.current.toggleTaskCompletion(createdTask.id))
          .toBe(true);
      });

      const completedTask = toggleRender.result.current.tasks[0];

      expect(completedTask.completed).toBe(true);
      expect(readStoredTasks()).toEqual([completedTask]);
      toggleRender.unmount();

      const deleteRender = renderHook(() => useTasks({
        today: '2026-11-27',
      }));

      act(() => {
        expect(deleteRender.result.current.requestDelete(createdTask.id))
          .toBe(true);
      });
      act(() => {
        expect(deleteRender.result.current.confirmDelete()).toBe(true);
      });

      expect(deleteRender.result.current.tasks).toEqual([]);
      expect(readStoredTasks()).toEqual([]);
      deleteRender.unmount();

      const refreshAfterDelete = renderHook(() => useTasks({
        today: '2026-11-27',
      }));

      expect(refreshAfterDelete.result.current.tasks).toEqual([]);
      expectNoNetworkTransmission(fetchMock, sendBeaconMock);
      refreshAfterDelete.unmount();
    } finally {
      restoreNetworkApis();
    }
  });

  /**
   * run_id: 1490a92254cb4fdaaa8bd2b6c9befd11; task_id: TASK-005;
   * AC-008: verifies canceled edit, canceled deletion, validation failure, and
   * filter-only behavior do not create unintended persisted task changes.
   */
  it('does not persist canceled, invalid, or filter-only state changes', () => {
    const { fetchMock, restoreNetworkApis, sendBeaconMock } = mockNetworkApis();
    const existingTask = createTaskFixture({
      id: 'task-keep',
      title: 'Keep local task',
    });

    try {
      writeStoredTasks([existingTask]);

      const { result, unmount } = renderHook(() => useTasks({
        today: '2026-11-27',
      }));
      const originalStoredTasks = readStoredTasks();

      act(() => {
        expect(result.current.startEdit(existingTask.id)).toBe(true);
      });
      act(() => {
        result.current.cancelEdit();
      });
      act(() => {
        expect(result.current.startEdit(existingTask.id)).toBe(true);
      });
      act(() => {
        expect(result.current.updateTask({ title: '   ' })).toBe(false);
      });
      act(() => {
        expect(result.current.requestDelete(existingTask.id)).toBe(true);
      });
      act(() => {
        result.current.cancelDelete();
      });
      act(() => {
        expect(result.current.createTask({ title: '   ' })).toBe(false);
      });
      act(() => {
        result.current.setFilter('completed');
      });

      expect(result.current.tasks).toEqual([existingTask]);
      expect(result.current.visibleTasks).toEqual([]);
      expect(readStoredTasks()).toEqual(originalStoredTasks);
      expectNoNetworkTransmission(fetchMock, sendBeaconMock);
      unmount();
    } finally {
      restoreNetworkApis();
    }
  });
});
