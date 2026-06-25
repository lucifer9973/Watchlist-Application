import axios from "axios";
import { Check, Eye, LoaderCircle, Plus, Save, Star, X, Globe, MessageSquare, Compass, Heart, Calendar, Clock, User, Bookmark } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { findLibraryItem } from "../../utils/duplicateHelper";
import { DuplicateWatchlistError, useWatchlist } from "../../hooks/useWatchlist";
import { useOmdbDetails } from "../../hooks/useOmdbDetails";
import { useBookDetails } from "../../hooks/useBookDetails";
import { useGameDetails } from "../../hooks/useGameDetails";
import type { SearchResult, WatchlistItem, WatchStatus } from "../../types";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Skeleton } from "../ui/skeleton";
import { Textarea } from "../ui/textarea";
import { useToast } from "../ui/toast";
import { CollectionSelector } from "../ui/CollectionSelector";

export type ContentSummary = {
  imdbId?: string | null;
  externalId?: string | null;
  source?: string | null;
  title: string;
  year: string;
  type: SearchResult["type"];
  poster: string | null;
  contentType?: "MOVIE" | "TV_SHOW" | "BOOK" | "GAME";
  collection?: string | null;
  author?: string | null;
};

type Props = {
  content: ContentSummary | null;
  onClose: () => void;
};

const errorMessage = (error: unknown) => {
  if (error instanceof DuplicateWatchlistError) return error.message;
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? "Could not update library";
  }
  return "Could not update library";
};

