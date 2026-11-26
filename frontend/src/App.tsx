import { useState } from 'react';

import AppShell from './components/AppShell.jsx';

type TaskViewId = 'dashboard' | 'tasks' | 'create';

type TaskView = {
  title: string;
  lead: string;
  detail: string;
};

const taskViews: Record<TaskViewId, TaskView> = {
  dashboard: {
    title: 'Dashboard',
    lead: 'A focused summary for today, built around tasks saved only on this device.',
    detail: 'Upcoming work, completed counts, and local progress can live here as the task model grows.',
  },
  tasks: {
    title: 'Task list',
    lead: 'A local list area for saved browser tasks.',
    detail: 'The shell is ready for filtering, reviewing, and updating tasks without adding a backend.',
  },
  create: {
    title: 'Create task',
    lead: 'A task creation area for this browser.',
    detail: 'Future form fields can attach to localStorage while keeping the page navigation intact.',
  },
};

export default function App() {
  const [activeTarget, setActiveTarget] = useState<TaskViewId>('dashboard');
  const currentView = taskViews[activeTarget];

  return (
    <AppShell activeTarget={activeTarget} onNavigate={setActiveTarget}>
      <section className="view-panel" aria-labelledby="current-view-heading">
        <p className="view-kicker">Frontend only</p>
        <h2 id="current-view-heading">{currentView.title}</h2>
        <p className="view-lead">{currentView.lead}</p>
        <p>{currentView.detail}</p>
      </section>
    </AppShell>
  );
}
