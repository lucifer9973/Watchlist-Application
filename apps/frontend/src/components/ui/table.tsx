import * as React from "react";

import { cn } from "../../lib/utils";

export const Table = ({ className, ...props }: React.TableHTMLAttributes<HTMLTableElement>) => (
  <div className="w-full overflow-x-auto">
    <table className={cn("w-full border-collapse text-left text-sm", className)} {...props} />
  </div>
);

export const Th = ({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) => (
  <th className={cn("border-b border-border px-3 py-3 font-semibold text-muted-foreground", className)} {...props} />
);

export const Td = ({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) => (
  <td className={cn("border-b border-border px-3 py-3 align-middle", className)} {...props} />
);
