import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Play, Square, Save, Sparkles, Music2, Drum, Waves, Volume2, VolumeX, LogIn } from "lucide-react";
import { useJamEngine, SOUND_PRESETS, type MixerChannel } from "../hooks/useJamEngine";
import { usePresence } from "../hooks/usePresence";
import { useAuthStore } from "../stores/authStore";
import { getSocket } from "../lib/socket";
import { api, apiErrorMessage } from "../lib/api";
import { VUMeter } from "../components/VUMeter";
import { AudioVisualizer } from "../components/AudioVisualizer";
import { ChatPanel } from "../components/ChatPanel";

export default function Studio() {
  const { isPlaying, params, start, stop, setParams, getAnalyser, mixer, setChannelVolume, toggleChannelMute } =
    useJamEngine();
  const presence = usePresence();
  const user = useAuthStore((s) => s.user);

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
    if (!user) {
      setSaveError("Please log in to save your track to the global feed.");
      return;
    }
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
      setExportError(apiErrorMessage(err, "AI export failed"));
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
      {/* Top Banner & Header */}
      <div className="glass-card mb-6 flex flex-wrap items-center justify-between gap-4 p-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-full bg-accent animate-pulse shadow-[0_0_10px_#00F2FE]" />
            <h1 className="font-display text-2xl font-bold tracking-tight text-paper sm:text-3xl">
              Jam <span className="neon-text-cyan">Studio</span>
            </h1>
          </div>
          <p className="mt-1 flex items-center gap-2 font-mono text-xs text-muted">
            <VUMeter active={presence.inJamRoom > 0} bars={4} />
            <span className="text-accent font-semibold">{presence.inJamRoom}</span> musicians jamming live over WebSocket
          </p>
        </div>

        <button
          onClick={() => (isPlaying ? stop() : start())}
          className={`flex items-center gap-3 rounded-xl px-8 py-3.5 font-display text-base font-bold transition-all shadow-lg active:scale-95 ${
            isPlaying
              ? "bg-gradient-to-r from-red-500 to-alert text-white shadow-alert/40 hover:brightness-110"
              : "bg-gradient-to-r from-accent via-primary to-neon text-bg shadow-glow hover:brightness-110"
          }`}
        >
          {isPlaying ? <Square size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
          {isPlaying ? "STOP JAM" : "START JAM 🎵"}
        </button>
      </div>

      {/* Guest Audio Mode Banner */}
      {!user && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-accent/10 border border-accent/30 p-4 text-sm text-paper">
          <div className="flex items-center gap-2">
            <Sparkles className="text-accent shrink-0" size={18} />
            <span>
              <strong>Guest Jamming Active:</strong> Anyone can generate and tweak live audio instantly! Log in to save your jams to the feed.
            </span>
          </div>
          <Link to="/login" className="flex items-center gap-1.5 rounded-lg bg-accent/20 px-3 py-1.5 text-xs font-semibold text-accent hover:bg-accent/30 transition-colors">
            <LogIn size={14} /> Log In
          </Link>
        </div>
      )}

      {/* Real-time Spectrum Waveform Visualizer */}
      <div className="mb-6">
        <AudioVisualizer getAnalyser={getAnalyser} active={isPlaying} />
      </div>

      {/* Hardware DAW Mixer Console Dashboard */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <MixerStrip
          icon={<Drum size={18} />}
          label="Drums"
          channel="drums"
          active={isPlaying}
          db={mixer.volume.drums}
          muted={mixer.muted.drums}
          onVolumeChange={setChannelVolume}
          onToggleMute={toggleChannelMute}
        />
        <MixerStrip
          icon={<Waves size={18} />}
          label="Bass"
          channel="bass"
          active={isPlaying}
          db={mixer.volume.bass}
          muted={mixer.muted.bass}
          onVolumeChange={setChannelVolume}
          onToggleMute={toggleChannelMute}
        />
        <MixerStrip
          icon={<Music2 size={18} />}
          label="Pads"
          channel="pads"
          active={isPlaying}
          db={mixer.volume.pads}
          muted={mixer.muted.pads}
          onVolumeChange={setChannelVolume}
          onToggleMute={toggleChannelMute}
        />
        <MixerStrip
          icon={<Sparkles size={18} />}
          label="Lead"
          channel="lead"
          active={isPlaying}
          db={mixer.volume.lead}
          muted={mixer.muted.lead}
          onVolumeChange={setChannelVolume}
          onToggleMute={toggleChannelMute}
        />
      </div>

      {/* Sound Presets bar */}
      <div className="glass-card mb-6 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-accent font-semibold">
            <Sparkles size={14} /> 1-Click Sound Presets
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(SOUND_PRESETS).map(([name, preset]) => (
              <button
                key={name}
                onClick={() => setParams(preset)}
                className="rounded-lg border border-white/15 bg-surface/80 px-3.5 py-1.5 text-xs font-semibold text-paper transition-all hover:border-accent hover:text-accent hover:shadow-glow active:scale-95"
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Parameters & Tone Controls Grid */}
      <div className="mb-6 grid gap-6 sm:grid-cols-2">
        <div className="glass-card p-6">
          <h2 className="mb-4 font-mono text-xs font-bold uppercase tracking-widest text-primary">Groove Controls</h2>
          <Slider
            label="Tempo"
            value={params.tempo}
            min={60}
            max={160}
            onChange={(v) => setParams({ tempo: v })}
            suffix=" bpm"
          />
          <Slider
            label="Energy"
            value={Math.round(params.energy * 100)}
            min={0}
            max={100}
            onChange={(v) => setParams({ energy: v / 100 })}
            suffix="%"
            hint="Controls drum pattern density and synth melody rate"
          />
          <div className="mt-4">
            <label htmlFor="jam-scale" className="mb-1 block text-sm font-semibold text-muted">Scale / Tonality</label>
            <select
              id="jam-scale"
              name="scale"
              className="w-full rounded-lg border border-white/15 bg-bg/80 px-4 py-2.5 text-sm text-paper transition-colors focus:border-accent focus:outline-none"
              value={params.scale}
              onChange={(e) => setParams({ scale: e.target.value as typeof params.scale })}
            >
              <option value="pentatonic">Pentatonic (Harmonic Ambient)</option>
              <option value="major">Major (Upbeat Pop)</option>
              <option value="minor">Minor (Cyber Synthwave)</option>
            </select>
          </div>
        </div>

        <div className="glass-card p-6">
          <h2 className="mb-4 font-mono text-xs font-bold uppercase tracking-widest text-accent">Tone & DSP Effects</h2>
          <Slider
            label="Filter Cutoff"
            value={params.filterCutoff}
            min={200}
            max={8000}
            onChange={(v) => setParams({ filterCutoff: v })}
            suffix=" Hz"
          />
          <Slider
            label="Reverb Space"
            value={Math.round(params.reverbWet * 100)}
            min={0}
            max={100}
            onChange={(v) => setParams({ reverbWet: v / 100 })}
            suffix="%"
          />
        </div>
      </div>

      {/* Live Jam Room Chat */}
      <div className="mb-6">
        <ChatPanel />
      </div>

      {/* Save Jam Box */}
      <div className="glass-card p-6">
        <h2 className="mb-1 text-lg font-bold text-paper">Save Track to Global Feed</h2>
        <p className="mb-4 text-xs text-muted">Publish your live jam session so other musicians can listen, like, and vote.</p>
        <label htmlFor="track-title" className="mb-1 block text-sm text-muted">Track Title</label>
        <input
          id="track-title"
          name="title"
          className="mb-4 w-full rounded-lg border border-white/15 bg-bg/80 px-4 py-2.5 text-sm transition-colors focus:border-accent focus:outline-none"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Midnight Cyberpunk Jam"
          maxLength={100}
        />
        {saveError && <p className="mb-4 rounded-lg bg-alert/20 p-3 text-sm text-alert" role="alert">{saveError}</p>}
        <button
          onClick={handleSave}
          disabled={saveState === "saving"}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent py-3 text-sm font-bold text-bg transition-all hover:brightness-110 disabled:opacity-50"
        >
          <Save size={16} />
          {saveState === "saving" ? "Saving Track…" : saveState === "saved" ? "Saved ✓" : "Publish to Feed"}
        </button>
      </div>

      {/* AI Export Box */}
      {savedTrackId && (
        <div className="glass-card mt-6 p-6">
          <h2 className="mb-1 flex items-center gap-2 text-lg font-bold text-paper">
            <Sparkles size={18} className="text-neon" /> AI Render Export
          </h2>
          <p className="mb-4 text-xs text-muted">
            Generates an AI audio master track using configured cloud provider models.
          </p>
          <label htmlFor="export-prompt" className="sr-only">Describe the vibe for AI export</label>
          <input
            id="export-prompt"
            name="exportPrompt"
            className="mb-4 w-full rounded-lg border border-white/15 bg-bg/80 px-4 py-2.5 text-sm transition-colors focus:border-neon focus:outline-none"
            placeholder="Describe your prompt, e.g. 'lo-fi chill beats with soft piano'"
            maxLength={500}
            value={exportPrompt}
            onChange={(e) => setExportPrompt(e.target.value)}
          />
          {exportError && <p className="mb-4 rounded-lg bg-alert/20 p-3 text-sm text-alert" role="alert">{exportError}</p>}
          {exportState === "done" && exportUrl && (
            <audio controls src={exportUrl} className="mb-4 w-full" />
          )}
          <button
            onClick={handleExport}
            disabled={exportState === "exporting" || !exportPrompt.trim()}
            className="w-full rounded-xl bg-neon py-3 text-sm font-bold text-white transition-all hover:brightness-110 disabled:opacity-50"
          >
            {exportState === "exporting" ? "Rendering AI Track…" : "Render with AI"}
          </button>
        </div>
      )}
    </div>
  );
}

function MixerStrip({
  icon,
  label,
  channel,
  active,
  db,
  muted,
  onVolumeChange,
  onToggleMute,
}: {
  icon: ReactNode;
  label: string;
  channel: MixerChannel;
  active: boolean;
  db: number;
  muted: boolean;
  onVolumeChange: (channel: MixerChannel, db: number) => void;
  onToggleMute: (channel: MixerChannel) => void;
}) {
  const isAudible = active && !muted;
  return (
    <div className="glass-card flex flex-col items-center gap-3 p-4">
      <span className={isAudible ? "text-accent" : "text-muted"}>{icon}</span>
      <VUMeter active={isAudible} bars={5} />
      <span className="font-mono text-xs font-semibold tracking-wider text-paper uppercase">{label}</span>
      <label htmlFor={`vol-${channel}`} className="sr-only">{label} volume</label>
      <input
        id={`vol-${channel}`}
        name={`vol-${channel}`}
        type="range"
        min={-40}
        max={0}
        value={db}
        disabled={muted}
        onChange={(e) => onVolumeChange(channel, Number(e.target.value))}
        className="w-full accent-accent disabled:opacity-30"
      />
      <div className="flex items-center justify-between w-full text-[10px] font-mono text-muted">
        <span>-40dB</span>
        <span>{db}dB</span>
        <span>0dB</span>
      </div>
      <button
        onClick={() => onToggleMute(channel)}
        title={muted ? `Unmute ${label}` : `Mute ${label}`}
        className={`flex items-center gap-1 w-full justify-center rounded-lg py-1.5 text-xs font-semibold transition-all ${
          muted
            ? "bg-alert/20 text-alert border border-alert/40"
            : "bg-surface/80 text-muted border border-white/10 hover:text-accent hover:border-accent"
        }`}
      >
        {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
        <span>{muted ? "MUTED" : "MUTE"}</span>
      </button>
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
  hint,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  suffix: string;
  hint?: string;
}) {
  return (
    <div className="mb-4">
      <div className="mb-1 flex justify-between text-sm text-muted">
        <span className="font-semibold">{label}</span>
        <span className="font-mono font-bold text-accent">
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
        className="w-full accent-accent"
      />
      {hint && <p className="mt-1 text-xs text-muted/70">{hint}</p>}
    </div>
  );
}
