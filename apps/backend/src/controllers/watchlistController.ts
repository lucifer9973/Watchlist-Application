import type { Request, Response } from "express";

import type { WatchlistService } from "../services/watchlistService.js";
import {
  createWatchlistItemSchema,
  idParamSchema,
  updateWatchlistItemSchema,
  watchlistQuerySchema
} from "../validators/watchlistValidator.js";

export class WatchlistController {
  constructor(private readonly service: WatchlistService) {}

  list = async (req: Request, res: Response) => {
    const filters = watchlistQuerySchema.parse(req.query);
    const items = await this.service.list(filters);
    res.json(items);
  };

  create = async (req: Request, res: Response) => {
    const input = createWatchlistItemSchema.parse(req.body);
    const item = await this.service.create(input);
    res.status(201).json(item);
  };

  update = async (req: Request, res: Response) => {
    const { id } = idParamSchema.parse(req.params);
    const input = updateWatchlistItemSchema.parse(req.body);
    const item = await this.service.update(id, input);
    res.json(item);
  };

  delete = async (req: Request, res: Response) => {
    const { id } = idParamSchema.parse(req.params);
    await this.service.delete(id);
    res.status(204).send();
  };
}
