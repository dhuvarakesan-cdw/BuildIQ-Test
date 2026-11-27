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
});
