import { KeyboardEvent, useEffect, useId, useRef } from 'react';

import { Task } from '../../domain/task';

interface DeleteTaskDialogProps {
  task: Task | null;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function DeleteTaskDialog({
  task,
  onCancel,
  onConfirm,
}: DeleteTaskDialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const cancelButtonRef = useRef<HTMLButtonElement | null>(null);
  const confirmButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (task !== null) {
      cancelButtonRef.current?.focus();
    }
  }, [task]);

  if (task === null) {
    return null;
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (event.key === 'Escape') {
      event.preventDefault();
      onCancel();
      return;
    }

    if (event.key !== 'Tab') {
      return;
    }

    const firstButton = cancelButtonRef.current;
    const lastButton = confirmButtonRef.current;

    if (firstButton === null || lastButton === null) {
      return;
    }

    if (event.shiftKey && document.activeElement === firstButton) {
      event.preventDefault();
      lastButton.focus();
      return;
    }

    if (!event.shiftKey && document.activeElement === lastButton) {
      event.preventDefault();
      firstButton.focus();
    }
  };

  return (
    <div className="dialog-backdrop">
      <div
        className="delete-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        onKeyDown={handleKeyDown}
      >
        <div>
          <p className="section-kicker">Confirm deletion</p>
          <h3 id={titleId}>Delete "{task.title}"?</h3>
          <p id={descriptionId}>
            This removes the task from this local list after confirmation.
          </p>
        </div>

        <div className="dialog-actions">
          <button
            ref={cancelButtonRef}
            type="button"
            className="secondary-action"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            ref={confirmButtonRef}
            type="button"
            className="danger-action"
            onClick={onConfirm}
          >
            Delete task
          </button>
        </div>
      </div>
    </div>
  );
}
