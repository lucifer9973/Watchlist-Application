import { cn } from "../../lib/utils";

export const Badge = ({
  className,
  tone = "neutral",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: "neutral" | "success" | "accent" }) => {
  const tones = {
    neutral: "bg-muted text-foreground",
    success: "bg-primary/12 text-primary",
    accent: "bg-accent/15 text-accent"
  };

  return (
    <span
      className={cn("inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold", tones[tone], className)}
      {...props}
    />
  );
};
