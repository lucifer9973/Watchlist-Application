import { useState } from "react";
import { Trash2, Search, ArrowLeft, ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useWatchlist } from "../hooks/useWatchlist";
import { MediaGrid } from "../components/ui/MediaGrid";
import { MediaCard } from "../components/ui/MediaCard";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { EmptyState } from "../components/ui/EmptyState";
import { useToast } from "../components/ui/toast";
import { ConfirmationDialog } from "../components/ui/ConfirmationDialog";
import { useDebounce } from "../hooks/useDebounce";

export const RecentlyDeletedPage = () => {
  const navigate = useNavigate();
  const showToast = useToast();
  const [searchVal, setSearchVal] = useState("");
  const debouncedSearch = useDebounce(searchVal);

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Load soft-deleted items
  const {
    data: items = [],
    isLoading,
    isError,
    restoreItem,
    deleteItemForever,
    refetch
  } = useWatchlist({
    showDeleted: true,
    search: debouncedSearch || undefined
  });

  const handleRestore = async (id: string, title: string) => {
    try {
      await restoreItem.mutateAsync(id);
      showToast(`Restored "${title}" to library`);
    } catch (e) {
      showToast("Failed to restore item", "error");
    }
  };

  const handleDeleteForever = async () => {
    if (!deleteConfirmId) return;
    try {
      await deleteItemForever.mutateAsync(deleteConfirmId);
      showToast("Item permanently deleted");
      setDeleteConfirmId(null);
    } catch (e) {
      showToast("Failed to delete item permanently", "error");
    }
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <Button
            variant="ghost"
            onClick={() => navigate("/watchlist")}
            className="p-0 h-auto gap-1 text-sm font-semibold hover:bg-transparent hover:text-primary transition"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Library
          </Button>
          <h1 className="text-3xl font-extrabold tracking-tight">Recently Deleted</h1>
          <p className="text-muted-foreground text-sm">
            Items are retained here for 30 days before being permanently removed.
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchVal}
          onChange={(e) => setSearchVal(e.target.value)}
          placeholder="Search deleted items..."
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <MediaGrid>
          {Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} className="aspect-[2/3.5] rounded-xl bg-muted animate-pulse" />
          ))}
        </MediaGrid>
      ) : isError ? (
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="p-8 text-center space-y-4">
            <ShieldAlert className="h-10 w-10 text-destructive mx-auto" />
            <p className="text-destructive font-medium">Failed to load deleted items.</p>
            <Button onClick={() => refetch()} variant="secondary">
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : items.length === 0 ? (
        <EmptyState
          title="Trash is Empty"
          description={
            debouncedSearch
              ? "No deleted items match your search term."
              : "Items you remove from your library will appear here for 30 days."
          }
          icon={Trash2}
        />
      ) : (
        <MediaGrid>
          {items.map((item) => (
            <MediaCard
              key={item.id}
              item={item}
              onOpenDetails={() => {}}
              onRestore={() => handleRestore(item.id, item.title)}
              onDeleteForever={() => setDeleteConfirmId(item.id)}
            />
          ))}
        </MediaGrid>
      )}

      <ConfirmationDialog
        open={deleteConfirmId !== null}
        title="Permanently Delete Item?"
        message="This action cannot be undone. The item will be permanently removed from your history."
        confirmLabel="Delete Forever"
        onConfirm={handleDeleteForever}
        onClose={() => setDeleteConfirmId(null)}
      />
    </main>
  );
};
