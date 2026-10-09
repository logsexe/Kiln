import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Shell } from "@/components/shell";
import { Button, Card, PageHead } from "@/components/ui";
import { askCoach, buildCoachContext } from "@/lib/training/coach";
import { useTraining } from "@/lib/training/store";
import { useTodayKey } from "@/lib/training/use-today";

export const Route = createFileRoute("/coach")({ component: CoachPage });

function CoachPage() {
  const date = useTodayKey();
  const profile = useTraining((state) => state.profile);
  const day = useTraining((state) => (date ? state.days[date] : undefined));
  const chat = useTraining((state) => state.chat);
  const pushChat = useTraining((state) => state.pushChat);
  const applyActions = useTraining((state) => state.applyActions);
  const markChatApplied = useTraining((state) => state.markChatApplied);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const prompts = [
    "My shoulder is cranky. Change today.",
    "Make the weak-point lift heavier and drop a pump set.",
    "Where should tomorrow's run sit?",
  ];

  async function send(text: string) {
    const content = text.trim();
    if (!content || pending) return;
    setError(null);
    setDraft("");
    const userTurn = { id: `u-${Date.now()}`, role: "user" as const, content, actions: [], applied: false };
    pushChat(userTurn);
    setPending(true);
    try {
      const history = [...chat, userTurn].map((turn) => ({ role: turn.role, content: turn.content }));
      const result = await askCoach({
        data: {
          messages: history,
          context: buildCoachContext(profile, day ?? null),
        },
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      pushChat({
        id: `a-${Date.now()}`,
        role: "assistant",
        content: result.message,
        actions: result.actions,
        applied: false,
      });
    } catch {
      setError("The coach couldn't answer. Try again in a moment.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Shell>
      <PageHead
        kicker="Coach"
        title="Ask, then apply"
        lede="It can see your goal, injuries, weak points, and today's session. Nothing changes until you apply it."
      />
      <div className="mt-5 space-y-3">
        {chat.length === 0 ? (
          <div className="flex flex-col gap-2">
            {prompts.map((prompt) => (
              <button
                key={prompt}
                className="rounded-2xl bg-paper px-4 py-3 text-left text-sm text-fg ring-1 ring-line"
                onClick={() => void send(prompt)}
              >
                {prompt}
              </button>
            ))}
          </div>
        ) : (
          chat.map((turn) => (
            <Card key={turn.id} className={turn.role === "user" ? "bg-raised" : undefined}>
              <p className="text-xs uppercase tracking-widest text-faint">{turn.role === "user" ? "You" : "Kiln"}</p>
              <p className="mt-2 text-sm text-fg">{turn.content}</p>
              {turn.role === "assistant" && turn.actions.length > 0 && !turn.applied && date ? (
                <Button
                  className="mt-3"
                  onClick={() => {
                    applyActions(date, turn.actions);
                    markChatApplied(turn.id);
                  }}
                >
                  Apply to today
                </Button>
              ) : null}
              {turn.applied ? <p className="mt-2 text-sm text-brass">Applied.</p> : null}
            </Card>
          ))
        )}
        {error ? <p className="text-sm text-fg">{error}</p> : null}
        {pending ? <p className="text-sm text-muted">Thinking through today's session.</p> : null}
      </div>
      <form
        className="mt-4 flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          void send(draft);
        }}
      >
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Ask about today"
          className="h-11 min-w-0 flex-1 rounded-xl bg-paper px-3 text-base text-fg ring-1 ring-line outline-none focus:ring-brass"
        />
        <Button type="submit" disabled={pending || draft.trim().length === 0}>
          Send
        </Button>
      </form>
    </Shell>
  );
}
