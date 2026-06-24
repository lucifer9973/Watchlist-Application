import { Router } from "express";
import { BooksController } from "../controllers/booksController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { OpenLibraryService } from "../services/openLibraryService.js";

export const createBooksRoutes = (service = new OpenLibraryService()) => {
  const router = Router();
  const controller = new BooksController(service);

  router.get("/search", asyncHandler(controller.search));
  router.get("/:workId", asyncHandler(controller.details));

  return router;
};
