import { Search } from "lucide-react";
import { useState } from "react";

import { SearchResultCard } from "../components/search/SearchResultCard";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Skeleton } from "../components/ui/skeleton";
import { useDebounce } from "../hooks/useDebounce";
import { useSearchMovies } from "../hooks/useSearchMovies";
import { useWatchlist } from "../hooks/useWatchlist";
import type { SearchResult, WatchStatus } from "../types";

export const SearchPage = () => {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query);
  const searchQuery = useSearchMovies(debouncedQuery);
  const watchlist = useWatchlist();

  const addResult = (result: SearchResult, status: WatchStatus) => {
    watchlist.addItem.mutate({
      imdbId: result.imdbID,
      title: result.title,
      year: result.year,
      type: result.type,
      poster: result.poster,
      status
    });
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-6">
      <section className="grid gap-4">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-semibold">Search titles</h2>
          <p className="mt-1 text-muted-foreground">Find movies and TV shows from OMDb and save them.</p>
        </div>
        <div className="relative max-w-2xl">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            aria-label="Search movies and TV shows"
            className="pl-9"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search Breaking Bad, Dune, The Bear..."
          />
        </div>
      </section>

      <section className="mt-6">
        {query.trim().length < 3 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              Type at least three characters to search.
            </CardContent>
          </Card>
        ) : searchQuery.isLoading || debouncedQuery !== query ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-40" />
            ))}
          </div>
        ) : searchQuery.isError ? (
          <Card>
            <CardContent className="p-8 text-center text-destructive">Search failed. Try again.</CardContent>
          </Card>
        ) : searchQuery.data?.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">No movies or TV shows found.</CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {searchQuery.data?.map((result) => (
              <SearchResultCard
                key={result.imdbID}
                result={result}
                onAdd={(status) => addResult(result, status)}
                isAdding={watchlist.addItem.isPending}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
};
