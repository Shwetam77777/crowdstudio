import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";

vi.mock("../db", () => ({ prisma: createMockPrisma() }));

import { createMockPrisma } from "./mockPrisma";
import { prisma } from "../db";
import { buildApp } from "../index";
import { config } from "../config";

const mockPrisma = prisma as unknown as ReturnType<typeof createMockPrisma>;
const app = buildApp();

function tokenFor(userId: string) {
  return jwt.sign({ userId }, config.jwtSecret, { expiresIn: config.jwtExpiry });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /tracks", () => {
  it("returns an empty feed cleanly with no tracks", async () => {
    mockPrisma.track.findMany.mockResolvedValue([]);
    const res = await request(app).get("/tracks");
    expect(res.status).toBe(200);
    expect(res.body.tracks).toEqual([]);
  });
});

describe("POST /tracks", () => {
  it("requires authentication", async () => {
    const res = await request(app).post("/tracks").send({ title: "My jam", jamConfig: {} });
    expect(res.status).toBe(401);
  });

  it("rejects a track with no title", async () => {
    const res = await request(app)
      .post("/tracks")
      .set("Authorization", `Bearer ${tokenFor("user1")}`)
      .send({ jamConfig: {} });
    expect(res.status).toBe(400);
  });

  it("creates a track when authenticated with valid data", async () => {
    mockPrisma.track.create.mockResolvedValue({
      id: "t1",
      title: "My jam",
      author: { id: "user1", username: "alice", displayName: "Alice", avatarUrl: null },
    });
    const res = await request(app)
      .post("/tracks")
      .set("Authorization", `Bearer ${tokenFor("user1")}`)
      .send({ title: "My jam", jamConfig: { tempo: 90 } });
    expect(res.status).toBe(201);
    expect(res.body.track.title).toBe("My jam");
  });
});

describe("POST /tracks/:id/like", () => {
  it("requires authentication", async () => {
    const res = await request(app).post("/tracks/t1/like");
    expect(res.status).toBe(401);
  });

  it("likes a track that hasn't been liked yet", async () => {
    mockPrisma.like.findUnique.mockResolvedValue(null);
    mockPrisma.like.create.mockResolvedValue({ id: "l1" });
    mockPrisma.like.count.mockResolvedValue(1);
    const res = await request(app)
      .post("/tracks/t1/like")
      .set("Authorization", `Bearer ${tokenFor("user1")}`);
    expect(res.status).toBe(200);
    expect(res.body.liked).toBe(true);
    expect(res.body.likeCount).toBe(1);
  });

  it("unlikes a track that was already liked (toggle behavior)", async () => {
    mockPrisma.like.findUnique.mockResolvedValue({ id: "l1" });
    mockPrisma.like.delete.mockResolvedValue({ id: "l1" });
    mockPrisma.like.count.mockResolvedValue(0);
    const res = await request(app)
      .post("/tracks/t1/like")
      .set("Authorization", `Bearer ${tokenFor("user1")}`);
    expect(res.status).toBe(200);
    expect(res.body.liked).toBe(false);
  });

  it("returns 404 for a nonexistent track instead of a raw DB error", async () => {
    mockPrisma.like.findUnique.mockResolvedValue(null);
    mockPrisma.like.create.mockRejectedValue(new Error("foreign key constraint"));
    const res = await request(app)
      .post("/tracks/does-not-exist/like")
      .set("Authorization", `Bearer ${tokenFor("user1")}`);
    expect(res.status).toBe(404);
  });
});

describe("GET /tracks/leaderboard", () => {
  it("returns a ranked, real leaderboard shape (not a hardcoded number)", async () => {
    mockPrisma.track.findMany.mockResolvedValue([
      {
        id: "t1",
        title: "Top jam",
        playCount: 5,
        author: { username: "alice", displayName: "Alice" },
        _count: { likes: 10 },
      },
    ]);
    const res = await request(app).get("/tracks/leaderboard");
    expect(res.status).toBe(200);
    expect(res.body.leaderboard[0]).toMatchObject({ rank: 1, likeCount: 10 });
  });
});

describe("404 handling", () => {
  it("returns clean JSON for unknown routes", async () => {
    const res = await request(app).get("/this-route-does-not-exist");
    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Not found");
  });
});
