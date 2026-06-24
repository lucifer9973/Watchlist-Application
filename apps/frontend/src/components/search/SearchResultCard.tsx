import { Plus } from "lucide-react";

import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import type { SearchResult, WatchStatus } from "../../types";

type Props = {
  result: SearchResult;
  onAdd: (status: WatchStatus) => void;
  isAdding: boolean;
};

export const SearchResultCard = ({ result, onAdd, isAdding }: Props) => (
  <Card className="overflow-hidden">
    <CardContent className="grid grid-cols-[82px_1fr] gap-4 p-3">
      <div className="aspect-[2/3] overflow-hidden rounded-md bg-muted">
        {result.poster ? (
          <img src={result.poster} alt={`${result.title} poster`} className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full place-items-center px-2 text-center text-xs text-muted-foreground">No poster</div>
        )}
      </div>
      <div className="flex min-w-0 flex-col justify-between gap-3">
        <div>
          <h3 className="truncate font-semibold">{result.title}</h3>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge>{result.year}</Badge>
            <Badge tone="accent">{result.type === "series" ? "TV Show" : "Movie"}</Badge>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={() => onAdd("WANT_TO_WATCH")} disabled={isAdding}>
            <Plus className="h-4 w-4" /> Want
          </Button>
          <Button size="sm" variant="secondary" onClick={() => onAdd("WATCHED")} disabled={isAdding}>
            Watched
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
);
