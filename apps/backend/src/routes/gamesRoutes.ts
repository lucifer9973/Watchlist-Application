import { Router } from "express";
import { GamesController } from "../controllers/gamesController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { RawgService } from "../services/rawgService.js";

export const createGamesRoutes = (service = new RawgService()) => {
  const router = Router();
  const controller = new GamesController(service);

  router.get("/search", asyncHandler(controller.search));
  router.get("/:id", asyncHandler(controller.details));

  return router;
};
