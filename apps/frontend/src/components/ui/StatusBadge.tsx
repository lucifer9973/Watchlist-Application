import { cn } from "../../lib/utils";
import type { WatchStatus } from "../../types";

type StatusBadgeProps = {
  status: WatchStatus;
  className?: string;
};

export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const styles = {
    PLANNED: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
    WATCHING: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800",
    COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800"
  };

  const labels = {
    PLANNED: "Planned",
    WATCHING: "Watching",
    COMPLETED: "Completed"
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        styles[status],
        className
      )}
    >
      {labels[status]}
    </span>
  );
};
