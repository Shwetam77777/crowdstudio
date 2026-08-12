import { Link } from "react-router-dom";
import { VUMeter } from "../components/VUMeter";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <VUMeter active={false} bars={5} className="scale-150" />
      <h1 className="font-display text-2xl font-semibold text-primary">Dead air</h1>
      <p className="max-w-sm text-sm text-muted">
        Nothing's coming through on this channel — the page you're looking for doesn't exist.
      </p>
      <Link to="/" className="rounded bg-primary px-4 py-2 text-sm font-semibold text-bg">
        Back to the feed
      </Link>
    </div>
  );
}
