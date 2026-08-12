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

describe("GET /users/:username", () => {
  it("returns 404 for a user that doesn't exist", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    const res = await request(app).get("/users/nobody");
    expect(res.status).toBe(404);
  });

  it("returns the public profile and their tracks", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: "u1",
      username: "alice",
      displayName: "Alice",
      bio: "I jam",
      avatarUrl: null,
      createdAt: new Date(),
      _count: { tracks: 1 },
    });
    mockPrisma.track.findMany.mockResolvedValue([
      { id: "t1", title: "Jam", createdAt: new Date(), playCount: 3, _count: { likes: 2, comments: 1 } },
    ]);
    const res = await request(app).get("/users/alice");
    expect(res.status).toBe(200);
    expect(res.body.user.username).toBe("alice");
    expect(res.body.tracks).toHaveLength(1);
  });
});

describe("PATCH /users/me", () => {
  it("requires authentication", async () => {
    const res = await request(app).patch("/users/me").send({ bio: "hi" });
    expect(res.status).toBe(401);
  });

  it("rejects a bio over 280 characters", async () => {
    const res = await request(app)
      .patch("/users/me")
      .set("Authorization", `Bearer ${tokenFor("u1")}`)
      .send({ bio: "x".repeat(281) });
    expect(res.status).toBe(400);
  });

  it("updates profile fields for the authenticated user", async () => {
    mockPrisma.user.update.mockResolvedValue({
      id: "u1",
      username: "alice",
      displayName: "Alice J",
      bio: "updated bio",
      avatarUrl: null,
    });
    const res = await request(app)
      .patch("/users/me")
      .set("Authorization", `Bearer ${tokenFor("u1")}`)
      .send({ displayName: "Alice J", bio: "updated bio" });
    expect(res.status).toBe(200);
    expect(res.body.user.bio).toBe("updated bio");
  });
});
