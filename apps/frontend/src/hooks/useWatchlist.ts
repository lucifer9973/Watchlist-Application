import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  addWatchlistItem,
  deleteWatchlistItem,
  getWatchlist,
  updateWatchlistItem
} from "../api/watchlistApi";
import type { CreateWatchlistItem, UpdateWatchlistItem, WatchlistFilters, WatchlistItem } from "../types";

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
    mutationFn: (payload: CreateWatchlistItem) => addWatchlistItem(payload),
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

  return { ...query, addItem, updateItem, deleteItem };
};
