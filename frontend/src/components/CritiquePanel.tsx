import type { CritiqueResult } from "@/types";

interface Props {
  critique: CritiqueResult;
  revisionCount: number;
}

export function CritiquePanel({ critique, revisionCount }: Props) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-800">
          Quality Assessment
        </h3>
        <div className="flex items-center gap-2">
          {revisionCount > 0 && (
            <span className="text-xs text-gray-400">
              Revision {revisionCount}
            </span>
          )}
          <span
            className={`text-sm font-bold ${
              critique.passed ? "text-green-600" : "text-red-500"
            }`}
          >
            {critique.score}/100
          </span>
        </div>
      </div>

      {critique.issues.length > 0 && (
        <div className="space-y-1">
          {critique.issues.map((issue, i) => (
            <div
              key={i}
              className="flex items-start gap-2 text-xs"
            >
              <span
                className={
                  issue.severity === "critical"
                    ? "text-red-500"
                    : issue.severity === "warning"
                      ? "text-amber-500"
                      : "text-gray-400"
                }
              >
                {issue.severity === "critical"
                  ? "●"
                  : issue.severity === "warning"
                    ? "▲"
                    : "ℹ"}
              </span>
              <span className="text-gray-600">
                <strong>{issue.field}:</strong> {issue.message}
              </span>
            </div>
          ))}
        </div>
      )}

      {critique.suggestions.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-500">Suggestions:</p>
          {critique.suggestions.map((s, i) => (
            <p key={i} className="text-xs text-gray-500 pl-2">
              → {s}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
