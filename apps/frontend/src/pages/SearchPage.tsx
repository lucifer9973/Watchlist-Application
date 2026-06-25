import { Search } from "lucide-react";
import axios from "axios";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import {
  ContentDetailsDrawer,
  type ContentSummary
} from "../components/content/ContentDetailsDrawer";
import { SearchResultCard } from "../components/search/SearchResultCard";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Skeleton } from "../components/ui/skeleton";
import { Tabs } from "../components/ui/tabs";
import { Button } from "../components/ui/button";
import { useToast } from "../components/ui/toast";
import { useDebounce } from "../hooks/useDebounce";
import { useSearchMovies } from "../hooks/useSearchMovies";
import { useSearchBooks } from "../hooks/useSearchBooks";
import { DuplicateWatchlistError, useWatchlist } from "../hooks/useWatchlist";
import type { SearchResult, WatchStatus } from "../types";

export const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(initialQuery);
  const [selected, setSelected] = useState<ContentSummary | null>(null);
  const [activeTab, setActiveTab] = useState<"MOVIE" | "TV_SHOW" | "BOOK" | "GAME">("MOVIE");
  const [showSlowMessage, setShowSlowMessage] = useState(false);
  const debouncedQuery = useDebounce(query);

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

  // Show slow response message after 4 seconds for books
  useEffect(() => {
    if (activeTab === "BOOK" && bookSearchQuery.isLoading) {
      const timer = setTimeout(() => setShowSlowMessage(true), 4000);
      return () => clearTimeout(timer);
    } else {
      setShowSlowMessage(false);
    }
  }, [activeTab, bookSearchQuery.isLoading]);

  const currentQuery = activeTab === "BOOK" ? bookSearchQuery : movieSearchQuery;
  const watchlist = useWatchlist();
  const showToast = useToast();

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const addResult = (result: SearchResult, status: WatchStatus) => {
    watchlist.addItem.mutate(
      {
        imdbId: activeTab === "BOOK" ? null : result.imdbID,
        externalId: result.imdbID,
        source: activeTab === "BOOK" ? "OPEN_LIBRARY" : "OMDB",
        title: result.title,
        author: result.author,
        year: result.year,
        type: result.type,
        poster: result.poster,
        contentType: activeTab,
        status
      },
      {
        onSuccess: () => showToast("Added to Library"),
        onError: (error) => {
          const message =
            error instanceof DuplicateWatchlistError
              ? error.message
              : axios.isAxiosError<{ message?: string }>(error)
                ? error.response?.data?.message ?? "Could not add title"
                : "Could not add title";
          showToast(message, "error");
        }
      }
    );
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-6">
      <section className="grid gap-4">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-semibold">Search titles</h2>
          <p className="mt-1 text-muted-foreground">Find movies and TV shows from OMDb and save them.</p>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-2xl">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              aria-label="Search movies and TV shows"
              className="pl-9"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search Breaking Bad, Dune, The Bear..."
            />
          </div>
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as any)}
            tabs={[
              { value: "MOVIE", label: "Movies" },
              { value: "TV_SHOW", label: "TV Shows" },
              { value: "BOOK", label: "Books" },
              { value: "GAME", label: "Games (Coming Soon)" }
            ]}
          />
        </div>
      </section>

      <section className="mt-6">
        {activeTab === "GAME" ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              Games search is coming soon!
            </CardContent>
          </Card>
        ) : query.trim().length < 3 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              Type at least three characters to search.
            </CardContent>
          </Card>
        ) : currentQuery.isLoading || debouncedQuery !== query ? (
          <>
            {showSlowMessage && activeTab === "BOOK" && (
              <Card className="mb-4 border-yellow-200 bg-yellow-50">
                <CardContent className="p-4 text-center text-sm text-yellow-800">
                  Open Library is responding slowly... Please wait.
                </CardContent>
              </Card>
            )}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-40" />
              ))}
            </div>
          </>
        ) : currentQuery.isError ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-destructive mb-4">
                {activeTab === "BOOK" ? "Book search temporarily unavailable." : "Search failed. Try again."}
              </p>
              {activeTab === "BOOK" && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => bookSearchQuery.refetch()}
                  disabled={bookSearchQuery.isFetching}
                >
                  {bookSearchQuery.isFetching ? "Retrying..." : "Retry"}
                </Button>
              )}
            </CardContent>
          </Card>
        ) : currentQuery.data?.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">No matches found.</CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {currentQuery.data?.map((result) => (
              <SearchResultCard
                key={result.imdbID}
                result={result}
                onAdd={(status) => addResult(result, status)}
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
                isAdding={watchlist.addItem.isPending}
              />
            ))}
          </div>
        )}
      </section>
      <ContentDetailsDrawer content={selected} onClose={() => setSelected(null)} />
    </main>
  );
};
