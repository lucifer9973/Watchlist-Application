import { ArrowRight, Search } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  ContentDetailsDrawer,
  type ContentSummary
} from "../components/content/ContentDetailsDrawer";
import { ContentRail } from "../components/content/ContentRail";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Skeleton } from "../components/ui/skeleton";
import { useTrendingContent } from "../hooks/useTrendingContent";
import { useWatchlist } from "../hooks/useWatchlist";
import type { SearchResult, WatchlistItem } from "../types";

const fromWatchlist = (item: WatchlistItem): ContentSummary => ({
  imdbId: item.imdbId,
  title: item.title,
  year: item.year,
  type: item.type,
  poster: item.poster
});

const fromSearch = (item: SearchResult): ContentSummary => ({
  imdbId: item.imdbID,
  title: item.title,
  year: item.year,
  type: item.type,
  poster: item.poster
});

export const HomePage = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<ContentSummary | null>(null);
  const watchlist = useWatchlist({ sortBy: "createdAt", sortOrder: "desc" });
  const trending = useTrendingContent();
  const saved = watchlist.data ?? [];
  const continueWatching = saved.filter((item) => item.status !== "WATCHED").slice(0, 5).map(fromWatchlist);
  const recentlyAdded = saved.slice(0, 5).map(fromWatchlist);

  return (
    <main>
      <section className="border-b border-border bg-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase text-accent">Your media tracker</p>
            <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">Pick up where you left off.</h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Keep movies and shows organized, inspect full details, and find the next title worth your time.
            </p>
            <form
              className="relative mt-6 max-w-xl"
              onSubmit={(event) => {
                event.preventDefault();
                if (query.trim().length >= 3) navigate(`/search?q=${encodeURIComponent(query.trim())}`);
              }}
            >
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                aria-label="Search from home"
                className="pr-28 pl-9"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search movies and TV shows"
              />
              <Button
                type="submit"
                size="sm"
                className="absolute right-1 top-1"
                disabled={query.trim().length < 3}
              >
                Search
              </Button>
            </form>
          </div>
          <Button variant="secondary" onClick={() => navigate("/watchlist")}>
            Open Watchlist <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </section>

      <div className="mx-auto max-w-7xl divide-y divide-border px-4">
        {watchlist.isLoading ? (
          <div className="grid grid-cols-2 gap-3 py-8 sm:grid-cols-5">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="aspect-[2/3]" />
            ))}
          </div>
        ) : (
          <>
            <ContentRail
              title="Continue Watching"
              description="Saved titles that are still waiting to be finished."
              items={continueWatching}
              emptyMessage="Everything is marked watched. Nicely done."
              onOpenDetails={setSelected}
            />
            <ContentRail
              title="Recently Added"
              description="The latest titles saved to your watchlist."
              items={recentlyAdded}
              emptyMessage="Your newest saves will appear here."
              onOpenDetails={setSelected}
            />
          </>
        )}

        {trending.isLoading ? (
          <div className="grid grid-cols-2 gap-3 py-8 sm:grid-cols-5">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="aspect-[2/3]" />
            ))}
          </div>
        ) : trending.isError ? (
          <div className="py-8 text-center text-sm text-destructive">
            Discovery titles are unavailable right now. <Link className="font-semibold underline" to="/search">Try search</Link>.
          </div>
        ) : (
          <>
            <ContentRail
              title="Trending Movies"
              description="Popular movie searches selected through OMDb."
              items={trending.movies.map(fromSearch)}
              onOpenDetails={setSelected}
            />
            <ContentRail
              title="Trending TV Shows"
              description="Popular series searches selected through OMDb."
              items={trending.shows.map(fromSearch)}
              onOpenDetails={setSelected}
            />
          </>
        )}
      </div>

      <ContentDetailsDrawer content={selected} onClose={() => setSelected(null)} />
    </main>
  );
};
