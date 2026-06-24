import { useQuery } from "@tanstack/react-query";

import { getOmdbDetails } from "../api/watchlistApi";

export const useOmdbDetails = (imdbId: string | null) =>
  useQuery({
    queryKey: ["omdb-details", imdbId],
    queryFn: () => getOmdbDetails(imdbId!),
    enabled: Boolean(imdbId),
    staleTime: 1000 * 60 * 60
  });
