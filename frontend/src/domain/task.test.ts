import {
  Task,
  createTask,
  filterTasks,
  isTaskOverdue,
  mergeTaskUpdate,
  toggleTaskCompletion,
  validateTaskInput,
  validateTaskUpdate,
} from './task';

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

describe('task domain rules', () => {
  /**
   * run_id: 28e480edc100444a9a45357f6e97dcb1; task_id: TASK-006;
   * AC-014: verifies validation trims input, rejects blank titles, and applies
   * defaults for optional fields before creating a task.
   */
  it('validates and normalizes task input before creation', () => {
    expect(validateTaskInput({ title: '   ' })).toMatchObject({
      isValid: false,
      errors: {
        title: 'Title is required.',
      },
      value: {
        title: '',
        description: '',
        dueDate: '',
        priority: 'medium',
        completed: false,
      },
    });

    expect(validateTaskInput({
      title: '  Book venue  ',
      description: '  Confirm room setup  ',
      dueDate: '  2026-12-02  ',
      priority: 'high',
      completed: true,
    })).toMatchObject({
      isValid: true,
      errors: {},
      value: {
        title: 'Book venue',
        description: 'Confirm room setup',
        dueDate: '2026-12-02',
        priority: 'high',
        completed: true,
      },
    });

    expect(createTask({ title: '  Draft agenda  ' }, '2026-11-27T10:00:00.000Z'))
      .toMatchObject({
        title: 'Draft agenda',
        description: '',
        dueDate: '',
        priority: 'medium',
        completed: false,
        createdAt: '2026-11-27T10:00:00.000Z',
      });
  });

  /**
   * run_id: 28e480edc100444a9a45357f6e97dcb1; task_id: TASK-006;
   * AC-014: verifies edit validation evaluates the merged task and preserves
   * unchanged fields when only partial updates are provided.
   */
  it('validates partial updates against the merged task state', () => {
    const task = createTaskFixture({
      title: 'Send notes',
      description: 'Original details',
      dueDate: '2026-12-01',
      priority: 'low',
    });

    expect(validateTaskUpdate(task, { title: '   ' })).toMatchObject({
      isValid: false,
      errors: {
        title: 'Title is required.',
      },
    });

    expect(mergeTaskUpdate(task, {
      title: '  Send revised notes  ',
      completed: true,
    })).toEqual({
      ...task,
      title: 'Send revised notes',
      description: 'Original details',
      dueDate: '2026-12-01',
      priority: 'low',
      completed: true,
    });
  });

  /**
   * run_id: 28e480edc100444a9a45357f6e97dcb1; task_id: TASK-006;
   * AC-014: verifies all, active, and completed filters return independent
   * task arrays with the expected task membership.
   */
  it('filters task collections by completion state', () => {
    const activeTask = createTaskFixture({ id: 'active', completed: false });
    const completedTask = createTaskFixture({ id: 'done', completed: true });
    const tasks = [activeTask, completedTask];

    expect(filterTasks(tasks, 'all')).toEqual(tasks);
    expect(filterTasks(tasks, 'all')).not.toBe(tasks);
    expect(filterTasks(tasks, 'active')).toEqual([activeTask]);
    expect(filterTasks(tasks, 'completed')).toEqual([completedTask]);
  });

  /**
   * run_id: 28e480edc100444a9a45357f6e97dcb1; task_id: TASK-006;
   * AC-014: verifies completion transitions are immutable and move tasks
   * between active and completed filter results.
   */
  it('toggles completion without mutating the original task', () => {
    const task = createTaskFixture({ completed: false });
    const completedTask = toggleTaskCompletion(task);
    const reopenedTask = toggleTaskCompletion(completedTask);

    expect(completedTask).toEqual({
      ...task,
      completed: true,
    });
    expect(reopenedTask).toEqual(task);
    expect(task.completed).toBe(false);
    expect(filterTasks([completedTask], 'completed')).toEqual([completedTask]);
    expect(filterTasks([completedTask], 'active')).toEqual([]);
  });

  /**
   * run_id: 28e480edc100444a9a45357f6e97dcb1; task_id: TASK-006;
   * AC-014: verifies overdue rules only classify incomplete tasks with valid
   * due dates before today as overdue.
   */
  it('applies overdue rules to active dated tasks only', () => {
    const today = '2026-11-27';

    expect(isTaskOverdue(
      createTaskFixture({ dueDate: '2026-11-26', completed: false }),
      today,
    )).toBe(true);
    expect(isTaskOverdue(
      createTaskFixture({ dueDate: '2026-11-27', completed: false }),
      today,
    )).toBe(false);
    expect(isTaskOverdue(
      createTaskFixture({ dueDate: '2026-11-28', completed: false }),
      today,
    )).toBe(false);
    expect(isTaskOverdue(
      createTaskFixture({ dueDate: '2026-11-26', completed: true }),
      today,
    )).toBe(false);
    expect(isTaskOverdue(
      createTaskFixture({ dueDate: '', completed: false }),
      today,
    )).toBe(false);
    expect(isTaskOverdue(
      createTaskFixture({ dueDate: 'not-a-date', completed: false }),
      today,
    )).toBe(false);
  });
});
