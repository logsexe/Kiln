import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DayStrip } from "@/components/day-strip";
import { StravaPanel } from "@/components/strava-panel";
import { splitKit } from "@/lib/training/brand";
import { getExercise, EXERCISES } from "@/lib/training/catalog";
import { formatClock } from "@/lib/training/dates";
import { aimRpe, dayHasActivity, loggedSets, profileStamp, ROLE_LABEL, splitWeakPoints } from "@/lib/training/program";
import { useTraining } from "@/lib/training/store";
import type { LiftExercise } from "@/lib/training/types";
import { useTodayKey } from "@/lib/training/use-today";
import { Button, Card } from "./ui";

export function TodayScreen({ date }: { date: string }) {
  const day = useTraining((state) => state.days[date]);
  const profile = useTraining((state) => state.profile);
  const ensureDay = useTraining((state) => state.ensureDay);
  const rebuild = useTraining((state) => state.rebuild);
  const shorten = useTraining((state) => state.shorten);
  const morePump = useTraining((state) => state.morePump);
  const finishLift = useTraining((state) => state.finishLift);
  const reopenLift = useTraining((state) => state.reopenLift);
  const clearRest = useTraining((state) => state.clearRest);
  const applyActions = useTraining((state) => state.applyActions);
  const saveWorkout = useTraining((state) => state.saveWorkout);
  const saveWeek = useTraining((state) => state.saveWeek);
  const setRepeat = useTraining((state) => state.setRepeat);
  const weekPlan = useTraining((state) => state.weekPlan);
  const setFocusDate = useTraining((state) => state.setFocusDate);
  const today = useTodayKey();
  const [armReset, setArmReset] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [savedNote, setSavedNote] = useState<string | null>(null);

  useEffect(() => {
    ensureDay(date);
  }, [date, ensureDay, profile]);

  useEffect(() => {
    if (!day?.restEndsAt || day.restEndsAt <= Date.now()) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [day?.restEndsAt]);

  if (!day) {
    return (
      <div>
        <p className="text-xs font-medium uppercase tracking-widest text-brass">Kiln</p>
        <h1 className="mt-2 font-display text-4xl">Today</h1>
        <p className="mt-3 text-muted">Building the session from your aims.</p>
      </div>
    );
  }

  const focus = splitWeakPoints(day.lift?.exercises.map((exercise) => exercise.exerciseId) ?? [], profile.weakPoints);
  const stale =
    !day.stamp.startsWith("repeat:") &&
    day.stamp !== profileStamp(profile) &&
    (day.customized || dayHasActivity(day));
  const restLeft = day.restEndsAt ? Math.round((day.restEndsAt - now) / 1000) : 0;
  const progress = loggedSets(day);
  const openId =
    day.lift?.exercises.find((exercise) => exercise.sets.some((set) => !set.done))?.exerciseId ??
    day.lift?.exercises[0]?.exerciseId;

  return (
    <div className="space-y-5">
      <header className="rise space-y-4">
        {today ? <DayStrip today={today} selected={date} onSelect={setFocusDate} /> : null}
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-brass">
            {date === today ? "Today" : "Scheduled"}
            {weekPlan?.repeat ? " · repeats weekly" : ""}
          </p>
          <h1 className="mt-2 text-4xl font-medium">{day.lift?.title ?? day.run?.title ?? "Rest"}</h1>
          <p className="mt-3 text-base text-muted">
            {day.lift
              ? day.lift.kind === "legs" && day.lift.variant === "B"
                ? "Posterior chain today. Quads stay quiet so Sunday's long run still has legs."
                : "Machines first. Heavy where you asked to get stronger, growth work around it."
              : "No barbell today. Keep the run easy enough that Monday can press."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => {
              saveWeek(date);
              setSavedNote("Week saved. It repeats until you turn it off.");
            }}
          >
            {weekPlan ? "Update repeating week" : "Save week and repeat"}
          </Button>
          {weekPlan ? (
            <Button variant="ghost" onClick={() => setRepeat(!weekPlan.repeat)}>
              {weekPlan.repeat ? "Repeating" : "Repeat is off"}
            </Button>
          ) : null}
          {today && date !== today ? (
            <Button variant="quiet" onClick={() => setFocusDate(today)}>
              Back to today
            </Button>
          ) : null}
        </div>
        <p className="text-sm text-muted">
          {weekPlan?.repeat
            ? "Slide the days. Next week copies this one. A day you've already logged stays put."
            : "Slide the days to see what's scheduled. Save the week when you want that pattern to repeat."}
        </p>
        {focus.here.length > 0 ? (
          <p className="mt-3 text-sm text-fg">Strength work today: {focus.here.join(", ")}. 4–6 reps, then add load.</p>
        ) : null}
        {focus.later.length > 0 ? (
          <p className="mt-3 text-sm text-muted">
            {joinWords(focus.later)} {focus.later.length === 1 ? "is" : "are"} scheduled on {focus.later.length === 1 ? "its" : "their"} own day, not piled onto this one.
          </p>
        ) : null}
      </header>

      {!profile.aimsConfirmed ? (
        <Card className="space-y-3">
          <h2 className="font-display text-2xl">Set your aims</h2>
          <p className="text-sm text-muted">
            Goal, injuries, and the muscles that have to get stronger. Until that's filled in, the plan is a size-first guess.
          </p>
          <Link to="/you" hash="aims" className="inline-flex h-11 items-center rounded-xl bg-brass px-4 text-sm font-medium text-ink">
            Open aims
          </Link>
        </Card>
      ) : null}

      {stale ? (
        <Card className="space-y-3">
          <p className="text-sm text-muted">Your aims changed after this day was already edited or logged. Rebuild only if you want the new priorities to replace it.</p>
          <Button variant="ghost" onClick={() => rebuild(date)}>
            Rebuild today
          </Button>
        </Card>
      ) : null}

      {day.lift ? (
        <section className="space-y-3">
          <div className="flex items-end justify-between gap-3">
            <p className="text-sm tabular-nums text-muted">
              {day.lift.kind} {day.lift.variant} · {progress.done}/{progress.total} sets
            </p>
            {day.lift.finishedAt ? (
              <button className="text-sm text-brass" onClick={() => reopenLift(date)}>
                Reopen
              </button>
            ) : null}
          </div>
          {day.lift.exercises.length === 0 ? (
            <Card>
              <p className="text-sm text-muted">Nothing left for this day. Clear a few avoided exercises in the library.</p>
            </Card>
          ) : (
            day.lift.exercises.map((exercise) => (
              <ExerciseCard
                key={exercise.exerciseId}
                date={date}
                exercise={exercise}
                locked={Boolean(day.lift?.finishedAt)}
                startOpen={exercise.exerciseId === openId && !day.lift?.finishedAt}
                onSwap={(toId) => applyActions(date, [{ type: "swap", fromId: exercise.exerciseId, toId }])}
              />
            ))
          )}
          {!day.lift.finishedAt ? (
            <div className="flex flex-wrap gap-2">
              <Button variant="quiet" onClick={() => shorten(date)}>
                Shorter
              </Button>
              <Button variant="quiet" onClick={() => morePump(date)}>
                More pump
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  if (!armReset && progress.done > 0) {
                    setArmReset(true);
                    return;
                  }
                  rebuild(date);
                  setArmReset(false);
                }}
              >
                {armReset ? "Replace logged work" : "Rebuild"}
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted">Logged. Weights you finished with are saved for next time.</p>
          )}
          {!day.lift.finishedAt ? (
            <Button className="w-full" disabled={progress.done === 0} onClick={() => finishLift(date)}>
              Finish lift
            </Button>
          ) : null}
        </section>
      ) : null}

      {day.run ? <RunCard date={date} /> : null}

      <Button
        variant="ghost"
        className="w-full"
        onClick={() => {
          const saved = saveWorkout(date);
          setSavedNote(saved ? "Workout saved on this phone." : "Nothing to save yet.");
        }}
      >
        Save workout
      </Button>
      {savedNote ? <p className="text-sm text-brass">{savedNote}</p> : null}
      {day.savedAt ? (
        <p className="text-sm text-muted">
          Last save {new Date(day.savedAt).toLocaleTimeString("en-AU", { hour: "numeric", minute: "2-digit" })}. Weights, reps, RPE, machine settings, and the run are included.
        </p>
      ) : (
        <p className="text-sm text-muted">Save stores the weights, reps, RPE, machine settings, and the run on this phone.</p>
      )}

      {restLeft > 0 ? (
        <div className="fixed inset-x-0 bottom-24 z-30 mx-auto w-full max-w-lg px-4">
          <div className="flex items-center justify-between rounded-2xl bg-brass px-4 py-3 text-ink">
            <div>
              <p className="text-xs font-medium uppercase tracking-widest">Rest</p>
              <p className="font-display text-3xl tabular-nums">{formatClock(restLeft)}</p>
            </div>
            <button className="h-11 rounded-xl bg-ink px-4 text-sm text-fg" onClick={() => clearRest(date)}>
              Skip
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function joinWords(items: string[]): string {
  const labels = items.map((item) => item.charAt(0).toUpperCase() + item.slice(1));
  if (labels.length <= 1) return labels[0] ?? "";
  if (labels.length === 2) return `${labels[0]} and ${labels[1]}`;
  return `${labels.slice(0, -1).join(", ")}, and ${labels[labels.length - 1]}`;
}

function ExerciseCard({
  date,
  exercise,
  locked,
  startOpen,
  onSwap,
}: {
  date: string;
  exercise: LiftExercise;
  locked: boolean;
  startOpen: boolean;
  onSwap: (toId: string) => void;
}) {
  const source = getExercise(exercise.exerciseId);
  const [open, setOpen] = useState(startOpen);
  const done = exercise.sets.filter((set) => set.done).length;
  const lastDone = [...exercise.sets].reverse().find((set) => set.done);
  const target = aimRpe(exercise.rirTarget);
  const liftExercises = useTraining((state) => state.days[date]?.lift?.exercises);
  const freeWeights = useTraining((state) => state.profile.freeWeights);
  const avoid = useTraining((state) => state.profile.avoid);
  const addSet = useTraining((state) => state.addSet);
  const dropSet = useTraining((state) => state.dropSet);
  const usedIds = liftExercises?.map((item) => item.exerciseId) ?? [];
  const samePattern = source
    ? EXERCISES.filter(
        (item) =>
          item.pattern === source.pattern &&
          item.id !== exercise.exerciseId &&
          !usedIds.includes(item.id) &&
          !avoid.includes(item.id) &&
          (!item.freeWeight || freeWeights) &&
          item.day === source.day,
      )
    : [];
  const sameMuscle = source
    ? EXERCISES.filter(
        (item) =>
          item.muscle === source.muscle &&
          item.pattern !== source.pattern &&
          item.id !== exercise.exerciseId &&
          !usedIds.includes(item.id) &&
          !avoid.includes(item.id) &&
          (!item.freeWeight || freeWeights) &&
          item.day === source.day,
      )
    : [];
  const catalogOptions = [...samePattern, ...sameMuscle].slice(0, 8);

  const brand = source ? splitKit(source.kit) : null;
  return (
    <Card className="space-y-3">
      <button className="flex w-full items-start justify-between gap-3 text-left" onClick={() => setOpen((value) => !value)}>
        <span>
          {brand ? (
            <span className="block text-sm font-medium text-brass">
              {brand.brand}
              {brand.rest ? <span className="font-normal text-muted"> · {brand.rest}</span> : null}
            </span>
          ) : null}
          <span className="mt-1 flex flex-wrap items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-faint">{ROLE_LABEL[exercise.role]}</span>
            {exercise.emphasis === "strength" ? (
              <span className="rounded-full bg-brass px-2 py-0.5 text-xs font-medium text-ink">Get stronger</span>
            ) : null}
          </span>
          <span className="mt-1 block text-2xl font-medium">{source?.name ?? exercise.exerciseId}</span>
          <span className="mt-1 block text-sm text-muted">
            {exercise.setup ? `${exercise.setup} · ` : ""}
            {exercise.repLow}–{exercise.repHigh} · aim RPE {target}
          </span>
          {lastDone ? (
            <span className="mt-1 block text-sm tabular-nums text-fg">
              Last {lastDone.weight ?? "—"} kg × {lastDone.reps ?? "—"}
              {lastDone.rpe != null ? ` @ ${lastDone.rpe}` : ""}
            </span>
          ) : null}
        </span>
        <span className="tabular-nums text-sm text-faint">
          {done}/{exercise.sets.length}
        </span>
      </button>
      {open && source ? (
        <div className="space-y-3">
          <p className="text-sm text-muted">{source.cue}</p>
          <p className="text-sm text-fg">{exercise.note}</p>
          <SetupField date={date} exerciseId={exercise.exerciseId} setup={exercise.setup ?? ""} locked={locked} />
          {exercise.sets.map((set, index) => (
            <SetRow key={`${exercise.exerciseId}-${index}`} date={date} exercise={exercise} index={index} locked={locked} />
          ))}
          {!locked ? (
            <div className="flex gap-2">
              <Button variant="quiet" disabled={exercise.sets.length >= 8} onClick={() => addSet(date, exercise.exerciseId)}>
                Add set
              </Button>
              <Button
                variant="ghost"
                disabled={exercise.sets.length <= 1 || Boolean(exercise.sets[exercise.sets.length - 1]?.done)}
                onClick={() => dropSet(date, exercise.exerciseId)}
              >
                Drop last
              </Button>
            </div>
          ) : null}
          {!locked && catalogOptions.length > 0 && done === 0 ? (
            <label className="block text-sm text-muted">
              Swap machine
              <select
                className="mt-2 h-11 w-full rounded-xl bg-bg px-3 text-base text-fg ring-1 ring-line"
                value=""
                onChange={(event) => {
                  if (event.target.value) onSwap(event.target.value);
                }}
              >
                <option value="">Keep {source.name}</option>
                {catalogOptions.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
        </div>
      ) : null}
    </Card>
  );
}

function SetupField({ date, exerciseId, setup, locked }: { date: string; exerciseId: string; setup: string; locked: boolean }) {
  const patchSetup = useTraining((state) => state.patchSetup);
  return (
    <label className="block text-sm text-muted">
      Machine setting
      <input
        disabled={locked}
        value={setup}
        maxLength={80}
        placeholder="Seat 4 · chest pad 2 · start pin 3"
        className="mt-1 h-11 w-full rounded-xl bg-bg px-3 text-base text-fg ring-1 ring-line outline-none focus:ring-brass disabled:opacity-70"
        onChange={(event) => patchSetup(date, exerciseId, event.target.value)}
      />
    </label>
  );
}

function SetRow({
  date,
  exercise,
  index,
  locked,
}: {
  date: string;
  exercise: LiftExercise;
  index: number;
  locked: boolean;
}) {
  const setLog = exercise.sets[index];
  const patchSet = useTraining((state) => state.patchSet);
  const completeSet = useTraining((state) => state.completeSet);
  if (!setLog) return null;
  return (
    <div className={setLog.done ? "space-y-2 opacity-60" : "space-y-2"}>
      <p className="text-xs uppercase tracking-widest text-faint">
        Set {index + 1} · rest {formatClock(exercise.restSec)}
      </p>
      <div className="grid grid-cols-2 gap-2">
        <label className="text-sm text-muted">
          Kg
          <input
            inputMode="decimal"
            disabled={locked || setLog.done}
            className="mt-1 h-11 w-full rounded-xl bg-bg px-3 text-base text-fg tabular-nums ring-1 ring-line focus:ring-brass disabled:opacity-70"
            value={setLog.weight ?? ""}
            placeholder="—"
            onChange={(event) => {
              const value = event.target.value;
              patchSet(date, exercise.exerciseId, index, {
                weight: value === "" ? null : Number(value),
              });
            }}
          />
        </label>
        <label className="text-sm text-muted">
          Reps
          <input
            inputMode="numeric"
            disabled={locked || setLog.done}
            className="mt-1 h-11 w-full rounded-xl bg-bg px-3 text-base text-fg tabular-nums ring-1 ring-line focus:ring-brass disabled:opacity-70"
            value={setLog.reps ?? ""}
            placeholder={`${exercise.repLow}–${exercise.repHigh}`}
            onChange={(event) => {
              const value = event.target.value;
              patchSet(date, exercise.exerciseId, index, {
                reps: value === "" ? null : Number(value),
              });
            }}
          />
        </label>
      </div>
      <div>
        <p className="text-xs uppercase tracking-widest text-faint">RPE · aim {aimRpe(exercise.rirTarget)}</p>
        <div className="mt-1 grid grid-cols-5 gap-1" role="group" aria-label="RPE">
          {[6, 7, 8, 9, 10].map((rpe) => (
            <button
              key={rpe}
              disabled={locked || setLog.done}
              className={
                setLog.rpe === rpe
                  ? "h-11 rounded-lg bg-brass text-sm text-ink"
                  : "h-11 rounded-lg bg-raised text-sm text-fg ring-1 ring-line"
              }
              onClick={() => patchSet(date, exercise.exerciseId, index, { rpe, rir: Math.max(0, 10 - rpe) })}
            >
              {rpe}
            </button>
          ))}
        </div>
      </div>
      <button
        disabled={locked || setLog.done || setLog.reps == null}
        className="h-11 w-full rounded-xl bg-brass px-4 text-sm font-medium text-ink disabled:opacity-40"
        onClick={() => {
          completeSet(date, exercise.exerciseId, index);
          if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(12);
        }}
      >
        {setLog.done ? "Done" : "Log set"}
      </button>
    </div>
  );
}

function RunCard({ date }: { date: string }) {
  const run = useTraining((state) => state.days[date]?.run);
  const patchRun = useTraining((state) => state.patchRun);
  if (!run) return null;
  return (
    <Card className="space-y-3">
      <p className="text-xs font-medium uppercase tracking-widest text-brass">Run</p>
      <h2 className="font-display text-2xl">{run.title}</h2>
      <p className="text-sm text-muted">
        {run.minutesLow}–{run.minutesHigh} min. {run.cue}
      </p>
      <div className="grid grid-cols-2 gap-2">
        <label className="text-sm text-muted">
          Minutes
          <input
            inputMode="numeric"
            className="mt-1 h-11 w-full rounded-xl bg-bg px-3 text-base text-fg tabular-nums ring-1 ring-line"
            value={run.minutes ?? ""}
            onChange={(event) => patchRun(date, { minutes: event.target.value === "" ? null : Number(event.target.value) })}
          />
        </label>
        <label className="text-sm text-muted">
          Km, optional
          <input
            inputMode="decimal"
            className="mt-1 h-11 w-full rounded-xl bg-bg px-3 text-base text-fg tabular-nums ring-1 ring-line"
            value={run.km ?? ""}
            onChange={(event) => patchRun(date, { km: event.target.value === "" ? null : Number(event.target.value) })}
          />
        </label>
      </div>
      <div className="flex gap-2">
        {(["easy", "steady", "hard"] as const).map((feel) => (
          <button
            key={feel}
            className={
              run.feel === feel
                ? "h-10 flex-1 rounded-full bg-brass text-sm text-ink"
                : "h-10 flex-1 rounded-full bg-raised text-sm text-fg ring-1 ring-line"
            }
            onClick={() => patchRun(date, { feel })}
          >
            {feel}
          </button>
        ))}
      </div>
      <Button variant={run.done ? "quiet" : "solid"} onClick={() => patchRun(date, { done: !run.done })}>
        {run.done ? "Run logged" : "Mark run done"}
      </Button>
      <StravaPanel
        compact
        onUse={(activity) => {
          patchRun(date, { minutes: activity.minutes, km: activity.km, done: true });
        }}
      />
    </Card>
  );
}
