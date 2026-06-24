import axios from "axios";

import { env } from "../config/env.js";
import type { OmdbDetails } from "../types/omdbDetails.js";
import { TtlCache } from "../utils/cache.js";
import { HttpError } from "../utils/httpError.js";

type OmdbDetailsResponse =
  | {
      Response: "True";
      Poster: string;
      Title: string;
      Year: string;
      Genre: string;
      Runtime: string;
      Actors: string;
      Director: string;
      imdbRating: string;
      Plot: string;
    }
  | {
      Response: "False";
      Error: string;
    };

export class OmdbDetailsService {
  private readonly cache = new TtlCache<OmdbDetails>(1000 * 60 * 60);

  async getDetails(imdbId: string): Promise<OmdbDetails> {
    const normalized = imdbId.trim();
    const cached = this.cache.get(normalized);
    if (cached) return cached;

    try {
      const { data } = await axios.get<OmdbDetailsResponse>("https://www.omdbapi.com/", {
        params: {
          apikey: env.OMDB_API_KEY,
          i: normalized,
          plot: "full"
        },
        timeout: 9000
      });

      if (data.Response === "False") {
        throw new HttpError(404, "OMDb details not found", data.Error);
      }

      const details: OmdbDetails = {
        Poster: data.Poster,
        Title: data.Title,
        Year: data.Year,
        Genre: data.Genre,
        Runtime: data.Runtime,
        Actors: data.Actors,
        Director: data.Director,
        imdbRating: data.imdbRating,
        Plot: data.Plot
      };

      this.cache.set(normalized, details);
      return details;
    } catch (error) {
      if (error instanceof HttpError) throw error;
      throw new HttpError(502, "Unable to reach OMDb");
    }
  }
}

