import { Router } from "express";

import { WatchlistController } from "../controllers/watchlistController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { WatchlistRepository } from "../repositories/watchlistRepository.js";
import { WatchlistService } from "../services/watchlistService.js";

export const createWatchlistRoutes = (
  service = new WatchlistService(new WatchlistRepository())
) => {
  const router = Router();
  const controller = new WatchlistController(service);

  router.get("/", asyncHandler(controller.list));
  router.post("/", asyncHandler(controller.create));
  router.put("/:id", asyncHandler(controller.update));
  router.delete("/:id", asyncHandler(controller.delete));

  return router;
};
