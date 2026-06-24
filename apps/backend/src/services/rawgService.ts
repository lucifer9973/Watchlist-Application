import { TtlCache } from "../utils/cache.js";
import { HttpError } from "../utils/httpError.js";
import type { GameSearchResult, GameDetails, RawgGameSearchResult, RawgGameDetails } from "../types/rawg.js";

export class RawgService {
  private readonly searchCache = new TtlCache<GameSearchResult[]>(1000 * 60 * 60);
  private readonly detailsCache = new TtlCache<GameDetails>(1000 * 60 * 60);

  private readonly headers = {
    "User-Agent": "WatchlistApplication/1.0.0 (contact: developer@watchlistapp.local)",
    "Accept": "application/json"
  };

  private async fetchWithRetry(url: string, timeoutMs = 6000, maxRetries = 2): Promise<Response> {
    let delay = 1000;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(url, {
          headers: this.headers,
          signal: AbortSignal.timeout(timeoutMs)
        });
        if (response.ok) return response;
        // Don't retry on client errors (4xx) except 429 (rate limit)
        if (response.status >= 400 && response.status < 500 && response.status !== 429) {
          throw new HttpError(response.status, `HTTP error ${response.status}`);
        }
        if (response.status === 404) return response; // 404 is a terminal response, no need to retry
        if (attempt === maxRetries) {
          throw new HttpError(response.status, `HTTP error ${response.status}`);
        }
        console.warn(`RAWG request failed (attempt ${attempt}/${maxRetries}): ${response.status}`);
      } catch (error) {
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            if (attempt === maxRetries) {
              throw new HttpError(504, "RAWG request timed out");
            }
            console.warn(`RAWG timeout (attempt ${attempt}/${maxRetries})`);
          } else if (error instanceof HttpError) {
            throw error;
          } else {
            if (attempt === maxRetries) {
              throw new HttpError(502, "RAWG request failed");
            }
            console.warn(`RAWG network error (attempt ${attempt}/${maxRetries})`);
          }
        } else {
          if (attempt === maxRetries) {
            throw new HttpError(502, "RAWG request failed");
          }
          console.warn(`RAWG unknown error (attempt ${attempt}/${maxRetries})`);
        }
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      }
    }
    throw new HttpError(502, "Request failed after maximum retries");
  }

  async search(query: string): Promise<GameSearchResult[]> {
    const normalizedQuery = query.trim();
    if (normalizedQuery.length < 3) return [];

    const cacheKey = normalizedQuery.toLowerCase();
    const cached = this.searchCache.get(cacheKey);
    if (cached) return cached;

    try {
      const url = `https://api.rawg.io/api/games?key=${process.env.RAWG_API_KEY}&search=${encodeURIComponent(normalizedQuery)}&page_size=15`;
      const response = await this.fetchWithRetry(url, 6000, 2);

      if (!response.ok) {
        throw new HttpError(response.status, "RAWG search request failed");
      }

      const data = await response.json() as { results: RawgGameSearchResult[] };

      if (!data || !data.results) {
        return [];
      }

      const results: GameSearchResult[] = data.results.map((game) => ({
        id: game.id.toString(),
        title: game.name,
        year: game.released ? game.released.substring(0, 4) : "N/A",
        poster: game.background_image,
        metacritic: game.metacritic,
        platforms: game.platforms?.map((p) => p.platform.name) || [],
        genres: game.genres?.map((g) => g.genre.name) || []
      }));

      this.searchCache.set(cacheKey, results);
      return results;
    } catch (error) {
      if (error instanceof HttpError) throw error;
      throw new HttpError(502, "Unable to reach RAWG search service");
    }
  }

  async getGameDetails(gameId: string): Promise<GameDetails> {
    const cached = this.detailsCache.get(gameId);
    if (cached) return cached;

    try {
      const response = await this.fetchWithRetry(
        `https://api.rawg.io/api/games/${gameId}?key=${process.env.RAWG_API_KEY}`,
        6000,
        2
      );

      if (response.status === 404) {
        throw new HttpError(404, "Game details not found");
      }
      if (!response.ok) {
        throw new HttpError(response.status, "RAWG details request failed");
      }

      const data = await response.json() as RawgGameDetails;

      const details: GameDetails = {
        id: data.id.toString(),
        title: data.name,
        year: data.released ? data.released.substring(0, 4) : "N/A",
        poster: data.background_image,
        description: data.description_raw,
        metacritic: data.metacritic,
        platforms: data.platforms?.map((p) => p.platform.name) || [],
        genres: data.genres?.map((g) => g.genre.name) || [],
        developers: data.developers?.map((d) => d.developer.name) || [],
        publishers: data.publishers?.map((p) => p.publisher.name) || [],
        ratings: data.ratings || [],
        screenshots: data.screenshots?.map((s) => s.image) || [],
        stores: data.stores?.map((s) => s.store.name) || [],
        esrbRating: data.esrb_rating?.name || null,
        website: data.website,
        playtime: data.playtime
      };

      this.detailsCache.set(gameId, details);
      return details;
    } catch (error) {
      if (error instanceof HttpError) throw error;
      throw new HttpError(502, "Unable to reach RAWG details service");
    }
  }
}
