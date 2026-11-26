import {
  PRIORITY_VALUES,
  STATUS_VALUES,
  createTaskRecord,
} from '../taskModel.js';

describe('taskModel', () => {
  /**
   * run_id: 5f94352ef9be4758aeeb8f7a814d52b3; task_id: TASK-004;
   * AC-005: verifies foundation tests cover exported task constants.
   */
  it('exports the task status and priority constants', () => {
    expect(STATUS_VALUES).toEqual(['Pending', 'In Progress', 'Completed']);
    expect(PRIORITY_VALUES).toEqual(['Low', 'Medium', 'High']);
  });

  /**
   * run_id: 5f94352ef9be4758aeeb8f7a814d52b3; task_id: TASK-004;
   * AC-005: verifies the task factory supplies default field values.
   */
  it('creates a default task record with empty user-editable fields', () => {
    const task = createTaskRecord();

    expect(task).toMatchObject({
      title: '',
      description: '',
      dueDate: '',
      priority: '',
      status: 'Pending',
    });
    expect(task.id).toEqual(expect.any(String));
    expect(task.createdAt).toEqual(task.updatedAt);
    expect(Date.parse(task.createdAt)).not.toBeNaN();
  });

  /**
   * run_id: 5f94352ef9be4758aeeb8f7a814d52b3; task_id: TASK-004;
   * AC-005: verifies the factory normalizes input while preserving valid priority.
   */
  it('trims text input and preserves a valid priority', () => {
    const task = createTaskRecord({
      title: '  Draft release notes  ',
      description: '  Summarize completed tasks  ',
      dueDate: '  2026-12-31  ',
      priority: 'High',
    });

    expect(task).toMatchObject({
      title: 'Draft release notes',
      description: 'Summarize completed tasks',
      dueDate: '2026-12-31',
      priority: 'High',
      status: 'Pending',
    });
  });
});
