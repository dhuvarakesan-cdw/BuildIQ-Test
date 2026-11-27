import { useState } from 'react';

type NavigationTarget = 'today' | 'tasks' | 'localData';
type ThemeMode = 'light' | 'calm';
type Persona = 'planner' | 'caretaker' | 'student';

type NavigationItem = {
  id: NavigationTarget;
  label: string;
  description: string;
};

type TaskHighlight = {
  label: string;
  value: string;
};

const navigationItems: NavigationItem[] = [
  {
    id: 'today',
    label: 'Today',
    description: 'Current focus and quick task review',
  },
  {
    id: 'tasks',
    label: 'Tasks',
    description: 'Task placeholder ready for local entries',
  },
  {
    id: 'localData',
    label: 'Local data',
    description: 'Browser-only storage status and controls',
  },
];

const taskHighlights: TaskHighlight[] = [
  { label: 'Pinned tasks', value: '0' },
  { label: 'Due today', value: '0' },
  { label: 'Stored locally', value: 'Ready' },
];

const personaLabels: Record<Persona, string> = {
  planner: 'Planner',
  caretaker: 'Caretaker',
  student: 'Student',
};

export default function App() {
  const [activeTarget, setActiveTarget] = useState<NavigationTarget>('today');
  const [persona, setPersona] = useState<Persona>('planner');
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');
  const activeNavigation = navigationItems.find(
    (item) => item.id === activeTarget,
  );
  const currentSectionTitle = activeNavigation?.label ?? 'Today';

  return (
    <div className="app-shell" data-theme={themeMode}>
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      <header className="topbar" aria-label="Application header">
        <div className="brand-lockup" aria-label="Daily Tasks home">
          <span className="brand-mark" aria-hidden="true">
            DT
          </span>
          <div>
            <p className="brand-kicker">Local task tracker</p>
            <h1>Daily Tasks</h1>
          </div>
        </div>

        <div className="topbar-controls" aria-label="Shell preferences">
          <label className="field-control" htmlFor="persona-select">
            <span>Persona</span>
            <select
              id="persona-select"
              value={persona}
              onChange={(event) => setPersona(event.target.value as Persona)}
            >
              <option value="planner">{personaLabels.planner}</option>
              <option value="caretaker">{personaLabels.caretaker}</option>
              <option value="student">{personaLabels.student}</option>
            </select>
          </label>

          <button
            type="button"
            className="theme-toggle"
            aria-pressed={themeMode === 'calm'}
            onClick={() => {
              setThemeMode((current) => (current === 'light' ? 'calm' : 'light'));
            }}
          >
            Calm theme
          </button>
        </div>
      </header>

      <div className="shell-layout">
        <aside className="sidebar" aria-label="Workspace navigation">
          <nav className="primary-nav" aria-label="Primary">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className="nav-button"
                aria-current={activeTarget === item.id ? 'page' : undefined}
                onClick={() => setActiveTarget(item.id)}
              >
                <span className="nav-label">{item.label}</span>
                <span className="nav-description">{item.description}</span>
              </button>
            ))}
          </nav>
        </aside>

        <main
          id="main-content"
          className="main-content"
          aria-labelledby="main-heading"
          tabIndex={-1}
        >
          <section className="hero-panel" aria-labelledby="main-heading">
            <p className="section-kicker">{personaLabels[persona]} workspace</p>
            <h2 id="main-heading">{currentSectionTitle}</h2>
            <p className="section-lead">
              A responsive shell for local task planning, with room for task screens
              and storage controls as the app grows.
            </p>
          </section>

          <section
            className="content-grid"
            aria-label="Task and local data placeholders"
          >
            <article
              className="placeholder-card"
              aria-labelledby="task-placeholder-heading"
            >
              <p className="section-kicker">Task placeholder</p>
              <h3 id="task-placeholder-heading">Tasks will appear here</h3>
              <p>
                This area is reserved for creating, reviewing, and completing tasks
                without adding accounts or a backend service.
              </p>

              <dl className="task-metrics" aria-label="Current task summary">
                {taskHighlights.map((item) => (
                  <div key={item.label}>
                    <dt>{item.label}</dt>
                    <dd>{item.value}</dd>
                  </div>
                ))}
              </dl>
            </article>

            <article
              className="placeholder-card"
              aria-labelledby="local-data-heading"
            >
              <p className="section-kicker">Local data placeholder</p>
              <h3 id="local-data-heading">Browser storage only</h3>
              <p>
                Saved task data will stay on this device through browser storage.
                Clearing site data will remove the saved task list.
              </p>

              <div className="storage-status" role="status" aria-live="polite">
                <span aria-hidden="true" />
                Local storage connection ready
              </div>
            </article>
          </section>
        </main>
      </div>
    </div>
  );
}
