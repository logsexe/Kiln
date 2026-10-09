import { EXERCISES, getExercise } from "./catalog";
import { keyToDate } from "./dates";
import type {
  DayPlan,
  Exercise,
  Level,
  LiftExercise,
  LiftKind,
  LiftSession,
  Profile,
  Role,
  RunSession,
  RunVariant,
  SetLog,
  WeekPlan,
} from "./types";

export const ROLE_LABEL: Record<Role, string> = {
  main: "Top",
  secondary: "Build",
  stretch: "Lengthen",
  pump: "Pump",
};

const ROLE_NOTE: Record<Role, string> = {
  main: "Leave about two reps in the tank. This is the load-bearing set of the day.",
  secondary: "Hard, but the last rep should still look like the first.",
  stretch: "Pause for a quiet second in the stretch. Don't bounce out of it.",
  pump: "Short rest. Stop when the reps get sloppy, not when the burn starts.",
};

interface Slot {
  role: Role;
  sets: number;
  repLow: number;
  repHigh: number;
  rir: number;
  rest: number;
  ids: string[];
}

const PUSH_A: Slot[] = [
  { role: "main", sets: 3, repLow: 6, repHigh: 10, rir: 2, rest: 150, ids: ["prime-flat-press", "gymleco-press", "watson-smith-press", "bb-bench"] },
  { role: "secondary", sets: 3, repLow: 8, repHigh: 12, rir: 1, rest: 120, ids: ["prime-incline-press", "atlantis-incline-press", "db-incline-press"] },
  { role: "secondary", sets: 3, repLow: 8, repHigh: 12, rir: 1, rest: 120, ids: ["nautilus-ohp", "newtech-shoulder-press", "lf-smith-press"] },
  { role: "stretch", sets: 2, repLow: 10, repHigh: 15, rir: 1, rest: 75, ids: ["nautilus-pec-fly", "gymleco-incline-fly", "db-fly"] },
  { role: "secondary", sets: 3, repLow: 12, repHigh: 20, rir: 1, rest: 60, ids: ["newtech-lateral", "prime-lateral", "cable-lateral"] },
  { role: "pump", sets: 2, repLow: 12, repHigh: 15, rir: 0, rest: 40, ids: ["cable-fly", "lf-pec-fly", "prime-pec-fly"] },
];

const PUSH_B: Slot[] = [
  { role: "main", sets: 3, repLow: 6, repHigh: 10, rir: 2, rest: 150, ids: ["atlantis-incline-press", "prime-incline-press", "db-incline-press"] },
  { role: "secondary", sets: 3, repLow: 8, repHigh: 12, rir: 1, rest: 120, ids: ["newtech-shoulder-press", "nautilus-ohp", "lf-smith-press"] },
  { role: "secondary", sets: 3, repLow: 8, repHigh: 12, rir: 1, rest: 120, ids: ["nautilus-vertical-press", "prime-hybrid-press", "prime-ft-press"] },
  { role: "stretch", sets: 2, repLow: 10, repHigh: 15, rir: 1, rest: 75, ids: ["gymleco-incline-fly", "nautilus-pec-fly", "db-fly"] },
  { role: "secondary", sets: 4, repLow: 12, repHigh: 20, rir: 1, rest: 60, ids: ["prime-lateral", "newtech-lateral", "cable-lateral"] },
  { role: "pump", sets: 2, repLow: 10, repHigh: 15, rir: 0, rest: 40, ids: ["dip-assist", "cable-fly", "lf-pec-fly"] },
];

const PULL_A: Slot[] = [
  { role: "main", sets: 3, repLow: 6, repHigh: 10, rir: 2, rest: 150, ids: ["prime-pulldown", "nautilus-pulldown", "pullup-assist"] },
  { role: "secondary", sets: 3, repLow: 8, repHigh: 12, rir: 1, rest: 120, ids: ["prime-extreme-row", "megamass-tbar", "watson-tbar"] },
  { role: "secondary", sets: 3, repLow: 8, repHigh: 12, rir: 1, rest: 120, ids: ["newtech-row", "prime-hybrid-row", "prime-seated-row"] },
  { role: "stretch", sets: 3, repLow: 8, repHigh: 12, rir: 1, rest: 75, ids: ["newtech-curl", "prime-curl", "db-curl"] },
  { role: "secondary", sets: 3, repLow: 12, repHigh: 20, rir: 1, rest: 60, ids: ["lf-rear-delt", "prime-rear-delt", "face-pull"] },
  { role: "pump", sets: 2, repLow: 12, repHigh: 15, rir: 0, rest: 40, ids: ["prime-curl", "db-curl", "bb-curl"] },
];

