import {
  Task,
  filterTasks,
  isTaskOverdue,
  mergeTaskUpdate,
  toggleTaskCompletion,
  validateTaskInput,
  validateTaskUpdate,
} from '../task';

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

describe('task domain model', () => {
  /**
   * run_id: 28e480edc100444a9a45357f6e97dcb1; task_id: TASK-001;
   * AC-001: verifies create validation rejects trimmed-empty titles while
   * accepting optional description and due date values.
   */
  it('validates title requirements and optional input fields', () => {
    expect(validateTaskInput({ title: '   ' })).toMatchObject({
      isValid: false,
      errors: {
        title: 'Title is required.',
      },
    });

    expect(validateTaskInput({
      title: '  Book venue  ',
      description: '  Confirm room setup  ',
      dueDate: '  2026-12-02  ',
    })).toMatchObject({
      isValid: true,
      errors: {},
      value: {
        title: 'Book venue',
        description: 'Confirm room setup',
        dueDate: '2026-12-02',
      },
    });
  });

  /**
   * run_id: 28e480edc100444a9a45357f6e97dcb1; task_id: TASK-001;
   * AC-001: verifies edit validation rejects updates that would leave the
   * merged task title empty.
   */
  it('validates merged task edits before accepting title changes', () => {
    const task = createTaskFixture({ title: 'Send notes' });

    expect(validateTaskUpdate(task, { title: '  ' })).toMatchObject({
      isValid: false,
      errors: {
        title: 'Title is required.',
      },
    });

    expect(mergeTaskUpdate(task, {
      title: '  Send revised notes  ',
      description: '  Include owners  ',
    })).toMatchObject({
      title: 'Send revised notes',
      description: 'Include owners',
    });
  });

  /**
   * run_id: 28e480edc100444a9a45357f6e97dcb1; task_id: TASK-001;
   * AC-002: verifies filtering returns all, active, and completed subsets.
   */
  it('filters tasks by all, active, and completed states', () => {
    const activeTask = createTaskFixture({ id: 'active', completed: false });
    const completedTask = createTaskFixture({ id: 'done', completed: true });
    const tasks = [activeTask, completedTask];

    expect(filterTasks(tasks, 'all')).toEqual(tasks);
    expect(filterTasks(tasks, 'active')).toEqual([activeTask]);
    expect(filterTasks(tasks, 'completed')).toEqual([completedTask]);
  });

  /**
   * run_id: 28e480edc100444a9a45357f6e97dcb1; task_id: TASK-001;
   * AC-003: verifies only incomplete tasks with due dates before today are
   * considered overdue.
   */
  it('marks only active tasks due before today as overdue', () => {
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
  });

  /**
   * run_id: 28e480edc100444a9a45357f6e97dcb1; task_id: TASK-001;
   * AC-002: verifies completion toggling updates active/completed task
   * membership without mutating the original task.
   */
  it('toggles completion with an immutable task copy', () => {
    const task = createTaskFixture({ completed: false });
    const toggledTask = toggleTaskCompletion(task);

    expect(toggledTask).toMatchObject({ completed: true });
    expect(task).toMatchObject({ completed: false });
  });
});
