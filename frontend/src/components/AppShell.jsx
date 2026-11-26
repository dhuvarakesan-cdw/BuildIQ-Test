const navigationItems = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'tasks', label: 'Task list' },
  { id: 'create', label: 'Create task' },
];

export default function AppShell({ activeTarget, children, onNavigate }) {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-task-content">
        Skip to main task content
      </a>

      <aside className="shell-sidebar" aria-label="Application">
        <div className="brand-lockup">
          <p className="brand-kicker">Local task tracker</p>
          <h1>Daily Tasks</h1>
        </div>

        <nav className="primary-nav" aria-label="Primary">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className="nav-target"
              aria-current={activeTarget === item.id ? 'page' : undefined}
              onClick={() => onNavigate(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <div className="shell-workspace">
        <p className="storage-note">
          Tasks stay in this browser with localStorage and clearing browser
          storage removes saved tasks.
        </p>

        <main id="main-task-content" className="task-content" tabIndex="-1">
          {children}
        </main>
      </div>
    </div>
  );
}
