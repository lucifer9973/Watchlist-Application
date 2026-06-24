import { describe, expect, it } from "@jest/globals";
import request from "supertest";

import { createApp } from "../../src/app.js";

describe("watchlist routes", () => {
  it("returns validation errors for invalid create payloads", async () => {
    const response = await request(createApp()).post("/api/watchlist").send({
      title: ""
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it("responds to health checks", async () => {
    const response = await request(createApp()).get("/health");
    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ok");
  });
});
