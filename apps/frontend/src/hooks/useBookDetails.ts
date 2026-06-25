import { useQuery } from "@tanstack/react-query";
import { getBookDetails } from "../api/watchlistApi";

export const useBookDetails = (workId: string | null) =>
  useQuery({
    queryKey: ["bookDetails", workId],
    queryFn: () => getBookDetails(workId!),
    enabled: Boolean(workId),
    staleTime: 1000 * 60 * 60
  });
