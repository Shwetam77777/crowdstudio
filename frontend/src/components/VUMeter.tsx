interface VUMeterProps {
  active: boolean;
  bars?: number;
  className?: string;
}

/**
 * The product's signature visual element: a small bank of bars that
 * animate like a mixing-console VU meter. Used anywhere we want to signal
 * "something live is happening" — online presence in the navbar, jam
 * playback feedback in the studio — instead of a generic pulsing dot.
 */
export function VUMeter({ active, bars = 4, className = "" }: VUMeterProps) {
  return (
    <span className={`inline-flex items-end gap-[2px] ${className}`} aria-hidden="true">
      {Array.from({ length: bars }).map((_, i) => (
        <span
          key={i}
          className={`w-[3px] rounded-full ${active ? "bg-accent" : "bg-muted/40"}`}
          style={
            active
              ? {
                  height: "12px",
                  animation: `vu-bounce 0.9s ease-in-out ${i * 0.13}s infinite`,
                }
              : { height: "4px" }
          }
        />
      ))}
      <style>{`
        @keyframes vu-bounce {
          0%, 100% { transform: scaleY(0.3); }
          50% { transform: scaleY(1); }
        }
      `}</style>
    </span>
  );
}
