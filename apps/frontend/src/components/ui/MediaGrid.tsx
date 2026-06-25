import { cn } from "../../lib/utils";
import type { ReactNode } from "react";

type MediaGridProps = {
  children: ReactNode;
  className?: string;
};

export const MediaGrid = ({ children, className }: MediaGridProps) => {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
        className
      )}
    >
      {children}
    </div>
  );
};
