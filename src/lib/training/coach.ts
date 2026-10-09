import { createServerFn } from "@tanstack/react-start";
import { EXERCISES, getExercise } from "./catalog";
import type { CoachAction, DayPlan, Profile, Role } from "./types";

const ROLES = new Set<Role>(["main", "secondary", "stretch", "pump"]);

export function buildCoachContext(profile: Profile, day: DayPlan | null): string {
  const catalog = EXERCISES.map(
    (exercise) => `${exercise.id} | ${exercise.day} | ${exercise.name} | ${exercise.kit} | ${exercise.muscle}`,
  ).join("\n");
  const session = day?.lift
    ? day.lift.exercises
        .map((exercise) => {
          const source = getExercise(exercise.exerciseId);
          const done = exercise.sets.filter((set) => set.done).length;
          return `${exercise.exerciseId} | ${source?.name ?? exercise.exerciseId} | ${exercise.role} | ${exercise.emphasis} | ${exercise.repLow}-${exercise.repHigh} | setup ${exercise.setup || "unset"} | sets ${done}/${exercise.sets.length} done`;
        })
        .join("\n")
    : "No lift today.";
  return [
    `Goal: ${profile.goal}. ${profile.goalNote || "No extra goal note."}`,
    `Level: ${profile.level}. Runs per week: ${profile.runsPerWeek}.`,
    `Weak points, in priority order: ${profile.weakPoints.join(", ") || "none yet"}.`,
    `Injuries: ${profile.injuries.join(", ") || "none marked"}. ${profile.injuryNote || ""}`,
    `Avoid ids: ${profile.avoid.join(", ") || "none"}.`,
    `Free weights: ${profile.freeWeights ? "yes" : "no"}. Treadmill ${profile.treadmill ? "on" : "off"}, bike ${profile.bike ? "on" : "off"}, rower ${profile.rower ? "on" : "off"}, ski ${profile.ski ? "on" : "off"}.`,
    day?.run ? `Run today: ${day.run.title}. ${day.run.cue}` : "No run today.",
    "Today's lift:",
    session,
    "Catalog:",
    catalog,
  ].join("\n");
}

export function sanitizeActions(raw: unknown): CoachAction[] {
  if (!Array.isArray(raw)) return [];
  const actions: CoachAction[] = [];
  for (const item of raw.slice(0, 8)) {
    if (!item || typeof item !== "object") continue;
    const action = item as Record<string, unknown>;
    if (action.type === "swap" && typeof action.fromId === "string" && typeof action.toId === "string" && getExercise(action.toId)) {
      actions.push({ type: "swap", fromId: action.fromId, toId: action.toId });
    } else if (action.type === "set_sets" && typeof action.exerciseId === "string" && typeof action.sets === "number") {
      actions.push({ type: "set_sets", exerciseId: action.exerciseId, sets: action.sets });
    } else if (
      action.type === "set_reps" &&
      typeof action.exerciseId === "string" &&
      typeof action.low === "number" &&
      typeof action.high === "number"
    ) {
      actions.push({ type: "set_reps", exerciseId: action.exerciseId, low: action.low, high: action.high });
    } else if (action.type === "add" && typeof action.exerciseId === "string" && typeof action.role === "string" && ROLES.has(action.role as Role) && getExercise(action.exerciseId)) {
      actions.push({ type: "add", exerciseId: action.exerciseId, role: action.role as Role });
    } else if (action.type === "remove" && typeof action.exerciseId === "string") {
      actions.push({ type: "remove", exerciseId: action.exerciseId });
    } else if (action.type === "note" && typeof action.exerciseId === "string" && typeof action.text === "string") {
      actions.push({ type: "note", exerciseId: action.exerciseId, text: action.text });
    } else if (action.type === "avoid" && typeof action.exerciseId === "string" && getExercise(action.exerciseId)) {
      actions.push({ type: "avoid", exerciseId: action.exerciseId });
    }
  }
  return actions;
}

