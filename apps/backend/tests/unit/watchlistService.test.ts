import { describe, expect, it, jest } from "@jest/globals";

import { WatchlistService } from "../../src/services/watchlistService.js";

const repository = () => ({
  findAll: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  count: jest.fn(),
  countByStatus: jest.fn(),
  countByType: jest.fn(),
  countCreatedSince: jest.fn()
});

describe("WatchlistService", () => {
  it("throws when updating a missing item", async () => {
    const repo = repository();
    repo.findById.mockResolvedValue(null as never);
    const service = new WatchlistService(repo as never);

    await expect(service.update("00000000-0000-0000-0000-000000000000", {})).rejects.toThrow(
      "Watchlist item not found"
    );
  });

  it("returns dashboard statistics", async () => {
    const repo = repository();
    repo.count.mockResolvedValue(4 as never);
    repo.countByStatus.mockResolvedValueOnce(2 as never).mockResolvedValueOnce(2 as never);
    repo.countByType.mockResolvedValueOnce(3 as never).mockResolvedValueOnce(1 as never);
    repo.countCreatedSince.mockResolvedValue(2 as never);
    const service = new WatchlistService(repo as never);

    await expect(service.stats()).resolves.toEqual({
      total: 4,
      watched: 2,
      wantToWatch: 2,
      movies: 3,
      shows: 1,
      recentlyAdded: 2,
      completionRate: 50
    });
  });
});
