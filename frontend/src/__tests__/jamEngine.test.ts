import { describe, it, expect } from "vitest";
import { degreeToNote, buildTriad, SCALES } from "../hooks/useJamEngine";

describe("degreeToNote", () => {
  it("returns the root note itself at degree 0", () => {
    expect(degreeToNote(SCALES.major, "C3", 0)).toBe("C3");
  });

  it("wraps to the next octave once the degree exceeds the scale length", () => {
    // Major scale has 7 degrees (0-6); degree 7 should be the root one
    // octave up, not fall off the end or throw.
    expect(degreeToNote(SCALES.major, "C3", 7)).toBe("C4");
  });

  it("produces a diatonic 5th (G) for major scale degree 4", () => {
    expect(degreeToNote(SCALES.major, "C3", 4)).toBe("G3");
  });

  it("handles the shorter pentatonic scale without throwing", () => {
    // This is exactly the kind of edge case that broke in an earlier draft
    // of the engine — a 5-note scale combined with a degree count assuming
    // 7 notes. Regression guard.
    expect(() => degreeToNote(SCALES.pentatonic, "C3", 4)).not.toThrow();
    expect(degreeToNote(SCALES.pentatonic, "C3", 5)).toBe("C4"); // wraps after 5 notes
  });
});

describe("buildTriad", () => {
  it("builds a C major triad (C-E-G) at degree 0 in the major scale", () => {
    expect(buildTriad(SCALES.major, "C3", 0)).toEqual(["C3", "E3", "G3"]);
  });

  it("builds a diatonic triad for every degree in the progression without duplicate/invalid notes", () => {
    // Regression guard for the exact progressions used by PROGRESSIONS in
    // useJamEngine.ts (major: I-V-vi-IV -> degrees 0,4,5,3).
    for (const degree of [0, 4, 5, 3]) {
      const triad = buildTriad(SCALES.major, "C3", degree);
      expect(triad).toHaveLength(3);
      expect(new Set(triad).size).toBe(3); // no duplicate notes in a triad
    }
  });

  it("stays within the pentatonic scale without throwing for every progression degree", () => {
    for (const degree of [0, 3, 4, 2]) {
      expect(() => buildTriad(SCALES.pentatonic, "C3", degree)).not.toThrow();
    }
  });
});
