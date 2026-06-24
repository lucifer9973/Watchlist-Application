import type { PrismaClient } from "@prisma/client";

import { prisma } from "../config/prisma.js";
import type {
  CreateWatchlistItemInput,
  UpdateWatchlistItemInput,
  WatchlistFilters
} from "../types/watchlist.js";

export class WatchlistRepository {
  constructor(private readonly db: PrismaClient = prisma) {}

  findAll(filters: WatchlistFilters) {
    return this.db.watchlistItem.findMany({
      where: {
        status: filters.status,
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

  create(data: CreateWatchlistItemInput) {
    return this.db.watchlistItem.create({
      data: {
        ...data,
        poster: data.poster === "N/A" ? null : data.poster
      }
    });
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

  countByStatus(status: "WATCHED" | "WANT_TO_WATCH") {
    return this.db.watchlistItem.count({ where: { status } });
  }

  countByType(type: string) {
    return this.db.watchlistItem.count({ where: { type } });
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
