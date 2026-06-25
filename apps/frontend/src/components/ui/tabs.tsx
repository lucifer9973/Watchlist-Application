import { cn } from "../../lib/utils";

type TabsProps = {
  value: string;
  onValueChange: (value: string) => void;
  tabs: { value: string; label: string }[];
};

export const Tabs = ({ value, onValueChange, tabs }: TabsProps) => (
  <div className="inline-flex rounded-md border border-border bg-card p-1">
    {tabs.map((tab) => (
      <button
        key={tab.value}
        type="button"
        onClick={() => onValueChange(tab.value)}
        className={cn(
          "h-8 rounded px-3 text-sm font-medium transition",
          value === tab.value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
        )}
      >
        {tab.label}
      </button>
    ))}
  </div>
);
