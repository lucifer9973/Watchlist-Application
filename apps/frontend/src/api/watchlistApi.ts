import { apiClient } from "./client";
import type {
  CreateWatchlistItem,
  DashboardStats,
  OmdbDetails,
  SearchResult,
  UpdateWatchlistItem,
  WatchlistFilters,
  WatchlistItem,
  BookDetails
} from "../types";

export const searchMovies = async (query: string, type?: "movie" | "series") => {
  const { data } = await apiClient.get<SearchResult[]>("/search", { params: { q: query, type } });
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

export const getOmdbDetails = async (imdbId: string) => {
  const { data } = await apiClient.get<OmdbDetails>(`/omdb/${imdbId}`);
  return data;
};

export const searchBooks = async (query: string): Promise<SearchResult[]> => {
  const { data } = await apiClient.get<any[]>("/books/search", { params: { q: query } });
  return data.map((item) => ({
    imdbID: item.imdbId,
    title: item.title,
    author: item.author ?? null,
    year: item.year,
    poster: item.poster,
    type: "book" as const,
    externalId: item.imdbId,
    source: "OPEN_LIBRARY" as const
  }));
};

export const getBookDetails = async (workId: string) => {
  const { data } = await apiClient.get<BookDetails>(`/books/${workId}`);
  return data;
};
