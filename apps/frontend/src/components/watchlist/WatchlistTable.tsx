import { Edit, Eye, Trash2 } from "lucide-react";

import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Table, Td, Th } from "../ui/table";
import type { WatchlistItem } from "../../types";

type Props = {
  items: WatchlistItem[];
  onEdit: (item: WatchlistItem) => void;
  onOpenDetails: (item: WatchlistItem) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
};

export const WatchlistTable = ({ items, onEdit, onOpenDetails, onDelete, isDeleting }: Props) => (
  <Table>
    <thead>
      <tr>
        <Th>Title</Th>
        <Th>Type</Th>
        <Th>Status</Th>
        <Th>Rating</Th>
        <Th>Notes</Th>
        <Th className="w-28">Actions</Th>
      </tr>
    </thead>
    <tbody>
      {items.map((item) => (
        <tr key={item.id}>
          <Td>
            <div className="flex min-w-56 items-center gap-3">
              <div className="h-16 w-11 shrink-0 overflow-hidden rounded bg-muted">
                {item.poster ? (
                  <img src={item.poster} alt={`${item.title} poster`} className="h-full w-full object-cover" />
                ) : null}
              </div>
              <div>
                <div className="font-semibold">{item.title}</div>
                <div className="text-sm text-muted-foreground">{item.year}</div>
              </div>
            </div>
          </Td>
          <Td>{item.type === "series" ? "TV Show" : "Movie"}</Td>
          <Td>
            <Badge tone={item.status === "WATCHED" ? "success" : "accent"}>
              {item.status === "WATCHED" ? "Watched" : "Want to Watch"}
            </Badge>
          </Td>
          <Td>{item.rating ?? "-"}</Td>
          <Td className="max-w-xs truncate">{item.notes ?? "-"}</Td>
          <Td>
            <div className="flex gap-2">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onOpenDetails(item)}
                aria-label={`View ${item.title} details`}
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => onEdit(item)} aria-label={`Edit ${item.title}`}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onDelete(item.id)}
                disabled={isDeleting}
                aria-label={`Delete ${item.title}`}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </Td>
        </tr>
      ))}
    </tbody>
  </Table>
);
