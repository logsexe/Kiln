import type { Goal, InjuryArea, Level, WeakPoint } from "./types";

export const GOAL_OPTIONS: { id: Goal; label: string; detail: string }[] = [
  {
    id: "size",
    label: "Muscle",
    detail: "Hypertrophy leads. Anything you mark as weak still gets heavier 4–6 rep work.",
  },
  {
    id: "both",
    label: "Muscle and strength",
    detail: "Size is the base. Weak points are trained to add load, not just a pump.",
  },
  {
    id: "strength",
    label: "Strength",
    detail: "The top lift of each day is 4–6 reps. The rest stays in a growth range.",
  },
];

export const LEVELS: { id: Level; label: string }[] = [
  { id: "beginner", label: "Beginner" },
  { id: "intermediate", label: "Intermediate" },
  { id: "advanced", label: "Advanced" },
];

export const INJURY_OPTIONS: { id: InjuryArea; label: string }[] = [
  { id: "shoulder", label: "Shoulder" },
  { id: "elbow", label: "Elbow" },
  { id: "wrist", label: "Wrist" },
  { id: "neck", label: "Neck" },
  { id: "low-back", label: "Low back" },
  { id: "hip", label: "Hip" },
  { id: "knee", label: "Knee" },
  { id: "ankle", label: "Ankle" },
];

export const WEAK_OPTIONS: { id: WeakPoint; label: string }[] = [
  { id: "chest", label: "Chest" },
  { id: "upper-chest", label: "Upper chest" },
  { id: "side-delts", label: "Side delts" },
  { id: "triceps", label: "Triceps" },
  { id: "lats", label: "Lats" },
  { id: "upper-back", label: "Upper back" },
  { id: "biceps", label: "Biceps" },
  { id: "quads", label: "Quads" },
  { id: "hamstrings", label: "Hamstrings" },
  { id: "glutes", label: "Glutes" },
  { id: "calves", label: "Calves" },
];

export const LOAD_IDS = [
  "prime-flat-press",
  "bb-bench",
  "prime-incline-press",
  "nautilus-ohp",
  "prime-pulldown",
  "prime-extreme-row",
  "prime-hack",
  "bb-rdl",
  "gb-hip-thrust",
  "hoist-calf",
];
