import { useEffect, useState } from "react";

import { Button } from "../ui/button";
import { Dialog } from "../ui/dialog";
import { Input } from "../ui/input";
import { Select } from "../ui/select";
import { Textarea } from "../ui/textarea";
import type { WatchStatus, WatchlistItem } from "../../types";

type Props = {
  item: WatchlistItem | null;
  open: boolean;
  onClose: () => void;
  onSave: (payload: { status: WatchStatus; rating: number | null; notes: string | null; collection: string | null }) => void;
  isSaving: boolean;
};

export const EditWatchlistDialog = ({ item, open, onClose, onSave, isSaving }: Props) => {
  const [status, setStatus] = useState<WatchStatus>("PLANNED");
  const [rating, setRating] = useState("");
  const [notes, setNotes] = useState("");
  const [collection, setCollection] = useState("");

  useEffect(() => {
    if (!item) return;
    setStatus(item.status);
    setRating(item.rating?.toString() ?? "");
    setNotes(item.notes ?? "");
    setCollection(item.collection ?? "");
  }, [item]);

  return (
    <Dialog open={open} title={item ? `Edit ${item.title}` : "Edit item"} onClose={onClose}>
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          onSave({
            status,
            rating: rating ? Number(rating) : null,
            notes: notes.trim() ? notes.trim() : null,
            collection: collection.trim() ? collection.trim() : null
          });
        }}
      >
        <label className="block space-y-1 text-sm font-medium">
          <span>Status</span>
          <Select value={status} onChange={(event) => setStatus(event.target.value as WatchStatus)}>
            <option value="PLANNED">Planned</option>
            <option value="COMPLETED">Completed</option>
          </Select>
        </label>
        <label className="block space-y-1 text-sm font-medium">
          <span>Rating</span>
          <Input
            type="number"
            min={1}
            max={10}
            value={rating}
            onChange={(event) => setRating(event.target.value)}
            placeholder="1-10"
          />
        </label>
        <label className="block space-y-1 text-sm font-medium">
          <span>Collection Tag</span>
          <Input
            value={collection}
            onChange={(event) => setCollection(event.target.value)}
            placeholder="e.g. Sci-Fi, Marvel"
          />
        </label>
        <label className="block space-y-1 text-sm font-medium">
          <span>Notes</span>
          <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} />
        </label>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
            Save
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
