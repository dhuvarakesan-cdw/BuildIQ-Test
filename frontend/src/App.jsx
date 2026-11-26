const navigationItems = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'tasks', label: 'Tasks' },
  { id: 'create', label: 'Create' },
];

export default function App() {
  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Local task workspace</p>
          <h1>Personal Task Manager</h1>
        </div>
        <nav className="app-nav" aria-label="Primary">
          {navigationItems.map((item) => (
            <a key={item.id} href={`#${item.id}`}>
              {item.label}
            </a>
          ))}
        </nav>
      </header>

      <section className="intro-panel" aria-labelledby="foundation-heading">
        <div>
          <h2 id="foundation-heading">Frontend foundation ready</h2>
          <p>
            Tasks stay in this browser with localStorage. Clearing browser
            storage removes saved tasks.
          </p>
        </div>
        <div className="status-pill" aria-label="Application mode">
          Frontend only
        </div>
      </section>

      <section className="workspace-grid" aria-label="Application areas">
        {navigationItems.map((item) => (
          <article key={item.id} id={item.id} className="workspace-card">
            <h2>{item.label}</h2>
            <p>{getAreaDescription(item.id)}</p>
          </article>
        ))}
      </section>
    </main>
  );
}

function getAreaDescription(areaId) {
  const descriptions = {
    dashboard: 'A future summary area for local task counts and progress.',
    tasks: 'A future list area for saved browser-local tasks.',
    create: 'A future form area for adding a task on this device.',
  };

  return descriptions[areaId];
}