const PULL_B: Slot[] = [
  { role: "main", sets: 3, repLow: 6, repHigh: 10, rir: 2, rest: 150, ids: ["megamass-tbar", "watson-tbar", "bb-row"] },
  { role: "secondary", sets: 3, repLow: 8, repHigh: 12, rir: 1, rest: 120, ids: ["prime-hybrid-pulldown", "atlantis-uni-pulldown", "watson-low-row"] },
  { role: "secondary", sets: 3, repLow: 8, repHigh: 12, rir: 1, rest: 120, ids: ["prime-seated-row", "prime-hybrid-row", "db-row"] },
  { role: "stretch", sets: 3, repLow: 8, repHigh: 12, rir: 1, rest: 75, ids: ["prime-curl", "newtech-curl", "bb-curl"] },
  { role: "secondary", sets: 3, repLow: 12, repHigh: 20, rir: 1, rest: 60, ids: ["prime-rear-delt", "face-pull", "lf-rear-delt"] },
  { role: "pump", sets: 2, repLow: 12, repHigh: 15, rir: 0, rest: 40, ids: ["face-pull", "db-curl", "prime-hybrid-pulldown"] },
];

const LEGS_A: Slot[] = [
  { role: "main", sets: 3, repLow: 6, repHigh: 10, rir: 2, rest: 150, ids: ["prime-hack", "watson-pendulum", "rodgers-squat", "bb-squat"] },
  { role: "secondary", sets: 3, repLow: 8, repHigh: 12, rir: 1, rest: 120, ids: ["atlantis-leg-press", "rodgers-hip", "atlantis-pivot"] },
  { role: "stretch", sets: 3, repLow: 10, repHigh: 15, rir: 1, rest: 75, ids: ["newtech-extension", "prime-extension"] },
  { role: "secondary", sets: 3, repLow: 8, repHigh: 12, rir: 1, rest: 90, ids: ["newtech-lying-curl", "prime-lying-curl", "lf-seated-curl"] },
  { role: "secondary", sets: 3, repLow: 10, repHigh: 15, rir: 1, rest: 60, ids: ["hoist-calf", "leg-press-calf"] },
];

const LEGS_B: Slot[] = [
  { role: "main", sets: 3, repLow: 6, repHigh: 10, rir: 2, rest: 150, ids: ["bb-rdl", "watson-hyper", "smith-rdl"] },
  { role: "secondary", sets: 3, repLow: 8, repHigh: 12, rir: 1, rest: 120, ids: ["gb-hip-thrust", "watson-glute"] },
  { role: "stretch", sets: 3, repLow: 8, repHigh: 12, rir: 1, rest: 75, ids: ["lf-seated-curl", "prime-seated-curl", "prime-lying-curl"] },
  { role: "secondary", sets: 2, repLow: 12, repHigh: 20, rir: 1, rest: 60, ids: ["gb-kneeling", "maxpump-abductor", "gb-kickback", "prime-abd-add"] },
  { role: "secondary", sets: 2, repLow: 10, repHigh: 15, rir: 1, rest: 60, ids: ["hoist-calf", "leg-press-calf"] },
];

const TEMPLATES: Record<LiftKind, Record<"A" | "B", Slot[]>> = {
  push: { A: PUSH_A, B: PUSH_B },
  pull: { A: PULL_A, B: PULL_B },
  legs: { A: LEGS_A, B: LEGS_B },
};

const TITLES: Record<string, string> = {
  "push-A": "Press day",
  "push-B": "Upper chest and delts",
  "pull-A": "Pulldown day",
  "pull-B": "Row day",
  "legs-A": "Squat day",
  "legs-B": "Hinge day",
};

