import axios from "axios";

import { env } from "../config/env.js";
import type { OmdbSearchItem, SearchResult } from "../types/omdb.js";
import { TtlCache } from "../utils/cache.js";
import { HttpError } from "../utils/httpError.js";

type OmdbSearchResponse =
  | {
      Response: "True";
      Search: OmdbSearchItem[];
      totalResults: string;
    }
  | {
      Response: "False";
      Error: string;
    };

export class OmdbService {
  private readonly cache = new TtlCache<SearchResult[]>(1000 * 60 * 10);

  async search(query: string): Promise<SearchResult[]> {
    const normalizedQuery = query.trim();
    if (normalizedQuery.length < 3) return [];

    const cacheKey = normalizedQuery.toLowerCase();
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    try {
      const { data } = await axios.get<OmdbSearchResponse>("https://www.omdbapi.com/", {
        params: {
          apikey: env.OMDB_API_KEY,
          s: normalizedQuery
        },
        timeout: 8000
      });

      if (data.Response === "False") {
        if (data.Error === "Movie not found!") {
          this.cache.set(cacheKey, []);
          return [];
        }
        throw new HttpError(502, "OMDb request failed", data.Error);
      }

      const results = data.Search.filter((item) => item.Type === "movie" || item.Type === "series").map(
        (item) => ({
          imdbID: item.imdbID,
          title: item.Title,
          year: item.Year,
          type: item.Type === "series" ? "series" : "movie",
          poster: item.Poster && item.Poster !== "N/A" ? item.Poster : null
        })
      );

      this.cache.set(cacheKey, results);
      return results;
    } catch (error) {
      if (error instanceof HttpError) throw error;
      throw new HttpError(502, "Unable to reach OMDb");
    }
  }
}
