import type { Request, Response } from "express";

import type { OmdbService } from "../services/omdbService.js";
import { searchQuerySchema } from "../validators/searchValidator.js";

export class SearchController {
  constructor(private readonly omdbService: OmdbService) {}

  search = async (req: Request, res: Response) => {
    const { q } = searchQuerySchema.parse(req.query);
    const results = await this.omdbService.search(q);
    res.json(results);
  };
}
