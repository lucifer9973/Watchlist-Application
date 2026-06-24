import { useQuery } from "@tanstack/react-query";

import { getDashboardStats } from "../api/watchlistApi";

export const useDashboardStats = () =>
  useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: getDashboardStats
  });
