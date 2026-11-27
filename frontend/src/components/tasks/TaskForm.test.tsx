import { fireEvent, render, screen } from '@testing-library/react';

import { Task } from '../../domain/task';
import TaskForm from './TaskForm';

const createTaskFixture = (overrides: Partial<Task> = {}): Task => ({
  id: 'task-1',
  title: 'Plan launch',
  description: 'Confirm details',
  dueDate: '2026-12-02',
  priority: 'high',
  completed: false,
  createdAt: '2026-11-27T00:00:00.000Z',
  ...overrides,
});

describe('TaskForm', () => {
  /**
   * run_id: 28e480edc100444a9a45357f6e97dcb1; task_id: TASK-006;
   * AC-014: verifies the form exposes accessible labels and submits the
   * current create draft to the create command.
   */
  it('submits a labeled create form with entered values', () => {
    const onCreateTask = jest.fn(() => true);

    render(
      <TaskForm
        editTarget={null}
        validationErrors={{}}
        onCreateTask={onCreateTask}
        onUpdateTask={jest.fn()}
        onCancelEdit={jest.fn()}
      />,
    );

    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'Plan launch' },
    });
    fireEvent.change(screen.getByLabelText('Description'), {
      target: { value: 'Confirm room setup' },
    });
    fireEvent.change(screen.getByLabelText('Due date'), {
      target: { value: '2026-12-02' },
    });
    fireEvent.change(screen.getByLabelText('Priority'), {
      target: { value: 'high' },
    });
    fireEvent.click(screen.getByLabelText('Completed'));
    fireEvent.click(screen.getByRole('button', { name: 'Save task' }));

    expect(onCreateTask).toHaveBeenCalledWith({
      title: 'Plan launch',
      description: 'Confirm room setup',
      dueDate: '2026-12-02',
      priority: 'high',
      completed: true,
    });
    expect(screen.getByLabelText('Title')).toHaveValue('');
  });

  /**
   * run_id: 28e480edc100444a9a45357f6e97dcb1; task_id: TASK-006;
   * AC-014: verifies visible validation is linked to the title control using
   * alert text, aria-invalid, and aria-describedby.
   */
  it('shows accessible title validation without clearing the draft', () => {
    const onCreateTask = jest.fn(() => false);

    render(
      <TaskForm
        editTarget={null}
        validationErrors={{ title: 'Title is required.' }}
        onCreateTask={onCreateTask}
        onUpdateTask={jest.fn()}
        onCancelEdit={jest.fn()}
      />,
    );

    const titleInput = screen.getByLabelText('Title');
    const alert = screen.getByRole('alert');

    fireEvent.change(titleInput, {
      target: { value: '   ' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save task' }));

    expect(alert).toHaveTextContent('Title is required.');
    expect(titleInput).toHaveAttribute('aria-invalid', 'true');
    expect(titleInput).toHaveAccessibleDescription('Title is required.');
    expect(titleInput).toHaveValue('   ');
    expect(onCreateTask).toHaveBeenCalledWith({
      title: '   ',
      description: '',
      dueDate: '',
      priority: 'medium',
      completed: false,
    });
  });

  /**
   * run_id: 28e480edc100444a9a45357f6e97dcb1; task_id: TASK-006;
   * AC-014: verifies edit mode preloads task values, submits updates, and
   * exposes a non-mutating cancel edit command.
   */
  it('submits and cancels edit mode with prefilled task values', () => {
    const onUpdateTask = jest.fn(() => true);
    const onCancelEdit = jest.fn();

    render(
      <TaskForm
        editTarget={createTaskFixture()}
        validationErrors={{}}
        onCreateTask={jest.fn()}
        onUpdateTask={onUpdateTask}
        onCancelEdit={onCancelEdit}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Update task details' }))
      .toBeInTheDocument();
    expect(screen.getByLabelText('Title')).toHaveValue('Plan launch');
    expect(screen.getByLabelText('Description')).toHaveValue('Confirm details');
    expect(screen.getByLabelText('Due date')).toHaveValue('2026-12-02');
    expect(screen.getByLabelText('Priority')).toHaveValue('high');

    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'Finalize launch plan' },
    });
    fireEvent.click(screen.getByLabelText('Completed'));
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(onUpdateTask).toHaveBeenCalledWith({
      title: 'Finalize launch plan',
      description: 'Confirm details',
      dueDate: '2026-12-02',
      priority: 'high',
      completed: true,
    });

    fireEvent.click(screen.getByRole('button', { name: 'Cancel edit' }));

    expect(onCancelEdit).toHaveBeenCalledTimes(1);
  });
});
