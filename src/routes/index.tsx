import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { Shell } from "@/components/shell";
import { TodayScreen } from "@/components/today-screen";
import { useTraining } from "@/lib/training/store";
import { useTodayKey } from "@/lib/training/use-today";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const today = useTodayKey();
  const focus = useTraining((state) => state.focusDate);
  const setFocusDate = useTraining((state) => state.setFocusDate);
  useEffect(() => {
    if (today && !focus) setFocusDate(today);
  }, [today, focus, setFocusDate]);
  const date = focus ?? today;
  return (
    <Shell>
      {date ? (
        <TodayScreen date={date} />
      ) : (
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-brass">Kiln</p>
          <h1 className="mt-2 text-4xl font-medium">Today</h1>
          <p className="mt-3 text-base text-muted">Setting up push, pull, legs, and the runs around them.</p>
        </div>
      )}
    </Shell>
  );
}