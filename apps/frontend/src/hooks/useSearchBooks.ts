import { useQuery } from "@tanstack/react-query";
import { searchBooks } from "../api/watchlistApi";

export const useSearchBooks = (query: string, enabled = true) =>
  useQuery({
    queryKey: ["searchBooks", query],
    queryFn: () => searchBooks(query),
    enabled: enabled && query.trim().length >= 3,
    staleTime: 1000 * 60 * 60
  });
