import { useEffect } from "react";
import { cn } from "@/lib/cn";
import { formatPretty, rangeKeys, weekdayShort } from "@/lib/training/dates";
import { scheduledTitle } from "@/lib/training/program";
import { useTraining } from "@/lib/training/store";

export function DayStrip({ today, selected, onSelect }: { today: string; selected: string; onSelect: (date: string) => void }) {
  const profile = useTraining((state) => state.profile);
  const days = useTraining((state) => state.days);
  const weekPlan = useTraining((state) => state.weekPlan);
  const keys = rangeKeys(today, 7, 14);

  useEffect(() => {
    document.getElementById(`day-${selected}`)?.scrollIntoView({ inline: "center", block: "nearest" });
  }, [selected]);

  return (
    <div className="day-scroll -mx-4 flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 pb-1">
      {keys.map((key) => {
        const on = key === selected;
        const title = scheduledTitle(key, profile, days[key], weekPlan);
        return (
          <button
            key={key}
            id={`day-${key}`}
            type="button"
            aria-pressed={on}
            aria-label={`${formatPretty(key)}, ${title}`}
            className={cn(
              "flex w-24 shrink-0 snap-start flex-col rounded-xl px-2 py-2 text-left ring-1",
              on ? "bg-brass text-ink ring-brass" : "bg-paper text-fg ring-line",
            )}
            onClick={() => onSelect(key)}
          >
            <span className={cn("text-xs uppercase tracking-widest", on ? "text-ink/70" : "text-faint")}>
              {weekdayShort(key)}
              {key === today ? " · now" : ""}
            </span>
            <span className="text-lg font-medium tabular-nums">{Number(key.slice(-2))}</span>
            <span className={cn("mt-1 line-clamp-2 text-xs", on ? "text-ink/80" : "text-muted")}>{title}</span>
          </button>
        );
      })}
    </div>
  );
}
