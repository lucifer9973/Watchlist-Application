import type { LucideIcon } from "lucide-react";
import { Button } from "./button";

type EmptyStateProps = {
  title: string;
  description: string;
  icon?: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
};

export const EmptyState = ({
  title,
  description,
  icon: Icon,
  actionLabel,
  onAction
}: EmptyStateProps) => {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center animate-in fade-in duration-300">
      {Icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Icon className="h-6 w-6" />
        </div>
      )}
      <h3 className="mt-4 text-lg font-semibold tracking-tight">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button className="mt-6 font-bold" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
