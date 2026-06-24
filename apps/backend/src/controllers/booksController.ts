import type { Request, Response } from "express";
import { z } from "zod";
import type { OpenLibraryService } from "../services/openLibraryService.js";

const searchSchema = z.object({
  q: z.string().trim().min(3, "Search query must be at least 3 characters")
});

const detailsParamsSchema = z.object({
  workId: z.string().trim().min(1)
});

export class BooksController {
  constructor(private readonly service: OpenLibraryService) {}

  search = async (req: Request, res: Response) => {
    const { q } = searchSchema.parse(req.query);
    const results = await this.service.search(q);
    res.json(results);
  };

  details = async (req: Request, res: Response) => {
    const { workId } = detailsParamsSchema.parse(req.params);
    const details = await this.service.getWorkDetails(workId);
    res.json(details);
  };
}
