import { describe, expect, it } from "@jest/globals";

import {
  createWatchlistItemSchema,
  updateWatchlistItemSchema
} from "../../src/validators/watchlistValidator.js";

describe("watchlist validators", () => {
  it("accepts a valid watchlist item", () => {
    const parsed = createWatchlistItemSchema.parse({
      imdbId: "tt0903747",
      title: "Breaking Bad",
      year: "2008-2013",
      type: "series",
      poster: "https://example.com/poster.jpg",
      status: "WATCHED",
      rating: 10,
      notes: "Peak television"
    });

    expect(parsed.title).toBe("Breaking Bad");
  });

  it("rejects ratings outside the 1-10 range", () => {
    expect(() => updateWatchlistItemSchema.parse({ rating: 11 })).toThrow();
  });
});
