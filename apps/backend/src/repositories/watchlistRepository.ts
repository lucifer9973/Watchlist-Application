import { type PrismaClient, Prisma } from "@prisma/client";

import { prisma } from "../config/prisma.js";
import type {
  CreateWatchlistItemInput,
  UpdateWatchlistItemInput,
  WatchlistFilters
} from "../types/watchlist.js";
import { HttpError } from "../utils/httpError.js";

export class WatchlistRepository {
  constructor(private readonly db: PrismaClient = prisma) {}

  findAll(filters: WatchlistFilters) {
    return this.db.watchlistItem.findMany({
      where: {
        status: filters.status,
        contentType: filters.contentType,
        title: filters.search
          ? {
              contains: filters.search,
              mode: "insensitive"
            }
          : undefined
      },
      orderBy: {
        [filters.sortBy ?? "createdAt"]: filters.sortOrder ?? "desc"
      }
    });
  }

  findById(id: string) {
    return this.db.watchlistItem.findUnique({ where: { id } });
  }

  async create(data: CreateWatchlistItemInput) {
    const contentType = data.contentType ?? this.mapContentType(data.type);
    const source = data.source ?? "OMDB";
    const externalId = data.externalId ?? data.imdbId;

    if (!externalId) {
      throw new HttpError(400, "externalId or imdbId is required");
    }

    try {
      return await this.db.watchlistItem.create({
        data: {
          ...data,
          contentType,
          source,
          externalId,
          collection: data.collection ?? null,
          poster: data.poster === "N/A" ? null : data.poster
        }
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new HttpError(409, "Already in Library");
      }
      throw error;
    }
  }

  private mapContentType(type: string) {
    if (type === "series") return "TV_SHOW";
    if (type === "book") return "BOOK";
    return "MOVIE";
  }


  async update(id: string, data: UpdateWatchlistItemInput) {
    return this.db.watchlistItem.update({ where: { id }, data });
  }

  delete(id: string) {
    return this.db.watchlistItem.delete({ where: { id } });
  }

  count() {
    return this.db.watchlistItem.count();
  }

  countByStatus(status: "COMPLETED" | "PLANNED") {
    return this.db.watchlistItem.count({ where: { status } });
  }

  countByType(type: string) {
    return this.db.watchlistItem.count({ where: { type } });
  }

  countByContentType(contentType: "MOVIE" | "TV_SHOW" | "BOOK" | "GAME") {
    return this.db.watchlistItem.count({ where: { contentType } });
  }



  countCreatedSince(createdAt: Date) {
    return this.db.watchlistItem.count({
      where: {
        createdAt: {
          gte: createdAt
        }
      }
    });
  }
}
