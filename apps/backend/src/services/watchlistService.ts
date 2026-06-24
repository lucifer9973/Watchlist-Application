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

  async stats() {
    const [total, watched, wantToWatch, movies, shows] = await Promise.all([
      this.repository.count(),
      this.repository.countByStatus("WATCHED" as WatchStatus),
      this.repository.countByStatus("WANT_TO_WATCH" as WatchStatus),
      this.repository.countByType("movie"),
      this.repository.countByType("series")
    ]);

    return { total, watched, wantToWatch, movies, shows };
  }
}