export const ContentDetailsDrawer = ({ content, onClose }: Props) => {
  const watchlist = useWatchlist();
  const isBook = content?.contentType === "BOOK" || content?.type === "book";
  const isGame = content?.contentType === "GAME" || content?.type === "game";
  
  const idToFetch = isBook || isGame 
    ? (content?.externalId ?? content?.imdbId) 
    : (content?.imdbId ?? content?.externalId);
    
  const omdbQuery = useOmdbDetails(!isBook && !isGame ? idToFetch ?? null : null);
  const bookQuery = useBookDetails(isBook ? idToFetch ?? null : null);
  const gameQuery = useGameDetails(isGame ? idToFetch ?? null : null);
  
  const detailsQuery = isBook ? bookQuery : isGame ? gameQuery : omdbQuery;
  const showToast = useToast();
  
  const existing = useMemo(() => {
    if (!content) return null;
    const contentSrc = isBook ? "OPEN_LIBRARY" : isGame ? "RAWG" : "OMDB";
    const contentExt = content.externalId ?? content.imdbId;
    return findLibraryItem(contentSrc, contentExt, watchlist.data);
  }, [content, isBook, isGame, watchlist.data]);

  const [rating, setRating] = useState<number | "">("");
  const [collection, setCollection] = useState("");
  const [notes, setNotes] = useState("");
  const [localAdding, setLocalAdding] = useState<"PLANNED" | "COMPLETED" | null>(null);

  useEffect(() => {
    setRating(existing?.rating ?? "");
    setCollection(existing?.collection ?? "");
    setNotes(existing?.notes ?? "");
    if (existing) {
      setLocalAdding(null);
    }
  }, [existing]);

  // Support Escape to close
  useEffect(() => {
    if (!content) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [content, onClose]);

  if (!content) return null;

  const details = detailsQuery.data;
  const poster = details && !isBook && !isGame && (details as any).Poster && (details as any).Poster !== "N/A" ? (details as any).Poster : content.poster;

  // Compute backdrop image
  const backdropImage = isGame && (details as any)?.screenshots && (details as any).screenshots.length > 0
    ? (details as any).screenshots[0]
    : poster;

  const add = (status: WatchStatus) => {
    watchlist.addItem.mutate(
      {
        imdbId: (isBook || isGame) ? null : content.imdbId,
        externalId: content.externalId ?? content.imdbId,
        source: isBook ? "OPEN_LIBRARY" : isGame ? "RAWG" : "OMDB",
        title: content.title,
        author: content.author,
        year: content.year,
        type: content.type,
        poster: content.poster,
        contentType: content.contentType ?? (isBook ? "BOOK" : isGame ? "GAME" : undefined),
        status
      },
      {
        onSuccess: () => showToast(status === "COMPLETED" ? "Added and marked completed" : "Added to Library"),
        onError: (error) => {
          setLocalAdding(null);
          showToast(errorMessage(error), "error");
        }
      }
    );
  };

  const handleAdd = (status: "PLANNED" | "COMPLETED") => {
    if (localAdding || existing) return;
    setLocalAdding(status);
    add(status);
  };

  const update = (item: WatchlistItem, payload: { status?: WatchStatus; rating?: number | null; notes?: string | null; collection?: string | null; favorite?: boolean }) => {
    watchlist.updateItem.mutate(
      { id: item.id, payload },
      {
        onSuccess: () => showToast("Library updated"),
        onError: (error) => showToast(errorMessage(error), "error")
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={`${content.title} details`}>
      <button className="absolute inset-0 cursor-default" onClick={onClose} aria-label="Close details" />
      
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-2xl flex-col overflow-hidden bg-card text-card-foreground shadow-2xl border-l border-border/80">
        
        {/* Sticky Header with title details */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-border/60 px-6 z-10 bg-card/90 backdrop-blur-md sticky top-0">
          <div className="min-w-0">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-primary">Content Hub</p>
            <h2 className="truncate text-base font-extrabold tracking-tight">{content.title}</h2>
          </div>
          <div className="flex items-center gap-2">
            {existing && (
              <button
                onClick={() => update(existing, { favorite: !existing.favorite })}
                className={`p-2 rounded-lg border transition ${existing.favorite ? "border-red-200 bg-red-50 text-red-500" : "border-border hover:bg-muted text-muted-foreground"}`}
                title={existing.favorite ? "Unfavorite" : "Favorite"}
              >
                <Heart className={`h-4 w-4 ${existing.favorite ? "fill-red-500" : ""}`} />
              </button>
            )}
            <Button size="icon" variant="ghost" className="h-9 w-9 rounded-lg border border-border" onClick={onClose} aria-label="Close details drawer">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Scrollable details view */}
        <div className="flex-1 overflow-y-auto pb-10">
          
          {/* Backdrop Header Block */}
          <div className="relative h-56 w-full bg-slate-950 overflow-hidden">
            {backdropImage ? (
              <>
                <img 
                  src={backdropImage} 
                  alt="" 
                  className="h-full w-full object-cover filter blur-[20px] opacity-40 scale-110" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-black/30" />
              </>
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-teal-950 to-slate-900" />
            )}

            {/* Float Overlay Container */}
            <div className="absolute bottom-4 left-6 flex items-end gap-5">
              <div className="h-32 w-24 shrink-0 overflow-hidden rounded-xl border border-white/20 bg-muted shadow-xl select-none">
                {poster ? (
                  <img src={poster} alt={`${content.title} poster`} className="h-full w-full object-cover" />
                ) : (
                  <div className="grid h-full place-items-center text-[10px] text-muted-foreground font-semibold">No Poster</div>
                )}
              </div>
              <div className="space-y-1.5 pb-2 text-white drop-shadow-md">
                <div className="flex flex-wrap gap-1.5">
                  <Badge className="bg-white/20 text-white border-none font-bold text-[9px] py-0 px-2 uppercase tracking-wide">
                    {content.year}
                  </Badge>
                  <Badge tone="accent" className="font-bold text-[9px] py-0 px-2 uppercase tracking-wide">
                    {isBook ? "Book" : isGame ? "Game" : content.type === "series" ? "TV Show" : "Movie"}
                  </Badge>
                </div>
                <h3 className="text-xl md:text-2xl font-extrabold tracking-tight line-clamp-1">{content.title}</h3>
                {isBook && content.author && (
                  <p className="text-xs font-semibold text-slate-200 flex items-center gap-1"><User className="h-3.5 w-3.5" /> by {content.author}</p>
                )}
              </div>
            </div>
          </div>

          <div className="px-6 mt-6 space-y-6">
            {/* Loading / Error States */}
            {detailsQuery.isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-24" />
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-10" />
                  <Skeleton className="h-10" />
                </div>
              </div>
            ) : detailsQuery.isError ? (
              <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-xs font-semibold text-destructive">
                ❌ Full details could not be loaded. You can still save and organize this item below.
              </div>
            ) : null}

            {details && (
              <div className="space-y-6">
                {/* Description Segment */}
                <div className="space-y-2">
                  <h4 className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground">About</h4>
                  <p className="text-sm text-foreground leading-relaxed font-medium">
                    {isBook 
                      ? (details as any)?.description ?? "No description has been indexed for this book title." 
                      : isGame 
                        ? (details as any)?.description ?? "No summary has been indexed for this game title." 
                        : (details as any)?.Plot ?? "No overview plot is available for this film."}
                  </p>
                </div>

                {/* Metadata Grid */}
                <div className="border-t border-border/50 pt-4">
                  <h4 className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground mb-3">Specifications</h4>
                  
                  {isBook ? (
                    <div className="space-y-3">
                      <div>
                        <span className="text-xs font-bold text-muted-foreground block mb-1.5">Subject Keywords</span>
                        <div className="flex flex-wrap gap-1">
                          {(details as any)?.subjects && (details as any).subjects.length > 0 ? (
                            (details as any).subjects.slice(0, 10).map((sub: string) => (
                              <Badge key={sub} tone="neutral" className="text-[10px] py-0 px-2 font-semibold">
                                {sub}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-xs text-muted-foreground">N/A</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : isGame ? (
                    <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-xs">
                      {[
                        ["Platforms", (details as any)?.platforms?.join(", ")],
                        ["Genres", (details as any)?.genres?.join(", ")],
                        ["Developers", (details as any)?.developers?.join(", ")],
                        ["Publishers", (details as any)?.publishers?.join(", ")],
                        ["Playtime", (details as any)?.playtime ? `${(details as any).playtime} Hours` : "N/A"]
                      ].map(([label, value]) => (
                        <div key={label} className="space-y-0.5">
                          <span className="font-bold text-muted-foreground block uppercase text-[10px] tracking-wider">{label}</span>
                          <span className="font-semibold text-foreground">{value || "N/A"}</span>
                        </div>
                      ))}
                      {(details as any)?.metacritic && (
                        <div className="space-y-0.5">
                          <span className="font-bold text-muted-foreground block uppercase text-[10px] tracking-wider">Metacritic</span>
                          <Badge tone="success" className="font-bold py-0.5 text-xs">
                            {(details as any).metacritic} / 100
                          </Badge>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-xs">
                      {[
                        ["Genre", (details as any)?.Genre],
                        ["Runtime", (details as any)?.Runtime],
                        ["Director", (details as any)?.Director],
                        ["Actors", (details as any)?.Actors]
                      ].map(([label, value]) => (
                        <div key={label} className="space-y-0.5">
                          <span className="font-bold text-muted-foreground block uppercase text-[10px] tracking-wider">{label}</span>
                          <span className="font-semibold text-foreground">{value || "N/A"}</span>
                        </div>
                      ))}
                      {(details as any)?.imdbRating && (details as any).imdbRating !== "N/A" && (
                        <div className="space-y-0.5">
                          <span className="font-bold text-muted-foreground block uppercase text-[10px] tracking-wider">IMDb Rating</span>
                          <div className="flex items-center gap-1.5 font-extrabold text-amber-500">
                            <Star className="h-4 w-4 fill-current" />
                            <span>{(details as any).imdbRating} / 10</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Screenshots Carousel for Games */}
                {isGame && (details as any)?.screenshots && (details as any).screenshots.length > 0 && (
                  <div className="border-t border-border/50 pt-4 space-y-2.5">
                    <h4 className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground">Screenshots</h4>
                    <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory">
                      {(details as any).screenshots.map((src: string, idx: number) => (
                        <div key={idx} className="w-56 shrink-0 aspect-video overflow-hidden rounded-xl border border-border/80 bg-muted shadow-sm snap-start">
                          <img src={src} alt="Game snapshot" className="h-full w-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* External Hyperlinks */}
                {((details as any)?.website || (details as any)?.redditUrl) && (
                  <div className="border-t border-border/50 pt-4 space-y-2.5">
                    <h4 className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground">Web links</h4>
                    <div className="flex flex-wrap gap-2">
                      {(details as any)?.website && (
                        <a 
                          href={(details as any).website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3.5 py-2 text-xs font-bold hover:bg-muted text-foreground transition"
                        >
                          <Globe className="h-3.5 w-3.5" /> Official Website
                        </a>
                      )}
                      {(details as any)?.redditUrl && (
                        <a 
                          href={(details as any).redditUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3.5 py-2 text-xs font-bold hover:bg-muted text-foreground transition"
                        >
                          <MessageSquare className="h-3.5 w-3.5" /> Reddit Community
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Library Control Panel */}
            <div className="border-t border-border pt-6 space-y-4">
              <h4 className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground">Library Status</h4>
              
              {existing ? (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border border-border/60 bg-muted/5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-muted-foreground">Current Status:</span>
                      <Badge tone="success" className="font-bold py-0.5 text-xs">
                        {existing.status === "COMPLETED" ? "Completed ✓" : existing.status === "WATCHING" ? "Watching ⌛" : "Want (Planned) ✓"}
                      </Badge>
                    </div>

                    <div className="flex gap-2">
                      {existing.status !== "WATCHING" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => update(existing, { status: "WATCHING" })}
                          className="h-8 text-xs font-bold border border-border shadow-sm"
                          disabled={watchlist.updateItem.isPending}
                        >
                          <Clock className="h-3.5 w-3.5" /> Track Watching
                        </Button>
                      )}
                      {existing.status !== "COMPLETED" && (
                        <Button
                          size="sm"
                          onClick={() => update(existing, { status: "COMPLETED" })}
                          className="h-8 text-xs font-bold"
                          disabled={watchlist.updateItem.isPending}
                        >
                          <Eye className="h-3.5 w-3.5" /> Completed
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    {/* Collection Assignment */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                        Collection Selector
                      </label>
                      <CollectionSelector
                        currentValue={collection}
                        onChange={(col) => {
                          setCollection(col ?? "");
                          update(existing, { collection: col });
                        }}
                        disabled={watchlist.updateItem.isPending}
                      />
                    </div>

                    {/* Quick Star Rating Picker */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                        Your Rating ({rating || "None"})
                      </label>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 10 }).map((_, idx) => {
                          const starVal = idx + 1;
                          return (
                            <button
                              key={starVal}
                              onClick={() => {
                                const newVal = rating === starVal ? null : starVal;
                                setRating(newVal ?? "");
                                update(existing, { rating: newVal });
                              }}
                              className={`p-0.5 transition ${starVal <= (rating || 0) ? "text-amber-500" : "text-slate-300 hover:text-slate-400"}`}
                              title={`Rate ${starVal}/10`}
                            >
                              <Star className={`h-4.5 w-4.5 ${starVal <= (rating || 0) ? "fill-current" : ""}`} />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Notes Area */}
                  <div className="space-y-1.5 pt-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                      Edit Library Notes
                    </label>
                    <Textarea 
                      value={notes} 
                      onChange={(event) => setNotes(event.target.value)} 
                      placeholder="Add personal thoughts, reviews, or tracking comments..."
                      className="min-h-24 text-xs font-semibold"
                    />
                    <Button
                      size="sm"
                      onClick={() =>
                        update(existing, {
                          notes: notes.trim() ? notes.trim() : null
                        })
                      }
                      disabled={watchlist.updateItem.isPending}
                      className="gap-1.5 text-xs font-bold h-9 px-4 mt-1"
                    >
                      <Save className="h-3.5 w-3.5" /> Save Notes
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2.5">
                  <Button 
                    onClick={() => handleAdd("PLANNED")} 
                    disabled={watchlist.addItem.isPending || localAdding !== null}
                    className="rounded-xl px-5 gap-1.5 font-bold shadow-sm"
                  >
                    {localAdding === "PLANNED" ? (
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                    Want (Planned)
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => handleAdd("COMPLETED")}
                    disabled={watchlist.addItem.isPending || localAdding !== null}
                    className="rounded-xl px-5 gap-1.5 font-bold border border-border shadow-sm hover:bg-muted"
                  >
                    {localAdding === "COMPLETED" ? (
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                    Mark Completed
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};
