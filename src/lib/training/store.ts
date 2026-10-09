import { create } from "zustand";
import { persist } from "zustand/middleware";
import { keyToDate, shiftKey, weekKeys } from "./dates";
import { getExercise } from "./catalog";
import {
  buildDay,
  chooseExercise,
  cloneRepeatedDay,
  dayIsTouched,
  defaultPrescription,
  makeExercise,
  emptySet,
  nextDateForGroup,
  profileStamp,
  tune,
} from "./program";
import type {
  ChatTurn,
  CoachAction,
  DayPlan,
  InjuryArea,
  LiftExercise,
  Profile,
  Role,
  SetLog,
  WeakPoint,
  WeekPlan,
} from "./types";

export const defaultProfile: Profile = {
  level: "intermediate",
  goal: "both",
  goalNote: "",
  runsPerWeek: 4,
  freeWeights: true,
  treadmill: true,
  bike: true,
  rower: true,
  ski: false,
  injuries: [],
  injuryNote: "",
  weakPoints: [],
  avoid: [],
  loads: {},
  aimsConfirmed: false,
};

interface TrainingState {
  profile: Profile;
  days: Record<string, DayPlan>;
  chat: ChatTurn[];
  weekPlan: WeekPlan | null;
  focusDate: string | null;
  stravaToken: string;
  hydrated: boolean;
  markHydrated: () => void;
  patchProfile: (patch: Partial<Profile>) => void;
  toggleInjury: (area: InjuryArea) => void;
  toggleWeak: (point: WeakPoint) => void;
  confirmAims: () => void;
  setLoad: (id: string, kg: number | null) => void;
  toggleAvoid: (id: string) => void;
  setFocusDate: (date: string) => void;
  setStravaToken: (token: string) => void;
  ensureDay: (date: string) => void;
  rebuild: (date: string) => void;
  saveWeek: (anchor: string) => void;
  setRepeat: (on: boolean) => void;
  saveWorkout: (date: string) => string | null;
  patchSet: (date: string, exerciseId: string, index: number, patch: Partial<SetLog>) => void;
  patchSetup: (date: string, exerciseId: string, setup: string) => void;
  addSet: (date: string, exerciseId: string) => void;
  dropSet: (date: string, exerciseId: string) => void;
  completeSet: (date: string, exerciseId: string, index: number) => void;
  clearRest: (date: string) => void;
  patchRun: (date: string, patch: Partial<NonNullable<DayPlan["run"]>>) => void;
  finishLift: (date: string) => void;
  reopenLift: (date: string) => void;
  shorten: (date: string) => void;
  morePump: (date: string) => void;
  addToNext: (exerciseId: string, from: string) => string | null;
  applyActions: (date: string, actions: CoachAction[]) => number;
  pushChat: (turn: ChatTurn) => void;
  markChatApplied: (id: string) => void;
}

function prune(days: Record<string, DayPlan>, anchor: string): Record<string, DayPlan> {
  const cutoff = shiftKey(anchor, -120);
  const next: Record<string, DayPlan> = {};
  for (const [key, value] of Object.entries(days)) {
    if (key >= cutoff) next[key] = value;
  }
  return next;
}

function mapLift(day: DayPlan, fn: (lift: NonNullable<DayPlan["lift"]>) => NonNullable<DayPlan["lift"]>): DayPlan {
  if (!day.lift) return day;
  return { ...day, lift: fn(day.lift) };
}

function mapExercise(day: DayPlan, exerciseId: string, fn: (exercise: LiftExercise) => LiftExercise): DayPlan {
  return mapLift(day, (lift) => ({
    ...lift,
    exercises: lift.exercises.map((exercise) => (exercise.exerciseId === exerciseId ? fn(exercise) : exercise)),
  }));
}

