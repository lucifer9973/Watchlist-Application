import { jest } from "@jest/globals";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { renderWithProviders } from "./test-utils";

jest.unstable_mockModule("../api/watchlistApi", () => ({
  searchMovies: jest.fn().mockResolvedValue([
    {
      imdbID: "tt0903747",
      title: "Breaking Bad",
      year: "2008-2013",
      type: "series",
      poster: null
    }
  ]),
  addWatchlistItem: jest.fn().mockResolvedValue({}),
  getWatchlist: jest.fn().mockResolvedValue([]),
  updateWatchlistItem: jest.fn().mockResolvedValue({}),
  deleteWatchlistItem: jest.fn().mockResolvedValue(undefined),
  getDashboardStats: jest.fn().mockResolvedValue({}),
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

const { SearchPage } = await import("../pages/SearchPage");

describe("SearchPage", () => {
  it("searches and renders results", async () => {
    renderWithProviders(<SearchPage />);

    await userEvent.type(screen.getByLabelText(/search/i), "breaking");

    await waitFor(() => expect(screen.getByText("Breaking Bad")).toBeInTheDocument());
    expect(screen.getByText("TV Show")).toBeInTheDocument();
  });
});
