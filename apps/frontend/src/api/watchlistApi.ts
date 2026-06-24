import { apiClient } from "./client";
import type {
  CreateWatchlistItem,
  DashboardStats,
  SearchResult,
  UpdateWatchlistItem,
  WatchlistFilters,
  WatchlistItem
} from "../types";

export const searchMovies = async (query: string) => {
  const { data } = await apiClient.get<SearchResult[]>("/search", { params: { q: query } });
  return data;
};

export const getWatchlist = async (filters: WatchlistFilters) => {
  const params = {
    ...filters,
    status: filters.status === "ALL" ? undefined : filters.status
  };
  const { data } = await apiClient.get<WatchlistItem[]>("/watchlist", { params });
  return data;
};

export const addWatchlistItem = async (payload: CreateWatchlistItem) => {
  const { data } = await apiClient.post<WatchlistItem>("/watchlist", payload);
  return data;
};

export const updateWatchlistItem = async (id: string, payload: UpdateWatchlistItem) => {
  const { data } = await apiClient.put<WatchlistItem>(`/watchlist/${id}`, payload);
  return data;
};

export const deleteWatchlistItem = async (id: string) => {
  await apiClient.delete(`/watchlist/${id}`);
};

export const getDashboardStats = async () => {
  const { data } = await apiClient.get<DashboardStats>("/dashboard/stats");
  return data;
};
