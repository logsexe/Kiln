import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { StravaPanel } from "@/components/strava-panel";
import { Button, Card, Chip, Field, PageHead, fieldClass } from "@/components/ui";
import { getExercise } from "@/lib/training/catalog";
import { GOAL_OPTIONS, INJURY_OPTIONS, LEVELS, LOAD_IDS, WEAK_OPTIONS } from "@/lib/training/copy";
import { formatPretty } from "@/lib/training/dates";
import { loggedSets } from "@/lib/training/program";
import { useTraining } from "@/lib/training/store";

export const Route = createFileRoute("/you")({ component: YouPage });

function YouPage() {
  const profile = useTraining((state) => state.profile);
  const days = useTraining((state) => state.days);
  const patchProfile = useTraining((state) => state.patchProfile);
  const toggleInjury = useTraining((state) => state.toggleInjury);
  const toggleWeak = useTraining((state) => state.toggleWeak);
  const confirmAims = useTraining((state) => state.confirmAims);
  const setLoad = useTraining((state) => state.setLoad);

  const history = Object.values(days)
    .filter((day) => day.lift?.finishedAt || day.run?.done)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 8);

  return (
    <Shell>
      <div id="aims" className="scroll-mt-6 space-y-4">
        <PageHead
          kicker="Aims"
          title="What has to change"
          lede="The split stays push, pull, legs. These choices decide which lift gets heavy, which machines get skipped, and what stronger means."
        />
        <Card className="space-y-3">
          <h2 className="font-display text-2xl">Goal</h2>
          <div className="flex flex-col gap-2">
            {GOAL_OPTIONS.map((option) => (
              <button
                key={option.id}
                aria-pressed={profile.goal === option.id}
                className={
                  profile.goal === option.id
                    ? "rounded-xl bg-brass px-3 py-3 text-left text-ink"
                    : "rounded-xl bg-raised px-3 py-3 text-left text-fg ring-1 ring-line"
                }
                onClick={() => patchProfile({ goal: option.id })}
              >
                <span className="block text-sm font-medium">{option.label}</span>
                <span className={profile.goal === option.id ? "mt-1 block text-sm text-ink/80" : "mt-1 block text-sm text-muted"}>
                  {option.detail}
                </span>
              </button>
            ))}
          </div>
          <Field label="What stronger looks like">
            <textarea
              value={profile.goalNote}
              onChange={(event) => patchProfile({ goalNote: event.target.value.slice(0, 400) })}
              rows={3}
              placeholder="A heavier incline. Ten strict pull-ups. A squat that doesn't fold."
              className="w-full rounded-xl bg-bg px-3 py-3 text-base text-fg ring-1 ring-line outline-none focus:ring-brass"
            />
          </Field>
        </Card>

        <Card className="space-y-3">
          <h2 className="font-display text-2xl">Injuries</h2>
          <p className="text-sm text-muted">
            Flagged joints change the menu. Knees lose lunges and deep free-weight squats. A sore shoulder drops dips and the harshest overhead. Pain still ends a set.
          </p>
          <div className="flex flex-wrap gap-2">
            {INJURY_OPTIONS.map((option) => (
              <Chip key={option.id} pressed={profile.injuries.includes(option.id)} onClick={() => toggleInjury(option.id)}>
                {option.label}
              </Chip>
            ))}
          </div>
          <Field label="What actually hurts">
            <textarea
              value={profile.injuryNote}
              onChange={(event) => patchProfile({ injuryNote: event.target.value.slice(0, 400) })}
              rows={3}
              placeholder="Left shoulder pinches on a wide grip. Right knee is fine on a belt squat."
              className="w-full rounded-xl bg-bg px-3 py-3 text-base text-fg ring-1 ring-line outline-none focus:ring-brass"
            />
          </Field>
        </Card>

        <Card className="space-y-3">
          <h2 className="font-display text-2xl">Get these stronger</h2>
          <p className="text-sm text-muted">
            Each one you pick becomes a 4–6 rep priority on its day, with a longer rest. Leg days only get one of those so the runs still happen. Order is priority.
          </p>
          <div className="flex flex-wrap gap-2">
            {WEAK_OPTIONS.map((option) => {
              const index = profile.weakPoints.indexOf(option.id);
              return (
                <Chip key={option.id} pressed={index >= 0} onClick={() => toggleWeak(option.id)}>
                  {index >= 0 ? `${index + 1} ${option.label}` : option.label}
                </Chip>
              );
            })}
          </div>
          <Button className="w-full" onClick={confirmAims}>
            {profile.aimsConfirmed ? "Aims saved" : "Save aims"}
          </Button>
        </Card>
      </div>

      <div className="mt-8 space-y-4">
        <h2 className="font-display text-3xl">Training week</h2>
        <div className="flex flex-wrap gap-2">
          {LEVELS.map((level) => (
            <Chip key={level.id} pressed={profile.level === level.id} onClick={() => patchProfile({ level: level.id })}>
              {level.label}
            </Chip>
          ))}
        </div>
        <div className="flex gap-2">
          <Chip pressed={profile.runsPerWeek === 3} onClick={() => patchProfile({ runsPerWeek: 3 })}>
            3 runs
          </Chip>
          <Chip pressed={profile.runsPerWeek === 4} onClick={() => patchProfile({ runsPerWeek: 4 })}>
            4 runs
          </Chip>
        </div>
        <Card className="space-y-3">
          <h3 className="font-display text-2xl">Kit</h3>
          <Toggle label="Free weights" on={profile.freeWeights} onClick={() => patchProfile({ freeWeights: !profile.freeWeights })} />
          <Toggle label="Treadmill" on={profile.treadmill} onClick={() => patchProfile({ treadmill: !profile.treadmill })} />
          <Toggle label="Bike" on={profile.bike} onClick={() => patchProfile({ bike: !profile.bike })} />
          <Toggle label="Rower" on={profile.rower} onClick={() => patchProfile({ rower: !profile.rower })} />
          <Toggle label="Ski erg" on={profile.ski} onClick={() => patchProfile({ ski: !profile.ski })} />
          <p className="text-sm text-muted">Outdoor running stays on. Machines from the Peak HP list stay on.</p>
        </Card>
        <Card className="space-y-3">
          <h3 className="font-display text-2xl">Working weights</h3>
          <p className="text-sm text-muted">Kilograms you can do for the top of the rep range. Blank is fine. Logging a set updates these.</p>
          {LOAD_IDS.filter((id) => {
            const exercise = getExercise(id);
            if (!exercise) return false;
            if (exercise.freeWeight && !profile.freeWeights) return false;
            return true;
          }).map((id) => {
            const exercise = getExercise(id);
            if (!exercise) return null;
            return (
              <Field key={id} label={exercise.name}>
                <input
                  inputMode="decimal"
                  className={fieldClass}
                  value={profile.loads[id] ?? ""}
                  placeholder="kg"
                  onChange={(event) => {
                    const value = event.target.value;
                    setLoad(id, value === "" ? null : Number(value));
                  }}
                />
              </Field>
            );
          })}
        </Card>
        <Card id="strava" className="scroll-mt-6 space-y-3">
          <StravaPanel />
        </Card>
        <Card className="space-y-2">
          <h3 className="text-2xl font-medium">Recent</h3>
          {history.length === 0 ? <p className="text-sm text-muted">Nothing logged yet.</p> : null}
          {history.map((day) => {
            const progress = loggedSets(day);
            return (
              <p key={day.date} className="text-sm text-muted">
                {formatPretty(day.date)} · {day.lift?.title ?? day.run?.title}
                {day.lift?.finishedAt ? ` · ${progress.done} sets` : ""}
                {day.run?.done ? " · run" : ""}
              </p>
            );
          })}
        </Card>
        <Card className="space-y-2">
          <h2 className="font-display text-2xl">Where the method comes from</h2>
          <p className="text-sm text-muted">
            Size first, in the vein of Mike Israetel: enough hard sets, most of them a rep or two shy of failure. A lengthened set and a pump finish, in the vein of Hany Rambod. Each set is logged as weight, reps, and RPE, the way Jeff Nippard keeps a session honest, so the next one knows whether to add load. Conditioning stays easy enough to lift, closer to Andy Galpin and Rhonda Patrick than to a second workout.
          </p>
          <p className="text-sm text-faint">Kiln writes its own sessions. It is not their program, and it is not affiliated with them or with Peak HP.</p>
        </Card>
        <p className="text-sm text-faint">
          On Android, use the browser menu and Add to Home screen. It opens full screen. Kiln is not a medical service.
        </p>
      </div>
    </Shell>
  );
}

function Toggle({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) {
  return (
    <button className="flex h-11 w-full items-center justify-between text-left" onClick={onClick} aria-pressed={on}>
      <span>{label}</span>
      <span className={on ? "text-brass" : "text-faint"}>{on ? "On" : "Off"}</span>
    </button>
  );
}
