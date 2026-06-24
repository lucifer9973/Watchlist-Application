import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import axios from "axios";

import { HttpError } from "../../src/utils/httpError.js";
import { OmdbDetailsService } from "../../src/services/omdb-details.service.js";

describe("OmdbDetailsService", () => {
  let axiosGetSpy: any;

  beforeEach(() => {
    if (axiosGetSpy) {
      axiosGetSpy.mockRestore();
    }
    axiosGetSpy = jest.spyOn(axios, "get");
  });

  it("returns cached details when available", async () => {
    const service = new OmdbDetailsService();

    axiosGetSpy.mockResolvedValueOnce({
      data: {
        Response: "True",
        Poster: "p",
        Title: "t",
        Year: "2000",
        Genre: "g",
        Runtime: "100 min",
        Actors: "a",
        Director: "d",
        imdbRating: "8.1",
        Plot: "plot"
      }
    });

    const first = await service.getDetails("tt123");
    expect(first.Title).toBe("t");

    // Second call should come from cache, so axios.get should not be called again
    const second = await service.getDetails("tt123");
    expect(second.Title).toBe("t");
    expect(axiosGetSpy).toHaveBeenCalledTimes(1);
  });

  it("throws HttpError(404) when OMDb returns Response=False", async () => {
    const service = new OmdbDetailsService();

    axiosGetSpy.mockResolvedValueOnce({
      data: {
        Response: "False",
        Error: "Movie not found"
      }
    });

    await expect(service.getDetails("tt404")).rejects.toMatchObject({
      statusCode: 404,
      message: "OMDb details not found"
    });
  });

  it("wraps non-HttpError failures as HttpError(502)", async () => {
    const service = new OmdbDetailsService();

    axiosGetSpy.mockRejectedValueOnce(new Error("network down"));

    await expect(service.getDetails("tt500")).rejects.toBeInstanceOf(HttpError);

    await expect(service.getDetails("tt500")).rejects.toMatchObject({
      statusCode: 502,
      message: "Unable to reach OMDb"
    });
  });
});

