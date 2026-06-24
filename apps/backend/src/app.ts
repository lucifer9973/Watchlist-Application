import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { createDashboardRoutes } from "./routes/dashboardRoutes.js";
import { createSearchRoutes } from "./routes/searchRoutes.js";
import { createWatchlistRoutes } from "./routes/watchlistRoutes.js";

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

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
