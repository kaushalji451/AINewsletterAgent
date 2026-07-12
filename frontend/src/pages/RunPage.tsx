import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { GoalInput } from "@/components/GoalInput";
import { ModeToggle } from "@/components/ModeToggle";
import { useStartRun } from "@/hooks/useStartRun";

export function RunPage() {
  const [mode, setMode] = useState<"autonomous" | "hitl">("autonomous");
  const startRun = useStartRun();
  const navigate = useNavigate();

  const handleSubmit = useCallback(
    (goal: string) => {
      startRun.mutate(
        { goal, mode },
        {
          onSuccess: (res) => {
            if (res.success && res.data) {
              navigate(`/run/${res.data.runId}`);
            }
          },
        }
      );
    },
    [mode, startRun, navigate]
  );

  return (
    <div className="max-w-xl mx-auto space-y-6 py-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-gray-900">
          Create Newsletter
        </h1>
        <p className="text-sm text-gray-500">
          Describe your topic and the agent will research, write, and critique
          a newsletter for you.
        </p>
      </div>

      <ModeToggle
        value={mode}
        onChange={setMode}
        disabled={startRun.isPending}
      />

      {mode === "hitl" && (
        <div className="rounded-md bg-amber-50 border border-amber-200 px-4 py-2 text-xs text-amber-700">
          In HITL mode, the agent will pause after writing the draft so you can
          approve or request changes before final output.
        </div>
      )}

      <GoalInput onSubmit={handleSubmit} loading={startRun.isPending} />

      {startRun.isError && (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          {startRun.error?.message || "Failed to start agent run."}
        </div>
      )}
    </div>
  );
}
