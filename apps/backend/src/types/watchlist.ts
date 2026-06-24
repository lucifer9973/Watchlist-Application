import type { WatchStatus, WatchlistItem } from "@prisma/client";

export type WatchlistItemEntity = WatchlistItem;

export type CreateWatchlistItemInput = {
  imdbId: string;
  title: string;
  year: string;
  type: string;
  poster?: string | null;
  status: WatchStatus;
  rating?: number | null;
  notes?: string | null;
};

export type UpdateWatchlistItemInput = Partial<
  Pick<CreateWatchlistItemInput, "status" | "rating" | "notes">
>;

export type WatchlistFilters = {
  status?: WatchStatus;
  search?: string;
  sortBy?: "title" | "year" | "createdAt";
  sortOrder?: "asc" | "desc";
};

export type DashboardStats = {
  total: number;
  watched: number;
  wantToWatch: number;
  movies: number;
  shows: number;
  recentlyAdded: number;
  completionRate: number;
};
