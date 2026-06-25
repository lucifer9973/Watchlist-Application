import { apiClient } from "./client";
import type {
  CreateWatchlistItem,
  DashboardStats,
  OmdbDetails,
  SearchResult,
  UpdateWatchlistItem,
  WatchlistFilters,
  WatchlistItem,
  BookDetails,
  GameDetails
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

export const searchGames = async (query: string): Promise<SearchResult[]> => {
  const { data } = await apiClient.get<any[]>("/games/search", { params: { q: query } });
  return data.map((item) => ({
    imdbID: item.id,
    title: item.title,
    year: item.year,
    poster: item.poster,
    type: "game" as const,
    externalId: item.id,
    source: "RAWG" as const
  }));
};

export const getGameDetails = async (id: string): Promise<GameDetails> => {
  const { data } = await apiClient.get<GameDetails>(`/games/${id}`);
  return data;
};

export const restoreWatchlistItem = async (id: string) => {
  const { data } = await apiClient.post<{ message: string }>(`/watchlist/restore/${id}`);
  return data;
};

export const deleteWatchlistItemForever = async (id: string) => {
  await apiClient.delete(`/watchlist/deleted/${id}`);
};

export interface CollectionEntity {
  id: string;
  name: string;
  createdAt: string;
}

export const getCollections = async () => {
  const { data } = await apiClient.get<CollectionEntity[]>("/collections");
  return data;
};

export const createCollection = async (name: string) => {
  const { data } = await apiClient.post<CollectionEntity>("/collections", { name });
  return data;
};

export const renameCollection = async (id: string, name: string) => {
  const { data } = await apiClient.put<CollectionEntity>(`/collections/${id}`, { name });
  return data;
};

export const deleteCollection = async (id: string) => {
  await apiClient.delete(`/collections/${id}`);
};

