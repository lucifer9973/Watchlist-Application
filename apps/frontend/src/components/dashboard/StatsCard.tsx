import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "../ui/card";

type Props = {
  title: string;
  value: number | string;
  icon: LucideIcon;
};

export const StatsCard = ({ title, value, icon: Icon }: Props) => (
  <Card>
    <CardContent className="flex items-center justify-between p-4">
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="mt-1 text-3xl font-semibold">{value}</p>
      </div>
      <div className="grid h-11 w-11 place-items-center rounded-md bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
    </CardContent>
  </Card>
);
