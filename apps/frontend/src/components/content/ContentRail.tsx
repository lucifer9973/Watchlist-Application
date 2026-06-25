import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";

import type { ContentSummary } from "./ContentDetailsDrawer";
import { MediaCard } from "../ui/MediaCard";
import type { WatchStatus } from "../../types";

type Props = {
  title: string;
  description: string;
  items: ContentSummary[];
  emptyMessage?: string;
  onOpenDetails: (item: ContentSummary) => void;
  // Dynamic action integrations
  onAdd?: (item: ContentSummary, status: WatchStatus) => void;
  onUpdateStatus?: (item: ContentSummary, status: WatchStatus) => void;
  onToggleFavorite?: (item: ContentSummary) => void;
  onUpdateCollection?: (item: ContentSummary, collection: string | null) => void;
  onDelete?: (item: ContentSummary) => void;
  isPending?: boolean;
};

export const ContentRail = ({
  title,
  description,
  items,
  emptyMessage,
  onOpenDetails,
  onAdd,
  onUpdateStatus,
  onToggleFavorite,
  onUpdateCollection,
  onDelete,
  isPending = false
}: Props) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === "left" ? scrollLeft - clientWidth * 0.8 : scrollLeft + clientWidth * 0.8;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  return (
    <section className="relative py-8 group/rail">
      <div className="mb-4 flex items-end justify-between px-1">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl">{title}</h2>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground font-medium">{description}</p>
        </div>
        {items.length > 0 && (
          <div className="flex gap-1.5 opacity-0 group-hover/rail:opacity-100 transition-opacity duration-350">
            <button
              onClick={() => scroll("left")}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-card-foreground shadow-sm hover:bg-muted transition"
              aria-label={`Scroll ${title} left`}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-card-foreground shadow-sm hover:bg-muted transition"
              aria-label={`Scroll ${title} right`}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/80 bg-muted/5 px-4 py-12 text-center text-sm text-muted-foreground font-medium select-none">
          {emptyMessage ?? "Nothing to show yet."}
        </div>
      ) : (
        <div className="relative">
          {/* Scrollable Container */}
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto pb-4 pt-1 px-1 scrollbar-none snap-x snap-mandatory scroll-smooth"
          >
            {items.map((item) => {
              // Convert ContentSummary to CardData format
              const cardData = {
                id: item.imdbId || item.externalId || undefined,
                imdbId: item.imdbId,
                externalId: item.externalId,
                source: item.source,
                title: item.title,
                year: item.year,
                type: item.type,
                poster: item.poster,
                author: item.author,
                collection: item.collection,
                // These are passed down if the item is already a watchlist item
                status: (item as any).status,
                favorite: (item as any).favorite,
                rating: (item as any).rating,
                notes: (item as any).notes
              };

              return (
                <div
                  key={item.imdbId || item.externalId || item.title}
                  className="w-[170px] sm:w-[210px] shrink-0 snap-start"
                >
                  <MediaCard
                    item={cardData}
                    onOpenDetails={() => onOpenDetails(item)}
                    onAdd={onAdd ? (status) => onAdd(item, status) : undefined}
                    onUpdateStatus={onUpdateStatus ? (status) => onUpdateStatus(item, status) : undefined}
                    onToggleFavorite={onToggleFavorite ? () => onToggleFavorite(item) : undefined}
                    onUpdateCollection={onUpdateCollection ? (col) => onUpdateCollection(item, col) : undefined}
                    onDelete={onDelete ? () => onDelete(item) : undefined}
                    isPending={isPending}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};
