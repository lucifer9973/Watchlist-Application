export type WatchStatus = "COMPLETED" | "PLANNED" | "WATCHING";

export type SearchResult = {
  imdbID: string;
  title: string;
  year: string;
  type: "movie" | "series" | "book" | "game";
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
  type: "movie" | "series" | "book" | "game";
  contentType: "MOVIE" | "TV_SHOW" | "BOOK" | "GAME";
  collection: string | null;
  poster: string | null;
  status: WatchStatus;
  rating: number | null;
  notes: string | null;
  favorite: boolean;
  deletedAt: string | null;
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
  favorite?: boolean;
};

export type UpdateWatchlistItem = Partial<Pick<WatchlistItem, "status" | "rating" | "notes" | "collection" | "favorite">>;

export type WatchlistFilters = {
  status?: WatchStatus | "ALL";
  search?: string;
  sortBy?: "title" | "year" | "createdAt";
  sortOrder?: "asc" | "desc";
  contentType?: "MOVIE" | "TV_SHOW" | "BOOK" | "GAME";
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

export type GameDetails = {
  id: string;
  title: string;
  year: string;
  poster: string | null;
  description: string | null;
  metacritic: number | null;
  platforms: string[];
  genres: string[];
  developers: string[];
  publishers: string[];
  ratings: Array<{ id: number; title: string; count: number; percent: number }>;
  screenshots: string[];
  stores: string[];
  esrbRating: string | null;
  website: string | null;
  redditUrl: string | null;
  playtime: number;
};

