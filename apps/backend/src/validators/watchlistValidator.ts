import { WatchStatus } from "@prisma/client";
import { z } from "zod";

const watchStatusSchema = z.nativeEnum(WatchStatus);

export const watchlistQuerySchema = z.object({
  status: watchStatusSchema.optional(),
  search: z.string().trim().optional(),
  sortBy: z.enum(["title", "year", "createdAt"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc")
});

export const createWatchlistItemSchema = z.object({
  imdbId: z.string().trim().min(1),
  title: z.string().trim().min(1),
  year: z.string().trim().min(1),
  type: z.string().trim().min(1),
  poster: z.string().url().nullable().optional().or(z.literal("N/A")),
  status: watchStatusSchema,
  rating: z.number().int().min(1).max(10).nullable().optional(),
  notes: z.string().trim().max(1000).nullable().optional()
});

export const updateWatchlistItemSchema = z
  .object({
    status: watchStatusSchema.optional(),
    rating: z.number().int().min(1).max(10).nullable().optional(),
    notes: z.string().trim().max(1000).nullable().optional()
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required"
  });

export const idParamSchema = z.object({
  id: z.string().uuid()
});
