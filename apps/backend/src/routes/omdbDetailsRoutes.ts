import { Router } from "express";

import { OmdbController } from "../controllers/omdbController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { OmdbDetailsService } from "../services/omdb-details.service.js";

export const createOmdbDetailsRoutes = (service = new OmdbDetailsService()) => {
  const router = Router();
  const controller = new OmdbController(service);

  router.get("/:imdbId", asyncHandler(controller.details));

  return router;
};

