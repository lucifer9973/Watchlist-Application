export type WatchStatus = "COMPLETED" | "PLANNED";

export type SearchResult = {
  imdbID: string;
  title: string;
  year: string;
  type: "movie" | "series" | "book";
  poster: string | null;
  author?: string | null;
  externalId?: string | null;
  source?: string | null;
};

export type WatchlistItem = {
  id: string;
  imdbId: string | null;
  externalId: string | null;
  source: string;
  title: string;
  author: string | null;
  year: string;
  type: "movie" | "series" | "book";
  contentType: "MOVIE" | "TV_SHOW" | "BOOK" | "GAME";
  collection: string | null;
  poster: string | null;
  status: WatchStatus;
  rating: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateWatchlistItem = {
  imdbId?: string | null;
  externalId?: string | null;
  source?: string | null;
  title: string;
  author?: string | null;
  year: string;
  type: string;
  poster?: string | null;
  status: WatchStatus;
  rating?: number | null;
  notes?: string | null;
  contentType?: "MOVIE" | "TV_SHOW" | "BOOK" | "GAME";
  collection?: string | null;
};

export type UpdateWatchlistItem = Partial<Pick<WatchlistItem, "status" | "rating" | "notes" | "collection">>;

export type WatchlistFilters = {
  status?: WatchStatus | "ALL";
  search?: string;
  sortBy?: "title" | "year" | "createdAt";
  sortOrder?: "asc" | "desc";
  contentType?: "MOVIE" | "TV_SHOW" | "BOOK" | "GAME";
};

export type DashboardStats = {
  total: number;
  watched: number;
  wantToWatch: number;
  movies: number;
  shows: number;
  books: number;
  games: number;
  recentlyAdded: number;
  completionRate: number;
};

export type OmdbDetails = {
  Poster: string;
  Title: string;
  Year: string;
  Genre: string;
  Runtime: string;
  Director: string;
  Actors: string;
  imdbRating: string;
  Plot: string;
};

export type BookDetails = {
  imdbId: string;
  title: string;
  author: string | null;
  year: string | null;
  poster: string | null;
  subjects: string[];
  description: string | null;
};
