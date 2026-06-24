import { Router } from "express";

import { DashboardController } from "../controllers/dashboardController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { WatchlistRepository } from "../repositories/watchlistRepository.js";
import { WatchlistService } from "../services/watchlistService.js";

export const createDashboardRoutes = (
  service = new WatchlistService(new WatchlistRepository())
) => {
  const router = Router();
  const controller = new DashboardController(service);
  router.get("/stats", asyncHandler(controller.stats));
  return router;
};
