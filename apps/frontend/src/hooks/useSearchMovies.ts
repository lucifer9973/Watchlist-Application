import { useQuery } from "@tanstack/react-query";

import { searchMovies } from "../api/watchlistApi";

export const useSearchMovies = (query: string) =>
  useQuery({
    queryKey: ["search", query],
    queryFn: () => searchMovies(query),
    enabled: query.trim().length >= 3,
    staleTime: 1000 * 60 * 10
  });
