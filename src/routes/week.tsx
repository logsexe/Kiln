import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { DayStrip } from "@/components/day-strip";
import { Button, Card, PageHead } from "@/components/ui";
import { splitKit } from "@/lib/training/brand";
import { getExercise } from "@/lib/training/catalog";
import { formatShort, keyToDate, weekKeys, weekdayShort } from "@/lib/training/dates";
import { buildDay, loggedSets, scheduledTitle } from "@/lib/training/program";
import { useTraining } from "@/lib/training/store";
import { useTodayKey } from "@/lib/training/use-today";

export const Route = createFileRoute("/week")({ component: WeekPage });

function WeekPage() {
  const today = useTodayKey();
  const navigate = useNavigate();
  const profile = useTraining((state) => state.profile);
  const days = useTraining((state) => state.days);
  const weekPlan = useTraining((state) => state.weekPlan);
  const focusDate = useTraining((state) => state.focusDate);
  const setFocusDate = useTraining((state) => state.setFocusDate);
  const saveWeek = useTraining((state) => state.saveWeek);
  const setRepeat = useTraining((state) => state.setRepeat);
  const selected = focusDate ?? today;
  return (
    <Shell>
      <PageHead
        kicker="Week"
        title="Slide the week"
        lede="Check what's scheduled, then save it. A saved week repeats until you turn that off. Logged days are left alone."
      />
      {!today || !selected ? (
        <p className="mt-6 text-muted">Loading this week.</p>
      ) : (
        <div className="mt-6 space-y-4">
          <DayStrip today={today} selected={selected} onSelect={setFocusDate} />
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => saveWeek(selected)}>{weekPlan ? "Update repeating week" : "Save week and repeat"}</Button>
            {weekPlan ? (
              <Button variant="ghost" onClick={() => setRepeat(!weekPlan.repeat)}>
                {weekPlan.repeat ? "Repeating" : "Repeat is off"}
              </Button>
            ) : null}
          </div>
          {weekKeys(today).map((key) => {
            const stored = days[key];
            const planned = weekPlan?.repeat ? weekPlan.byDow[String(keyToDate(key).getDay())] : undefined;
            const day = stored ?? planned ?? buildDay(key, profile);
            const progress = loggedSets(day);
            const title = scheduledTitle(key, profile, stored, weekPlan);
            const current = key === today;
            return (
              <Card key={key} className={key === selected ? "ring-brass" : undefined}>
                <button
                  className="w-full text-left"
                  onClick={() => {
                    setFocusDate(key);
                    void navigate({ to: "/" });
                  }}
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-xs font-medium uppercase tracking-widest text-brass">
                      {weekdayShort(key)} · {formatShort(key)}
                      {current ? " · today" : ""}
                    </p>
                    {progress.done > 0 ? (
                      <p className="text-xs tabular-nums text-faint">
                        {progress.done}/{progress.total}
                      </p>
                    ) : null}
                  </div>
                  <h2 className="mt-1 text-2xl font-medium">{title}</h2>
                  <p className="mt-1 text-sm text-muted">
                    {day.lift
                      ? day.lift.exercises
                          .map((exercise) => {
                            const source = getExercise(exercise.exerciseId);
                            if (!source) return exercise.exerciseId;
                            return splitKit(source.kit).brand;
                          })
                          .slice(0, 4)
                          .join(" · ")
                      : "Rest from the barbell."}
                  </p>
                  {day.run ? (
                    <p className="mt-2 text-sm text-muted">
                      {day.run.title} · {day.run.minutesLow}–{day.run.minutesHigh} min
                      {day.run.done ? " · logged" : ""}
                    </p>
                  ) : (
                    <p className="mt-2 text-sm text-faint">No run.</p>
                  )}
                </button>
              </Card>
            );
          })}
        </div>
      )}
    </Shell>
  );
}