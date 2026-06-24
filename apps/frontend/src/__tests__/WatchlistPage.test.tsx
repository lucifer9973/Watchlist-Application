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
      status: "WATCHED",
      rating: 10,
      notes: "A favorite",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z"
    }
  ]),
  updateWatchlistItem: jest.fn().mockResolvedValue({}),
  deleteWatchlistItem: jest.fn().mockResolvedValue(undefined),
  addWatchlistItem: jest.fn().mockResolvedValue({})
}));

const { WatchlistPage } = await import("../pages/WatchlistPage");

describe("WatchlistPage", () => {
  it("renders saved items", async () => {
    renderWithProviders(<WatchlistPage />);

    expect(await screen.findByText("The Shawshank Redemption")).toBeInTheDocument();
    expect(screen.getByText("A favorite")).toBeInTheDocument();
  });
});
