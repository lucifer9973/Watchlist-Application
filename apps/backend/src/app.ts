import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { createBooksRoutes } from "./routes/booksRoutes.js";
import { createDashboardRoutes } from "./routes/dashboardRoutes.js";
import { createGamesRoutes } from "./routes/gamesRoutes.js";
import { createOmdbDetailsRoutes } from "./routes/omdbDetailsRoutes.js";
import { createSearchRoutes } from "./routes/searchRoutes.js";
import { createWatchlistRoutes } from "./routes/watchlistRoutes.js";
import { createCollectionRoutes } from "./routes/collectionRoutes.js";

export const createApp = () => {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(morgan("dev"));

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api/search", createSearchRoutes());
  app.use("/api/watchlist", createWatchlistRoutes());
  app.use("/api/dashboard", createDashboardRoutes());
  app.use("/api/omdb", createOmdbDetailsRoutes());
  app.use("/api/books", createBooksRoutes());
  app.use("/api/games", createGamesRoutes());
  app.use("/api/collections", createCollectionRoutes());

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
