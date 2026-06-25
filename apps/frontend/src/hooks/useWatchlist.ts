import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  addWatchlistItem,
  deleteWatchlistItem,
  getWatchlist,
  updateWatchlistItem,
  restoreWatchlistItem,
  deleteWatchlistItemForever
} from "../api/watchlistApi";
import type { CreateWatchlistItem, UpdateWatchlistItem, WatchlistFilters, WatchlistItem } from "../types";
import { isAlreadyInLibrary } from "../utils/duplicateHelper";

export class DuplicateWatchlistError extends Error {
  constructor() {
    super("Already in Library");
    this.name = "DuplicateWatchlistError";
  }
}

export const watchlistKeys = {
  all: ["watchlist"] as const,
  list: (filters: WatchlistFilters) => [...watchlistKeys.all, filters] as const
};

export const useWatchlist = (filters: WatchlistFilters = {}) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: watchlistKeys.list(filters),
    queryFn: () => getWatchlist(filters)
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: watchlistKeys.all });
    void queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
  };

  const addItem = useMutation({
    mutationFn: (payload: CreateWatchlistItem) => {
      const cachedLists = queryClient.getQueriesData<WatchlistItem[]>({
        queryKey: watchlistKeys.all
      });
      console.log("MUTATION PAYLOAD:", payload);
      console.log("CACHED LISTS:", JSON.stringify(cachedLists));
      const exists = cachedLists.some(([, items]) =>
        isAlreadyInLibrary(
          payload.source,
          payload.externalId,
          items?.filter((item) => !String(item.id).startsWith("temp-"))
        )
      );
      console.log("EXISTS RESULT:", exists);

      if (exists) {
        return Promise.reject(new DuplicateWatchlistError());
      }

      return addWatchlistItem(payload);
    },
    onMutate: async (newItemPayload) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: watchlistKeys.all });

      // Snapshot the previous values
      const previousWatchlists = queryClient.getQueriesData<WatchlistItem[]>({
        queryKey: watchlistKeys.all
      });

      // Construct a mock WatchlistItem
      const mockItem: WatchlistItem = {
        id: `temp-${Date.now()}`,
        imdbId: newItemPayload.imdbId ?? null,
        externalId: newItemPayload.externalId ?? null,
        source: newItemPayload.source ?? "OMDB",
        title: newItemPayload.title,
        author: newItemPayload.author ?? null,
        year: newItemPayload.year,
        type: (newItemPayload.type as any) || "movie",
        contentType: newItemPayload.contentType ?? "MOVIE",
        collection: newItemPayload.collection ?? null,
        poster: newItemPayload.poster ?? null,
        status: newItemPayload.status,
        rating: null,
        notes: null,
        favorite: newItemPayload.favorite ?? false,
        deletedAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Optimistically update to all active watchlist query caches
      queryClient.getQueriesData<WatchlistItem[]>({ queryKey: watchlistKeys.all }).forEach(([queryKey]) => {
        queryClient.setQueryData<WatchlistItem[]>(queryKey, (old = []) => [...old, mockItem]);
      });

      return { previousWatchlists };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousWatchlists) {
        context.previousWatchlists.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSuccess: invalidate
  });

  const updateItem = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateWatchlistItem }) =>
      updateWatchlistItem(id, payload),
    onMutate: async ({ id, payload }) => {
      await queryClient.cancelQueries({ queryKey: watchlistKeys.list(filters) });
      const previous = queryClient.getQueryData<WatchlistItem[]>(watchlistKeys.list(filters));
      queryClient.setQueryData<WatchlistItem[]>(watchlistKeys.list(filters), (items = []) =>
        items.map((item) => (item.id === id ? { ...item, ...payload } : item))
      );
      return { previous };
    },
    onError: (_error, _variables, context) => {
      queryClient.setQueryData(watchlistKeys.list(filters), context?.previous);
    },
    onSettled: invalidate
  });

  const deleteItem = useMutation({
    mutationFn: (id: string) => deleteWatchlistItem(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: watchlistKeys.list(filters) });
      const previous = queryClient.getQueryData<WatchlistItem[]>(watchlistKeys.list(filters));
      queryClient.setQueryData<WatchlistItem[]>(watchlistKeys.list(filters), (items = []) =>
        items.filter((item) => item.id !== id)
      );
      return { previous };
    },
    onError: (_error, _variables, context) => {
      queryClient.setQueryData(watchlistKeys.list(filters), context?.previous);
    },
    onSettled: invalidate
  });

  const restoreItem = useMutation({
    mutationFn: (id: string) => restoreWatchlistItem(id),
    onSuccess: invalidate
  });

  const deleteItemForever = useMutation({
    mutationFn: (id: string) => deleteWatchlistItemForever(id),
    onSuccess: invalidate
  });

  return { ...query, addItem, updateItem, deleteItem, restoreItem, deleteItemForever };
};
