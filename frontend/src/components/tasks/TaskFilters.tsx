import { TASK_FILTERS, TaskFilter } from '../../domain/task';
import { TaskCounts } from '../../hooks/useTasks';

interface TaskFiltersProps {
  activeFilter: TaskFilter;
  counts: TaskCounts;
  visibleCount: number;
  onFilterChange: (filter: TaskFilter) => void;
}

const filterLabels: Record<TaskFilter, string> = {
  all: 'All',
  active: 'Active',
  completed: 'Completed',
};

export default function TaskFilters({
  activeFilter,
  counts,
  visibleCount,
  onFilterChange,
}: TaskFiltersProps) {
  const activeFilterLabel = filterLabels[activeFilter].toLowerCase();

  return (
    <div className="task-filter-block">
      <div
        className="task-filters"
        role="group"
        aria-label="Filter saved tasks"
      >
        {TASK_FILTERS.map((filter) => (
          <button
            key={filter}
            type="button"
            className="filter-button"
            aria-pressed={activeFilter === filter}
            onClick={() => {
              onFilterChange(filter);
            }}
          >
            <span>{filterLabels[filter]}</span>
            <span className="filter-count">{counts[filter]}</span>
          </button>
        ))}
      </div>

      <p className="filter-summary" aria-live="polite">
        Showing {visibleCount} {activeFilterLabel} of {counts.all} total tasks.
      </p>
    </div>
  );
}
