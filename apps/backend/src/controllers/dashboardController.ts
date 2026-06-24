import type { Request, Response } from "express";

import type { WatchlistService } from "../services/watchlistService.js";

export class DashboardController {
  constructor(private readonly service: WatchlistService) {}

  stats = async (_req: Request, res: Response) => {
    const stats = await this.service.stats();
    res.json(stats);
  };
}
