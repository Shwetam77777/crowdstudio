import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";

vi.mock("../db", () => ({ prisma: createMockPrisma() }));

// Overrides the real config module so this file can exercise the
// "provider configured" branch without needing real env vars — the rest
// of the suite (aiExport.test.ts) covers the real default "not configured"
// state using the actual config module.
vi.mock("../config", () => ({
  config: {
    port: 4000,
    nodeEnv: "test",
    jwtSecret: "test-secret-do-not-use-in-prod",
    jwtExpiry: "7d",
    corsOrigin: "http://localhost:5173",
    databaseUrl: "postgresql://test:test@localhost:5432/test",
    aiExportApiKey: "fake-key",
    aiExportProvider: "fake-provider",
    aiExportTimeoutMs: 200,
  },
}));

import { createMockPrisma } from "./mockPrisma";
import { prisma } from "../db";
import { buildApp } from "../index";
import { config } from "../config";

const mockPrisma = prisma as unknown as ReturnType<typeof createMockPrisma>;
const app = buildApp();

function tokenFor(userId: string) {
  return jwt.sign({ userId }, config.jwtSecret, { expiresIn: config.jwtExpiry });
}

const originalEnv = process.env.AI_EXPORT_ENDPOINT;
const originalFetch = global.fetch;

beforeEach(() => {
  vi.clearAllMocks();
  process.env.AI_EXPORT_ENDPOINT = "https://fake-provider.example/render";
});

afterEach(() => {
  process.env.AI_EXPORT_ENDPOINT = originalEnv;
  global.fetch = originalFetch;
});

describe("POST /tracks/:id/export — provider configured", () => {
  it("rejects a request for a track that doesn't exist", async () => {
    mockPrisma.track.findUnique.mockResolvedValue(null);
    const res = await request(app)
      .post("/tracks/nope/export")
      .set("Authorization", `Bearer ${tokenFor("user1")}`)
      .send({ prompt: "dreamy lo-fi" });
    expect(res.status).toBe(404);
  });

  it("rejects exporting a track you don't own", async () => {
    mockPrisma.track.findUnique.mockResolvedValue({ id: "t1", authorId: "someone-else", jamConfig: {} });
    const res = await request(app)
      .post("/tracks/t1/export")
      .set("Authorization", `Bearer ${tokenFor("user1")}`)
      .send({ prompt: "dreamy lo-fi" });
    expect(res.status).toBe(403);
  });

  it("rejects an empty prompt", async () => {
    const res = await request(app)
      .post("/tracks/t1/export")
      .set("Authorization", `Bearer ${tokenFor("user1")}`)
      .send({ prompt: "" });
    expect(res.status).toBe(400);
  });

  it("returns the real audio URL from the provider on success", async () => {
    mockPrisma.track.findUnique.mockResolvedValue({ id: "t1", authorId: "user1", jamConfig: {} });
    mockPrisma.track.update.mockResolvedValue({});
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ audioUrl: "https://fake-provider.example/track.mp3" }),
    }) as unknown as typeof fetch;

    const res = await request(app)
      .post("/tracks/t1/export")
      .set("Authorization", `Bearer ${tokenFor("user1")}`)
      .send({ prompt: "dreamy lo-fi" });

    expect(res.status).toBe(200);
    expect(res.body.aiExportUrl).toBe("https://fake-provider.example/track.mp3");
    expect(mockPrisma.track.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ aiExportStatus: "ready" }) })
    );
  });

  it("marks the track failed and returns 502 when the provider errors, instead of faking output", async () => {
    mockPrisma.track.findUnique.mockResolvedValue({ id: "t1", authorId: "user1", jamConfig: {} });
    mockPrisma.track.update.mockResolvedValue({});
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500 }) as unknown as typeof fetch;

    const res = await request(app)
      .post("/tracks/t1/export")
      .set("Authorization", `Bearer ${tokenFor("user1")}`)
      .send({ prompt: "dreamy lo-fi" });

    expect(res.status).toBe(502);
    expect(mockPrisma.track.update).toHaveBeenLastCalledWith(
      expect.objectContaining({ data: { aiExportStatus: "failed" } })
    );
  });

  it("times out and fails cleanly instead of hanging when the provider never responds", async () => {
    mockPrisma.track.findUnique.mockResolvedValue({ id: "t1", authorId: "user1", jamConfig: {} });
    mockPrisma.track.update.mockResolvedValue({});
    // Simulate a fetch that respects AbortSignal, like the real API.
    global.fetch = vi.fn((_url: string, init?: RequestInit) => {
      return new Promise((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () => {
          const err = new Error("aborted");
          err.name = "AbortError";
          reject(err);
        });
      });
    }) as unknown as typeof fetch;

    const res = await request(app)
      .post("/tracks/t1/export")
      .set("Authorization", `Bearer ${tokenFor("user1")}`)
      .send({ prompt: "dreamy lo-fi" });

    expect(res.status).toBe(502);
    expect(res.body.error).toMatch(/did not respond/i);
  }, 5_000);
});
