import { useQueries } from "@tanstack/react-query";

import { searchMovies } from "../api/watchlistApi";
import type { SearchResult } from "../types";

const movieQueries = ["Marvel", "Batman", "Avatar", "Inception", "Mission Impossible"];
const tvQueries = ["Breaking Bad", "Dark", "Friends", "Stranger Things", "The Office"];

const firstOfType = (
  results: Array<SearchResult[] | undefined>,
  type: SearchResult["type"]
) =>
  results
    .map((items) => items?.find((item) => item.type === type))
    .filter((item): item is SearchResult => Boolean(item));

export const useTrendingContent = () => {
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

  return {
    movies: firstOfType(
      movieResults.map((query) => query.data),
      "movie"
    ),
    shows: firstOfType(
      tvResults.map((query) => query.data),
      "series"
    ),
    isLoading: [...movieResults, ...tvResults].some((query) => query.isLoading),
    isError: [...movieResults, ...tvResults].some((query) => query.isError)
  };
};
