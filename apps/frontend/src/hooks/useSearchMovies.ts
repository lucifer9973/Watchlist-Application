import { useQuery } from "@tanstack/react-query";

import { searchMovies } from "../api/watchlistApi";

export const useSearchMovies = (query: string, type?: "movie" | "series", enabled = true) =>
  useQuery({
    queryKey: ["search", query, type],
    queryFn: () => searchMovies(query, type),
    enabled: enabled && query.trim().length >= 3,
    staleTime: 1000 * 60 * 10
  });
