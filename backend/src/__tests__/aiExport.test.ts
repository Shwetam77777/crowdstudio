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

describe("POST /tracks/:id/export — not configured (default test env)", () => {
  it("returns a clear 501 instead of faking a result when no provider is configured", () => {
    return request(app)
      .post("/tracks/t1/export")
      .set("Authorization", `Bearer ${tokenFor("user1")}`)
      .send({ prompt: "dreamy lo-fi" })
      .then((res) => {
        expect(res.status).toBe(501);
        expect(res.body.error).toMatch(/not configured/i);
        // Must not touch the DB at all when short-circuiting on missing config.
        expect(mockPrisma.track.findUnique).not.toHaveBeenCalled();
      });
  });

  it("requires authentication", async () => {
    const res = await request(app).post("/tracks/t1/export").send({ prompt: "x" });
    expect(res.status).toBe(401);
  });
});
