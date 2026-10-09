import { createServerFn } from "@tanstack/react-start";
import type { StravaActivity } from "./types";

export const pullStravaActivities = createServerFn({ method: "POST" })
  .validator((input: { token: string }) => {
    const token = (input?.token || "").trim();
    if (!/^[A-Za-z0-9._-]{20,300}$/.test(token)) {
      throw new Error("Paste the access token from your Strava API settings.");
    }
    return { token };
  })
  .handler(async ({ data }) => {
    let response: Response;
    try {
      response = await fetch("https://www.strava.com/api/v3/athlete/activities?per_page=20", {
        headers: { Authorization: `Bearer ${data.token}` },
      });
    } catch {
      return { ok: false as const, error: "Couldn't reach Strava." };
    }
    if (response.status === 401) {
      return {
        ok: false as const,
        error: "Strava rejected that token. Open strava.com/settings/api and copy a fresh access token.",
      };
    }
    if (!response.ok) return { ok: false as const, error: "Strava didn't return activities." };
    const body = (await response.json()) as unknown;
    if (!Array.isArray(body)) return { ok: false as const, error: "Unexpected reply from Strava." };
    const activities: StravaActivity[] = [];
    for (const item of body) {
      if (!item || typeof item !== "object") continue;
      const row = item as Record<string, unknown>;
      const id = typeof row.id === "number" ? row.id : 0;
      const name = typeof row.name === "string" ? row.name.slice(0, 80) : "Activity";
      const sport = typeof row.sport_type === "string" ? row.sport_type : typeof row.type === "string" ? row.type : "Workout";
      const start = typeof row.start_date_local === "string" ? row.start_date_local.slice(0, 10) : "";
      const moving = typeof row.moving_time === "number" ? row.moving_time : 0;
      const distance = typeof row.distance === "number" ? row.distance : 0;
      if (!id || !start) continue;
      activities.push({
        id,
        name,
        sport,
        date: start,
        minutes: Math.max(1, Math.round(moving / 60)),
        km: Math.round((distance / 1000) * 10) / 10,
      });
    }
    return { ok: true as const, activities };
  });
