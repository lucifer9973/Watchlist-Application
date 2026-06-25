import type { WatchStatus } from "@prisma/client";

import type { WatchlistRepository } from "../repositories/watchlistRepository.js";
import type {
  CreateWatchlistItemInput,
  UpdateWatchlistItemInput,
  WatchlistFilters
} from "../types/watchlist.js";
import { HttpError } from "../utils/httpError.js";

export class WatchlistService {
  constructor(private readonly repository: WatchlistRepository) {}

  list(filters: WatchlistFilters) {
    return this.repository.findAll(filters);
  }

  create(input: CreateWatchlistItemInput) {
    return this.repository.create(input);
  }

  async update(id: string, input: UpdateWatchlistItemInput) {
    const existing = await this.repository.findById(id);
    if (!existing) throw new HttpError(404, "Watchlist item not found");
    return this.repository.update(id, input);
  }

  async delete(id: string) {
    const existing = await this.repository.findById(id);
    if (!existing) throw new HttpError(404, "Watchlist item not found");
    await this.repository.delete(id);
  }

  async restore(id: string) {
    const existing = await this.repository.findDeletedById(id);
    if (!existing) throw new HttpError(404, "Deleted watchlist item not found");
    await this.repository.restore(id);
  }

  async deleteForever(id: string) {
    const existing = await this.repository.findDeletedById(id);
    if (!existing) throw new HttpError(404, "Deleted watchlist item not found");
    await this.repository.deleteForever(id);
  }

  async stats() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [total, watched, wantToWatch, watching, movies, shows, books, games, recentlyAdded] = await Promise.all([
      this.repository.count(),
      this.repository.countByStatus("COMPLETED" as WatchStatus),
      this.repository.countByStatus("PLANNED" as WatchStatus),
      this.repository.countByStatus("WATCHING" as WatchStatus),
      this.repository.countByContentType("MOVIE"),
      this.repository.countByContentType("TV_SHOW"),
      this.repository.countByContentType("BOOK"),
      this.repository.countByContentType("GAME"),
      this.repository.countCreatedSince(sevenDaysAgo)
    ]);

    const completionRate = total === 0 ? 0 : Math.round((watched / total) * 100);

    return { total, watched, wantToWatch, watching, movies, shows, books, games, recentlyAdded, completionRate };
  }
}
