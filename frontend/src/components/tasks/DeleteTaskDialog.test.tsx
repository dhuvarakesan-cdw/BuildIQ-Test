import { fireEvent, render, screen, within } from '@testing-library/react';

import { Task } from '../../domain/task';
import DeleteTaskDialog from './DeleteTaskDialog';

const createTaskFixture = (overrides: Partial<Task> = {}): Task => ({
  id: 'task-1',
  title: 'Review proposal',
  description: '',
  dueDate: '',
  priority: 'medium',
  completed: false,
  createdAt: '2026-11-27T00:00:00.000Z',
  ...overrides,
});

describe('DeleteTaskDialog', () => {
  /**
   * run_id: 28e480edc100444a9a45357f6e97dcb1; task_id: TASK-006;
   * AC-014: verifies no confirmation UI is rendered when there is no pending
   * delete target.
   */
  it('renders nothing without a task target', () => {
    const { container } = render(
      <DeleteTaskDialog
        task={null}
        onCancel={jest.fn()}
        onConfirm={jest.fn()}
      />,
    );

    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  /**
   * run_id: 28e480edc100444a9a45357f6e97dcb1; task_id: TASK-006;
   * AC-014: verifies delete confirmation exposes accessible dialog labels and
   * routes cancel/confirm actions to their callbacks.
   */
  it('renders accessible delete confirmation controls', () => {
    const onCancel = jest.fn();
    const onConfirm = jest.fn();

    render(
      <DeleteTaskDialog
        task={createTaskFixture()}
        onCancel={onCancel}
        onConfirm={onConfirm}
      />,
    );

    const dialog = screen.getByRole('dialog', {
      name: 'Delete "Review proposal"?',
      description: 'This removes the task from this local list after confirmation.',
    });

    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus();

    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));
    fireEvent.click(within(dialog).getByRole('button', { name: 'Delete task' }));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  /**
   * run_id: 28e480edc100444a9a45357f6e97dcb1; task_id: TASK-006;
   * AC-014: verifies keyboard cancellation and focus trapping keep destructive
   * confirmation accessible without mutating task state directly.
   */
  it('supports Escape cancellation and wraps focus between dialog buttons', () => {
    const onCancel = jest.fn();

    render(
      <DeleteTaskDialog
        task={createTaskFixture()}
        onCancel={onCancel}
        onConfirm={jest.fn()}
      />,
    );

    const dialog = screen.getByRole('dialog', {
      name: 'Delete "Review proposal"?',
    });
    const cancelButton = within(dialog).getByRole('button', { name: 'Cancel' });
    const confirmButton = within(dialog).getByRole('button', {
      name: 'Delete task',
    });

    expect(cancelButton).toHaveFocus();

    fireEvent.keyDown(dialog, { key: 'Tab', shiftKey: true });
    expect(confirmButton).toHaveFocus();

    fireEvent.keyDown(dialog, { key: 'Tab' });
    expect(cancelButton).toHaveFocus();

    fireEvent.keyDown(dialog, { key: 'Escape' });
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
