import { render, screen } from '@testing-library/react';

import LocalDataNotice from './LocalDataNotice';

describe('LocalDataNotice', () => {
  /**
   * run_id: 1490a92254cb4fdaaa8bd2b6c9befd11; task_id: TASK-005;
   * AC-008: verifies the privacy notice says tasks stay in browser-profile
   * localStorage and are not sent to a backend, analytics, or telemetry.
   */
  it('communicates browser-profile localStorage and no backend transmission', () => {
    render(<LocalDataNotice />);

    expect(screen.getByRole('heading', {
      level: 3,
      name: 'Stored only in this browser profile',
    })).toBeInTheDocument();
    expect(screen.getByText(
      /tasks are saved in this browser profile with localStorage under the ptma\.tasks\.v1 key/i,
    )).toBeInTheDocument();
    expect(screen.getByText(
      /no backend services, accounts, authentication, analytics, telemetry, or cross-device sync are used/i,
    )).toBeInTheDocument();
    expect(screen.getByText(
      /saved tasks remain after refresh, and confirmed deletions remain deleted after refresh/i,
    )).toBeInTheDocument();
    expect(screen.getByText(
      /tasks are not available from another browser profile or another device/i,
    )).toBeInTheDocument();
  });
});
