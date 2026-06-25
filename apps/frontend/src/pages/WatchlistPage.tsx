import { useMemo, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FolderHeart, Star, Trash2, Plus, Search, Heart, Edit2, Save, X, Archive } from "lucide-react";
import { cn } from "../lib/utils";

import {
  ContentDetailsDrawer,
  type ContentSummary
} from "../components/content/ContentDetailsDrawer";
import { MediaGrid } from "../components/ui/MediaGrid";
import { MediaCard } from "../components/ui/MediaCard";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Select } from "../components/ui/select";
import { Skeleton } from "../components/ui/skeleton";
import { Tabs } from "../components/ui/tabs";
import { Button } from "../components/ui/button";
import { EmptyState } from "../components/ui/EmptyState";
import { ConfirmationDialog } from "../components/ui/ConfirmationDialog";
import { UndoSnackbar } from "../components/ui/UndoSnackbar";
import { useToast } from "../components/ui/toast";
import { useWatchlist } from "../hooks/useWatchlist";
import { useCollections } from "../hooks/useCollections";
import type { WatchStatus, WatchlistFilters, WatchlistItem } from "../types";

export const WatchlistPage = () => {
  const navigate = useNavigate();
  const showToast = useToast();

  const [activeTab, setActiveTab] = useState<string>("MOVIE");

  // Keep filters independent for each tab
  const [tabFilters, setTabFilters] = useState<Record<string, { status: string; search: string; sortBy: string }>>({
    MOVIE: { status: "ALL", search: "", sortBy: "createdAt" },
    TV_SHOW: { status: "ALL", search: "", sortBy: "createdAt" },
    BOOK: { status: "ALL", search: "", sortBy: "createdAt" },
    GAME: { status: "ALL", search: "", sortBy: "createdAt" },
    FAVORITES: { status: "ALL", search: "", sortBy: "createdAt" },
    COLLECTIONS: { status: "ALL", search: "", sortBy: "createdAt" }
  });

  const currentFilters = tabFilters[activeTab] || { status: "ALL", search: "", sortBy: "createdAt" };

  const [selected, setSelected] = useState<ContentSummary | null>(null);

  // Soft-delete states
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<WatchlistItem | null>(null);
  const [undoItem, setUndoItem] = useState<WatchlistItem | null>(null);
  const [showUndoSnackbar, setShowUndoSnackbar] = useState(false);

  // Collections Tab States
  const {
    data: collections = [],
    addCollection,
    updateCollection,
    removeCollection
  } = useCollections();
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameName, setRenameName] = useState("");

  // Remember scroll positions
  const scrollPositions = useRef<Record<string, number>>({});

  const handleTabChange = (newTab: string) => {
    scrollPositions.current[activeTab] = window.scrollY;
    setActiveTab(newTab);
  };

  useEffect(() => {
    const targetScroll = scrollPositions.current[activeTab] ?? 0;
    const timer = setTimeout(() => {
      window.scrollTo({ top: targetScroll, behavior: "auto" });
    }, 20);
    return () => clearTimeout(timer);
  }, [activeTab]);

  // Construct API filters
  const apiFilters = useMemo((): WatchlistFilters => {
    const isFav = activeTab === "FAVORITES" ? true : undefined;
    const coll = activeTab === "COLLECTIONS" ? selectedCollection || "__none__" : undefined;

    let contentType: any = undefined;
    if (["MOVIE", "TV_SHOW", "BOOK", "GAME"].includes(activeTab)) {
      contentType = activeTab;
    }

    return {
      status: currentFilters.status === "ALL" ? undefined : (currentFilters.status as WatchStatus),
      sortBy: currentFilters.sortBy as any,
      sortOrder: currentFilters.sortBy === "createdAt" ? "desc" : "asc",
      search: currentFilters.search || undefined,
      contentType,
      favorite: isFav,
      collection: coll === "__none__" ? undefined : coll
    };
  }, [activeTab, currentFilters, selectedCollection]);

  const watchlist = useWatchlist(apiFilters);

  // Update specific filter property for active tab
  const updateFilter = (key: "status" | "search" | "sortBy", value: string) => {
    setTabFilters((prev) => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        [key]: value
      }
    }));
  };

  // Mutator triggers
  const handleUpdateStatus = async (item: WatchlistItem, status: WatchStatus) => {
    try {
      await watchlist.updateItem.mutateAsync({ id: item.id, payload: { status } });
      showToast(`Moved "${item.title}" to ${status.toLowerCase()}`);
    } catch (e) {
      showToast("Failed to update status", "error");
    }
  };

  const handleToggleFavorite = async (item: WatchlistItem) => {
    try {
      await watchlist.updateItem.mutateAsync({ id: item.id, payload: { favorite: !item.favorite } });
      showToast(!item.favorite ? `Favorited "${item.title}"` : `Unfavorited "${item.title}"`);
    } catch (e) {
      showToast("Failed to update favorite status", "error");
    }
  };

  const handleUpdateCollection = async (item: WatchlistItem, collectionName: string | null) => {
    try {
      await watchlist.updateItem.mutateAsync({ id: item.id, payload: { collection: collectionName } });
      showToast(collectionName ? `Assigned to "${collectionName}"` : `Removed from collection`);
    } catch (e) {
      showToast("Failed to update collection", "error");
    }
  };

  const handleDeleteItem = async () => {
    if (!deleteConfirmItem) return;
    const itemToDelete = deleteConfirmItem;
    setDeleteConfirmItem(null);
    try {
      await watchlist.deleteItem.mutateAsync(itemToDelete.id);
      setUndoItem(itemToDelete);
      setShowUndoSnackbar(true);
    } catch (e) {
      showToast("Failed to delete item", "error");
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

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newCollectionName.trim();
    if (!name) return;
    try {
      await addCollection.mutateAsync(name);
      setNewCollectionName("");
      showToast("Collection created");
    } catch (err) {
      showToast("Collection already exists", "error");
    }
  };

  const handleRenameCollection = async (id: string) => {
    const name = renameName.trim();
    if (!name) return;
    try {
      await updateCollection.mutateAsync({ id, name });
      setRenameId(null);
      setRenameName("");
      showToast("Collection renamed");
    } catch (err) {
      showToast("Failed to rename collection", "error");
    }
  };

  const handleDeleteCollection = async (id: string) => {
    if (!confirm("Delete this collection? Items will not be deleted but will lose this assignment.")) return;
    try {
      await removeCollection.mutateAsync(id);
      showToast("Collection deleted");
    } catch (err) {
      showToast("Failed to delete collection", "error");
    }
  };

  // Filter items in memory if needed or rely on backend
  const displayItems = watchlist.data ?? [];

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 space-y-8">
      {/* Header Info */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Your Library</h1>
          <p className="mt-1 text-muted-foreground text-sm">
            Inspect, filter, categorize, and organize your media items in one place.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/deleted")} className="gap-2 font-semibold border border-border shadow-sm">
            <Archive className="h-4 w-4" /> Trash (Recently Deleted)
          </Button>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="border-b border-border">
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          tabs={[
            { value: "MOVIE", label: "Movies" },
            { value: "TV_SHOW", label: "TV Shows" },
            { value: "BOOK", label: "Books" },
            { value: "GAME", label: "Games" },
            { value: "FAVORITES", label: "Favorites" },
            { value: "COLLECTIONS", label: "Collections" }
          ]}
        />
      </div>

      {/* Filter and Search controls */}
      {activeTab !== "COLLECTIONS" && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              value={currentFilters.search}
              onChange={(e) => updateFilter("search", e.target.value)}
              placeholder={`Search in ${activeTab.toLowerCase().replace("_", " ")}s...`}
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <Select
              value={currentFilters.status}
              onChange={(e) => updateFilter("status", e.target.value)}
              className="w-40"
            >
              <option value="ALL">All Statuses</option>
              <option value="PLANNED">Planned (Want)</option>
              <option value="WATCHING">Watching</option>
              <option value="COMPLETED">Completed</option>
            </Select>
            <Select
              value={currentFilters.sortBy}
              onChange={(e) => updateFilter("sortBy", e.target.value)}
              className="w-44"
            >
              <option value="createdAt">Date Added</option>
              <option value="title">Title (A-Z)</option>
              <option value="year">Release Year</option>
            </Select>
          </div>
        </div>
      )}

      {/* Main Tab Render Grid */}
      <section className="min-h-[400px]">
        {activeTab === "COLLECTIONS" ? (
          /* Collections Management View */
          <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
            {/* Sidebar Collection List */}
            <aside className="space-y-6 border-r border-border/50 pr-6">
              <form onSubmit={handleCreateCollection} className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                  New Collection
                </label>
                <div className="flex gap-2">
                  <Input
                    value={newCollectionName}
                    onChange={(e) => setNewCollectionName(e.target.value)}
                    placeholder="Marvel, Books 2026..."
                    className="h-9 text-xs"
                  />
                  <Button type="submit" size="sm" className="h-9 px-3">
                    Add
                  </Button>
                </div>
              </form>

              <div className="space-y-2">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                  Collections list
                </span>
                {collections.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No collections created yet.</p>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    <button
                      onClick={() => setSelectedCollection(null)}
                      className={cn(
                        "w-full text-left px-3 py-2 text-xs font-semibold rounded-lg transition",
                        selectedCollection === null
                          ? "bg-primary text-primary-foreground font-bold shadow-sm"
                          : "hover:bg-muted text-foreground"
                      )}
                    >
                      All Items
                    </button>
                    {collections.map((col) => (
                      <div
                        key={col.id}
                        className={cn(
                          "group/col flex items-center justify-between px-3 py-1.5 rounded-lg transition text-xs",
                          selectedCollection === col.name
                            ? "bg-primary/10 text-primary font-bold"
                            : "hover:bg-muted text-foreground"
                        )}
                      >
                        {renameId === col.id ? (
                          <div className="flex items-center gap-1.5 w-full">
                            <Input
                              value={renameName}
                              onChange={(e) => setRenameName(e.target.value)}
                              className="h-7 text-xs py-0.5 px-2.5"
                              autoFocus
                            />
                            <button
                              onClick={() => handleRenameCollection(col.id)}
                              className="text-primary hover:text-primary/80"
                            >
                              <Save className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => setRenameId(null)} className="text-muted-foreground">
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => setSelectedCollection(col.name)}
                              className="flex-1 text-left py-1 font-semibold"
                            >
                              {col.name}
                            </button>
                            <div className="opacity-0 group-hover/col:opacity-100 flex items-center gap-1.5 transition">
                              <button
                                onClick={() => {
                                  setRenameId(col.id);
                                  setRenameName(col.name);
                                }}
                                className="text-muted-foreground hover:text-foreground"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteCollection(col.id)}
                                className="text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </aside>

            {/* Collection Items Grid */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <FolderHeart className="h-5 w-5 text-primary" />
                <h3 className="font-bold text-lg">
                  {selectedCollection ? `Collection: ${selectedCollection}` : "All Items"}
                </h3>
                <span className="text-xs text-muted-foreground font-semibold bg-muted px-2 py-0.5 rounded-full">
                  {displayItems.length} items
                </span>
              </div>

              {watchlist.isLoading ? (
                <MediaGrid>
                  {Array.from({ length: 4 }).map((_, idx) => (
                    <div key={idx} className="aspect-[2/3.5] rounded-xl bg-muted animate-pulse" />
                  ))}
                </MediaGrid>
              ) : displayItems.length === 0 ? (
                <EmptyState
                  title="No items in this collection"
                  description="Assign items to this collection using the dropdown option on media cards."
                  icon={FolderHeart}
                />
              ) : (
                <MediaGrid>
                  {displayItems.map((item) => (
                    <MediaCard
                      key={item.id}
                      item={item}
                      onOpenDetails={() =>
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
                      onUpdateStatus={(status) => handleUpdateStatus(item, status)}
                      onToggleFavorite={() => handleToggleFavorite(item)}
                      onUpdateCollection={(col) => handleUpdateCollection(item, col)}
                      onDelete={() => setDeleteConfirmItem(item)}
                      isPending={watchlist.updateItem.isPending}
                    />
                  ))}
                </MediaGrid>
              )}
            </div>
          </div>
        ) : (
          /* Normal Media Categories View (Movies, TV Shows, Books, Games, Favorites) */
          <>
            {watchlist.isLoading ? (
              <MediaGrid>
                {Array.from({ length: 5 }).map((_, idx) => (
                  <div key={idx} className="aspect-[2/3.5] rounded-xl bg-muted animate-pulse" />
                ))}
              </MediaGrid>
            ) : watchlist.isError ? (
              <Card className="border-destructive/20 bg-destructive/5 text-center p-8">
                <CardContent className="space-y-4">
                  <p className="text-destructive font-semibold">Could not load library contents.</p>
                  <Button onClick={() => watchlist.refetch()}>Retry</Button>
                </CardContent>
              </Card>
            ) : displayItems.length === 0 ? (
              <EmptyState
                title={`No ${activeTab.toLowerCase().replace("_", " ")}s found`}
                description={
                  currentFilters.search
                    ? "Try adjusting your search query or filters."
                    : "Add items to your library from the search tab to track them."
                }
                actionLabel="Go to Search"
                onAction={() => navigate("/search")}
                icon={activeTab === "FAVORITES" ? Heart : undefined}
              />
            ) : (
              <MediaGrid>
                {displayItems.map((item) => (
                  <MediaCard
                    key={item.id}
                    item={item}
                    onOpenDetails={() =>
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
                    onUpdateStatus={(status) => handleUpdateStatus(item, status)}
                    onToggleFavorite={() => handleToggleFavorite(item)}
                    onUpdateCollection={(col) => handleUpdateCollection(item, col)}
                    onDelete={() => setDeleteConfirmItem(item)}
                    isPending={watchlist.updateItem.isPending}
                  />
                ))}
              </MediaGrid>
            )}
          </>
        )}
      </section>

      {/* Modals & snackbars */}
      <ConfirmationDialog
        open={deleteConfirmItem !== null}
        title="Remove from Library?"
        message={`"${deleteConfirmItem?.title}" will be soft-deleted. You can restore it from the Trash list within 30 days.`}
        confirmLabel="Remove"
        onConfirm={handleDeleteItem}
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

      <ContentDetailsDrawer content={selected} onClose={() => setSelected(null)} />
    </main>
  );
};
