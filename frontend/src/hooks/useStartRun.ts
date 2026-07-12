import { useMutation } from "@tanstack/react-query";
import { startRun } from "@/api/client";

export function useStartRun() {
  return useMutation({
    mutationFn: ({
      goal,
      mode,
    }: {
      goal: string;
      mode: "autonomous" | "hitl";
    }) => startRun(goal, mode),
  });
}
