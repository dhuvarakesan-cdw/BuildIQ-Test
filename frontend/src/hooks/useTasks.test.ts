import { act, renderHook } from '@testing-library/react';

import { Task } from '../domain/task';
import { LOCAL_TASK_STORAGE_KEY } from '../storage/localTaskStorage';
import { useTasks } from './useTasks';

const createTaskFixture = (overrides: Partial<Task> = {}): Task => ({
  id: 'task-1',
  title: 'Plan launch',
  description: '',
  dueDate: '',
  priority: 'medium',
  completed: false,
  createdAt: '2026-11-27T00:00:00.000Z',
  ...overrides,
});

type NetworkSentinel = {
  analyticsMock: jest.Mock;
  fetchMock: jest.Mock;
  restore: () => void;
  sendBeaconMock: jest.Mock;
  telemetryMock: jest.Mock;
  webSocketMock: jest.Mock;
  xhrMock: jest.Mock;
};

const mockGlobalValue = (
  key: string,
  value: unknown,
): (() => void) => {
  const originalDescriptor = Object.getOwnPropertyDescriptor(globalThis, key);

  Object.defineProperty(globalThis, key, {
    configurable: true,
    writable: true,
    value,
  });

  return () => {
    if (originalDescriptor === undefined) {
      Reflect.deleteProperty(globalThis, key);
      return;
    }

    Object.defineProperty(globalThis, key, originalDescriptor);
  };
};

const mockNavigatorValue = (
  key: string,
  value: unknown,
): (() => void) => {
  const originalDescriptor = Object.getOwnPropertyDescriptor(navigator, key);

  Object.defineProperty(navigator, key, {
    configurable: true,
    writable: true,
    value,
  });

  return () => {
    if (originalDescriptor === undefined) {
      Reflect.deleteProperty(navigator, key);
      return;
    }

    Object.defineProperty(navigator, key, originalDescriptor);
  };
};

const installNetworkSentinel = (): NetworkSentinel => {
  const analyticsMock = jest.fn();
  const fetchMock = jest.fn();
  const restoreCallbacks: Array<() => void> = [];
  const sendBeaconMock = jest.fn();
  const telemetryMock = jest.fn();
  const webSocketMock = jest.fn();
  const xhrMock = jest.fn();

  restoreCallbacks.push(mockGlobalValue('analytics', analyticsMock));
  restoreCallbacks.push(mockGlobalValue('fetch', fetchMock));
  restoreCallbacks.push(mockGlobalValue('telemetry', telemetryMock));
  restoreCallbacks.push(mockGlobalValue('WebSocket', webSocketMock));
  restoreCallbacks.push(mockGlobalValue('XMLHttpRequest', xhrMock));
  restoreCallbacks.push(mockNavigatorValue('sendBeacon', sendBeaconMock));

  return {
    analyticsMock,
    fetchMock,
    restore: () => {
      [...restoreCallbacks].reverse().forEach((restoreCallback) => {
        restoreCallback();
      });
    },
    sendBeaconMock,
    telemetryMock,
    webSocketMock,
    xhrMock,
  };
};

