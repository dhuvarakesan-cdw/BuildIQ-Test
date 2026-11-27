import { Task, isTaskOverdue } from '../../domain/task';

interface TaskItemProps {
  task: Task;
  today?: Date | string;
  onToggleCompletion: (taskId: Task['id']) => void;
  onEdit: (taskId: Task['id']) => void;
  onDelete: (taskId: Task['id']) => void;
}

const priorityLabels: Record<Task['priority'], string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

const priorityClassNames: Record<Task['priority'], string> = {
  low: 'task-tag priority-low',
  medium: 'task-tag priority-medium',
  high: 'task-tag priority-high',
};

const formatDueDate = (dueDate: string): string => (
  dueDate === '' ? 'No due date' : dueDate
);

export default function TaskItem({
  task,
  today,
  onToggleCompletion,
  onEdit,
  onDelete,
}: TaskItemProps) {
  const isOverdue = isTaskOverdue(task, today);
  const stateClassName = task.completed
    ? 'task-card task-card-completed'
    : isOverdue
      ? 'task-card task-card-overdue'
      : 'task-card task-card-active';
  const statusText = task.completed
    ? 'Completed'
    : isOverdue
      ? 'Active overdue'
      : 'Active';
  const statusPillText = task.completed
    ? 'Done'
    : isOverdue
      ? 'Overdue'
      : 'Open';

  return (
    <li className={stateClassName} data-overdue={isOverdue ? 'true' : 'false'}>
      <div className="task-card-header">
        <div className="task-title-block">
          <h4>{task.title}</h4>
          <p className={task.description === '' ? 'task-muted-copy' : undefined}>
            {task.description === '' ? 'No description' : task.description}
          </p>
        </div>

        <span className={task.completed ? 'status-pill completed' : 'status-pill active'}>
          {statusPillText}
        </span>
      </div>

      <dl className="task-metadata" aria-label={`${task.title} details`}>
        <div>
          <dt>Due</dt>
          <dd className={isOverdue ? 'overdue-copy' : undefined}>
            {formatDueDate(task.dueDate)}
          </dd>
        </div>
        <div>
          <dt>Priority</dt>
          <dd>
            <span className={priorityClassNames[task.priority]}>
              {priorityLabels[task.priority]}
            </span>
          </dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>{statusText}</dd>
        </div>
      </dl>

      <div className="task-card-actions" aria-label={`${task.title} actions`}>
        <button
          type="button"
          className="secondary-action"
          onClick={() => {
            onToggleCompletion(task.id);
          }}
        >
          {task.completed ? 'Mark active' : 'Mark complete'}
        </button>
        <button
          type="button"
          className="secondary-action"
          onClick={() => {
            onEdit(task.id);
          }}
        >
          Edit task
        </button>
        <button
          type="button"
          className="danger-action"
          onClick={() => {
            onDelete(task.id);
          }}
        >
          Delete task
        </button>
      </div>
    </li>
  );
}
