import { Route, Routes } from "react-router-dom";

import { DashboardPage } from "../pages/DashboardPage";
import { HomePage } from "../pages/HomePage";
import { SearchPage } from "../pages/SearchPage";
import { WatchlistPage } from "../pages/WatchlistPage";

export const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/search" element={<SearchPage />} />
    <Route path="/watchlist" element={<WatchlistPage />} />
    <Route path="/dashboard" element={<DashboardPage />} />
  </Routes>
);
