export function todayKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function keyToDate(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y || 2026, (m || 1) - 1, d || 1);
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  next.setDate(next.getDate() + days);
  return next;
}

export function shiftKey(key: string, days: number): string {
  return todayKey(addDays(keyToDate(key), days));
}

export function formatPretty(key: string): string {
  return keyToDate(key).toLocaleDateString("en-AU", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });
}

export function formatShort(key: string): string {
  return keyToDate(key).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
  });
}

export function weekdayShort(key: string): string {
  return keyToDate(key).toLocaleDateString("en-AU", { weekday: "short" });
}

/** Monday-first week containing `anchor`. */
export function weekKeys(anchor: string): string[] {
  const date = keyToDate(anchor);
  const day = date.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = addDays(date, mondayOffset);
  return Array.from({ length: 7 }, (_, i) => todayKey(addDays(monday, i)));
}

export function rangeKeys(anchor: string, before: number, after: number): string[] {
  const start = shiftKey(anchor, -before);
  return Array.from({ length: before + after + 1 }, (_, index) => shiftKey(start, index));
}

export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.ceil(totalSeconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}