export interface LiftSpec {
  kind: LiftKind;
  variant: "A" | "B";
}

/** Monday–Saturday push / pull / legs, each twice. Sunday is the long run. */
export function liftSpecFor(date: string): LiftSpec | null {
  const dow = keyToDate(date).getDay();
  if (dow === 1) return { kind: "push", variant: "A" };
  if (dow === 2) return { kind: "pull", variant: "A" };
  if (dow === 3) return { kind: "legs", variant: "A" };
  if (dow === 4) return { kind: "push", variant: "B" };
  if (dow === 5) return { kind: "pull", variant: "B" };
  if (dow === 6) return { kind: "legs", variant: "B" };
  return null;
}

export function runVariantFor(date: string, runs: 3 | 4): RunVariant | null {
  const dow = keyToDate(date).getDay();
  if (runs === 4) {
    if (dow === 1 || dow === 4) return "easy";
    if (dow === 2) return "strides";
    if (dow === 0) return "long";
    return null;
  }
  if (dow === 1 || dow === 4) return "easy";
  if (dow === 0) return "long";
  return null;
}

export function profileStamp(profile: Profile): string {
  const loads = Object.entries(profile.loads)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([id, kg]) => `${id}:${kg}`)
    .join(",");
  return [
    profile.level,
    profile.runsPerWeek,
    profile.freeWeights ? "1" : "0",
    profile.treadmill ? "1" : "0",
    profile.bike ? "1" : "0",
    profile.rower ? "1" : "0",
    profile.ski ? "1" : "0",
    profile.avoid.slice().sort().join(","),
    profile.goal,
    profile.injuries.slice().sort().join(","),
    profile.weakPoints.join(","),
    loads,
  ].join("|");
}

export function tune(role: Role, sets: number, rir: number, level: Level): { sets: number; rir: number } {
  if (level === "beginner") return { sets: Math.max(2, sets - 1), rir: Math.min(3, rir + 1) };
  if (level === "advanced" && role === "main") return { sets: sets + 1, rir };
  return { sets, rir };
}

export function emptySet(weight: number | null): SetLog {
  return { weight, reps: null, rir: null, rpe: null, done: false };
}

export function aimRpe(rirTarget: number): number {
  return Math.max(6, Math.min(10, 10 - rirTarget));
}

export function makeExercise(
  exercise: Exercise,
  prescription: {
    role: Role;
    sets: number;
    repLow: number;
    repHigh: number;
    rir: number;
    rest: number;
    note?: string;
  },
  load: number | null,
): LiftExercise {
  return {
    exerciseId: exercise.id,
    role: prescription.role,
    setsTarget: prescription.sets,
    repLow: prescription.repLow,
    repHigh: prescription.repHigh,
    rirTarget: prescription.rir,
    restSec: prescription.rest,
    note: prescription.note ?? ROLE_NOTE[prescription.role],
    emphasis: "hypertrophy",
    setup: "",
    sets: Array.from({ length: prescription.sets }, () => emptySet(load)),
  };
}

function injuryBlocks(exercise: Exercise, profile: Profile): boolean {
  const areas = new Set(profile.injuries);
  if (areas.has("knee") && (exercise.pattern === "lunge" || exercise.id === "bb-squat" || exercise.id === "watson-pendulum")) {
    return true;
  }
  if (areas.has("low-back") && exercise.id === "smith-rdl") return true;
  if (areas.has("low-back") && exercise.freeWeight && (exercise.pattern === "hinge" || exercise.pattern === "row" || exercise.pattern === "squat")) {
    return true;
  }
  if (areas.has("shoulder") && (exercise.pattern === "dip" || exercise.id === "newtech-shoulder-press")) return true;
  if (areas.has("wrist") && exercise.gear === "barbell" && (exercise.pattern === "h-press" || exercise.pattern === "curl")) {
    return true;
  }
  if (areas.has("elbow") && exercise.id === "bb-curl") return true;
  if (areas.has("neck") && exercise.id === "newtech-shoulder-press") return true;
  return false;
}

