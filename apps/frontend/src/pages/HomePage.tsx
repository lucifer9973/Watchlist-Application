import { ArrowRight, Search, ListVideo, CheckCircle2, Clapperboard, Percent, Sparkles, BookOpen, Gamepad2, Tv, Heart } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

import {
  ContentDetailsDrawer,
  type ContentSummary
} from "../components/content/ContentDetailsDrawer";
import { ContentRail } from "../components/content/ContentRail";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Skeleton } from "../components/ui/skeleton";
import { Card, CardContent } from "../components/ui/card";
import { ConfirmationDialog } from "../components/ui/ConfirmationDialog";
import { UndoSnackbar } from "../components/ui/UndoSnackbar";
import { useToast } from "../components/ui/toast";
import { useTrendingContent } from "../hooks/useTrendingContent";
import { DuplicateWatchlistError, useWatchlist } from "../hooks/useWatchlist";
import { useDashboardStats } from "../hooks/useDashboardStats";
import { findLibraryItem } from "../utils/duplicateHelper";
import type { SearchResult, WatchlistItem, WatchStatus } from "../types";

const fromWatchlist = (item: WatchlistItem): ContentSummary => ({
  imdbId: item.imdbId,
  externalId: item.externalId,
  source: item.source,
  title: item.title,
  year: item.year,
  type: item.type,
  poster: item.poster,
  contentType: item.contentType,
  collection: item.collection,
  author: item.author,
  status: item.status,
  favorite: item.favorite,
  rating: item.rating,
  notes: item.notes
} as any);

const fromSearch = (item: SearchResult): ContentSummary => ({
  imdbId: item.imdbID,
  externalId: item.externalId ?? item.imdbID,
  source: item.source ?? "OMDB",
  title: item.title,
  year: item.year,
  type: item.type,
  poster: item.poster,
  author: item.author
});

