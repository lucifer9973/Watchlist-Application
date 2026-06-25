import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getCollections,
  createCollection,
  renameCollection,
  deleteCollection
} from "../api/watchlistApi";

export const collectionKeys = {
  all: ["collections"] as const
};

export const useCollections = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: collectionKeys.all,
    queryFn: getCollections
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: collectionKeys.all });
    // Also invalidate watchlist because items matching this collection will be updated
    void queryClient.invalidateQueries({ queryKey: ["watchlist"] });
  };

  const addCollection = useMutation({
    mutationFn: (name: string) => createCollection(name),
    onSuccess: invalidate
  });

  const updateCollection = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => renameCollection(id, name),
    onSuccess: invalidate
  });

  const removeCollection = useMutation({
    mutationFn: (id: string) => deleteCollection(id),
    onSuccess: invalidate
  });

  return {
    ...query,
    addCollection,
    updateCollection,
    removeCollection
  };
};
