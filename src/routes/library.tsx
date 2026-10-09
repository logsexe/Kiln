import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Shell } from "@/components/shell";
import { Chip, PageHead } from "@/components/ui";
import { EXERCISES } from "@/lib/training/catalog";
import { splitKit } from "@/lib/training/brand";
import { formatPretty } from "@/lib/training/dates";
import { scriptLine } from "@/lib/training/program";
import { useTraining } from "@/lib/training/store";
import { useTodayKey } from "@/lib/training/use-today";
import type { DayGroup } from "@/lib/training/types";

export const Route = createFileRoute("/library")({ component: LibraryPage });

const FILTERS: { id: "all" | DayGroup | "free"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "push", label: "Push" },
  { id: "pull", label: "Pull" },
  { id: "legs", label: "Legs" },
  { id: "conditioning", label: "Conditioning" },
  { id: "free", label: "Free weights" },
];

function LibraryPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const today = useTodayKey();
  const avoid = useTraining((state) => state.profile.avoid);
  const toggleAvoid = useTraining((state) => state.toggleAvoid);
  const addToNext = useTraining((state) => state.addToNext);

  const needle = query.trim().toLowerCase();
  const list = EXERCISES.filter((exercise) => {
    if (filter === "free" && !exercise.freeWeight) return false;
    if (filter !== "all" && filter !== "free" && exercise.day !== filter) return false;
    if (!needle) return true;
    return `${exercise.name} ${exercise.kit} ${exercise.muscle} ${exercise.cue}`.toLowerCase().includes(needle);
  });

  return (
    <Shell>
      <PageHead
        kicker="Library"
        title={`${EXERCISES.length} movements`}
        lede="Peak HP machines from the Birtinya floor, plus barbells, dumbbells, and the cardio you turn on. Not affiliated with the gym."
      />
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search a machine or muscle"
        className="mt-5 h-11 w-full rounded-xl bg-paper px-3 text-base text-fg ring-1 ring-line outline-none focus:ring-brass"
      />
      <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((item) => (
          <Chip key={item.id} pressed={filter === item.id} onClick={() => setFilter(item.id)}>
            {item.label}
          </Chip>
        ))}
      </div>
      {note ? <p className="mt-3 text-sm text-brass">{note}</p> : null}
      <div className="mt-4 space-y-2">
        {list.map((exercise) => {
          const open = openId === exercise.id;
          const brand = splitKit(exercise.kit);
          return (
            <article key={exercise.id} className="rounded-2xl bg-paper ring-1 ring-line">
              <button className="w-full px-4 py-3 text-left" onClick={() => setOpenId(open ? null : exercise.id)}>
                <span className="text-sm font-medium text-brass">
                  {brand.brand}
                  {brand.rest ? <span className="font-normal text-muted"> · {brand.rest}</span> : null}
                </span>
                <span className="mt-1 block text-2xl font-medium">{exercise.name}</span>
                <span className="mt-1 block text-sm text-muted">{exercise.muscle}</span>
              </button>
              {open ? (
                <div className="space-y-3 px-4 pb-4">
                  <p className="text-sm text-muted">{exercise.cue}</p>
                  <p className="text-sm text-fg">{scriptLine(exercise)}</p>
                  <div className="flex flex-wrap gap-2">
                    {exercise.day !== "conditioning" && today ? (
                      <button
                        className="h-11 rounded-xl bg-brass px-4 text-sm font-medium text-ink"
                        onClick={() => {
                          if (exercise.day === "conditioning" || !today) return;
                          const date = addToNext(exercise.id, today);
                          if (!date) {
                            setNote("That one doesn't sit on a lifting day.");
                            return;
                          }
                          setNote(`Added to ${formatPretty(date)}.`);
                        }}
                      >
                        Add to next {exercise.day}
                      </button>
                    ) : null}
                    <button
                      className="h-11 rounded-xl px-4 text-sm text-fg ring-1 ring-line"
                      onClick={() => toggleAvoid(exercise.id)}
                    >
                      {avoid.includes(exercise.id) ? "Allow again" : "Avoid this"}
                    </button>
                  </div>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </Shell>
  );
}