function allowed(exercise: Exercise, profile: Profile, used: Set<string>): boolean {
  if (used.has(exercise.id)) return false;
  if (profile.avoid.includes(exercise.id)) return false;
  if (injuryBlocks(exercise, profile)) return false;
  if (exercise.freeWeight && !profile.freeWeights) return false;
  if (exercise.cardio && !profile[exercise.cardio]) return false;
  return true;
}

export function chooseExercise(
  ids: string[],
  profile: Profile,
  used: Set<string>,
  pattern?: Exercise["pattern"],
  day?: Exercise["day"],
): Exercise | null {
  for (const id of ids) {
    const exercise = getExercise(id);
    if (exercise && allowed(exercise, profile, used)) return exercise;
  }
  if (!pattern || !day) return null;
  for (const exercise of EXERCISES) {
    if (exercise.pattern === pattern && exercise.day === day && allowed(exercise, profile, used)) {
      return exercise;
    }
  }
  return null;
}

function preferForInjuries(ids: string[], profile: Profile): string[] {
  const seed = getExercise(ids[0] ?? "");
  if (!seed) return ids;
  const extra: string[] = [];
  if (profile.injuries.includes("knee") && (seed.pattern === "squat" || seed.pattern === "lunge")) {
    extra.push("pitshark-belt", "atlantis-pivot");
  }
  if (profile.injuries.includes("knee") && seed.pattern === "leg-press") {
    extra.push("atlantis-pivot", "atlantis-leg-press", "rodgers-hip");
  }
  if (profile.injuries.includes("low-back") && seed.pattern === "hinge") extra.push("watson-hyper");
  if (profile.injuries.includes("low-back") && seed.pattern === "row") {
    extra.push("prime-extreme-row", "megamass-tbar", "prime-seated-row");
  }
  if (profile.injuries.includes("low-back") && seed.pattern === "squat") extra.push("pitshark-belt");
  if ((profile.injuries.includes("shoulder") || profile.injuries.includes("neck")) && seed.pattern === "v-press") {
    return ["nautilus-ohp", ...ids.filter((id) => id !== "newtech-shoulder-press")];
  }
  return [...extra, ...ids];
}

function resizeSets(exercise: LiftExercise, count: number, load: number | null): SetLog[] {
  const sets = exercise.sets.slice(0, count);
  while (sets.length < count) sets.push(emptySet(load));
  return sets;
}

function matchesWeak(exercise: Exercise, point: Profile["weakPoints"][number]): boolean {
  if (point === "chest") return exercise.muscle === "Chest";
  if (point === "upper-chest") return exercise.muscle === "Upper chest";
  if (point === "side-delts") return exercise.muscle === "Side delts" || exercise.muscle === "Delts";
  if (point === "lats") return exercise.muscle === "Lats";
  if (point === "upper-back") return exercise.muscle === "Back" || exercise.muscle === "Rear delts";
  if (point === "biceps") return exercise.muscle === "Biceps";
  if (point === "triceps") return exercise.muscle === "Triceps";
  if (point === "quads") return exercise.muscle === "Quads";
  if (point === "hamstrings") return exercise.muscle === "Hamstrings";
  if (point === "glutes") return exercise.muscle === "Glutes";
  if (point === "calves") return exercise.muscle === "Calves";
  return false;
}

function toStrength(exercise: LiftExercise, load: number | null, level: Level): LiftExercise {
  const count = Math.max(exercise.sets.length, level === "beginner" ? 3 : 4);
  return {
    ...exercise,
    emphasis: "strength",
    setsTarget: count,
    repLow: 4,
    repHigh: 6,
    rirTarget: 2,
    restSec: 180,
    note: "Strength priority. Add load when all 6 reps are clean and you still had 2 left.",
    sets: resizeSets(exercise, count, load),
  };
}

