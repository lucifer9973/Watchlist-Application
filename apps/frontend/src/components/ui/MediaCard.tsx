import { useState } from "react";
import { Eye, Plus, Trash2, Heart, RotateCcw, ShieldAlert, LoaderCircle, ExternalLink, Bookmark } from "lucide-react";
import { cn } from "../../lib/utils";
import { Badge } from "./badge";
import { FavoriteButton } from "./FavoriteButton";
import { StatusBadge } from "./StatusBadge";
import { CollectionSelector } from "./CollectionSelector";
import type { SearchResult, WatchlistItem, WatchStatus } from "../../types";

type CardData = {
  id?: string;
  imdbId?: string | null;
  externalId?: string | null;
  source?: string | null;
  title: string;
  year: string;
  type: string;
  poster: string | null;
  author?: string | null;
  status?: WatchStatus;
  favorite?: boolean;
  collection?: string | null;
  rating?: number | null;
  notes?: string | null;
  deletedAt?: string | null;
};

type MediaCardProps = {
  item: CardData;
  onOpenDetails: () => void;
  // Watchlist Actions
  onAdd?: (status: WatchStatus) => void;
  onUpdateStatus?: (status: WatchStatus) => void;
  onToggleFavorite?: () => void;
  onUpdateCollection?: (collection: string | null) => void;
  onDelete?: () => void;
  // Deleted Items Actions
  onRestore?: () => void;
  onDeleteForever?: () => void;
  // Global loading lock
  isPending?: boolean;
};

