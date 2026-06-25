import { useState } from "react";
import { useCollections } from "../../hooks/useCollections";
import { Plus, X } from "lucide-react";
import { Button } from "./button";
import { Input } from "./input";

type CollectionSelectorProps = {
  currentValue: string | null;
  onChange: (value: string | null) => void;
  disabled?: boolean;
};

export const CollectionSelector = ({
  currentValue,
  onChange,
  disabled = false
}: CollectionSelectorProps) => {
  const { data: collections = [], addCollection } = useCollections();
  const [isCreating, setIsCreating] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [error, setError] = useState("");

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === "__new__") {
      setIsCreating(true);
      setNewCollectionName("");
      setError("");
    } else {
      onChange(val === "" ? null : val);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newCollectionName.trim();
    if (!name) return;

    if (collections.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
      setError("Already exists");
      return;
    }

    try {
      await addCollection.mutateAsync(name);
      onChange(name);
      setIsCreating(false);
      setNewCollectionName("");
      setError("");
    } catch (err) {
      setError("Failed to create");
    }
  };

  if (isCreating) {
    return (
      <form onSubmit={handleCreate} className="flex flex-col gap-1.5 p-2 border border-border rounded bg-muted/40">
        <span className="text-xs font-semibold text-muted-foreground">New Collection</span>
        <div className="flex gap-1.5">
          <Input
            value={newCollectionName}
            onChange={(e) => {
              setNewCollectionName(e.target.value);
              setError("");
            }}
            placeholder="Name..."
            className="h-8 py-1 px-2 text-xs"
            autoFocus
            disabled={addCollection.isPending}
          />
          <Button
            type="submit"
            size="sm"
            className="h-8 w-8 p-0"
            disabled={!newCollectionName.trim() || addCollection.isPending}
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setIsCreating(false)}
            disabled={addCollection.isPending}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
        {error && <span className="text-[10px] text-destructive font-medium">{error}</span>}
      </form>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <select
        value={currentValue ?? ""}
        onChange={handleSelectChange}
        disabled={disabled}
        className="w-full bg-background text-foreground text-xs rounded border border-border py-1.5 px-2 focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50 transition"
        aria-label="Assign to Collection"
      >
        <option value="">No Collection</option>
        {collections.map((c) => (
          <option key={c.id} value={c.name}>
            {c.name}
          </option>
        ))}
        <option value="__new__" className="text-primary font-semibold">
          + Create New...
        </option>
      </select>
    </div>
  );
};