function injuryNote(exercise: Exercise, profile: Profile): string {
  const notes: string[] = [];
  if (profile.injuries.includes("shoulder") && (exercise.pattern === "v-press" || exercise.pattern === "h-press" || exercise.pattern === "dip")) {
    notes.push("Shoulder is flagged. Stop before a pinch. Pain ends the set.");
  }
  if (profile.injuries.includes("knee") && (exercise.pattern === "squat" || exercise.pattern === "leg-press" || exercise.pattern === "lunge")) {
    notes.push("Knee is flagged. Pain-free depth only. No bounce out of the bottom.");
  }
  if (profile.injuries.includes("low-back") && (exercise.pattern === "hinge" || exercise.pattern === "squat" || exercise.pattern === "row")) {
    notes.push("Back is flagged. Stay braced. If the back takes over, stop the set.");
  }
  if (profile.injuries.includes("hip") && (exercise.pattern === "hinge" || exercise.pattern === "thrust")) {
    notes.push("Hip is flagged. Shorten the range before you add load.");
  }
  if (profile.injuries.includes("elbow") && exercise.pattern === "curl") {
    notes.push("Elbow is flagged. Leave 2–3 reps and skip anything that stings.");
  }
  if (profile.injuries.includes("ankle") && exercise.pattern === "calf") {
    notes.push("Ankle is flagged. Slow stretch, and stop if it bites.");
  }
  return notes.join(" ");
}

export function splitWeakPoints(
  exerciseIds: string[],
  points: Profile["weakPoints"],
): { here: string[]; later: string[] } {
  const here: string[] = [];
  const later: string[] = [];
  for (const point of points) {
    const hit = exerciseIds.some((id) => {
      const source = getExercise(id);
      return source ? matchesWeak(source, point) : false;
    });
    const label = point.replaceAll("-", " ");
    if (hit) here.push(label);
    else later.push(label);
  }
  return { here, later };
}

function applyAims(exercises: LiftExercise[], spec: LiftSpec, profile: Profile): LiftExercise[] {
  let next = exercises.map((item) => {
    const source = getExercise(item.exerciseId);
    if (!source) return item;
    const extra = injuryNote(source, profile);
    if (!extra) return item;
    return { ...item, note: `${item.note} ${extra}` };
  });

  if (profile.goal === "strength") {
    next = next.map((item) => {
      if (item.role !== "main" || item.emphasis === "strength") return item;
      return toStrength(item, profile.loads[item.exerciseId] ?? null, profile.level);
    });
  }

  const cap = spec.kind === "legs" ? 1 : 2;
  let used = next.filter((item) => item.emphasis === "strength").length;
  for (const point of profile.weakPoints) {
    if (used >= cap) break;
    const index = next.findIndex((item) => {
      const source = getExercise(item.exerciseId);
      return source ? matchesWeak(source, point) && item.emphasis !== "strength" : false;
    });
    if (index === -1) continue;
    const current = next[index];
    if (!current) continue;
    next[index] = toStrength(current, profile.loads[current.exerciseId] ?? null, profile.level);
    used += 1;
    const extraIndex = next.findIndex((item, itemIndex) => {
      if (itemIndex === index) return false;
      const source = getExercise(item.exerciseId);
      return source ? matchesWeak(source, point) : false;
    });
    const extra = extraIndex >= 0 ? next[extraIndex] : undefined;
    if (extra && extra.emphasis !== "strength") {
      const count = extra.sets.length + 1;
      next[extraIndex] = {
        ...extra,
        setsTarget: count,
        sets: resizeSets(extra, count, profile.loads[extra.exerciseId] ?? null),
        note: `${extra.note} Extra set — this muscle is on your weak-point list.`,
      };
    }
  }

  if (spec.kind === "push" && profile.weakPoints.includes("triceps") && !next.some((item) => getExercise(item.exerciseId)?.muscle === "Triceps")) {
    const exercise = chooseExercise(["cable-pressdown", "dip-assist"], profile, new Set(next.map((item) => item.exerciseId)), "dip", "push");
    if (exercise) {
      const tuned = tune("secondary", 3, 2, profile.level);
      next.push(
        makeExercise(
          exercise,
          { role: "secondary", sets: tuned.sets, repLow: 6, repHigh: 10, rir: tuned.rir, rest: 90, note: "Added because triceps are a weak point. Load it like a lift, not a burn." },
          profile.loads[exercise.id] ?? null,
        ),
      );
    }
  }

  if (spec.kind === "legs" && spec.variant === "A" && profile.weakPoints.includes("glutes") && !next.some((item) => getExercise(item.exerciseId)?.muscle === "Glutes")) {
    const exercise = chooseExercise(["gb-hip-thrust", "watson-glute", "maxpump-abductor"], profile, new Set(next.map((item) => item.exerciseId)), "thrust", "legs");
    if (exercise) {
      next.push(
        makeExercise(
          exercise,
          { role: "secondary", sets: 2, repLow: 8, repHigh: 12, rir: 1, rest: 90, note: "Short glute add-on. Quads already had their heavy work." },
          profile.loads[exercise.id] ?? null,
        ),
      );
    }
  }

  return next;
}

