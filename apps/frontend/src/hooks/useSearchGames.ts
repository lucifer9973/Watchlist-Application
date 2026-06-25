import { useQuery } from "@tanstack/react-query";
import { searchGames } from "../api/watchlistApi";

export const useSearchGames = (query: string, enabled = true) =>
  useQuery({
    queryKey: ["searchGames", query],
    queryFn: () => searchGames(query),
    enabled: enabled && query.trim().length >= 3,
    staleTime: 1000 * 60 * 60
  });
