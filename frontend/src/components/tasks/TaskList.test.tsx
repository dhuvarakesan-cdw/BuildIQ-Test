import { fireEvent, render, screen, within } from '@testing-library/react';

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
   * run_id: 28e480edc100444a9a45357f6e97dcb1; task_id: TASK-006;
   * AC-014: verifies filter-specific empty states are rendered with status
   * semantics when no task matches the selected filter.
   */
  it.each([
    ['all' as const, 'No tasks saved yet.'],
    ['active' as const, 'No active tasks match this filter.'],
    ['completed' as const, 'No completed tasks match this filter.'],
  ])('shows the %s empty state', (filter, message) => {
    render(
      <TaskList
        filter={filter}
        today="2026-11-27"
        tasks={[]}
        onToggleCompletion={() => undefined}
        onEdit={() => undefined}
        onDelete={() => undefined}
      />,
    );

    expect(screen.getByRole('status')).toHaveTextContent(message);
    expect(screen.queryByRole('list', { name: 'Saved tasks' }))
      .not.toBeInTheDocument();
  });

  /**
   * run_id: 28e480edc100444a9a45357f6e97dcb1; task_id: TASK-006;
   * AC-014: verifies task cards render no-due-date copy, metadata tags,
   * accessible action labels, and overdue states.
   */
  it('renders task metadata, no-due-date copy, actions, and overdue states', () => {
    const onToggleCompletion = jest.fn();
    const onEdit = jest.fn();
    const onDelete = jest.fn();

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
        onToggleCompletion={onToggleCompletion}
        onEdit={onEdit}
        onDelete={onDelete}
      />,
    );

    const list = screen.getByRole('list', { name: 'Saved tasks' });
    const items = screen.getAllByRole('listitem');

    expect(items[0]).toHaveClass('task-card-overdue');
    expect(items[0]).toHaveAttribute('data-overdue', 'true');
    expect(items[0]).toHaveTextContent('Active overdue');
    expect(items[1]).toHaveClass('task-card-completed');
    expect(items[1]).toHaveAttribute('data-overdue', 'false');
    expect(items[2]).toHaveClass('task-card-active');
    expect(items[2]).toHaveAttribute('data-overdue', 'false');
    expect(within(list).getByText('No due date')).toBeInTheDocument();
    expect(within(list).getByText('Medium')).toBeInTheDocument();
    expect(within(items[0]).getByRole('button', { name: 'Mark complete' }))
      .toBeInTheDocument();
    expect(within(items[0]).getByRole('button', { name: 'Edit task' }))
      .toBeInTheDocument();
    expect(within(items[0]).getByRole('button', { name: 'Delete task' }))
      .toBeInTheDocument();

    fireEvent.click(within(items[0]).getByRole('button', { name: 'Mark complete' }));
    fireEvent.click(within(items[0]).getByRole('button', { name: 'Edit task' }));
    fireEvent.click(within(items[0]).getByRole('button', { name: 'Delete task' }));

    expect(onToggleCompletion).toHaveBeenCalledWith('task-1');
    expect(onEdit).toHaveBeenCalledWith('task-1');
    expect(onDelete).toHaveBeenCalledWith('task-1');
  });
});
