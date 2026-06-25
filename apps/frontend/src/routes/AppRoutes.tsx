import { Route, Routes } from "react-router-dom";

import { DashboardPage } from "../pages/DashboardPage";
import { HomePage } from "../pages/HomePage";
import { SearchPage } from "../pages/SearchPage";
import { WatchlistPage } from "../pages/WatchlistPage";
import { RecentlyDeletedPage } from "../pages/RecentlyDeletedPage";

export const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/search" element={<SearchPage />} />
    <Route path="/watchlist" element={<WatchlistPage />} />
    <Route path="/deleted" element={<RecentlyDeletedPage />} />
    <Route path="/dashboard" element={<DashboardPage />} />
  </Routes>
);
