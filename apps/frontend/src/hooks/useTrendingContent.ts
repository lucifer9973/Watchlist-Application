import { useQueries } from "@tanstack/react-query";
import { searchMovies, searchBooks, searchGames } from "../api/watchlistApi";
import type { SearchResult } from "../types";

const movieQueries = ["Marvel", "Batman", "Avatar", "Inception", "Mission Impossible"];
const tvQueries = ["Breaking Bad", "Dark", "Friends", "Stranger Things", "The Office"];
const bookQueriesInitial = ["Harry Potter", "Dune", "Atomic Habits"];
const bookQueriesAdditional = ["Lord of the Rings", "Mistborn"];
const gameQueriesInitial = ["Elden Ring", "Cyberpunk 2077", "Minecraft"];
const gameQueriesAdditional = ["Grand Theft Auto V", "The Witcher 3"];

const firstOfType = (
  results: Array<SearchResult[] | undefined>,
  type: SearchResult["type"]
) =>
  results
    .map((items) => items?.find((item) => item.type === type))
    .filter((item): item is SearchResult => Boolean(item));

// Wrapper function with timeout for trending book queries
const searchBooksWithTimeout = async (query: string, timeoutMs = 8000) => {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error("Timeout")), timeoutMs);
  });
  
  try {
    return await Promise.race([searchBooks(query), timeoutPromise]);
  } catch (error) {
    if (error instanceof Error && error.message === "Timeout") {
      // Return empty array on timeout to gracefully handle slow queries
      return [];
    }
    throw error;
  }
};

// Wrapper function with timeout for trending game queries
const searchGamesWithTimeout = async (query: string, timeoutMs = 8000) => {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error("Timeout")), timeoutMs);
  });
  
  try {
    return await Promise.race([searchGames(query), timeoutPromise]);
  } catch (error) {
    if (error instanceof Error && error.message === "Timeout") {
      return [];
    }
    throw error;
  }
};

export const useTrendingContent = (loadAdditionalBooks = false, loadAdditionalGames = false) => {
  const movieResults = useQueries({
    queries: movieQueries.map((query) => ({
      queryKey: ["search", query],
      queryFn: () => searchMovies(query),
      staleTime: 1000 * 60 * 60
    }))
  });
  const tvResults = useQueries({
    queries: tvQueries.map((query) => ({
      queryKey: ["search", query],
      queryFn: () => searchMovies(query),
      staleTime: 1000 * 60 * 60
    }))
  });
  
  const allBookQueries = loadAdditionalBooks ? [...bookQueriesInitial, ...bookQueriesAdditional] : bookQueriesInitial;
  
  const bookResults = useQueries({
    queries: allBookQueries.map((query, index) => ({
      queryKey: ["searchBooks", query],
      queryFn: () => searchBooksWithTimeout(query, 8000),
      staleTime: 1000 * 60 * 60,
      // Stagger book requests to avoid overwhelming Open Library
      enabled: true,
      retry: 0, // No retries for trending - skip if slow
      retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000) + (index * 500)
    }))
  });

  const allGameQueries = loadAdditionalGames ? [...gameQueriesInitial, ...gameQueriesAdditional] : gameQueriesInitial;

  const gameResults = useQueries({
    queries: allGameQueries.map((query, index) => ({
      queryKey: ["searchGames", query],
      queryFn: () => searchGamesWithTimeout(query, 8000),
      staleTime: 1000 * 60 * 60,
      enabled: true,
      retry: 0,
      retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000) + (index * 500)
    }))
  });

  const INITIAL_BOOKS = 6;
  const EXPANDED_BOOKS = 10;
  const INITIAL_GAMES = 6;
  const EXPANDED_GAMES = 10;

  const books = bookResults
    .flatMap((query) => query.data ?? [])
    // Keep stable-ish: unique by external id (fallback imdbID/title)
    .filter((item, idx, arr) => {
      const key = item.externalId ?? item.imdbID ?? item.title;
      return (
        arr.findIndex((x) => (x.externalId ?? x.imdbID ?? x.title) === key) === idx
      );
    })
    .slice(0, loadAdditionalBooks ? EXPANDED_BOOKS : INITIAL_BOOKS);

  const games = gameResults
    .flatMap((query) => query.data ?? [])
    .filter((item, idx, arr) => {
      const key = item.externalId ?? item.imdbID ?? item.title;
      return (
        arr.findIndex((x) => (x.externalId ?? x.imdbID ?? x.title) === key) === idx
      );
    })
    .slice(0, loadAdditionalGames ? EXPANDED_GAMES : INITIAL_GAMES);

  return {
    movies: firstOfType(
      movieResults.map((query) => query.data),
      "movie"
    ),
    shows: firstOfType(
      tvResults.map((query) => query.data),
      "series"
    ),
    books,
    games,
    isLoading: [...movieResults, ...tvResults].some((query) => query.isLoading),
    isError: [...movieResults, ...tvResults].some((query) => query.isError),
    booksLoading: bookResults.some((query) => query.isLoading),
    booksError: bookResults.some((query) => query.isError),
    hasMoreBooks: !loadAdditionalBooks,
    booksTimedOut: bookResults.some((query) => query.data?.length === 0 && !query.isError),
    gamesLoading: gameResults.some((query) => query.isLoading),
    gamesError: gameResults.some((query) => query.isError),
    hasMoreGames: !loadAdditionalGames,
    gamesTimedOut: gameResults.some((query) => query.data?.length === 0 && !query.isError)
  };
};