describe('useTasks', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  /**
   * run_id: 28e480edc100444a9a45357f6e97dcb1; task_id: TASK-002;
   * AC-004: verifies hook commands create, edit, toggle, filter, and delete
   * tasks while exposing derived counts and selected targets.
   */
  it('updates task state through task management commands', () => {
    const firstTask = createTaskFixture({
      id: 'task-1',
      title: 'Plan launch',
      dueDate: '2026-11-26',
    });
    const completedTask = createTaskFixture({
      id: 'task-2',
      title: 'Archive notes',
      completed: true,
      dueDate: '2026-11-25',
    });
    const { result } = renderHook(() => useTasks({
      initialTasks: [firstTask, completedTask],
      today: '2026-11-27',
    }));

    expect(result.current.counts).toEqual({
      all: 2,
      active: 1,
      completed: 1,
      overdueActive: 1,
    });

    act(() => {
      expect(result.current.createTask({
        title: '  Book venue  ',
        description: '  Main hall  ',
        dueDate: '2026-12-02',
        priority: 'high',
      })).toBe(true);
    });

    expect(result.current.tasks).toHaveLength(3);
    expect(result.current.tasks[2]).toMatchObject({
      title: 'Book venue',
      description: 'Main hall',
      dueDate: '2026-12-02',
      priority: 'high',
      completed: false,
    });

    act(() => {
      expect(result.current.startEdit('task-1')).toBe(true);
    });
    expect(result.current.editTarget).toMatchObject({ id: 'task-1' });

    act(() => {
      expect(result.current.updateTask({
        title: '  Finalize launch plan  ',
        completed: true,
      })).toBe(true);
    });

    expect(result.current.editTarget).toBeNull();
    expect(result.current.tasks.find((task) => task.id === 'task-1'))
      .toMatchObject({
        title: 'Finalize launch plan',
        completed: true,
      });

    act(() => {
      expect(result.current.toggleTaskCompletion('task-1')).toBe(true);
      result.current.setFilter('active');
    });

    expect(result.current.filter).toBe('active');
    expect(result.current.visibleTasks.map((task) => task.id)).toEqual([
      'task-1',
      result.current.tasks[2].id,
    ]);
    expect(result.current.counts).toMatchObject({
      all: 3,
      active: 2,
      completed: 1,
      overdueActive: 1,
    });

    act(() => {
      expect(result.current.requestDelete('task-2')).toBe(true);
    });
    expect(result.current.pendingDeleteTarget).toMatchObject({ id: 'task-2' });

    act(() => {
      expect(result.current.confirmDelete()).toBe(true);
    });

    expect(result.current.pendingDeleteTarget).toBeNull();
    expect(result.current.tasks.map((task) => task.id)).not.toContain('task-2');
    expect(result.current.counts).toMatchObject({
      all: 2,
      active: 2,
      completed: 0,
    });
  });

  /**
   * run_id: 28e480edc100444a9a45357f6e97dcb1; task_id: TASK-002;
   * AC-005: verifies invalid create and edit attempts expose validation errors
   * and leave the task collection unchanged.
   */
  it('keeps tasks unchanged when create or edit validation fails', () => {
    const existingTask = createTaskFixture({
      id: 'task-1',
      title: 'Plan launch',
    });
    const { result } = renderHook(() => useTasks({
      initialTasks: [existingTask],
    }));

    act(() => {
      expect(result.current.createTask({ title: '   ' })).toBe(false);
    });

    expect(result.current.validationErrors).toEqual({
      title: 'Title is required.',
    });
    expect(result.current.tasks).toEqual([existingTask]);

    act(() => {
      expect(result.current.startEdit('task-1')).toBe(true);
    });

    act(() => {
      expect(result.current.updateTask({ title: '   ' })).toBe(false);
    });

    expect(result.current.editTarget).toMatchObject({ id: 'task-1' });
    expect(result.current.validationErrors).toEqual({
      title: 'Title is required.',
    });
    expect(result.current.tasks).toEqual([existingTask]);
  });

  /**
   * run_id: 1490a92254cb4fdaaa8bd2b6c9befd11; task_id: TASK-002;
   * AC-003: verifies created and edited tasks are loaded from localStorage on a
   * fresh hook mount, matching the after-refresh task list behavior.
   */
  it('loads created and edited tasks from local storage after a refresh', () => {
    const firstRender = renderHook(() => useTasks());

    act(() => {
      expect(firstRender.result.current.createTask({
        title: '  Book venue  ',
        description: '  Main hall  ',
        dueDate: '2026-12-02',
        priority: 'high',
      })).toBe(true);
    });

    const createdTaskId = firstRender.result.current.tasks[0].id;

    act(() => {
      expect(firstRender.result.current.startEdit(createdTaskId)).toBe(true);
    });
    act(() => {
      expect(firstRender.result.current.updateTask({
        title: 'Confirm venue',
        description: 'Signed agreement',
      })).toBe(true);
    });

    firstRender.unmount();

    const refreshedRender = renderHook(() => useTasks());

    expect(refreshedRender.result.current.visibleTasks).toEqual([
      expect.objectContaining({
        id: createdTaskId,
        title: 'Confirm venue',
        description: 'Signed agreement',
        dueDate: '2026-12-02',
        priority: 'high',
      }),
    ]);
  });

  /**
   * run_id: 1490a92254cb4fdaaa8bd2b6c9befd11; task_id: TASK-002;
   * AC-004: verifies a confirmed deletion updates localStorage so the deleted
   * task does not return on a fresh hook mount.
   */
  it('keeps confirmed deletions deleted after a refresh', () => {
    const remainingTask = createTaskFixture({
      id: 'task-1',
      title: 'Plan launch',
    });
    const deletedTask = createTaskFixture({
      id: 'task-2',
      title: 'Archive notes',
    });

    localStorage.setItem(
      LOCAL_TASK_STORAGE_KEY,
      JSON.stringify([remainingTask, deletedTask]),
    );

    const firstRender = renderHook(() => useTasks());

    act(() => {
      expect(firstRender.result.current.requestDelete('task-2')).toBe(true);
    });
    act(() => {
      expect(firstRender.result.current.confirmDelete()).toBe(true);
    });

    firstRender.unmount();

    const refreshedRender = renderHook(() => useTasks());

    expect(refreshedRender.result.current.tasks).toEqual([remainingTask]);
  });

  /**
   * run_id: 1490a92254cb4fdaaa8bd2b6c9befd11; task_id: TASK-002;
   * AC-005: verifies completion toggles are persisted to localStorage and are
   * visible on a fresh hook mount.
   */
  it('loads persisted completion status after a refresh', () => {
    const activeTask = createTaskFixture({
      id: 'task-1',
      title: 'Plan launch',
      completed: false,
    });

    localStorage.setItem(LOCAL_TASK_STORAGE_KEY, JSON.stringify([activeTask]));

    const firstRender = renderHook(() => useTasks());

    act(() => {
      expect(firstRender.result.current.toggleTaskCompletion('task-1')).toBe(
        true,
      );
    });

    firstRender.unmount();

    const refreshedRender = renderHook(() => useTasks());

    expect(refreshedRender.result.current.tasks).toEqual([
      {
        ...activeTask,
        completed: true,
      },
    ]);
  });

  /**
   * run_id: 1490a92254cb4fdaaa8bd2b6c9befd11; task_id: TASK-004;
   * AC-007: verifies view, create, edit, complete, filter, and delete flows
   * persist with localStorage only and never invoke network or telemetry APIs.
   */
  it('keeps core task flows local without network or telemetry calls', () => {
    const sentinel = installNetworkSentinel();
    const getItemSpy = jest.spyOn(Storage.prototype, 'getItem');
    const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');
    const removeItemSpy = jest.spyOn(Storage.prototype, 'removeItem');
    const storedTask = createTaskFixture({
      id: 'task-1',
      title: 'Read privacy notice',
      completed: false,
    });

    localStorage.setItem(LOCAL_TASK_STORAGE_KEY, JSON.stringify([storedTask]));

    try {
      setItemSpy.mockClear();

      const { result } = renderHook(() => useTasks());

      expect(result.current.visibleTasks).toEqual([storedTask]);

      act(() => {
        expect(result.current.createTask({
          title: '  Draft launch tasks  ',
          priority: 'high',
        })).toBe(true);
      });

      const createdTaskId = result.current.tasks[1].id;

      act(() => {
        expect(result.current.startEdit(createdTaskId)).toBe(true);
      });
      act(() => {
        expect(result.current.updateTask({
          title: 'Draft launch checklist',
          completed: false,
        })).toBe(true);
      });
      act(() => {
        expect(result.current.toggleTaskCompletion(createdTaskId)).toBe(true);
        result.current.setFilter('completed');
      });

      expect(result.current.visibleTasks).toEqual([
        expect.objectContaining({
          id: createdTaskId,
          title: 'Draft launch checklist',
          completed: true,
        }),
      ]);

      act(() => {
        expect(result.current.requestDelete('task-1')).toBe(true);
      });
      act(() => {
        expect(result.current.confirmDelete()).toBe(true);
      });

      expect(getItemSpy).toHaveBeenCalledWith(LOCAL_TASK_STORAGE_KEY);
      expect(setItemSpy).toHaveBeenCalledWith(
        LOCAL_TASK_STORAGE_KEY,
        expect.any(String),
      );
      expect(removeItemSpy).not.toHaveBeenCalled();
      expect(sentinel.fetchMock).not.toHaveBeenCalled();
      expect(sentinel.xhrMock).not.toHaveBeenCalled();
      expect(sentinel.webSocketMock).not.toHaveBeenCalled();
      expect(sentinel.sendBeaconMock).not.toHaveBeenCalled();
      expect(sentinel.analyticsMock).not.toHaveBeenCalled();
      expect(sentinel.telemetryMock).not.toHaveBeenCalled();
    } finally {
      getItemSpy.mockRestore();
      removeItemSpy.mockRestore();
      sentinel.restore();
      setItemSpy.mockRestore();
    }
  });
});
