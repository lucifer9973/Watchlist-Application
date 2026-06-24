export type WatchStatus = "WATCHED" | "WANT_TO_WATCH";

export type SearchResult = {
  imdbID: string;
  title: string;
  year: string;
  type: "movie" | "series";
  poster: string | null;
};

export type WatchlistItem = {
  id: string;
  imdbId: string;
  title: string;
  year: string;
  type: "movie" | "series";
  poster: string | null;
  status: WatchStatus;
  rating: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateWatchlistItem = {
  imdbId: string;
  title: string;
  year: string;
  type: string;
  poster?: string | null;
  status: WatchStatus;
  rating?: number | null;
  notes?: string | null;
};

export type UpdateWatchlistItem = Partial<Pick<WatchlistItem, "status" | "rating" | "notes">>;

export type WatchlistFilters = {
  status?: WatchStatus | "ALL";
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
};
