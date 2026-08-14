import { useEffect, useRef } from "react";
import type * as Tone from "tone";

interface Props {
  getAnalyser: () => Tone.Analyser | null;
  active: boolean;
}

/**
 * Draws the genuine waveform of the jam engine's mixed output — not a
 * decorative sine-wave animation. When `active` is false (jam stopped),
 * shows a flat idle line instead of running the animation loop.
 */
export function AudioVisualizer({ getAnalyser, active }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Match backing resolution to displayed size (accounting for device
    // pixel ratio) so the line isn't blurry on high-DPI screens.
    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    };
    resize();
    window.addEventListener("resize", resize);

    function drawIdleLine() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = "rgba(156, 146, 132, 0.4)"; // muted
      ctx.lineWidth = 2 * dpr;
      ctx.beginPath();
      ctx.moveTo(0, canvas.height / 2);
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    }

    function draw() {
      if (!ctx || !canvas) return;
      const analyser = getAnalyser();
      if (!analyser) {
        drawIdleLine();
        return;
      }
      const values = analyser.getValue() as Float32Array;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = "#E8A33D"; // primary amber
      ctx.lineWidth = 2 * dpr;
      ctx.beginPath();
      const sliceWidth = canvas.width / values.length;
      let x = 0;
      for (let i = 0; i < values.length; i++) {
        const v = values[i]; // roughly -1..1
        const y = (v * 0.45 + 0.5) * canvas.height;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        x += sliceWidth;
      }
      ctx.stroke();
      rafRef.current = requestAnimationFrame(draw);
    }

    if (active) {
      draw();
    } else {
      drawIdleLine();
    }

    return () => {
      window.removeEventListener("resize", resize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [active, getAnalyser]);

  return (
    <canvas
      ref={canvasRef}
      className="h-16 w-full rounded"
      aria-hidden="true"
      role="presentation"
    />
  );
}
