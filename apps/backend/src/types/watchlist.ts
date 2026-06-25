import type { WatchStatus, WatchlistItem } from "@prisma/client";

export type WatchlistItemEntity = WatchlistItem;

export type ContentType = "MOVIE" | "TV_SHOW" | "BOOK" | "GAME";

export type CreateWatchlistItemInput = {
  imdbId?: string | null;
  externalId?: string | null;
  source?: string;
  title: string;
  author?: string | null;
  year: string;
  type: string;
  poster?: string | null;

  contentType?: ContentType;
  collection?: string | null;

  status: WatchStatus;
  rating?: number | null;
  notes?: string | null;
  favorite?: boolean;
};


export type UpdateWatchlistItemInput = Partial<
  Pick<CreateWatchlistItemInput, "status" | "rating" | "notes" | "collection" | "favorite">
>;


export type WatchlistFilters = {
  status?: WatchStatus;
  search?: string;
  sortBy?: "title" | "year" | "createdAt";
  sortOrder?: "asc" | "desc";
  contentType?: ContentType;
  favorite?: boolean;
  collection?: string;
  showDeleted?: boolean;
};

export type DashboardStats = {
  total: number;
  watched: number;
  wantToWatch: number;
  watching: number;
  movies: number;
  shows: number;
  books: number;
  games: number;
  recentlyAdded: number;
  completionRate: number;
};
