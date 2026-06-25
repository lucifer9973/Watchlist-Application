import { jest } from "@jest/globals";
import { screen } from "@testing-library/react";

import { renderWithProviders } from "./test-utils";

jest.unstable_mockModule("../api/watchlistApi", () => ({
  searchMovies: jest.fn().mockResolvedValue([]),
  getWatchlist: jest.fn().mockResolvedValue([
    {
      id: "1",
      imdbId: "tt0111161",
      title: "The Shawshank Redemption",
      year: "1994",
      type: "movie",
      poster: null,
      status: "PLANNED",
      rating: null,
      notes: null,
      createdAt: "2026-06-24T00:00:00.000Z",
      updatedAt: "2026-06-24T00:00:00.000Z"
    }
  ]),
  addWatchlistItem: jest.fn().mockResolvedValue({}),
  updateWatchlistItem: jest.fn().mockResolvedValue({}),
  deleteWatchlistItem: jest.fn().mockResolvedValue(undefined),
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
  deleteCollection: jest.fn().mockResolvedValue(undefined),
  getDashboardStats: jest.fn().mockResolvedValue({
    total: 1,
    watched: 0,
    wantToWatch: 1,
    watching: 0,
    movies: 1,
    shows: 0,
    books: 0,
    games: 0,
    recentlyAdded: 1,
    completionRate: 0
  })
}));

const { HomePage } = await import("../pages/HomePage");

describe("HomePage", () => {
  it("shows personalized sections before discovery", async () => {
    renderWithProviders(<HomePage />);

    expect((await screen.findAllByText("The Shawshank Redemption")).length).toBe(2);
    const continueWatching = screen.getByText("Continue Progress");
    const recentlyAdded = screen.getByText("Recently Added");
    const trendingMovies = screen.getByText("Trending Movies");

    expect(continueWatching.compareDocumentPosition(recentlyAdded)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(recentlyAdded.compareDocumentPosition(trendingMovies)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });
});
