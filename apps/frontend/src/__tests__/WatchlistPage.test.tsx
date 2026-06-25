import { jest } from "@jest/globals";
import { screen } from "@testing-library/react";

import { renderWithProviders } from "./test-utils";

jest.unstable_mockModule("../api/watchlistApi", () => ({
  getWatchlist: jest.fn().mockResolvedValue([
    {
      id: "1",
      imdbId: "tt0111161",
      title: "The Shawshank Redemption",
      year: "1994",
      type: "movie",
      poster: null,
      status: "COMPLETED",
      rating: 10,
      notes: "A favorite",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z"
    }
  ]),
  updateWatchlistItem: jest.fn().mockResolvedValue({}),
  deleteWatchlistItem: jest.fn().mockResolvedValue(undefined),
  addWatchlistItem: jest.fn().mockResolvedValue({}),
  getOmdbDetails: jest.fn().mockResolvedValue({}),
  searchBooks: jest.fn().mockResolvedValue([]),
  getBookDetails: jest.fn().mockResolvedValue({}),
  searchGames: jest.fn().mockResolvedValue([]),
  getGameDetails: jest.fn().mockResolvedValue({}),
  restoreWatchlistItem: jest.fn().mockResolvedValue({}),
  deleteWatchlistItemForever: jest.fn().mockResolvedValue(undefined),
  getCollections: jest.fn().mockResolvedValue([]),
  createCollection: jest.fn().mockResolvedValue({}),
  renameCollection: jest.fn().mockResolvedValue({}),
  deleteCollection: jest.fn().mockResolvedValue(undefined)
}));

const { WatchlistPage } = await import("../pages/WatchlistPage");

describe("WatchlistPage", () => {
  it("renders saved items", async () => {
    renderWithProviders(<WatchlistPage />);

    expect(await screen.findByText("The Shawshank Redemption")).toBeInTheDocument();
    expect(screen.getByText("A favorite")).toBeInTheDocument();
  });
});
