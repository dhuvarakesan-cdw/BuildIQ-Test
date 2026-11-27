import { render, screen } from '@testing-library/react';

import { Task } from '../../domain/task';
import TaskList from './TaskList';

const createTaskFixture = (overrides: Partial<Task> = {}): Task => ({
  id: 'task-1',
  title: 'Task fixture',
  description: '',
  dueDate: '',
  priority: 'medium',
  completed: false,
  createdAt: '2026-11-27T00:00:00.000Z',
  ...overrides,
});

describe('TaskList', () => {
  /**
   * run_id: 28e480edc100444a9a45357f6e97dcb1; task_id: TASK-004;
   * AC-011: verifies only active past-due tasks receive the active-overdue
   * visual state while completed past-due and no-due-date tasks do not.
   */
  it('marks only active past-due tasks as active overdue', () => {
    render(
      <TaskList
        filter="all"
        today="2026-11-27"
        tasks={[
          createTaskFixture({
            id: 'task-1',
            title: 'Renew permit',
            dueDate: '2026-11-26',
          }),
          createTaskFixture({
            id: 'task-2',
            title: 'File old receipt',
            completed: true,
            dueDate: '2026-11-25',
          }),
          createTaskFixture({
            id: 'task-3',
            title: 'Brainstorm ideas',
          }),
        ]}
        onToggleCompletion={() => undefined}
        onEdit={() => undefined}
        onDelete={() => undefined}
      />,
    );

    const items = screen.getAllByRole('listitem');

    expect(items[0]).toHaveClass('task-card-overdue');
    expect(items[0]).toHaveAttribute('data-overdue', 'true');
    expect(items[0]).toHaveTextContent('Active overdue');
    expect(items[1]).toHaveClass('task-card-completed');
    expect(items[1]).toHaveAttribute('data-overdue', 'false');
    expect(items[2]).toHaveClass('task-card-active');
    expect(items[2]).toHaveAttribute('data-overdue', 'false');
    expect(screen.getByText('No due date')).toBeInTheDocument();
  });
});
