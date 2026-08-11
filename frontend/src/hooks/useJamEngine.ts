import { useCallback, useRef, useState } from "react";
import * as Tone from "tone";

export interface JamParams {
  scale: "major" | "minor" | "pentatonic";
  rootNote: string; // e.g. "C3"
  tempo: number; // BPM
  filterCutoff: number; // Hz
  reverbWet: number; // 0-1
}

const SCALES: Record<JamParams["scale"], number[]> = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  pentatonic: [0, 2, 4, 7, 9],
};

export const DEFAULT_JAM_PARAMS: JamParams = {
  scale: "pentatonic",
  rootNote: "C3",
  tempo: 90,
  filterCutoff: 2000,
  reverbWet: 0.35,
};

/**
 * Real-time generative synth engine. Audio only starts after an explicit
 * user gesture (start()) — browsers block autoplay, and Tone.start()
 * requires a user interaction, so we never try to play on mount.
 */
export function useJamEngine() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [params, setParamsState] = useState<JamParams>(DEFAULT_JAM_PARAMS);

  const synthRef = useRef<Tone.PolySynth | null>(null);
  const filterRef = useRef<Tone.Filter | null>(null);
  const reverbRef = useRef<Tone.Reverb | null>(null);
  const loopRef = useRef<Tone.Loop | null>(null);

  const start = useCallback(async () => {
    if (isPlaying) return;
    await Tone.start(); // requires user gesture — call this from a click handler

    const filter = new Tone.Filter(params.filterCutoff, "lowpass").toDestination();
    const reverb = new Tone.Reverb({ decay: 3, wet: params.reverbWet }).connect(filter);
    const synth = new Tone.PolySynth(Tone.Synth).connect(reverb);

    filterRef.current = filter;
    reverbRef.current = reverb;
    synthRef.current = synth;

    Tone.Transport.bpm.value = params.tempo;

    const loop = new Tone.Loop((time) => {
      const scaleIntervals = SCALES[params.scale];
      const degree = scaleIntervals[Math.floor(Math.random() * scaleIntervals.length)];
      const note = Tone.Frequency(params.rootNote).transpose(degree).toNote();
      synth.triggerAttackRelease(note, "8n", time);
    }, "4n");

    loopRef.current = loop;
    loop.start(0);
    Tone.Transport.start();
    setIsPlaying(true);
  }, [isPlaying, params]);

  const stop = useCallback(() => {
    Tone.Transport.stop();
    loopRef.current?.dispose();
    synthRef.current?.dispose();
    filterRef.current?.dispose();
    reverbRef.current?.dispose();
    loopRef.current = null;
    synthRef.current = null;
    filterRef.current = null;
    reverbRef.current = null;
    setIsPlaying(false);
  }, []);

  const setParams = useCallback((next: Partial<JamParams>) => {
    setParamsState((prev) => {
      const merged = { ...prev, ...next };
      if (filterRef.current && next.filterCutoff !== undefined) {
        filterRef.current.frequency.rampTo(next.filterCutoff, 0.1);
      }
      if (reverbRef.current && next.reverbWet !== undefined) {
        reverbRef.current.wet.rampTo(next.reverbWet, 0.1);
      }
      if (next.tempo !== undefined) {
        Tone.Transport.bpm.rampTo(next.tempo, 0.2);
      }
      return merged;
    });
  }, []);

  return { isPlaying, params, start, stop, setParams };
}
