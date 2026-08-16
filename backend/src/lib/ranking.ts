/**
 * Time-decayed "hot" score for leaderboard ranking, in the spirit of
 * Reddit/Hacker News ranking algorithms.
 *
 * The previous leaderboard ordered strictly by raw like count, which meant
 * an old track just keeps accumulating likes forever and a brand-new great
 * track can never outrank it — the leaderboard effectively freezes once a
 * few tracks get ahead early. This score decays with age, so recent
 * engagement counts for more and the board actually stays "live".
 *
 * score = (likes * LIKE_WEIGHT + plays * PLAY_WEIGHT) / (ageInHours + 2) ^ GRAVITY
 *
 * - The "+2" avoids a division blow-up for tracks that are only seconds old.
 * - GRAVITY controls how fast old tracks fall off; 1.5 is a well-known
 *   starting point from Hacker News' own ranking formula.
 */
const LIKE_WEIGHT = 3;
const PLAY_WEIGHT = 1;
const GRAVITY = 1.5;

export function hotScore(likeCount: number, playCount: number, createdAt: Date, now: Date = new Date()): number {
  const ageInHours = Math.max(0, (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60));
  const weightedEngagement = likeCount * LIKE_WEIGHT + playCount * PLAY_WEIGHT;
  return weightedEngagement / Math.pow(ageInHours + 2, GRAVITY);
}
