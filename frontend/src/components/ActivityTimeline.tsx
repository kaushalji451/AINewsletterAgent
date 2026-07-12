import type { TimelineEntry } from "@/types";

const STATUS_COLORS: Record<TimelineEntry["status"], string> = {
  running: "text-blue-600",
  complete: "text-green-600",
  error: "text-red-500",
  waiting: "text-amber-500",
};

interface Props {
  entries: TimelineEntry[];
}

export function ActivityTimeline({ entries }: Props) {
  if (entries.length === 0) {
    return (
      <div className="text-sm text-gray-400 py-4">
        Waiting for agent to start...
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {entries.map((entry) => (
        <div
          key={entry.id}
          className="flex items-center gap-3 py-1.5 px-3 rounded-md hover:bg-gray-50 transition-colors"
        >
          <span
            className={`text-sm font-medium ${STATUS_COLORS[entry.status]}`}
          >
            {entry.label}
          </span>
          {entry.type === "revision_start" && entry.data && (
            <span className="text-xs text-gray-400">
              #{String(entry.data.revisionCount)}
            </span>
          )}
          <span className="ml-auto text-xs text-gray-300">
            {new Date(entry.timestamp).toLocaleTimeString()}
          </span>
        </div>
      ))}
    </div>
  );
}
