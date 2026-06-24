import { WatchStatus, ContentType } from "@prisma/client";
import { z } from "zod";

const watchStatusSchema = z.nativeEnum(WatchStatus);
const contentTypeSchema = z.nativeEnum(ContentType);

export const watchlistQuerySchema = z.object({
  status: watchStatusSchema.optional(),
  search: z.string().trim().optional(),
  sortBy: z.enum(["title", "year", "createdAt"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  contentType: contentTypeSchema.optional()
});

export const createWatchlistItemSchema = z.object({
  imdbId: z.string().trim().min(1).optional().nullable(),
  externalId: z.string().trim().min(1).optional().nullable(),
  source: z.string().trim().min(1).default("OMDB"),
  title: z.string().trim().min(1),
  author: z.string().trim().max(255).nullable().optional(),
  year: z.string().trim().min(1),
  type: z.string().trim().min(1),
  poster: z.string().url().nullable().optional().or(z.literal("N/A")),
  status: watchStatusSchema,
  rating: z.number().int().min(1).max(10).nullable().optional(),
  notes: z.string().trim().max(1000).nullable().optional(),
  contentType: contentTypeSchema.optional(),
  collection: z.string().trim().max(100).nullable().optional()
});

export const updateWatchlistItemSchema = z
  .object({
    status: watchStatusSchema.optional(),
    rating: z.number().int().min(1).max(10).nullable().optional(),
    notes: z.string().trim().max(1000).nullable().optional(),
    collection: z.string().trim().max(100).nullable().optional()
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required"
  });

export const idParamSchema = z.object({
  id: z.string().uuid()
});
