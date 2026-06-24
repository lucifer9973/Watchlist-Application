import type { Request, Response } from "express";
import { z } from "zod";

import type { OmdbDetailsService } from "../services/omdb-details.service.js";

const detailsParamsSchema = z.object({
  imdbId: z.string().trim().regex(/^tt\d+$/, "Invalid IMDb ID")
});

export class OmdbController {
  constructor(private readonly service: OmdbDetailsService) {}

  details = async (req: Request, res: Response) => {
    const { imdbId } = detailsParamsSchema.parse(req.params);
    const details = await this.service.getDetails(imdbId);
    res.json(details);
  };
}

