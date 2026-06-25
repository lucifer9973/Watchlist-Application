import { useQueries } from "@tanstack/react-query";
import { searchMovies, searchBooks } from "../api/watchlistApi";
import type { SearchResult } from "../types";

const movieQueries = ["Marvel", "Batman", "Avatar", "Inception", "Mission Impossible"];
const tvQueries = ["Breaking Bad", "Dark", "Friends", "Stranger Things", "The Office"];
const bookQueriesInitial = ["Harry Potter", "Dune", "Atomic Habits"];
const bookQueriesAdditional = ["Lord of the Rings", "Mistborn"];

const firstOfType = (
  results: Array<SearchResult[] | undefined>,
  type: SearchResult["type"]
) =>
  results
    .map((items) => items?.find((item) => item.type === type))
    .filter((item): item is SearchResult => Boolean(item));

// Wrapper function with timeout for trending book queries
const searchBooksWithTimeout = async (query: string, timeoutMs = 6000) => {
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

export const useTrendingContent = (loadAdditionalBooks = false) => {
  const movieResults = useQueries({
    queries: movieQueries.map((query) => ({
      queryKey: ["search", query],
      queryFn: () => searchMovies(query),
      staleTime: 1000 * 60 * 10
    }))
  });
  const tvResults = useQueries({
    queries: tvQueries.map((query) => ({
      queryKey: ["search", query],
      queryFn: () => searchMovies(query),
      staleTime: 1000 * 60 * 10
    }))
  });
  
  const allBookQueries = loadAdditionalBooks ? [...bookQueriesInitial, ...bookQueriesAdditional] : bookQueriesInitial;
  
  const bookResults = useQueries({
    queries: allBookQueries.map((query, index) => ({
      queryKey: ["searchBooks", query],
      queryFn: () => searchBooksWithTimeout(query, 6000),
      staleTime: 1000 * 60 * 60,
      // Stagger book requests to avoid overwhelming Open Library
      enabled: true,
      retry: 0, // No retries for trending - skip if slow
      retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000) + (index * 500)
    }))
  });

  return {
    movies: firstOfType(
      movieResults.map((query) => query.data),
      "movie"
    ),
    shows: firstOfType(
      tvResults.map((query) => query.data),
      "series"
    ),
    books: bookResults
      .map((query) => query.data?.[0])
      .filter((item): item is SearchResult => Boolean(item)),
    isLoading: [...movieResults, ...tvResults].some((query) => query.isLoading),
    isError: [...movieResults, ...tvResults].some((query) => query.isError),
    booksLoading: bookResults.some((query) => query.isLoading),
    booksError: bookResults.some((query) => query.isError),
    hasMoreBooks: !loadAdditionalBooks,
    booksTimedOut: bookResults.some((query) => query.data?.length === 0 && !query.isError)
  };
};