export const HomePage = () => {
  const navigate = useNavigate();
  const showToast = useToast();
  
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<ContentSummary | null>(null);
  const [loadMoreBooks, setLoadMoreBooks] = useState(false);
  const [loadMoreGames, setLoadMoreGames] = useState(false);

  // Soft-delete states
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<WatchlistItem | null>(null);
  const [undoItem, setUndoItem] = useState<WatchlistItem | null>(null);
  const [showUndoSnackbar, setShowUndoSnackbar] = useState(false);

  const watchlist = useWatchlist({ sortBy: "createdAt", sortOrder: "desc" });
  const statsQuery = useDashboardStats();
  const trending = useTrendingContent(loadMoreBooks, loadMoreGames);

  const saved = watchlist.data ?? [];
  const stats = statsQuery.data;

  // Filter Continue Progress (items that are WATCHING or PLANNED)
  const continueWatching = useMemo(() => {
    const active = saved.filter((item) => item.status === "WATCHING");
    const planned = saved.filter((item) => item.status === "PLANNED");
    return [...active, ...planned].slice(0, 10).map(fromWatchlist);
  }, [saved]);

  // Filter Recently Added
  const recentlyAdded = useMemo(() => {
    return saved.slice(0, 10).map(fromWatchlist);
  }, [saved]);

  // Filter Recently Completed
  const recentlyCompleted = useMemo(() => {
    return saved
      .filter((item) => item.status === "COMPLETED")
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 10)
      .map(fromWatchlist);
  }, [saved]);

  // Library Action Handlers (directly on Rails)
  const handleAddResult = async (item: ContentSummary, status: WatchStatus) => {
    try {
      const isBook = item.contentType === "BOOK" || item.type === "book";
      const isGame = item.contentType === "GAME" || item.type === "game";
      await watchlist.addItem.mutateAsync({
        imdbId: (isBook || isGame) ? null : item.imdbId,
        externalId: item.externalId ?? item.imdbId,
        source: isBook ? "OPEN_LIBRARY" : isGame ? "RAWG" : "OMDB",
        title: item.title,
        author: item.author,
        year: item.year,
        type: item.type,
        poster: item.poster,
        contentType: item.contentType ?? (isBook ? "BOOK" : isGame ? "GAME" : undefined),
        status
      });
      showToast(`Added "${item.title}" to library`);
    } catch (error) {
      const message =
        error instanceof DuplicateWatchlistError
          ? error.message
          : axios.isAxiosError<{ message?: string }>(error)
            ? error.response?.data?.message ?? "Could not add title"
            : "Could not add title";
      showToast(message, "error");
    }
  };

  const handleUpdateStatus = async (item: ContentSummary, status: WatchStatus) => {
    const contentSrc = item.source || (item.contentType === "BOOK" || item.type === "book" ? "OPEN_LIBRARY" : item.contentType === "GAME" || item.type === "game" ? "RAWG" : "OMDB");
    const contentExt = item.externalId ?? item.imdbId;
    const matched = findLibraryItem(contentSrc, contentExt, saved);
    if (!matched) return;
    try {
      await watchlist.updateItem.mutateAsync({ id: matched.id, payload: { status } });
      showToast(`Moved "${item.title}" to ${status.toLowerCase()}`);
    } catch (e) {
      showToast("Failed to update status", "error");
    }
  };

  const handleToggleFavorite = async (item: ContentSummary) => {
    const contentSrc = item.source || (item.contentType === "BOOK" || item.type === "book" ? "OPEN_LIBRARY" : item.contentType === "GAME" || item.type === "game" ? "RAWG" : "OMDB");
    const contentExt = item.externalId ?? item.imdbId;
    const matched = findLibraryItem(contentSrc, contentExt, saved);
    if (!matched) return;
    try {
      await watchlist.updateItem.mutateAsync({ id: matched.id, payload: { favorite: !matched.favorite } });
      showToast(!matched.favorite ? `Favorited "${item.title}"` : `Unfavorited "${item.title}"`);
    } catch (e) {
      showToast("Failed to update favorite status", "error");
    }
  };

  const handleUpdateCollection = async (item: ContentSummary, collectionName: string | null) => {
    const contentSrc = item.source || (item.contentType === "BOOK" || item.type === "book" ? "OPEN_LIBRARY" : item.contentType === "GAME" || item.type === "game" ? "RAWG" : "OMDB");
    const contentExt = item.externalId ?? item.imdbId;
    const matched = findLibraryItem(contentSrc, contentExt, saved);
    if (!matched) return;
    try {
      await watchlist.updateItem.mutateAsync({ id: matched.id, payload: { collection: collectionName } });
      showToast(collectionName ? `Assigned to "${collectionName}"` : `Removed from collection`);
    } catch (e) {
      showToast("Failed to update collection", "error");
    }
  };

  const handleDelete = (item: ContentSummary) => {
    const contentSrc = item.source || (item.contentType === "BOOK" || item.type === "book" ? "OPEN_LIBRARY" : item.contentType === "GAME" || item.type === "game" ? "RAWG" : "OMDB");
    const contentExt = item.externalId ?? item.imdbId;
    const matched = findLibraryItem(contentSrc, contentExt, saved);
    if (matched) {
      setDeleteConfirmItem(matched);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmItem) return;
    const itemToDelete = deleteConfirmItem;
    setDeleteConfirmItem(null);
    try {
      await watchlist.deleteItem.mutateAsync(itemToDelete.id);
      setUndoItem(itemToDelete);
      setShowUndoSnackbar(true);
    } catch (e) {
      showToast("Failed to remove item", "error");
    }
  };

  const handleUndoDelete = async () => {
    if (!undoItem) return;
    try {
      await watchlist.restoreItem.mutateAsync(undoItem.id);
      showToast(`Restored "${undoItem.title}" to library`);
      setShowUndoSnackbar(false);
      setUndoItem(null);
    } catch (e) {
      showToast("Failed to undo deletion", "error");
    }
  };

  return (
    <main className="space-y-10 pb-16">
      {/* Cinematic Hero Backdrop Banner */}
      <section className="relative overflow-hidden bg-gradient-to-r from-teal-950 via-slate-900 to-indigo-950 text-white py-16 md:py-24">
        {/* Subtle ambient lighting effect */}
        <div className="absolute -left-1/4 -top-1/4 h-[150%] w-[150%] bg-[radial-gradient(ellipse_at_center,rgba(36,117,110,0.18)_0%,transparent_60%)] pointer-events-none" />
        
        <div className="relative mx-auto max-w-7xl px-4 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-md border border-white/15">
              <Sparkles className="h-3.5 w-3.5 text-accent" /> Introducing Framekeep Registry
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent">
              Track what you consume.
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-slate-300 leading-relaxed max-w-2xl">
              Organize your films, series, books, and games in a single premium library. Complete statistics, custom collections, and unified search suggestions.
            </p>
            <form
              className="relative max-w-xl"
              onSubmit={(event) => {
                event.preventDefault();
                if (query.trim().length >= 3) navigate(`/search?q=${encodeURIComponent(query.trim())}`);
              }}
            >
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
              <Input
                aria-label="Search registry"
                className="h-12 bg-white/10 border-white/20 text-white placeholder-slate-400 pl-11 pr-28 rounded-xl backdrop-blur-md focus:border-primary focus:ring-primary focus:bg-white/15"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search movies, TV shows, books, and games..."
              />
              <Button
                type="submit"
                className="absolute right-1.5 top-1.5 h-9 font-semibold px-4 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={query.trim().length < 3}
              >
                Search
              </Button>
            </form>
          </div>
          <div className="flex justify-start">
            <Button
              size="md"
              variant="secondary"
              onClick={() => navigate("/watchlist")}
              className="rounded-xl px-5 h-11 bg-white hover:bg-slate-100 text-slate-900 border-none font-bold shadow-lg"
            >
              Open Library <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Library Overview Statistics Highlight Block */}
      <section className="mx-auto max-w-7xl px-4">
        {statsQuery.isLoading ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <Skeleton key={idx} className="h-24 rounded-2xl" />
            ))}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { label: "Total Tracker", val: stats.total, icon: ListVideo, color: "text-primary bg-primary/10 border-primary/20" },
              { label: "Completion Rate", val: `${stats.completionRate}%`, icon: Percent, color: "text-accent bg-accent/10 border-accent/20" },
              { label: "Active Watching", val: stats.watching, icon: Clapperboard, color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
              { label: "Recent Adds", val: stats.recentlyAdded, icon: CheckCircle2, color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20" }
            ].map((card, index) => {
              const Icon = card.icon;
              return (
                <div key={index} className="flex items-center gap-4 p-4 rounded-2xl border border-border/80 bg-card shadow-sm hover:shadow-md transition">
                  <div className={`p-3 rounded-xl border ${card.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">{card.label}</span>
                    <span className="text-xl sm:text-2xl font-extrabold text-foreground">{card.val}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}
      </section>

      {/* Library Collections Horizontal Rails */}
      <div className="mx-auto max-w-7xl px-4 divide-y divide-border/60">
        {watchlist.isLoading ? (
          <div className="space-y-8 py-8">
            <div className="space-y-3">
              <Skeleton className="h-6 w-48" />
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Skeleton key={idx} className="aspect-[2/3] rounded-xl" />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <ContentRail
              title="Continue Progress"
              description="Pick up right where you left off. Items waiting to be completed."
              items={continueWatching}
              emptyMessage="Everything is completed. Your watchlist is clear!"
              onOpenDetails={setSelected}
              onUpdateStatus={handleUpdateStatus}
              onToggleFavorite={handleToggleFavorite}
              onUpdateCollection={handleUpdateCollection}
              onDelete={handleDelete}
              isPending={watchlist.updateItem.isPending}
            />

            <ContentRail
              title="Recently Added"
              description="The latest titles registered in your library."
              items={recentlyAdded}
              emptyMessage="Your library is empty. Discover and save titles now."
              onOpenDetails={setSelected}
              onUpdateStatus={handleUpdateStatus}
              onToggleFavorite={handleToggleFavorite}
              onUpdateCollection={handleUpdateCollection}
              onDelete={handleDelete}
              isPending={watchlist.updateItem.isPending}
            />

            <ContentRail
              title="Recently Completed"
              description="Titles that you've finished tracking recently."
              items={recentlyCompleted}
              emptyMessage="No completed titles yet. Keep updating your progress!"
              onOpenDetails={setSelected}
              onUpdateStatus={handleUpdateStatus}
              onToggleFavorite={handleToggleFavorite}
              onUpdateCollection={handleUpdateCollection}
              onDelete={handleDelete}
              isPending={watchlist.updateItem.isPending}
            />
          </div>
        )}

        {/* Dynamic Trending Content Rails */}
        {trending.isLoading ? (
          <div className="grid grid-cols-2 gap-4 py-8 sm:grid-cols-5">
            {Array.from({ length: 5 }).map((_, idx) => (
              <Skeleton key={idx} className="aspect-[2/3] rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="space-y-4 pt-4">
            <ContentRail
              title="Trending Movies"
              description="Popular film searches in the community."
              items={trending.movies.map(fromSearch)}
              onOpenDetails={setSelected}
              onAdd={handleAddResult}
              isPending={watchlist.addItem.isPending}
            />
            <ContentRail
              title="Trending TV Shows"
              description="Hot television series on the air."
              items={trending.shows.map(fromSearch)}
              onOpenDetails={setSelected}
              onAdd={handleAddResult}
              isPending={watchlist.addItem.isPending}
            />
            
            {/* Trending Books */}
            {trending.booksLoading ? (
              <div className="py-8"><Skeleton className="h-32 rounded-xl" /></div>
            ) : trending.booksError ? (
              <div className="py-8 text-center text-sm text-muted-foreground font-semibold">
                Trending books unavailable. <Link className="font-semibold underline text-primary" to="/search">Search books</Link>
              </div>
            ) : (
              <>
                <ContentRail
                  title="Trending Books"
                  description="Highly requested literature from Open Library."
                  items={trending.books.map(fromSearch)}
                  onOpenDetails={setSelected}
                  onAdd={handleAddResult}
                  isPending={watchlist.addItem.isPending}
                />
                {trending.hasMoreBooks && (
                  <div className="pb-4">
                    <Button variant="secondary" size="sm" onClick={() => setLoadMoreBooks(true)} disabled={loadMoreBooks}>
                      {loadMoreBooks ? "Loading..." : "Load More Books"}
                    </Button>
                  </div>
                )}
              </>
            )}

            {/* Trending Games */}
            {trending.gamesLoading ? (
              <div className="py-8"><Skeleton className="h-32 rounded-xl" /></div>
            ) : trending.gamesError ? (
              <div className="py-8 text-center text-sm text-muted-foreground font-semibold">
                Trending games unavailable. <Link className="font-semibold underline text-primary" to="/search">Search games</Link>
              </div>
            ) : (
              <>
                <ContentRail
                  title="Trending Games"
                  description="Top games played around the world, selected via RAWG."
                  items={trending.games.map(fromSearch)}
                  onOpenDetails={setSelected}
                  onAdd={handleAddResult}
                  isPending={watchlist.addItem.isPending}
                />
                {trending.hasMoreGames && (
                  <div className="pb-4">
                    <Button variant="secondary" size="sm" onClick={() => setLoadMoreGames(true)} disabled={loadMoreGames}>
                      {loadMoreGames ? "Loading..." : "Load More Games"}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Personalized Recommendations Placeholder Mockup Card Stack */}
        <section className="py-12 border-t border-border/60">
          <div className="rounded-3xl bg-gradient-to-br from-teal-950 via-slate-900 to-indigo-950 p-8 md:p-12 text-white relative overflow-hidden shadow-xl border border-white/5">
            <div className="absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 w-[300px] h-[300px] bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
            <div className="max-w-2xl relative space-y-4">
              <span className="text-xs font-bold text-accent uppercase tracking-widest block">AI RECOMMENDATIONS</span>
              <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight">Tailored Discoveries</h3>
              <p className="text-sm md:text-base text-slate-300 leading-relaxed">
                Connect and sync your library to enable active recommendations. Our algorithm checks your favorited ratings and completion history to suggest titles that matches your preference.
              </p>
              <div className="pt-4 flex flex-wrap gap-4 items-center">
                <Button size="md" onClick={() => navigate("/search")} className="rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-bold border-none">
                  Discover More
                </Button>
                <span className="text-xs text-slate-400 font-semibold select-none">Sync active status to unlock recommendations.</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Global Details Drawer and Modals */}
      <ContentDetailsDrawer content={selected} onClose={() => setSelected(null)} />

      <ConfirmationDialog
        open={deleteConfirmItem !== null}
        title="Remove from Library?"
        message={`"${deleteConfirmItem?.title}" will be soft-deleted. You can restore it from the Trash page within 30 days.`}
        confirmLabel="Remove"
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteConfirmItem(null)}
      />

      <UndoSnackbar
        open={showUndoSnackbar}
        message="Item removed."
        onUndo={handleUndoDelete}
        onExpiry={() => {
          setShowUndoSnackbar(false);
          setUndoItem(null);
        }}
        onClose={() => setShowUndoSnackbar(false)}
      />
    </main>
  );
};
