import { useState } from 'react';

import LocalDataNotice from './components/privacy/LocalDataNotice';
import DeleteTaskDialog from './components/tasks/DeleteTaskDialog';
import TaskForm from './components/tasks/TaskForm';
import TaskFilters from './components/tasks/TaskFilters';
import TaskList from './components/tasks/TaskList';
import TaskSummary from './components/tasks/TaskSummary';
import { useTasks } from './hooks/useTasks';

type NavigationTarget = 'today' | 'tasks' | 'localData';
type ThemeMode = 'light' | 'calm';
type Persona = 'planner' | 'caretaker' | 'student';

type NavigationItem = {
  id: NavigationTarget;
  label: string;
  description: string;
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

const personaLabels: Record<Persona, string> = {
  planner: 'Planner',
  caretaker: 'Caretaker',
  student: 'Student',
};

export default function App() {
  const [activeTarget, setActiveTarget] = useState<NavigationTarget>('today');
  const [persona, setPersona] = useState<Persona>('planner');
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');
  const [taskFeedback, setTaskFeedback] = useState(
    'Task workspace ready for keyboard use.',
  );
  const tasksState = useTasks();
  const activeNavigation = navigationItems.find(
    (item) => item.id === activeTarget,
  );
  const currentSectionTitle = activeNavigation?.label ?? 'Today';
  const pendingDeleteTitle = tasksState.pendingDeleteTarget?.title ?? '';
  const visibleTaskFeedback = tasksState.persistenceError ?? taskFeedback;

  const handleCreateTask: typeof tasksState.createTask = (input) => {
    const didCreate = tasksState.createTask(input);

    setTaskFeedback(
      didCreate
        ? `Task "${input.title.trim()}" saved.`
        : 'Enter a task title before saving.',
    );

    return didCreate;
  };

  const handleUpdateTask: typeof tasksState.updateTask = (input) => {
    const didUpdate = tasksState.updateTask(input);
    const updatedTitle = input.title?.trim() || tasksState.editTarget?.title;

    setTaskFeedback(
      didUpdate
        ? `Task "${updatedTitle}" updated.`
        : 'Enter a task title before saving changes.',
    );

    return didUpdate;
  };

  const handleCancelEdit = (): void => {
    tasksState.cancelEdit();
    setTaskFeedback('Task editing canceled.');
  };

  const handleFilterChange: typeof tasksState.setFilter = (filter) => {
    tasksState.setFilter(filter);
    setTaskFeedback(`Showing ${filter} tasks.`);
  };

  const handleToggleCompletion: typeof tasksState.toggleTaskCompletion = (
    taskId,
  ) => {
    const task = tasksState.tasks.find((savedTask) => savedTask.id === taskId);
    const didToggle = tasksState.toggleTaskCompletion(taskId);

    if (didToggle && task !== undefined) {
      setTaskFeedback(
        task.completed
          ? `Task "${task.title}" marked active.`
          : `Task "${task.title}" marked complete.`,
      );
    }

    return didToggle;
  };

  const handleStartEdit: typeof tasksState.startEdit = (taskId) => {
    const task = tasksState.tasks.find((savedTask) => savedTask.id === taskId);
    const didStart = tasksState.startEdit(taskId);

    if (didStart && task !== undefined) {
      setTaskFeedback(`Editing task "${task.title}".`);
    }

    return didStart;
  };

  const handleRequestDelete: typeof tasksState.requestDelete = (taskId) => {
    const task = tasksState.tasks.find((savedTask) => savedTask.id === taskId);
    const didRequest = tasksState.requestDelete(taskId);

    if (didRequest && task !== undefined) {
      setTaskFeedback(`Delete confirmation opened for "${task.title}".`);
    }

    return didRequest;
  };

  const handleCancelDelete = (): void => {
    tasksState.cancelDelete();
    setTaskFeedback('Task deletion canceled.');
  };

  const handleConfirmDelete = (): void => {
    const didDelete = tasksState.confirmDelete();

    if (didDelete) {
      setTaskFeedback(`Task "${pendingDeleteTitle}" deleted.`);
    }
  };

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
              Create, edit, and review local tasks without accounts or a backend
              service.
            </p>
            <TaskSummary counts={tasksState.counts} />
          </section>

          <LocalDataNotice />

          <section
            className="content-grid"
            aria-label="Task editor and saved tasks"
          >
            <TaskForm
              editTarget={tasksState.editTarget}
              validationErrors={tasksState.validationErrors}
              onCreateTask={handleCreateTask}
              onUpdateTask={handleUpdateTask}
              onCancelEdit={handleCancelEdit}
            />

            <article
              className="task-list-panel"
              aria-labelledby="task-list-heading"
            >
              <p className="section-kicker">Task list</p>
              <h3 id="task-list-heading">Saved tasks</h3>
              <p className="task-feedback" role="status" aria-live="polite">
                {visibleTaskFeedback}
              </p>
              <TaskFilters
                activeFilter={tasksState.filter}
                counts={tasksState.counts}
                visibleCount={tasksState.visibleTasks.length}
                onFilterChange={handleFilterChange}
              />
              <TaskList
                filter={tasksState.filter}
                tasks={tasksState.visibleTasks}
                onToggleCompletion={handleToggleCompletion}
                onEdit={handleStartEdit}
                onDelete={handleRequestDelete}
              />
            </article>
          </section>
        </main>
      </div>

      <DeleteTaskDialog
        task={tasksState.pendingDeleteTarget}
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
