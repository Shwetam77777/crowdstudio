import { describe, it, expect } from "vitest";
import { hotScore } from "../lib/ranking";

describe("hotScore", () => {
  const now = new Date("2026-08-16T12:00:00Z");

  it("gives a higher score to more likes at the same age", () => {
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const low = hotScore(2, 0, oneHourAgo, now);
    const high = hotScore(20, 0, oneHourAgo, now);
    expect(high).toBeGreaterThan(low);
  });

  it("decays over time — the same like count scores lower as the track ages", () => {
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fresh = hotScore(10, 5, oneHourAgo, now);
    const stale = hotScore(10, 5, oneWeekAgo, now);
    expect(fresh).toBeGreaterThan(stale);
  });

  it("lets a fresh track with modest engagement outrank an old track with a huge historical like count", () => {
    // This is the exact "rich get richer" problem the old raw-like-count
    // ordering had: a months-old track with hundreds of likes would
    // permanently occupy the top of the board. A hot-ranked fresh track
    // with real recent engagement should be able to beat it.
    const monthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    const minutesAgo = new Date(now.getTime() - 10 * 60 * 1000);
    const oldPopular = hotScore(500, 1000, monthsAgo, now);
    const freshTrending = hotScore(40, 20, minutesAgo, now);
    expect(freshTrending).toBeGreaterThan(oldPopular);
  });

  it("never returns a negative score or throws for a zero-engagement track", () => {
    expect(() => hotScore(0, 0, now, now)).not.toThrow();
    expect(hotScore(0, 0, now, now)).toBe(0);
  });

  it("does not blow up for a track created in the same instant (age ~0)", () => {
    const score = hotScore(5, 2, now, now);
    expect(Number.isFinite(score)).toBe(true);
    expect(score).toBeGreaterThan(0);
  });

  it("treats a track with a future createdAt (clock skew) as age zero instead of going negative", () => {
    const future = new Date(now.getTime() + 60 * 60 * 1000);
    expect(() => hotScore(5, 2, future, now)).not.toThrow();
    const score = hotScore(5, 2, future, now);
    expect(Number.isFinite(score)).toBe(true);
    expect(score).toBeGreaterThan(0);
  });
});
