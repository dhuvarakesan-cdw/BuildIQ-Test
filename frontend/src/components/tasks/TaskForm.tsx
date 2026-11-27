import { FormEvent, useEffect, useId, useState } from 'react';

import {
  TASK_PRIORITIES,
  Task,
  TaskInput,
  TaskPriority,
  TaskValidationErrors,
} from '../../domain/task';

interface TaskFormProps {
  editTarget: Task | null;
  validationErrors: TaskValidationErrors;
  onCreateTask: (input: TaskInput) => boolean;
  onUpdateTask: (input: TaskInput) => boolean;
  onCancelEdit: () => void;
}

interface TaskFormDraft {
  title: string;
  description: string;
  dueDate: string;
  priority: TaskPriority;
  completed: boolean;
}

const emptyDraft: TaskFormDraft = {
  title: '',
  description: '',
  dueDate: '',
  priority: 'medium',
  completed: false,
};

const priorityLabels: Record<TaskPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

const toDraft = (task: Task | null): TaskFormDraft => {
  if (task === null) {
    return emptyDraft;
  }

  return {
    title: task.title,
    description: task.description,
    dueDate: task.dueDate,
    priority: task.priority,
    completed: task.completed,
  };
};

export default function TaskForm({
  editTarget,
  validationErrors,
  onCreateTask,
  onUpdateTask,
  onCancelEdit,
}: TaskFormProps) {
  const titleId = useId();
  const descriptionId = useId();
  const dueDateId = useId();
  const priorityId = useId();
  const completedId = useId();
  const titleErrorId = useId();
  const [draft, setDraft] = useState<TaskFormDraft>(() => toDraft(editTarget));
  const isEditing = editTarget !== null;
  const titleError = validationErrors.title;

  useEffect(() => {
    setDraft(toDraft(editTarget));
  }, [editTarget]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    const didSave = isEditing
      ? onUpdateTask(draft)
      : onCreateTask(draft);

    if (didSave && !isEditing) {
      setDraft(emptyDraft);
    }
  };

  return (
    <form className="task-form" noValidate onSubmit={handleSubmit}>
      <div className="task-form-heading">
        <p className="section-kicker">
          {isEditing ? 'Edit task' : 'Create task'}
        </p>
        <h3>{isEditing ? 'Update task details' : 'Add a task'}</h3>
      </div>

      <div className="form-field">
        <label htmlFor={titleId}>Title</label>
        <input
          id={titleId}
          type="text"
          value={draft.title}
          aria-invalid={titleError === undefined ? undefined : true}
          aria-describedby={titleError === undefined ? undefined : titleErrorId}
          onChange={(event) => {
            setDraft((current) => ({
              ...current,
              title: event.target.value,
            }));
          }}
        />
        {titleError === undefined ? null : (
          <p id={titleErrorId} className="field-error" role="alert">
            {titleError}
          </p>
        )}
      </div>

      <div className="form-field">
        <label htmlFor={descriptionId}>Description</label>
        <textarea
          id={descriptionId}
          value={draft.description}
          rows={4}
          onChange={(event) => {
            setDraft((current) => ({
              ...current,
              description: event.target.value,
            }));
          }}
        />
      </div>

      <div className="form-row">
        <div className="form-field">
          <label htmlFor={dueDateId}>Due date</label>
          <input
            id={dueDateId}
            type="date"
            value={draft.dueDate}
            onChange={(event) => {
              setDraft((current) => ({
                ...current,
                dueDate: event.target.value,
              }));
            }}
          />
        </div>

        <div className="form-field">
          <label htmlFor={priorityId}>Priority</label>
          <select
            id={priorityId}
            value={draft.priority}
            onChange={(event) => {
              setDraft((current) => ({
                ...current,
                priority: event.target.value as TaskPriority,
              }));
            }}
          >
            {TASK_PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {priorityLabels[priority]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <label className="checkbox-field" htmlFor={completedId}>
        <input
          id={completedId}
          type="checkbox"
          checked={draft.completed}
          onChange={(event) => {
            setDraft((current) => ({
              ...current,
              completed: event.target.checked,
            }));
          }}
        />
        Completed
      </label>

      <div className="form-actions">
        <button type="submit" className="primary-action">
          {isEditing ? 'Save changes' : 'Save task'}
        </button>
        {isEditing ? (
          <button type="button" className="secondary-action" onClick={onCancelEdit}>
            Cancel edit
          </button>
        ) : null}
      </div>
    </form>
  );
}
