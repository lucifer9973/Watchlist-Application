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

  async cleanupDeletedItems() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    await this.db.watchlistItem.deleteMany({
      where: {
        deletedAt: {
          lt: thirtyDaysAgo
        }
      }
    });
  }

  async findAll(filters: WatchlistFilters) {
    await this.cleanupDeletedItems();

    const where: Prisma.WatchlistItemWhereInput = {};

    if (filters.showDeleted === true) {
      where.deletedAt = { not: null };
    } else {
      where.deletedAt = null;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.contentType) {
      where.contentType = filters.contentType;
    }

    if (filters.favorite !== undefined) {
      where.favorite = filters.favorite;
    }

    if (filters.collection) {
      where.collection = filters.collection;
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: "insensitive" } },
        { author: { contains: filters.search, mode: "insensitive" } }
      ];
    }

    return this.db.watchlistItem.findMany({
      where,
      orderBy: {
        [filters.sortBy ?? "createdAt"]: filters.sortOrder ?? "desc"
      }
    });
  }

  findById(id: string) {
    return this.db.watchlistItem.findFirst({
      where: { id, deletedAt: null }
    });
  }

  findDeletedById(id: string) {
    return this.db.watchlistItem.findFirst({
      where: { id, deletedAt: { not: null } }
    });
  }

  async create(data: CreateWatchlistItemInput) {
    const contentType = data.contentType ?? this.mapContentType(data.type);
    const source = data.source ?? "OMDB";
    const externalId = data.externalId ?? data.imdbId;

    if (!externalId) {
      throw new HttpError(400, "externalId or imdbId is required");
    }

    console.log("WatchlistRepository.create payload:", {
      title: data.title,
      imdbId: data.imdbId,
      externalId,
      source,
      contentType
    });

    // Check if the item already exists in the database
    const existing = await this.db.watchlistItem.findUnique({
      where: {
        source_externalId: { source, externalId }
      }
    });

    if (existing) {
      if (existing.deletedAt !== null) {
        // Soft-deleted item: restore it and update status/info
        return this.db.watchlistItem.update({
          where: { id: existing.id },
          data: {
            deletedAt: null,
            status: data.status,
            favorite: data.favorite ?? false,
            rating: data.rating ?? null,
            notes: data.notes ?? null
          }
        });
      } else {
        // Active item: duplicate error
        throw new HttpError(409, "Already in Library");
      }
    }

    return this.db.watchlistItem.create({
      data: {
        ...data,
        contentType,
        source,
        externalId,
        collection: data.collection ?? null,
        poster: data.poster === "N/A" ? null : data.poster,
        favorite: data.favorite ?? false,
        deletedAt: null
      }
    });
  }

  private mapContentType(type: string) {
    if (type === "series") return "TV_SHOW";
    if (type === "book") return "BOOK";
    if (type === "game") return "GAME";
    return "MOVIE";
  }

  async update(id: string, data: UpdateWatchlistItemInput) {
    return this.db.watchlistItem.update({ where: { id }, data });
  }

  // Soft Delete
  async delete(id: string) {
    return this.db.watchlistItem.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }

  // Restore
  async restore(id: string) {
    return this.db.watchlistItem.update({
      where: { id },
      data: { deletedAt: null }
    });
  }

  // Permanent Delete
  async deleteForever(id: string) {
    return this.db.watchlistItem.delete({
      where: { id }
    });
  }

  count() {
    return this.db.watchlistItem.count({
      where: { deletedAt: null }
    });
  }

  countByStatus(status: any) {
    return this.db.watchlistItem.count({
      where: { status, deletedAt: null }
    });
  }

  countByType(type: string) {
    return this.db.watchlistItem.count({
      where: { type, deletedAt: null }
    });
  }

  countByContentType(contentType: "MOVIE" | "TV_SHOW" | "BOOK" | "GAME") {
    return this.db.watchlistItem.count({
      where: { contentType, deletedAt: null }
    });
  }

  countCreatedSince(createdAt: Date) {
    return this.db.watchlistItem.count({
      where: {
        createdAt: {
          gte: createdAt
        },
        deletedAt: null
      }
    });
  }
}
