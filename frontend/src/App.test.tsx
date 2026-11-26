import { render, screen } from '@testing-library/react';

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

    expect(
      container.querySelector(
        'a[href^="/api"], a[href^="http"], form[action], button[formaction]',
      ),
    ).not.toBeInTheDocument();
    expect(container.querySelector('form')).not.toBeInTheDocument();
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
});
