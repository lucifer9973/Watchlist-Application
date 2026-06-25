import { useQuery } from "@tanstack/react-query";
import { getGameDetails } from "../api/watchlistApi";

export const useGameDetails = (id: string | null) =>
  useQuery({
    queryKey: ["gameDetails", id],
    queryFn: () => getGameDetails(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 60
  });
