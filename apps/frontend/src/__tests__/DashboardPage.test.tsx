import { jest } from "@jest/globals";
import { screen } from "@testing-library/react";

import { renderWithProviders } from "./test-utils";

jest.unstable_mockModule("../api/watchlistApi", () => ({
  getDashboardStats: jest.fn().mockResolvedValue({
    total: 5,
    watched: 3,
    wantToWatch: 2,
    movies: 4,
    shows: 1
  })
}));

const { DashboardPage } = await import("../pages/DashboardPage");

describe("DashboardPage", () => {
  it("renders stats cards", async () => {
    renderWithProviders(<DashboardPage />);

    expect(await screen.findByText("Total Items")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("TV Shows")).toBeInTheDocument();
  });
});
