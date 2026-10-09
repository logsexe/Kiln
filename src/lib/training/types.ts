export type DayGroup = "push" | "pull" | "legs" | "conditioning";
export type LiftKind = "push" | "pull" | "legs";
export type Gear = "machine" | "cable" | "smith" | "barbell" | "dumbbell" | "cardio";
export type Pattern =
  | "h-press"
  | "incline-press"
  | "v-press"
  | "fly"
  | "lateral"
  | "dip"
  | "v-pull"
  | "row"
  | "curl"
  | "rear-delt"
  | "squat"
  | "leg-press"
  | "extension"
  | "ham-curl"
  | "hinge"
  | "thrust"
  | "glute"
  | "calf"
  | "lunge"
  | "run"
  | "erg";

export type Goal = "size" | "strength" | "both";

export type InjuryArea =
  | "shoulder"
  | "elbow"
  | "wrist"
  | "neck"
  | "low-back"
  | "hip"
  | "knee"
  | "ankle";

export type WeakPoint =
  | "chest"
  | "upper-chest"
  | "side-delts"
  | "lats"
  | "upper-back"
  | "biceps"
  | "triceps"
  | "quads"
  | "hamstrings"
  | "glutes"
  | "calves";

export type Emphasis = "hypertrophy" | "strength";
export type Role = "main" | "secondary" | "stretch" | "pump";
export type Level = "beginner" | "intermediate" | "advanced";
export type RunVariant = "easy" | "long" | "strides";
export type Feel = "easy" | "steady" | "hard";
export type CardioKey = "treadmill" | "bike" | "rower" | "ski";

export interface Exercise {
  id: string;
  name: string;
  kit: string;
  day: DayGroup;
  muscle: string;
  gear: Gear;
  pattern: Pattern;
  freeWeight: boolean;
  cardio?: CardioKey;
  cue: string;
}

export interface SetLog {
  weight: number | null;
  reps: number | null;
  rir: number | null;
  rpe?: number | null;
  done: boolean;
}

export interface LiftExercise {
  exerciseId: string;
  role: Role;
  setsTarget: number;
  repLow: number;
  repHigh: number;
  rirTarget: number;
  restSec: number;
  note: string;
  emphasis: Emphasis;
  setup?: string;
  sets: SetLog[];
}

export interface LiftSession {
  kind: LiftKind;
  variant: "A" | "B";
  title: string;
  startedAt: string | null;
  finishedAt: string | null;
  exercises: LiftExercise[];
}

export interface RunSession {
  variant: RunVariant;
  title: string;
  minutesLow: number;
  minutesHigh: number;
  cue: string;
  minutes: number | null;
  km: number | null;
  feel: Feel | null;
  done: boolean;
}

export interface DayPlan {
  date: string;
  stamp: string;
  customized: boolean;
  restEndsAt: number | null;
  savedAt?: string | null;
  lift: LiftSession | null;
  run: RunSession | null;
}

export interface Profile {
  level: Level;
  goal: Goal;
  goalNote: string;
  runsPerWeek: 3 | 4;
  freeWeights: boolean;
  treadmill: boolean;
  bike: boolean;
  rower: boolean;
  ski: boolean;
  injuries: InjuryArea[];
  injuryNote: string;
  weakPoints: WeakPoint[];
  avoid: string[];
  loads: Record<string, number>;
  aimsConfirmed: boolean;
}

export type CoachAction =
  | { type: "swap"; fromId: string; toId: string }
  | { type: "set_sets"; exerciseId: string; sets: number }
  | { type: "set_reps"; exerciseId: string; low: number; high: number }
  | { type: "add"; exerciseId: string; role: Role }
  | { type: "remove"; exerciseId: string }
  | { type: "note"; exerciseId: string; text: string }
  | { type: "avoid"; exerciseId: string };

export interface WeekPlan {
  repeat: boolean;
  savedAt: string;
  byDow: Record<string, DayPlan>;
}

export interface StravaActivity {
  id: number;
  name: string;
  sport: string;
  date: string;
  minutes: number;
  km: number;
}

export interface ChatTurn {
  id: string;
  role: "user" | "assistant";
  content: string;
  actions: CoachAction[];
  applied: boolean;
}
