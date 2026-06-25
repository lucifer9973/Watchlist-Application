import { z } from "zod";

export const searchQuerySchema = z.object({
  q: z.string().trim().min(3, "Search query must be at least 3 characters"),
  type: z.enum(["movie", "series"]).optional()
});
