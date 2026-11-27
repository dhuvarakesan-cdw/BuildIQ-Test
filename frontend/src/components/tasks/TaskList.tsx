import { Task, TaskFilter } from '../../domain/task';
import TaskItem from './TaskItem';

interface TaskListProps {
  filter: TaskFilter;
  tasks: Task[];
  today?: Date | string;
  onToggleCompletion: (taskId: Task['id']) => void;
  onEdit: (taskId: Task['id']) => void;
  onDelete: (taskId: Task['id']) => void;
}

const emptyMessages: Record<TaskFilter, string> = {
  all: 'No tasks saved yet.',
  active: 'No active tasks match this filter.',
  completed: 'No completed tasks match this filter.',
};

export default function TaskList({
  filter,
  tasks,
  today,
  onToggleCompletion,
  onEdit,
  onDelete,
}: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <p className="empty-state" role="status">
        {emptyMessages[filter]}
      </p>
    );
  }

  return (
    <ul className="task-list" aria-label="Saved tasks">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          today={today}
          onToggleCompletion={onToggleCompletion}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}
