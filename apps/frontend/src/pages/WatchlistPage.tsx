import { useMemo, useState } from "react";

import {
  ContentDetailsDrawer,
  type ContentSummary
} from "../components/content/ContentDetailsDrawer";
import { EditWatchlistDialog } from "../components/watchlist/EditWatchlistDialog";
import { WatchlistTable } from "../components/watchlist/WatchlistTable";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Select } from "../components/ui/select";
import { Skeleton } from "../components/ui/skeleton";
import { Tabs } from "../components/ui/tabs";
import { useDebounce } from "../hooks/useDebounce";
import { useWatchlist } from "../hooks/useWatchlist";
import type { WatchStatus, WatchlistFilters, WatchlistItem } from "../types";

export const WatchlistPage = () => {
  const [status, setStatus] = useState<WatchlistFilters["status"]>("ALL");
  const [sortBy, setSortBy] = useState<WatchlistFilters["sortBy"]>("createdAt");
  const [search, setSearch] = useState("");
  const [contentType, setContentType] = useState<"ALL" | "MOVIE" | "TV_SHOW" | "BOOK" | "GAME">("ALL");
  const debouncedSearch = useDebounce(search, 250);
  const [editing, setEditing] = useState<WatchlistItem | null>(null);
  const [selected, setSelected] = useState<ContentSummary | null>(null);

  const filters = useMemo(
    () => ({
      status,
      sortBy,
      sortOrder: sortBy === "createdAt" ? "desc" : "asc",
      search: debouncedSearch,
      contentType: contentType === "ALL" ? undefined : contentType
    }),
    [debouncedSearch, sortBy, status, contentType]
  ) satisfies WatchlistFilters;

  const watchlist = useWatchlist(filters);

  return (
    <main className="mx-auto max-w-7xl px-4 py-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Library</h2>
          <p className="mt-1 text-muted-foreground">Filter, sort, edit, and clean up saved titles.</p>
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          <Input
            aria-label="Search within library"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Find saved title"
          />
          <Select value={status} onChange={(event) => setStatus(event.target.value as WatchlistFilters["status"])}>
            <option value="ALL">All statuses</option>
            <option value="COMPLETED">Completed</option>
            <option value="PLANNED">Planned</option>
          </Select>
          <Select value={sortBy} onChange={(event) => setSortBy(event.target.value as WatchlistFilters["sortBy"])}>
            <option value="createdAt">Recently added</option>
            <option value="title">Title</option>
            <option value="year">Year</option>
          </Select>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-4 items-center justify-between">
        <Tabs
          value={contentType}
          onValueChange={(val) => setContentType(val as any)}
          tabs={[
            { value: "ALL", label: "All" },
            { value: "MOVIE", label: "Movies" },
            { value: "TV_SHOW", label: "TV Shows" },
            { value: "BOOK", label: "Books" },
            { value: "GAME", label: "Games (Coming Soon)" }
          ]}
        />
      </div>

      <section className="mt-6">
        {watchlist.isLoading ? (
          <Skeleton className="h-72" />
        ) : watchlist.isError ? (
          <Card>
            <CardContent className="p-8 text-center text-destructive">Could not load your library.</CardContent>
          </Card>
        ) : watchlist.data?.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">No saved titles match these filters.</CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <WatchlistTable
                items={watchlist.data ?? []}
                onEdit={setEditing}
                onOpenDetails={(item) =>
                  setSelected({
                    imdbId: item.imdbId,
                    externalId: item.externalId,
                    source: item.source,
                    title: item.title,
                    year: item.year,
                    type: item.type,
                    poster: item.poster,
                    contentType: item.contentType
                  })
                }
                onDelete={(id) => watchlist.deleteItem.mutate(id)}
                isDeleting={watchlist.deleteItem.isPending}
              />
            </CardContent>
          </Card>
        )}
      </section>

      <EditWatchlistDialog
        item={editing}
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        isSaving={watchlist.updateItem.isPending}
        onSave={(payload) => {
          if (!editing) return;
          watchlist.updateItem.mutate(
            { id: editing.id, payload: { ...payload, status: payload.status as WatchStatus } },
            { onSuccess: () => setEditing(null) }
          );
        }}
      />
      <ContentDetailsDrawer content={selected} onClose={() => setSelected(null)} />
    </main>
  );
};
