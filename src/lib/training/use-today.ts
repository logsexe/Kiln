import { useEffect, useState } from "react";
import { todayKey } from "./dates";
import { useTraining } from "./store";

export function useTodayKey(): string | null {
  const hydrated = useTraining((state) => state.hydrated);
  const [date, setDate] = useState<string | null>(null);
  useEffect(() => {
    setDate(todayKey());
  }, []);
  if (!hydrated || !date) return null;
  return date;
}

export function TrainingBoot() {
  useEffect(() => {
    const pending = useTraining.persist.rehydrate();
    if (pending && typeof pending.finally === "function") {
      void pending.finally(() => {
        useTraining.getState().markHydrated();
      });
      return;
    }
    useTraining.getState().markHydrated();
  }, []);
  return null;
}
