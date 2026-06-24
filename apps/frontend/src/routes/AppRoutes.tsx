import { Navigate, Route, Routes } from "react-router-dom";

import { DashboardPage } from "../pages/DashboardPage";
import { SearchPage } from "../pages/SearchPage";
import { WatchlistPage } from "../pages/WatchlistPage";

export const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/search" replace />} />
    <Route path="/search" element={<SearchPage />} />
    <Route path="/watchlist" element={<WatchlistPage />} />
    <Route path="/dashboard" element={<DashboardPage />} />
  </Routes>
);