export const MediaCard = ({
  item,
  onOpenDetails,
  onAdd,
  onUpdateStatus,
  onToggleFavorite,
  onUpdateCollection,
  onDelete,
  onRestore,
  onDeleteForever,
  isPending = false
}: MediaCardProps) => {
  const [localAdding, setLocalAdding] = useState<WatchStatus | null>(null);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [localNotes, setLocalNotes] = useState(item.notes ?? "");

  const isSoftDeleted = !!item.deletedAt;
  const isSearchResult = !item.id;

  const handleAddClick = async (status: WatchStatus) => {
    if (onAdd && !localAdding) {
      setLocalAdding(status);
      try {
        await onAdd(status);
      } finally {
        setLocalAdding(null);
      }
    }
  };

  return (
    <div
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          onOpenDetails();
        }
      }}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl focus:ring-2 focus:ring-primary focus:ring-offset-2 outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2",
        isSoftDeleted && "border-destructive/30 bg-destructive/5"
      )}
    >
      {/* Poster Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-muted">
        {item.poster ? (
          <img
            src={item.poster}
            alt={`${item.title} poster`}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full place-items-center bg-gradient-to-br from-muted to-muted/40 p-4 text-center text-xs font-semibold text-muted-foreground select-none">
            No Poster Available
          </div>
        )}

        {/* Dynamic Hover Action Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3.5 z-10">
          {/* Top Actions */}
          <div className="flex items-center justify-between">
            {onToggleFavorite && !isSoftDeleted && !isSearchResult && (
              <FavoriteButton isFavorite={!!item.favorite} onToggle={onToggleFavorite} disabled={isPending} />
            )}
            <div className="ml-auto flex gap-1">
              {!isSoftDeleted && (
                <button
                  type="button"
                  onClick={onOpenDetails}
                  className="rounded-full bg-black/35 backdrop-blur-md p-2 text-white/80 hover:bg-black/55 hover:text-white transition focus:outline-none focus:ring-2 focus:ring-primary"
                  aria-label="View Details"
                >
                  <Eye className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Bottom Quick Overlay Options */}
          <div className="space-y-2">
            {isSearchResult && onAdd && (
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleAddClick("PLANNED")}
                  disabled={isPending || !!localAdding}
                  className="flex items-center justify-center gap-1 rounded bg-primary/90 hover:bg-primary py-1.5 text-xs font-bold text-primary-foreground shadow transition disabled:opacity-50"
                >
                  {localAdding === "PLANNED" ? (
                    <LoaderCircle className="h-3 w-3 animate-spin" />
                  ) : (
                    <Plus className="h-3 w-3" />
                  )}
                  Want
                </button>
                <button
                  type="button"
                  onClick={() => handleAddClick("COMPLETED")}
                  disabled={isPending || !!localAdding}
                  className="flex items-center justify-center gap-1 rounded bg-white/95 hover:bg-white py-1.5 text-xs font-bold text-foreground shadow transition disabled:opacity-50"
                >
                  {localAdding === "COMPLETED" ? (
                    <LoaderCircle className="h-3 w-3 animate-spin" />
                  ) : (
                    <Eye className="h-3 w-3" />
                  )}
                  Done
                </button>
              </div>
            )}

            {!isSearchResult && !isSoftDeleted && onDelete && (
              <button
                type="button"
                onClick={onDelete}
                disabled={isPending}
                className="w-full flex items-center justify-center gap-1.5 rounded bg-destructive/90 hover:bg-destructive py-1.5 text-xs font-bold text-destructive-foreground shadow transition disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" /> Remove
              </button>
            )}

            {isSoftDeleted && (
              <div className="flex flex-col gap-1.5">
                {onRestore && (
                  <button
                    type="button"
                    onClick={onRestore}
                    disabled={isPending}
                    className="w-full flex items-center justify-center gap-1.5 rounded bg-emerald-600 hover:bg-emerald-500 py-1.5 text-xs font-bold text-white shadow transition disabled:opacity-50"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> Restore
                  </button>
                )}
                {onDeleteForever && (
                  <button
                    type="button"
                    onClick={onDeleteForever}
                    disabled={isPending}
                    className="w-full flex items-center justify-center gap-1.5 rounded bg-destructive hover:bg-destructive/80 py-1.5 text-xs font-bold text-destructive-foreground shadow transition disabled:opacity-50"
                  >
                    <ShieldAlert className="h-3.5 w-3.5" /> Delete Forever
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Metadata Container */}
      <div className="flex flex-1 flex-col justify-between p-3.5 gap-2.5">
        <div>
          <div className="flex items-start justify-between gap-1.5">
            <h3 className="truncate text-sm font-bold tracking-tight group-hover:text-primary transition-colors" title={item.title}>
              {item.title}
            </h3>
            {item.favorite && (
              <Heart className="h-3.5 w-3.5 fill-red-500 text-red-500 shrink-0" />
            )}
          </div>
          {item.author && (
            <p className="truncate text-xs text-muted-foreground mt-0.5">by {item.author}</p>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <Badge tone="neutral" className="text-[10px] py-0 px-1.5 font-semibold">
              {item.year}
            </Badge>
            <Badge tone="accent" className="text-[10px] py-0 px-1.5 font-semibold">
              {item.type === "series" ? "TV Show" : item.type.charAt(0).toUpperCase() + item.type.slice(1)}
            </Badge>
            {item.status && !isSoftDeleted && (
              <StatusBadge status={item.status} className="text-[9px] py-0 px-1.5" />
            )}
          </div>
          {item.notes && (
            <div className="sr-only">{item.notes}</div>
          )}
        </div>

        {/* Rating and Collection management */}
        {!isSearchResult && !isSoftDeleted && (
          <div className="space-y-2 border-t border-border/50 pt-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-medium">Status:</span>
              {onUpdateStatus && (
                <select
                  value={item.status ?? "PLANNED"}
                  disabled={isPending}
                  onChange={(e) => onUpdateStatus(e.target.value as WatchStatus)}
                  className="bg-transparent font-bold text-foreground border-none hover:text-primary transition focus:outline-none cursor-pointer text-xs"
                >
                  <option value="PLANNED">Planned</option>
                  <option value="WATCHING">Watching</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              )}
            </div>

            {onUpdateCollection && (
              <div className="flex flex-col gap-1">
                <CollectionSelector
                  currentValue={item.collection ?? null}
                  onChange={onUpdateCollection}
                  disabled={isPending}
                />
              </div>
            )}
          </div>
        )}

        {isSoftDeleted && (
          <div className="border-t border-border/50 pt-2 text-center">
            <span className="text-[10px] text-destructive font-bold flex items-center justify-center gap-1">
              <ShieldAlert className="h-3 w-3" /> Soft-Deleted
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