export function defaultPrescription(role: Role): {
  sets: number;
  repLow: number;
  repHigh: number;
  rir: number;
  rest: number;
} {
  if (role === "main") return { sets: 3, repLow: 6, repHigh: 10, rir: 2, rest: 150 };
  if (role === "stretch") return { sets: 3, repLow: 10, repHigh: 15, rir: 1, rest: 75 };
  if (role === "pump") return { sets: 3, repLow: 12, repHigh: 15, rir: 0, rest: 40 };
  return { sets: 3, repLow: 8, repHigh: 12, rir: 1, rest: 90 };
}

function buildLift(spec: LiftSpec, profile: Profile): LiftSession {
  let slots = TEMPLATES[spec.kind][spec.variant];
  if (profile.level === "beginner") slots = slots.filter((slot) => slot.role !== "pump");
  const used = new Set<string>();
  const exercises: LiftExercise[] = [];
  for (const slot of slots) {
    const ids = preferForInjuries(slot.ids, profile);
    const seed = getExercise(ids[0] ?? "");
    const exercise = chooseExercise(ids, profile, used, seed?.pattern, seed?.day);
    if (!exercise) continue;
    used.add(exercise.id);
    const tuned = tune(slot.role, slot.sets, slot.rir, profile.level);
    exercises.push(
      makeExercise(
        exercise,
        {
          role: slot.role,
          sets: tuned.sets,
          repLow: slot.repLow,
          repHigh: slot.repHigh,
          rir: tuned.rir,
          rest: slot.rest,
        },
        profile.loads[exercise.id] ?? null,
      ),
    );
  }
  return {
    kind: spec.kind,
    variant: spec.variant,
    title: TITLES[`${spec.kind}-${spec.variant}`] ?? "Lift",
    startedAt: null,
    finishedAt: null,
    exercises: applyAims(exercises, spec, profile),
  };
}

function buildRun(variant: RunVariant, profile: Profile): RunSession {
  const level = profile.level;
  const joint = profile.injuries.some((area) => area === "knee" || area === "ankle" || area === "hip")
    ? " A joint is flagged, so keep this flat and easy. Walk the moment it bites."
    : "";
  if (variant === "long") {
    const minutesLow = level === "beginner" ? 45 : level === "advanced" ? 70 : 55;
    const minutesHigh = level === "beginner" ? 60 : level === "advanced" ? 90 : 75;
    return {
      variant,
      title: "Long run",
      minutesLow,
      minutesHigh,
      cue: `Easy the whole way. Walk the hills if Saturday's hinge is still in your legs. You should finish thinking you could have kept going.${joint}`,
      minutes: null,
      km: null,
      feel: null,
      done: false,
    };
  }
  if (variant === "strides") {
    return {
      variant,
      title: "Easy run and strides",
      minutesLow: 25,
      minutesHigh: 35,
      cue: `Twenty easy minutes, then 6 × 20 seconds smooth and quick with a full walk back. Stop if the legs are heavy. This is not the day to race.${joint}`,
      minutes: null,
      km: null,
      feel: null,
      done: false,
    };
  }
  return {
    variant,
    title: "Easy run",
    minutesLow: 30,
    minutesHigh: level === "beginner" ? 40 : 45,
    cue: `Conversational the whole time. Before lifting or after, as you prefer. It should not touch the next leg day.${joint}`,
    minutes: null,
    km: null,
    feel: null,
    done: false,
  };
}

