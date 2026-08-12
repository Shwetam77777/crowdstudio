import { useEffect, useState } from "react";
import { useJamEngine } from "../hooks/useJamEngine";
import { usePresence } from "../hooks/usePresence";
import { getSocket } from "../lib/socket";
import { api, apiErrorMessage } from "../lib/api";
import { VUMeter } from "../components/VUMeter";

export default function Studio() {
  const { isPlaying, params, start, stop, setParams } = useJamEngine();
  const presence = usePresence();
  const [title, setTitle] = useState("");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedTrackId, setSavedTrackId] = useState<string | null>(null);
  const [exportPrompt, setExportPrompt] = useState("");
  const [exportState, setExportState] = useState<"idle" | "exporting" | "done" | "error">("idle");
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportUrl, setExportUrl] = useState<string | null>(null);

  useEffect(() => {
    const socket = getSocket();
    socket.emit("join-jam-room");
    return () => {
      socket.emit("leave-jam-room");
    };
  }, []);

  async function handleSave() {
    if (!title.trim()) {
      setSaveError("Give your jam a title first");
      return;
    }
    setSaveState("saving");
    setSaveError(null);
    try {
      const { data } = await api.post("/tracks", { title, jamConfig: params, durationSec: 0 });
      setSaveState("saved");
      setSavedTrackId(data.track.id);
    } catch (err) {
      setSaveState("error");
      setSaveError(apiErrorMessage(err, "Could not save track"));
    }
  }

  async function handleExport() {
    if (!savedTrackId) return;
    setExportState("exporting");
    setExportError(null);
    try {
      const { data } = await api.post(`/tracks/${savedTrackId}/export`, { prompt: exportPrompt });
      setExportUrl(data.aiExportUrl);
      setExportState("done");
    } catch (err) {
      setExportState("error");
      // Correctly surfaces "AI export is not configured on this server"
      // when no provider key is set, instead of pretending it worked.
      setExportError(apiErrorMessage(err, "AI export failed"));
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
      <h1 className="mb-1 font-display text-2xl font-semibold text-primary sm:text-3xl">Jam Studio</h1>
      <p className="mb-6 flex items-center gap-2 font-mono text-xs text-muted">
        <VUMeter active={presence.inJamRoom > 0} bars={3} />
        {presence.inJamRoom} jamming right now — live, over WebSocket
      </p>

      <div className="channel-strip mb-6 p-6">
        <button
          onClick={() => (isPlaying ? stop() : start())}
          className={`mb-6 flex w-full items-center justify-center gap-3 rounded-lg py-3 font-display text-lg font-semibold transition-colors ${
            isPlaying ? "bg-accent text-bg" : "bg-primary text-bg"
          }`}
        >
          <VUMeter active={isPlaying} bars={4} />
          {isPlaying ? "STOP" : "START JAM"}
        </button>

        <Slider
          label="Tempo"
          value={params.tempo}
          min={60}
          max={160}
          onChange={(v) => setParams({ tempo: v })}
          suffix="bpm"
        />
        <Slider
          label="Filter cutoff"
          value={params.filterCutoff}
          min={200}
          max={8000}
          onChange={(v) => setParams({ filterCutoff: v })}
          suffix="Hz"
        />
        <Slider
          label="Reverb"
          value={Math.round(params.reverbWet * 100)}
          min={0}
          max={100}
          onChange={(v) => setParams({ reverbWet: v / 100 })}
          suffix="%"
        />

        <div className="mt-4">
          <label className="mb-1 block text-sm text-muted">Scale</label>
          <select
            className="w-full rounded border border-paper/15 bg-bg/60 px-3 py-2"
            value={params.scale}
            onChange={(e) => setParams({ scale: e.target.value as typeof params.scale })}
          >
            <option value="pentatonic">Pentatonic</option>
            <option value="major">Major</option>
            <option value="minor">Minor</option>
          </select>
        </div>
      </div>

      <div className="channel-strip p-6">
        <label className="mb-1 block text-sm text-muted">Track title</label>
        <input
          className="mb-3 w-full rounded border border-paper/15 bg-bg/60 px-3 py-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="My late-night jam"
        />
        {saveError && <p className="mb-3 text-sm text-alert">{saveError}</p>}
        <button
          onClick={handleSave}
          disabled={saveState === "saving"}
          className="w-full rounded border border-primary py-2 text-primary disabled:opacity-50"
        >
          {saveState === "saving" ? "Saving…" : saveState === "saved" ? "Saved ✓" : "Save to feed"}
        </button>
      </div>

      {savedTrackId && (
        <div className="channel-strip mt-6 p-6">
          <h2 className="mb-1 font-semibold">AI Export</h2>
          <p className="mb-3 text-xs text-muted">
            Renders this jam into a downloadable track via an external AI provider. Only works if
            the server has a provider configured — otherwise you'll get a clear error, not a fake result.
          </p>
          <input
            className="mb-3 w-full rounded border border-paper/15 bg-bg/60 px-3 py-2 text-sm"
            placeholder="Describe the vibe you want, e.g. 'dreamy lo-fi with soft vocals'"
            value={exportPrompt}
            onChange={(e) => setExportPrompt(e.target.value)}
          />
          {exportError && <p className="mb-3 text-sm text-alert">{exportError}</p>}
          {exportState === "done" && exportUrl && (
            <audio controls src={exportUrl} className="mb-3 w-full" />
          )}
          <button
            onClick={handleExport}
            disabled={exportState === "exporting" || !exportPrompt.trim()}
            className="w-full rounded bg-accent py-2 text-sm font-semibold text-bg disabled:opacity-50"
          >
            {exportState === "exporting" ? "Rendering…" : "Export with AI"}
          </button>
        </div>
      )}
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  onChange,
  suffix,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  suffix: string;
}) {
  return (
    <div className="mb-4">
      <div className="mb-1 flex justify-between text-sm text-muted">
        <span>{label}</span>
        <span className="font-mono text-primary">
          {value}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => {
          const v = Number(e.target.value);
          onChange(v);
          getSocket().emit("jam-param-change", { param: label, value: v });
        }}
        className="w-full accent-primary"
      />
    </div>
  );
}
