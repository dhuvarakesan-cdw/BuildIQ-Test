import { TaskCounts } from '../../hooks/useTasks';

interface TaskSummaryProps {
  counts: TaskCounts;
}

interface SummaryItem {
  id: keyof TaskCounts;
  label: string;
}

const summaryItems: SummaryItem[] = [
  { id: 'all', label: 'All tasks' },
  { id: 'active', label: 'Active' },
  { id: 'completed', label: 'Completed' },
  { id: 'overdueActive', label: 'Active overdue' },
];

export default function TaskSummary({ counts }: TaskSummaryProps) {
  return (
    <dl className="task-summary" aria-label="Task summary">
      {summaryItems.map((item) => (
        <div key={item.id} className="summary-tile">
          <dt>{item.label}</dt>
          <dd>{counts[item.id]}</dd>
        </div>
      ))}
    </dl>
  );
}