export function buildDay(date: string, profile: Profile): DayPlan {
  const spec = liftSpecFor(date);
  const run = runVariantFor(date, profile.runsPerWeek);
  return {
    date,
    stamp: profileStamp(profile),
    customized: false,
    restEndsAt: null,
    savedAt: null,
    lift: spec ? buildLift(spec, profile) : null,
    run: run ? buildRun(run, profile) : null,
  };
}

export function cloneRepeatedDay(source: DayPlan, date: string, savedAt: string): DayPlan {
  return {
    date,
    stamp: `repeat:${savedAt}`,
    customized: true,
    restEndsAt: null,
    savedAt: null,
    lift: source.lift
      ? {
          ...source.lift,
          startedAt: null,
          finishedAt: null,
          exercises: source.lift.exercises.map((exercise) => ({
            ...exercise,
            sets: exercise.sets.map((set) => ({
              weight: set.weight,
              reps: null,
              rir: null,
              rpe: null,
              done: false,
            })),
          })),
        }
      : null,
    run: source.run
      ? { ...source.run, minutes: null, km: null, feel: null, done: false }
      : null,
  };
}

export function scheduledTitle(
  date: string,
  profile: Profile,
  stored: DayPlan | undefined,
  plan: WeekPlan | null,
): string {
  if (stored) return stored.lift?.title ?? stored.run?.title ?? "Rest";
  if (plan?.repeat) {
    const source = plan.byDow[String(keyToDate(date).getDay())];
    if (source) return source.lift?.title ?? source.run?.title ?? "Rest";
  }
  const built = buildDay(date, profile);
  return built.lift?.title ?? built.run?.title ?? "Rest";
}

export function nextDateForGroup(from: string, day: "push" | "pull" | "legs"): string {
  for (let i = 0; i <= 7; i++) {
    const date = new Date(keyToDate(from).getFullYear(), keyToDate(from).getMonth(), keyToDate(from).getDate() + i);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    const spec = liftSpecFor(key);
    if (spec?.kind === day) return key;
  }
  return from;
}

export function setsDone(exercise: LiftExercise): number {
  return exercise.sets.filter((set) => set.done).length;
}

export function dayHasActivity(day: DayPlan): boolean {
  if (day.run?.done || day.run?.minutes) return true;
  if (day.lift?.startedAt || day.lift?.finishedAt) return true;
  return Boolean(day.lift?.exercises.some((exercise) => exercise.sets.some((set) => set.done)));
}

export function dayIsTouched(day: DayPlan): boolean {
  if (day.savedAt || dayHasActivity(day)) return true;
  if (day.run?.km || day.run?.feel) return true;
  return Boolean(
    day.lift?.exercises.some(
      (exercise) => exercise.setup || exercise.sets.some((set) => set.reps != null || set.rpe != null),
    ),
  );
}

export function loggedSets(day: DayPlan): { done: number; total: number } {
  const exercises = day.lift?.exercises ?? [];
  const total = exercises.reduce((sum, exercise) => sum + exercise.sets.length, 0);
  const done = exercises.reduce((sum, exercise) => sum + setsDone(exercise), 0);
  return { done, total };
}

export function scriptLine(exercise: Exercise): string {
  if (exercise.day === "conditioning") return exercise.cue;
  if (exercise.pattern === "h-press" || exercise.pattern === "squat" || exercise.pattern === "hinge" || exercise.pattern === "v-pull" || exercise.pattern === "row") {
    return "Usually 6–10 reps, with about 2 left in the tank.";
  }
  if (exercise.pattern === "lateral" || exercise.pattern === "rear-delt" || exercise.pattern === "calf" || exercise.pattern === "glute") {
    return "Higher reps, 12–20. Smooth, and stop before the form goes.";
  }
  if (exercise.pattern === "fly" || exercise.pattern === "extension" || exercise.pattern === "curl" || exercise.pattern === "ham-curl") {
    return "A lengthened set. 8–15 reps, pause where the muscle is longest.";
  }
  return "8–12 reps, close to failure but not past it.";
}
