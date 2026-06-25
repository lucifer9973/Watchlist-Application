import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Sparkles, History, Trash2, X } from "lucide-react";
import axios from "axios";

import {
  ContentDetailsDrawer,
  type ContentSummary
} from "../components/content/ContentDetailsDrawer";
import { MediaGrid } from "../components/ui/MediaGrid";
import { MediaCard } from "../components/ui/MediaCard";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Skeleton } from "../components/ui/skeleton";
import { Tabs } from "../components/ui/tabs";
import { Button } from "../components/ui/button";
import { useToast } from "../components/ui/toast";
import { useDebounce } from "../hooks/useDebounce";
import { useSearchMovies } from "../hooks/useSearchMovies";
import { useSearchBooks } from "../hooks/useSearchBooks";
import { useSearchGames } from "../hooks/useSearchGames";
import { DuplicateWatchlistError, useWatchlist } from "../hooks/useWatchlist";
import { findLibraryItem } from "../utils/duplicateHelper";
import type { SearchResult, WatchStatus } from "../types";

const TRENDING_SEARCHES = ["Dune", "Elden Ring", "Breaking Bad", "Minecraft", "Interstellar"];

export const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(initialQuery);
  const [selected, setSelected] = useState<ContentSummary | null>(null);
  const [activeTab, setActiveTab] = useState<"MOVIE" | "TV_SHOW" | "BOOK" | "GAME">("MOVIE");
  const [showSlowMessage, setShowSlowMessage] = useState(false);
  const debouncedQuery = useDebounce(query);

  const inputRef = useRef<HTMLInputElement>(null);

  // Recent searches state
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("recentSearches") || "[]");
    } catch {
      return [];
    }
  });

  const searchType = activeTab === "MOVIE" ? "movie" : activeTab === "TV_SHOW" ? "series" : undefined;
  const movieSearchQuery = useSearchMovies(
    debouncedQuery,
    searchType,
    activeTab === "MOVIE" || activeTab === "TV_SHOW"
  );
  
  const bookSearchQuery = useSearchBooks(
    debouncedQuery,
    activeTab === "BOOK"
  );

  const gameSearchQuery = useSearchGames(
    debouncedQuery,
    activeTab === "GAME"
  );

  useEffect(() => {
    if ((activeTab === "BOOK" || activeTab === "GAME") && (activeTab === "BOOK" ? bookSearchQuery.isLoading : gameSearchQuery.isLoading)) {
      const timer = setTimeout(() => setShowSlowMessage(true), 4000);
      return () => clearTimeout(timer);
    } else {
      setShowSlowMessage(false);
    }
  }, [activeTab, bookSearchQuery.isLoading, gameSearchQuery.isLoading]);

  const currentQuery = activeTab === "BOOK" ? bookSearchQuery : activeTab === "GAME" ? gameSearchQuery : movieSearchQuery;
  const watchlist = useWatchlist();
  const showToast = useToast();

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  // Save query to recent searches
  useEffect(() => {
    const trimmed = debouncedQuery.trim();
    if (trimmed.length >= 3) {
      setRecentSearches((prev) => {
        const next = [trimmed, ...prev.filter((t) => t !== trimmed)].slice(0, 5);
        localStorage.setItem("recentSearches", JSON.stringify(next));
        return next;
      });
      // Synchronize URL search params
      setSearchParams({ q: trimmed });
    } else if (trimmed === "") {
      setSearchParams({});
    }
  }, [debouncedQuery, setSearchParams]);

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("recentSearches");
    showToast("Search history cleared");
  };

  const handleRecentClick = (term: string) => {
    setQuery(term);
    inputRef.current?.focus();
  };

  // Keyboard navigation logic
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setQuery("");
    }
  };

  const addResult = async (result: SearchResult, status: WatchStatus) => {
    try {
      await watchlist.addItem.mutateAsync({
        imdbId: (activeTab === "BOOK" || activeTab === "GAME") ? null : result.imdbID,
        externalId: result.imdbID,
        source: activeTab === "BOOK" ? "OPEN_LIBRARY" : activeTab === "GAME" ? "RAWG" : "OMDB",
        title: result.title,
        author: result.author,
        year: result.year,
        type: result.type,
        poster: result.poster,
        contentType: activeTab,
        status
      });
      showToast("Added to Library");
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

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 space-y-8">
      {/* Search Title */}
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight">Search Library</h1>
        <p className="text-muted-foreground text-sm">
          Discover movies, TV shows, books, and games to build your list.
        </p>
      </div>

      {/* Inputs and Tabs */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-2xl">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            aria-label="Search movies, TV shows, books, and games"
            className="pl-9 pr-10"
            value={query}
            onKeyDown={handleKeyDown}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search Breaking Bad, Dune, Elden Ring..."
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-3.5 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as any)}
          tabs={[
            { value: "MOVIE", label: "Movies" },
            { value: "TV_SHOW", label: "TV Shows" },
            { value: "BOOK", label: "Books" },
            { value: "GAME", label: "Games" }
          ]}
        />
      </div>

      {/* Secondary Search suggestions and history section */}
      {query.trim().length < 3 && (
        <section className="grid gap-6 md:grid-cols-2">
          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <Card className="bg-muted/10 border-border/80">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-border/60 pb-2">
                  <span className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1.5">
                    <History className="h-3.5 w-3.5" /> Recent Searches
                  </span>
                  <button
                    onClick={clearRecentSearches}
                    className="text-[10px] text-muted-foreground hover:text-destructive font-semibold flex items-center gap-1"
                  >
                    <Trash2 className="h-3 w-3" /> Clear
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((term) => (
                    <button
                      key={term}
                      onClick={() => handleRecentClick(term)}
                      className="px-2.5 py-1 text-xs font-medium bg-muted rounded-full hover:bg-primary/10 hover:text-primary transition"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Trending Searches */}
          <Card className="bg-muted/10 border-border/80">
            <CardContent className="p-4 space-y-3">
              <div className="border-b border-border/60 pb-2">
                <span className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-primary" /> Trending Searches
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {TRENDING_SEARCHES.map((term) => (
                  <button
                    key={term}
                    onClick={() => handleRecentClick(term)}
                    className="px-2.5 py-1 text-xs font-medium bg-muted rounded-full hover:bg-primary/10 hover:text-primary transition"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Search results container */}
      <section>
        {query.trim().length < 3 ? (
          <Card className="border-dashed bg-muted/5">
            <CardContent className="p-12 text-center text-muted-foreground text-sm">
              Type at least three characters to search.
            </CardContent>
          </Card>
        ) : currentQuery.isLoading || debouncedQuery !== query ? (
          <>
            {showSlowMessage && (activeTab === "BOOK" || activeTab === "GAME") && (
              <Card className="mb-4 border-yellow-250 bg-yellow-50">
                <CardContent className="p-3 text-center text-xs text-yellow-800 font-semibold">
                  {activeTab === "BOOK" ? "Open Library" : "RAWG"} is responding slowly... Please wait.
                </CardContent>
              </Card>
            )}
            <MediaGrid>
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="aspect-[2/3.5] rounded-xl" />
              ))}
            </MediaGrid>
          </>
        ) : currentQuery.isError ? (
          <Card className="border-destructive/20 bg-destructive/5">
            <CardContent className="p-8 text-center space-y-3">
              <p className="text-destructive font-medium">
                {activeTab === "BOOK" 
                  ? "Book search temporarily unavailable." 
                  : activeTab === "GAME" 
                    ? "Games search temporarily unavailable." 
                    : "Search failed. Try again."}
              </p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => activeTab === "BOOK" ? bookSearchQuery.refetch() : gameSearchQuery.refetch()}
                disabled={activeTab === "BOOK" ? bookSearchQuery.isFetching : gameSearchQuery.isFetching}
              >
                Retry
              </Button>
            </CardContent>
          </Card>
        ) : currentQuery.data?.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">No matches found.</CardContent>
          </Card>
        ) : (
          <MediaGrid>
            {currentQuery.data?.map((result) => {
              const matchedItem = findLibraryItem(
                activeTab === "BOOK" ? "OPEN_LIBRARY" : activeTab === "GAME" ? "RAWG" : "OMDB",
                result.imdbID,
                watchlist.data
              );

              const cardItem = {
                imdbId: (activeTab === "BOOK" || activeTab === "GAME") ? null : result.imdbID,
                externalId: result.imdbID,
                source: activeTab === "BOOK" ? "OPEN_LIBRARY" : activeTab === "GAME" ? "RAWG" : "OMDB",
                title: result.title,
                author: result.author,
                year: result.year,
                type: result.type,
                poster: result.poster,
                status: matchedItem?.status
              };

              return (
                <MediaCard
                  key={result.imdbID}
                  item={cardItem}
                  onOpenDetails={() =>
                    setSelected({
                      imdbId: result.imdbID,
                      title: result.title,
                      year: result.year,
                      type: result.type,
                      poster: result.poster,
                      contentType: activeTab,
                      collection: null
                    })
                  }
                  onAdd={(status) => addResult(result, status)}
                  isPending={watchlist.addItem.isPending}
                />
              );
            })}
          </MediaGrid>
        )}
      </section>
      <ContentDetailsDrawer content={selected} onClose={() => setSelected(null)} />
    </main>
  );
};
