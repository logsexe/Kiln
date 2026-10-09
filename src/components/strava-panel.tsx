import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { pullStravaActivities } from "@/lib/training/strava";
import { useTraining } from "@/lib/training/store";
import type { StravaActivity } from "@/lib/training/types";
import { Button } from "./ui";

export function StravaPanel({ onUse, compact = false }: { onUse?: (activity: StravaActivity) => void; compact?: boolean }) {
  const token = useTraining((state) => state.stravaToken);
  const setToken = useTraining((state) => state.setStravaToken);
  const [draft, setDraft] = useState(token);
  const [activities, setActivities] = useState<StravaActivity[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (compact && !token) {
    return (
      <p className="text-sm text-muted">
        <Link to="/you" hash="strava" className="text-brass">
          Connect Strava
        </Link>{" "}
        to pull a run onto this day.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {compact ? null : <h3 className="text-2xl font-medium">Strava</h3>}
      {compact ? null : (
        <p className="text-sm text-muted">
          Create a free app at strava.com/settings/api, then paste Your Access Token. Kiln pulls recent activities onto the run. The token stays on this phone.
        </p>
      )}
      {compact ? null : (
        <label className="block text-sm text-muted">
          Access token
          <input
            type="password"
            autoComplete="off"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Paste token"
            className="mt-1 h-11 w-full rounded-xl bg-bg px-3 text-base text-fg ring-1 ring-line outline-none focus:ring-brass"
          />
        </label>
      )}
      <div className="flex flex-wrap gap-2">
        {compact ? null : (
          <Button
            variant="ghost"
            onClick={() => {
              setToken(draft.trim());
              setStatus(draft.trim() ? "Token saved on this phone." : "Token cleared.");
            }}
          >
            Save token
          </Button>
        )}
        <Button
          disabled={busy || !token}
          onClick={() => {
            setBusy(true);
            setStatus(null);
            void pullStravaActivities({ data: { token } })
              .then((result) => {
                if (!result.ok) {
                  setActivities([]);
                  setStatus(result.error);
                  return;
                }
                setActivities(result.activities);
                setStatus(result.activities.length ? `${result.activities.length} activities from Strava.` : "No recent activities.");
              })
              .catch(() => setStatus("Couldn't pull Strava."))
              .finally(() => setBusy(false));
          }}
        >
          {busy ? "Pulling" : "Pull Strava"}
        </Button>
      </div>
      {status ? <p className="text-sm text-brass">{status}</p> : null}
      {activities.length > 0 ? (
        <ul className="space-y-2">
          {activities.slice(0, 8).map((activity) => (
            <li key={activity.id} className="flex items-center justify-between gap-3 rounded-xl bg-bg px-3 py-2">
              <span className="min-w-0">
                <span className="block truncate text-sm text-fg">{activity.name}</span>
                <span className="block text-xs text-muted">
                  {activity.sport} · {activity.date} · {activity.minutes} min · {activity.km} km
                </span>
              </span>
              {onUse ? (
                <button className="h-10 shrink-0 rounded-lg bg-brass px-3 text-sm font-medium text-ink" onClick={() => onUse(activity)}>
                  Use
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}