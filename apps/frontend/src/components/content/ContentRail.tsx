import { Eye } from "lucide-react";

import type { ContentSummary } from "./ContentDetailsDrawer";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

type Props = {
  title: string;
  description: string;
  items: ContentSummary[];
  emptyMessage?: string;
  onOpenDetails: (item: ContentSummary) => void;
};

export const ContentRail = ({ title, description, items, emptyMessage, onOpenDetails }: Props) => (
  <section className="py-6">
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
    {items.length === 0 ? (
      <div className="rounded-md border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
        {emptyMessage ?? "Nothing to show yet."}
      </div>
    ) : (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {items.map((item) => (
          <article key={item.imdbId} className="min-w-0 overflow-hidden rounded-md border border-border bg-white">
            <button className="block w-full text-left" onClick={() => onOpenDetails(item)}>
              <div className="aspect-[2/3] bg-muted">
                {item.poster ? (
                  <img src={item.poster} alt={`${item.title} poster`} className="h-full w-full object-cover" />
                ) : (
                  <div className="grid h-full place-items-center px-3 text-center text-xs text-muted-foreground">
                    No poster
                  </div>
                )}
              </div>
              <div className="p-3">
                <h3 className="truncate text-sm font-semibold">{item.title}</h3>
                <div className="mt-2 flex flex-wrap gap-1">
                  <Badge>{item.year}</Badge>
                  {item.contentType ? (
                    <Badge tone="accent">
                      {item.contentType === "MOVIE"
                        ? "Movie"
                        : item.contentType === "TV_SHOW"
                          ? "TV Show"
                          : item.contentType === "BOOK"
                            ? "Book"
                            : "Game"}
                    </Badge>
                  ) : (
                    <Badge tone="accent">{item.type === "series" ? "TV" : "Movie"}</Badge>
                  )}
                  {item.collection && (
                    <Badge tone="success" className="truncate max-w-full">{item.collection}</Badge>
                  )}
                </div>
              </div>
            </button>
            <div className="border-t border-border p-2">
              <Button className="w-full" size="sm" variant="ghost" onClick={() => onOpenDetails(item)}>
                <Eye className="h-4 w-4" /> Details
              </Button>
            </div>
          </article>
        ))}
      </div>
    )}
  </section>
);
