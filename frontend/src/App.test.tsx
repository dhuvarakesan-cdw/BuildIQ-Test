import { fireEvent, render, screen, within } from '@testing-library/react';

import App from './App';

describe('App foundation shell', () => {
  /**
   * run_id: 35306f6022d14dfd8e12d63556bf03ad; task_id: TASK-004;
   * AC-006: verifies the product shell, skip link, and main landmark render.
   */
  it('renders the product shell with accessible navigation landmarks', () => {
    render(<App />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Daily Tasks' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Skip to main content' }))
      .toHaveAttribute('href', '#main-content');
    expect(screen.getByRole('navigation', { name: 'Primary' }))
      .toBeInTheDocument();
    expect(screen.getByRole('main', { name: 'Today' })).toHaveAttribute(
      'id',
      'main-content',
    );
  });

  /**
   * run_id: 35306f6022d14dfd8e12d63556bf03ad; task_id: TASK-004;
   * AC-006: verifies no backend endpoint, auth UI, or account flow is rendered.
   */
  it('omits backend endpoints, authentication controls, and account flows', () => {
    const { container } = render(<App />);

    expect(container.querySelector(
      'a[href^="/api"], a[href^="http"], form[action], button[formaction]',
    )).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/email|password/i)).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', {
        name: /sign in|log in|log out|create account|account settings/i,
      }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', {
        name: /sign in|log in|create account|profile|account/i,
      }),
    ).not.toBeInTheDocument();
  });

  /**
   * run_id: 1490a92254cb4fdaaa8bd2b6c9befd11; task_id: TASK-003;
   * AC-006: verifies the UI explains browser-profile localStorage persistence
   * and confirms there is no backend service, account, auth, or sync behavior.
   */
  it('communicates local-only browser-profile storage and no backend use', () => {
    render(<App />);

    expect(screen.getByRole('heading', {
      level: 3,
      name: 'Stored only in this browser profile',
    })).toBeInTheDocument();
    expect(screen.getByText(
      /saved in this browser profile with localStorage under the ptma\.tasks\.v1 key/i,
    )).toBeInTheDocument();
    expect(screen.getByText(
      /no backend services, accounts, authentication, analytics, telemetry, or cross-device sync are used/i,
    )).toBeInTheDocument();
    expect(screen.getByText(
      /saved tasks remain after refresh, and confirmed deletions remain deleted after refresh/i,
    )).toBeInTheDocument();
    expect(screen.getByText(
      /not available from another browser profile or another device/i,
    )).toBeInTheDocument();
  });

  /**
   * run_id: 28e480edc100444a9a45357f6e97dcb1; task_id: TASK-003;
   * AC-006: verifies a valid form submission creates a task with entered
   * fields, then edit mode updates the saved task values.
   */
  it('creates and updates a task from submitted form fields', () => {
    render(<App />);

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
    fireEvent.click(screen.getByRole('button', { name: 'Save task' }));

    const taskList = screen.getByRole('list', { name: 'Saved tasks' });
    expect(within(taskList).getByRole('heading', { name: 'Plan launch' }))
      .toBeInTheDocument();
    expect(within(taskList).getByText('Confirm room setup')).toBeInTheDocument();
    expect(within(taskList).getByText('2026-12-02')).toBeInTheDocument();
    expect(within(taskList).getByText('High')).toBeInTheDocument();

    fireEvent.click(within(taskList).getByRole('button', { name: 'Edit task' }));
    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'Finalize launch plan' },
    });
    fireEvent.click(screen.getByLabelText('Completed'));
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(within(taskList).getByRole('heading', {
      name: 'Finalize launch plan',
    })).toBeInTheDocument();
    expect(within(taskList).queryByRole('heading', { name: 'Plan launch' }))
      .not.toBeInTheDocument();
    expect(within(taskList).getByText('Completed')).toBeInTheDocument();
  });

  /**
   * run_id: 28e480edc100444a9a45357f6e97dcb1; task_id: TASK-003;
   * AC-007: verifies empty title submission shows accessible validation and
   * does not create a saved task.
   */
  it('shows validation and skips saving when the title is empty', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'Save task' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Title is required.');
    expect(screen.getByLabelText('Title')).toHaveAttribute(
      'aria-invalid',
      'true',
    );
    expect(screen.queryByRole('list', { name: 'Saved tasks' }))
      .not.toBeInTheDocument();
    expect(screen.getByText('No tasks saved yet.')).toBeInTheDocument();
  });

  /**
   * run_id: 28e480edc100444a9a45357f6e97dcb1; task_id: TASK-003;
   * AC-008: verifies canceling edit returns to create mode and leaves the
   * original task values unchanged.
   */
  it('cancels edit mode without saving edited values', () => {
    render(<App />);

    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'Draft agenda' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save task' }));

    const taskList = screen.getByRole('list', { name: 'Saved tasks' });
    fireEvent.click(within(taskList).getByRole('button', { name: 'Edit task' }));
    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'Changed agenda' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Cancel edit' }));

    expect(screen.getByRole('button', { name: 'Save task' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Save changes' }))
      .not.toBeInTheDocument();
    expect(within(taskList).getByRole('heading', { name: 'Draft agenda' }))
      .toBeInTheDocument();
    expect(within(taskList).queryByRole('heading', { name: 'Changed agenda' }))
      .not.toBeInTheDocument();
    expect(screen.getByLabelText('Title')).toHaveValue('');
  });

  /**
   * run_id: 28e480edc100444a9a45357f6e97dcb1; task_id: TASK-004;
   * AC-009: verifies all, active, and completed filters show matching tasks
   * and a filter-specific empty state when no task matches.
   */
  it('filters saved tasks and shows filter-specific empty states', () => {
    render(<App />);

    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'Call supplier' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save task' }));
    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'Archive receipts' },
    });
    fireEvent.click(screen.getByLabelText('Completed'));
    fireEvent.click(screen.getByRole('button', { name: 'Save task' }));

    fireEvent.click(screen.getByRole('button', { name: /Active/ }));
    expect(screen.getByRole('button', { name: /Active/ }))
      .toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('heading', { name: 'Call supplier' }))
      .toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Archive receipts' }))
      .not.toBeInTheDocument();
    expect(screen.getByText('Showing 1 active of 2 total tasks.'))
      .toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Completed/ }));
    expect(screen.getByRole('heading', { name: 'Archive receipts' }))
      .toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Call supplier' }))
      .not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Mark active' }));
    expect(screen.getByText('No completed tasks match this filter.'))
      .toBeInTheDocument();
  });

  /**
   * run_id: 28e480edc100444a9a45357f6e97dcb1; task_id: TASK-004;
   * AC-010: verifies completion toggling, editing entry, and deletion only
   * after confirmation while cancel and Escape keep the task.
   */
  it('toggles completion, enters edit mode, and deletes only after confirmation', () => {
    render(<App />);

    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'Review proposal' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save task' }));

    const taskList = screen.getByRole('list', { name: 'Saved tasks' });
    fireEvent.click(within(taskList).getByRole('button', { name: 'Mark complete' }));
    expect(within(taskList).getByText('Completed')).toBeInTheDocument();
    fireEvent.click(within(taskList).getByRole('button', { name: 'Mark active' }));
    expect(within(taskList).getByText('Active')).toBeInTheDocument();

    fireEvent.click(within(taskList).getByRole('button', { name: 'Edit task' }));
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel edit' }));

    fireEvent.click(within(taskList).getByRole('button', { name: 'Delete task' }));
    let dialog = screen.getByRole('dialog', { name: 'Delete "Review proposal"?' });
    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));
    expect(screen.getByRole('heading', { name: 'Review proposal' }))
      .toBeInTheDocument();

    fireEvent.click(within(taskList).getByRole('button', { name: 'Delete task' }));
    dialog = screen.getByRole('dialog', { name: 'Delete "Review proposal"?' });
    fireEvent.keyDown(dialog, { key: 'Escape' });
    expect(screen.getByRole('heading', { name: 'Review proposal' }))
      .toBeInTheDocument();

    fireEvent.click(within(taskList).getByRole('button', { name: 'Delete task' }));
    dialog = screen.getByRole('dialog', { name: 'Delete "Review proposal"?' });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Delete task' }));
    expect(screen.queryByRole('heading', { name: 'Review proposal' }))
      .not.toBeInTheDocument();
    expect(screen.getByText('No tasks saved yet.')).toBeInTheDocument();
  });
});