function messageFrom(raw: unknown, fallback: string): { message: string; actions: CoachAction[] } {
  const text = typeof raw === "string" ? raw.trim() : "";
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return { message: text || fallback, actions: [] };
  try {
    const parsed = JSON.parse(match[0]) as { message?: unknown; actions?: unknown };
    const message = typeof parsed.message === "string" && parsed.message.trim() ? parsed.message.trim() : text || fallback;
    return { message, actions: sanitizeActions(parsed.actions) };
  } catch {
    return { message: text || fallback, actions: [] };
  }
}

async function complete(apiKey: string, messages: { role: string; content: string }[], jsonMode: boolean) {
  return fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "grok-4.5",
      max_tokens: 900,
      temperature: 0.4,
      messages,
      ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
    }),
  });
}

export const askCoach = createServerFn({ method: "POST" })
  .validator((input: { messages: { role: "user" | "assistant"; content: string }[]; context: string }) => {
    if (!input?.messages?.length) throw new Error("Missing message");
    if (input.messages.length > 16) throw new Error("Too many messages");
    const last = input.messages[input.messages.length - 1];
    if (!last || last.role !== "user") throw new Error("Last message must be yours");
    if (last.content.length > 2000 || last.content.trim().length === 0) throw new Error("Message is empty or too long");
    if ((input.context || "").length > 14000) throw new Error("Context too large");
    return {
      messages: input.messages.slice(-8).map((message) => ({
        role: message.role,
        content: message.content.slice(0, 2000),
      })),
      context: input.context.slice(0, 14000),
    };
  })
  .handler(async ({ data }) => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return { ok: false as const, error: "The coach is unavailable right now." };
    const messages = [
      {
        role: "system",
        content: [
          "You are Kiln, a hypertrophy coach for one lifter at Peak HP in Birtinya.",
          "They lift six days, push pull legs twice, and run three or four times. Size is the default. Weak points they name must get stronger: 4–6 reps, about 2 in reserve, and add load when they hit the top of the range.",
          "Respect injuries. Never program through pain. Prefer a machine on the catalog over a barbell when a joint is flagged.",
          "You are not Mike Israetel, Jeff Nippard, Hany Rambod, Andy Galpin, Rhonda Patrick, or their companies. Do not claim or quote their programs. Use your own words.",
          "Effort is logged as RPE. Most hypertrophy sets land around 7–9. A named weak point is closer to 8, in the 4–6 rep range, and the load goes up when the top of the range is clean.",
          "Include a lengthened exercise and, if it will not wreck the next run, a short-rest pump.",
          "Only use exercise ids from the catalog. Reply with JSON only: {\"message\":\"2-5 sentences\",\"actions\":[]}.",
          "Actions: swap {fromId,toId}, set_sets {exerciseId,sets}, set_reps {exerciseId,low,high}, add {exerciseId,role}, remove {exerciseId}, note {exerciseId,text}, avoid {exerciseId}.",
          "Do not swap or remove an exercise that already has completed sets. If nothing should change, actions is empty.",
          data.context,
        ].join("\n"),
      },
      ...data.messages,
    ];
    let response = await complete(apiKey, messages, true);
    if (response.status === 400) response = await complete(apiKey, messages, false);
    else if (response.status === 429 || response.status >= 500) response = await complete(apiKey, messages, true);
    if (!response.ok) return { ok: false as const, error: "The coach couldn't answer. Try again in a moment." };
    const body = (await response.json()) as { choices?: { message?: { content?: unknown } }[] };
    const content = body.choices?.[0]?.message?.content;
    const text =
      typeof content === "string"
        ? content
        : Array.isArray(content)
          ? content
              .map((part) => (part && typeof part === "object" && "text" in part ? String((part as { text: unknown }).text) : ""))
              .join("")
          : "";
    const parsed = messageFrom(text, "I couldn't read that. Ask again in one sentence.");
    return { ok: true as const, message: parsed.message, actions: parsed.actions };
  });