export const useTraining = create<TrainingState>()(
  persist(
    (set, get) => ({
      profile: defaultProfile,
      days: {},
      chat: [],
      weekPlan: null,
      focusDate: null,
      stravaToken: "",
      hydrated: false,
      markHydrated: () => set({ hydrated: true }),
      patchProfile: (patch) => set((state) => ({ profile: { ...state.profile, ...patch } })),
      toggleInjury: (area) =>
        set((state) => {
          const has = state.profile.injuries.includes(area);
          return {
            profile: {
              ...state.profile,
              injuries: has ? state.profile.injuries.filter((item) => item !== area) : [...state.profile.injuries, area],
            },
          };
        }),
      toggleWeak: (point) =>
        set((state) => {
          const has = state.profile.weakPoints.includes(point);
          return {
            profile: {
              ...state.profile,
              weakPoints: has
                ? state.profile.weakPoints.filter((item) => item !== point)
                : [...state.profile.weakPoints, point],
            },
          };
        }),
      confirmAims: () => set((state) => ({ profile: { ...state.profile, aimsConfirmed: true } })),
      setLoad: (id, kg) =>
        set((state) => {
          const loads = { ...state.profile.loads };
          if (kg == null || Number.isNaN(kg)) delete loads[id];
          else loads[id] = kg;
          return { profile: { ...state.profile, loads } };
        }),
      toggleAvoid: (id) =>
        set((state) => {
          const has = state.profile.avoid.includes(id);
          return {
            profile: {
              ...state.profile,
              avoid: has ? state.profile.avoid.filter((item) => item !== id) : [...state.profile.avoid, id],
            },
          };
        }),
      setFocusDate: (date) => set({ focusDate: date }),
      setStravaToken: (token) => set({ stravaToken: token.slice(0, 300) }),
      ensureDay: (date) => {
        const { days, profile, weekPlan } = get();
        const existing = days[date];
        if (existing && dayIsTouched(existing)) return;
        if (existing?.customized && !existing.stamp.startsWith("repeat:")) return;
        const dow = String(keyToDate(date).getDay());
        if (weekPlan?.repeat && weekPlan.byDow[dow]) {
          const wanted = `repeat:${weekPlan.savedAt}`;
          if (existing?.stamp === wanted) return;
          const next = cloneRepeatedDay(weekPlan.byDow[dow], date, weekPlan.savedAt);
          set({ days: { ...prune(days, date), [date]: next } });
          return;
        }
        const stamp = profileStamp(profile);
        if (existing && (existing.customized || existing.stamp === stamp)) return;
        const next = buildDay(date, profile);
        set({ days: { ...prune(days, date), [date]: next } });
      },
      saveWeek: (anchor) => {
        const keys = weekKeys(anchor);
        for (const key of keys) get().ensureDay(key);
        const savedAt = new Date().toISOString();
        const byDow: Record<string, DayPlan> = {};
        for (const key of keys) {
          const day = get().days[key];
          if (day) byDow[String(keyToDate(key).getDay())] = day;
        }
        set({ weekPlan: { repeat: true, savedAt, byDow } });
      },
      setRepeat: (on) =>
        set((state) => (state.weekPlan ? { weekPlan: { ...state.weekPlan, repeat: on } } : {})),
      saveWorkout: (date) => {
        const day = get().days[date];
        if (!day) return null;
        const savedAt = new Date().toISOString();
        set((state) => ({
          days: { ...state.days, [date]: { ...day, savedAt } },
        }));
        return savedAt;
      },
      rebuild: (date) => {
        const { days, profile } = get();
        set({ days: { ...days, [date]: buildDay(date, profile) } });
      },
      patchSet: (date, exerciseId, index, patch) =>
        set((state) => {
          const day = state.days[date];
          if (!day?.lift) return {};
          return {
            days: {
              ...state.days,
              [date]: mapExercise(day, exerciseId, (exercise) => ({
                ...exercise,
                sets: exercise.sets.map((setLog, setIndex) => (setIndex === index ? { ...setLog, ...patch } : setLog)),
              })),
            },
          };
        }),
      patchSetup: (date, exerciseId, setup) =>
        set((state) => {
          const day = state.days[date];
          if (!day?.lift) return {};
          return {
            days: {
              ...state.days,
              [date]: {
                ...mapExercise(day, exerciseId, (exercise) => ({ ...exercise, setup: setup.slice(0, 80) })),
                customized: true,
              },
            },
          };
        }),
      addSet: (date, exerciseId) =>
        set((state) => {
          const day = state.days[date];
          if (!day?.lift) return {};
          return {
            days: {
              ...state.days,
              [date]: {
                ...mapExercise(day, exerciseId, (exercise) => {
                  if (exercise.sets.length >= 8) return exercise;
                  const last = exercise.sets[exercise.sets.length - 1];
                  const weight = last?.weight ?? state.profile.loads[exerciseId] ?? null;
                  return {
                    ...exercise,
                    setsTarget: exercise.sets.length + 1,
                    sets: [...exercise.sets, emptySet(weight)],
                  };
                }),
                customized: true,
              },
            },
          };
        }),
      dropSet: (date, exerciseId) =>
        set((state) => {
          const day = state.days[date];
          if (!day?.lift) return {};
          return {
            days: {
              ...state.days,
              [date]: {
                ...mapExercise(day, exerciseId, (exercise) => {
                  const last = exercise.sets[exercise.sets.length - 1];
                  if (!last || last.done || exercise.sets.length <= 1) return exercise;
                  return { ...exercise, setsTarget: exercise.sets.length - 1, sets: exercise.sets.slice(0, -1) };
                }),
                customized: true,
              },
            },
          };
        }),
      completeSet: (date, exerciseId, index) =>
        set((state) => {
          const day = state.days[date];
          const lift = day?.lift;
          if (!day || !lift) return {};
          const source = lift.exercises.find((exercise) => exercise.exerciseId === exerciseId);
          const current = source?.sets[index];
          if (!source || !current || current.reps == null) return {};
          const loads = { ...state.profile.loads };
          if (current.weight != null) loads[exerciseId] = current.weight;
          const rpe = current.rpe ?? Math.max(6, Math.min(10, 10 - source.rirTarget));
          const rir = Math.max(0, Math.min(4, 10 - rpe));
          const updated = mapExercise(day, exerciseId, (exercise) => ({
            ...exercise,
            sets: exercise.sets.map((setLog, setIndex) =>
              setIndex === index ? { ...setLog, done: true, rpe, rir } : setLog,
            ),
          }));
          return {
            profile: { ...state.profile, loads },
            days: {
              ...state.days,
              [date]: {
                ...updated,
                restEndsAt: Date.now() + source.restSec * 1000,
                lift: updated.lift
                  ? { ...updated.lift, startedAt: updated.lift.startedAt ?? new Date().toISOString() }
                  : updated.lift,
              },
            },
          };
        }),
      clearRest: (date) =>
        set((state) => {
          const day = state.days[date];
          if (!day) return {};
          return { days: { ...state.days, [date]: { ...day, restEndsAt: null } } };
        }),
      patchRun: (date, patch) =>
        set((state) => {
          const day = state.days[date];
          if (!day?.run || !patch) return {};
          return { days: { ...state.days, [date]: { ...day, run: { ...day.run, ...patch } } } };
        }),
      finishLift: (date) =>
        set((state) => {
          const day = state.days[date];
          if (!day?.lift) return {};
          return {
            days: {
              ...state.days,
              [date]: {
                ...mapLift(day, (lift) => ({
                  ...lift,
                  finishedAt: new Date().toISOString(),
                  startedAt: lift.startedAt ?? new Date().toISOString(),
                })),
                savedAt: new Date().toISOString(),
              },
            },
          };
        }),
      reopenLift: (date) =>
        set((state) => {
          const day = state.days[date];
          if (!day?.lift) return {};
          return { days: { ...state.days, [date]: mapLift(day, (lift) => ({ ...lift, finishedAt: null })) } };
        }),
      shorten: (date) =>
        set((state) => {
          const day = state.days[date];
          if (!day?.lift) return {};
          let exercises = day.lift.exercises.filter((exercise) => exercise.role !== "pump");
          if (exercises.length > 4) exercises = exercises.slice(0, 4);
          return {
            days: {
              ...state.days,
              [date]: { ...mapLift(day, (lift) => ({ ...lift, exercises })), customized: true },
            },
          };
        }),
      morePump: (date) =>
        set((state) => {
          const day = state.days[date];
          if (!day?.lift) return {};
          const hasPump = day.lift.exercises.some((exercise) => exercise.role === "pump");
          let exercises = day.lift.exercises.map((exercise) => {
            if (exercise.role !== "pump") return exercise;
            const count = Math.min(5, exercise.sets.length + 1);
            return {
              ...exercise,
              setsTarget: count,
              restSec: 40,
              rirTarget: 0,
              sets: [
                ...exercise.sets,
                ...Array.from({ length: count - exercise.sets.length }, () =>
                  emptySet(state.profile.loads[exercise.exerciseId] ?? exercise.sets[0]?.weight ?? null),
                ),
              ],
            };
          });
          if (!hasPump) {
            const kind = day.lift.kind;
            const ids = kind === "push" ? ["cable-fly", "lf-pec-fly"] : kind === "pull" ? ["face-pull", "prime-curl"] : ["prime-extension"];
            const exercise = chooseExercise(ids, state.profile, new Set(exercises.map((item) => item.exerciseId)));
            if (exercise) {
              const prescription = defaultPrescription("pump");
              exercises = [
                ...exercises,
                makeExercise(exercise, { role: "pump", ...prescription }, state.profile.loads[exercise.id] ?? null),
              ];
            }
          }
          return { days: { ...state.days, [date]: { ...mapLift(day, (lift) => ({ ...lift, exercises })), customized: true } } };
        }),
      addToNext: (exerciseId, from) => {
        const exercise = getExercise(exerciseId);
        if (!exercise || exercise.day === "conditioning") return null;
        const date = nextDateForGroup(from, exercise.day);
        get().ensureDay(date);
        const day = get().days[date];
        if (!day?.lift) return null;
        if (day.lift.exercises.some((item) => item.exerciseId === exerciseId)) return date;
        const role: Role = "secondary";
        const base = defaultPrescription(role);
        const tuned = tune(role, base.sets, base.rir, get().profile.level);
        const added = makeExercise(
          exercise,
          { role, ...base, sets: tuned.sets, rir: tuned.rir, note: "Added from the library." },
          get().profile.loads[exerciseId] ?? null,
        );
        set({
          days: {
            ...get().days,
            [date]: {
              ...day,
              customized: true,
              lift: { ...day.lift, exercises: [...day.lift.exercises, added] },
            },
          },
        });
        return date;
      },
      applyActions: (date, actions) => {
        let applied = 0;
        for (const action of actions) {
          const day = get().days[date];
          if (!day?.lift) continue;
          if (action.type === "avoid") {
            if (!getExercise(action.exerciseId)) continue;
            set((state) => ({
              profile: state.profile.avoid.includes(action.exerciseId)
                ? state.profile
                : { ...state.profile, avoid: [...state.profile.avoid, action.exerciseId] },
            }));
            applied += 1;
            continue;
          }
          if (action.type === "swap") {
            const current = day.lift.exercises.find((exercise) => exercise.exerciseId === action.fromId);
            const next = getExercise(action.toId);
            if (!current || !next || current.sets.some((setLog) => setLog.done)) continue;
            if (next.day !== "push" && next.day !== "pull" && next.day !== "legs") continue;
            if (next.day !== day.lift.kind) continue;
            const replacement = makeExercise(
              next,
              {
                role: current.role,
                sets: current.setsTarget,
                repLow: current.repLow,
                repHigh: current.repHigh,
                rir: current.rirTarget,
                rest: current.restSec,
                note: current.note,
              },
              get().profile.loads[next.id] ?? null,
            );
            replacement.emphasis = current.emphasis;
            set({
              days: {
                ...get().days,
                [date]: {
                  ...mapExercise(get().days[date] ?? day, action.fromId, () => replacement),
                  customized: true,
                },
              },
            });
            applied += 1;
            continue;
          }
          if (action.type === "remove") {
            const current = day.lift.exercises.find((exercise) => exercise.exerciseId === action.exerciseId);
            if (!current || current.sets.some((setLog) => setLog.done)) continue;
            set({
              days: {
                ...get().days,
                [date]: {
                  ...mapLift(day, (lift) => ({
                    ...lift,
                    exercises: lift.exercises.filter((exercise) => exercise.exerciseId !== action.exerciseId),
                  })),
                  customized: true,
                },
              },
            });
            applied += 1;
            continue;
          }
          if (action.type === "add") {
            const exercise = getExercise(action.exerciseId);
            if (!exercise || exercise.day !== day.lift.kind) continue;
            if (day.lift.exercises.some((item) => item.exerciseId === exercise.id)) continue;
            const base = defaultPrescription(action.role);
            const tuned = tune(action.role, base.sets, base.rir, get().profile.level);
            const added = makeExercise(
              exercise,
              { role: action.role, ...base, sets: tuned.sets, rir: tuned.rir },
              get().profile.loads[exercise.id] ?? null,
            );
            set({
              days: {
                ...get().days,
                [date]: {
                  ...mapLift(get().days[date] ?? day, (lift) => ({ ...lift, exercises: [...lift.exercises, added] })),
                  customized: true,
                },
              },
            });
            applied += 1;
            continue;
          }
          if (action.type === "set_sets") {
            const current = day.lift.exercises.find((exercise) => exercise.exerciseId === action.exerciseId);
            if (!current) continue;
            const count = Math.max(1, Math.min(6, Math.round(action.sets)));
            const load = get().profile.loads[action.exerciseId] ?? current.sets.find((setLog) => setLog.weight != null)?.weight ?? null;
            set({
              days: {
                ...get().days,
                [date]: {
                  ...mapExercise(day, action.exerciseId, (exercise) => ({
                    ...exercise,
                    setsTarget: count,
                    sets: [
                      ...exercise.sets.slice(0, count),
                      ...Array.from({ length: Math.max(0, count - exercise.sets.length) }, () => emptySet(load)),
                    ],
                  })),
                  customized: true,
                },
              },
            });
            applied += 1;
            continue;
          }
          if (action.type === "set_reps") {
            const low = Math.max(3, Math.min(30, Math.round(action.low)));
            const high = Math.max(low, Math.min(30, Math.round(action.high)));
            set({
              days: {
                ...get().days,
                [date]: {
                  ...mapExercise(day, action.exerciseId, (exercise) => ({ ...exercise, repLow: low, repHigh: high })),
                  customized: true,
                },
              },
            });
            applied += 1;
            continue;
          }
          if (action.type === "note") {
            set({
              days: {
                ...get().days,
                [date]: {
                  ...mapExercise(day, action.exerciseId, (exercise) => ({
                    ...exercise,
                    note: action.text.slice(0, 240),
                  })),
                  customized: true,
                },
              },
            });
            applied += 1;
          }
        }
        return applied;
      },
      pushChat: (turn) => set((state) => ({ chat: [...state.chat, turn].slice(-24) })),
      markChatApplied: (id) =>
        set((state) => ({
          chat: state.chat.map((turn) => (turn.id === id ? { ...turn, applied: true } : turn)),
        })),
    }),
    {
      name: "kiln-v1",
      skipHydration: true,
      partialize: (state) => ({
        profile: state.profile,
        days: state.days,
        chat: state.chat,
        weekPlan: state.weekPlan,
        stravaToken: state.stravaToken,
      }),
    },
  ),
);
