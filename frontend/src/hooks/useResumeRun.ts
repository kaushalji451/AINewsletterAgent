import { useMutation } from "@tanstack/react-query";
import { resumeRun } from "@/api/client";

export function useResumeRun() {
  return useMutation({
    mutationFn: ({
      runId,
      approved,
      feedback,
    }: {
      runId: string;
      approved: boolean;
      feedback?: string;
    }) => resumeRun(runId, approved, feedback),
  });
}
