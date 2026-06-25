import { useEffect, useState } from "react";
import { Eye, Plus, LoaderCircle } from "lucide-react";

import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import type { SearchResult, WatchStatus } from "../../types";

type Props = {
  result: SearchResult;
  onAdd: (status: WatchStatus) => void;
  onOpenDetails: () => void;
  isAdding: boolean;
  libraryStatus?: WatchStatus | null;
};

export const SearchResultCard = ({ result, onAdd, onOpenDetails, isAdding, libraryStatus }: Props) => {
  const isInLibrary = !!libraryStatus;
  const [localAdding, setLocalAdding] = useState<WatchStatus | null>(null);

  useEffect(() => {
    if (libraryStatus) {
      setLocalAdding(null);
    }
  }, [libraryStatus]);

  const handleAdd = (status: WatchStatus) => {
    if (localAdding || isInLibrary) return;
    setLocalAdding(status);
    onAdd(status);
  };
  
  return (
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
            {result.author && (
              <p className="mt-1 truncate text-sm text-muted-foreground">by {result.author}</p>
            )}
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge>{result.year}</Badge>
              <Badge tone="accent">
              {result.type === "book"
                ? "Book"
                : result.type === "game"
                  ? "Game"
                  : result.type === "series"
                    ? "TV Show"
                    : "Movie"}
            </Badge>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="ghost" onClick={onOpenDetails}>
              <Eye className="h-4 w-4" /> Details
            </Button>
            {isInLibrary ? (
              <Button size="sm" variant="secondary" disabled className="text-primary font-medium">
                {libraryStatus === "COMPLETED" ? "Completed ✓" : "Planned ✓"}
              </Button>
            ) : (
              <>
                <Button 
                  size="sm" 
                  onClick={() => handleAdd("PLANNED")} 
                  disabled={isAdding || localAdding !== null}
                >
                  {localAdding === "PLANNED" ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <><Plus className="h-4 w-4" /> Want</>
                  )}
                </Button>
                <Button 
                  size="sm" 
                  variant="secondary" 
                  onClick={() => handleAdd("COMPLETED")} 
                  disabled={isAdding || localAdding !== null}
                >
                  {localAdding === "COMPLETED" ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    "Completed"
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
