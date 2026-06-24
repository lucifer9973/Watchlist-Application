import { Router } from "express";

import { SearchController } from "../controllers/searchController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { OmdbService } from "../services/omdbService.js";

export const createSearchRoutes = (service = new OmdbService()) => {
  const router = Router();
  const controller = new SearchController(service);
  router.get("/", asyncHandler(controller.search));
  return router;
};
