import axios from "axios";
import { Check, Eye, LoaderCircle, Plus, Save, Star, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { DuplicateWatchlistError, useWatchlist } from "../../hooks/useWatchlist";
import { useOmdbDetails } from "../../hooks/useOmdbDetails";
import type { SearchResult, WatchlistItem } from "../../types";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Skeleton } from "../ui/skeleton";
import { Textarea } from "../ui/textarea";
import { useToast } from "../ui/toast";

export type ContentSummary = {
  imdbId: string;
  title: string;
  year: string;
  type: SearchResult["type"];
  poster: string | null;
};

type Props = {
  content: ContentSummary | null;
  onClose: () => void;
};

const errorMessage = (error: unknown) => {
  if (error instanceof DuplicateWatchlistError) return error.message;
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? "Could not update watchlist";
  }
  return "Could not update watchlist";
};

export const ContentDetailsDrawer = ({ content, onClose }: Props) => {
  const watchlist = useWatchlist();
  const detailsQuery = useOmdbDetails(content?.imdbId ?? null);
  const showToast = useToast();
  const existing = useMemo(
    () => watchlist.data?.find((item) => item.imdbId === content?.imdbId) ?? null,
    [content?.imdbId, watchlist.data]
  );
  const [rating, setRating] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    setRating(existing?.rating?.toString() ?? "");
    setNotes(existing?.notes ?? "");
  }, [existing]);

  if (!content) return null;

  const details = detailsQuery.data;
  const poster = details?.Poster && details.Poster !== "N/A" ? details.Poster : content.poster;

  const add = (status: "WANT_TO_WATCH" | "WATCHED") => {
    watchlist.addItem.mutate(
      {
        imdbId: content.imdbId,
        title: content.title,
        year: content.year,
        type: content.type,
        poster: content.poster,
        status
      },
      {
        onSuccess: () => showToast(status === "WATCHED" ? "Added and marked watched" : "Added to watchlist"),
        onError: (error) => showToast(errorMessage(error), "error")
      }
    );
  };

  const update = (item: WatchlistItem, payload: { status?: "WATCHED"; rating?: number | null; notes?: string | null }) => {
    watchlist.updateItem.mutate(
      { id: item.id, payload },
      {
        onSuccess: () => showToast("Watchlist updated"),
        onError: (error) => showToast(errorMessage(error), "error")
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/45" role="dialog" aria-modal="true" aria-label={`${content.title} details`}>
      <button className="absolute inset-0 cursor-default" onClick={onClose} aria-label="Close details" />
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-2xl flex-col overflow-hidden bg-white shadow-2xl">
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-4 sm:px-6">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase text-accent">Content details</p>
            <h2 className="truncate text-lg font-semibold">{content.title}</h2>
          </div>
          <Button size="icon" variant="ghost" onClick={onClose} aria-label="Close details drawer">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {detailsQuery.isLoading ? (
            <div className="grid gap-5 sm:grid-cols-[180px_1fr]">
              <Skeleton className="aspect-[2/3]" />
              <div className="grid content-start gap-3">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-24" />
              </div>
            </div>
          ) : detailsQuery.isError ? (
            <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
              Full OMDb details could not be loaded. You can still manage this title below.
            </div>
          ) : null}

          <div className="grid gap-5 sm:grid-cols-[180px_1fr]">
            <div className="aspect-[2/3] overflow-hidden rounded-md bg-muted">
              {poster ? (
                <img src={poster} alt={`${content.title} poster`} className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full place-items-center text-sm text-muted-foreground">No poster</div>
              )}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap gap-2">
                <Badge>{details?.Year ?? content.year}</Badge>
                <Badge tone="accent">{content.type === "series" ? "TV Show" : "Movie"}</Badge>
                {details?.imdbRating && details.imdbRating !== "N/A" ? (
                  <Badge tone="success">
                    <Star className="mr-1 h-3 w-3" /> {details.imdbRating}
                  </Badge>
                ) : null}
              </div>
              <h3 className="mt-4 text-2xl font-semibold">{details?.Title ?? content.title}</h3>
              <p className="mt-3 leading-7 text-muted-foreground">{details?.Plot ?? "Plot unavailable."}</p>

              <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                {[
                  ["Genre", details?.Genre],
                  ["Runtime", details?.Runtime],
                  ["Director", details?.Director],
                  ["Actors", details?.Actors]
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="font-semibold">{label}</dt>
                    <dd className="mt-1 text-muted-foreground">{value ?? "N/A"}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          <div className="mt-6 border-t border-border pt-6">
            {existing ? (
              <>
                <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                  <Check className="h-4 w-4" /> Already in Watchlist
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    onClick={() => update(existing, { status: "WATCHED" })}
                    disabled={existing.status === "WATCHED" || watchlist.updateItem.isPending}
                  >
                    <Eye className="h-4 w-4" />
                    {existing.status === "WATCHED" ? "Watched" : "Mark Watched"}
                  </Button>
                </div>
                <div className="mt-5 grid gap-4">
                  <label className="grid gap-1 text-sm font-medium">
                    <span>Edit Rating</span>
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      value={rating}
                      onChange={(event) => setRating(event.target.value)}
                      placeholder="1-10"
                    />
                  </label>
                  <label className="grid gap-1 text-sm font-medium">
                    <span>Edit Notes</span>
                    <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} />
                  </label>
                  <Button
                    className="w-fit"
                    onClick={() =>
                      update(existing, {
                        rating: rating ? Number(rating) : null,
                        notes: notes.trim() ? notes.trim() : null
                      })
                    }
                    disabled={watchlist.updateItem.isPending}
                  >
                    <Save className="h-4 w-4" /> Save Rating & Notes
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => add("WANT_TO_WATCH")} disabled={watchlist.addItem.isPending}>
                  {watchlist.addItem.isPending ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  Add to Watchlist
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => add("WATCHED")}
                  disabled={watchlist.addItem.isPending}
                >
                  <Eye className="h-4 w-4" /> Mark Watched
                </Button>
              </div>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
};
