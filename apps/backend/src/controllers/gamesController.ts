import type { Request, Response } from "express";
import { z } from "zod";
import type { RawgService } from "../services/rawgService.js";

const searchSchema = z.object({
  q: z.string().trim().min(3, "Search query must be at least 3 characters")
});

const detailsParamsSchema = z.object({
  id: z.string().trim().min(1)
});

export class GamesController {
  constructor(private readonly service: RawgService) {}

  search = async (req: Request, res: Response) => {
    const { q } = searchSchema.parse(req.query);
    const results = await this.service.search(q);
    res.json(results);
  };

  details = async (req: Request, res: Response) => {
    const { id } = detailsParamsSchema.parse(req.params);
    const details = await this.service.getGameDetails(id);
    res.json(details);
  };
}
