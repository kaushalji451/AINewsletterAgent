import { useState, useEffect, useRef, useCallback } from "react";
import { createSSEConnection } from "@/api/client";
import type { SSEEvent, TimelineEntry } from "@/types";

const NODE_LABELS: Record<string, string> = {
  planner: "Planning",
  researcher: "Researching",
  curator: "Curating",
  summarizer: "Summarizing",
  writer: "Writing",
  hitl: "Awaiting Approval",
  evaluate: "Critiquing",
  revision: "Revising",
  finalize: "Finalizing",
};

export function useSSE(runId: string | null) {
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [latestEvent, setLatestEvent] = useState<SSEEvent | null>(null);
  const [connected, setConnected] = useState(false);
  const esRef = useRef<EventSource | null>(null);

  const addEntry = useCallback(
    (event: SSEEvent) => {
      setLatestEvent(event);

      if (event.type === "connected") {
        setConnected(true);
        return;
      }

      const label =
        (event.node && NODE_LABELS[event.node]) || event.message || event.type;

      let status: TimelineEntry["status"] = "running";
      if (event.type === "node_complete") status = "complete";
      else if (event.type === "error") status = "error";
      else if (event.type === "awaiting_approval") status = "waiting";
      else if (event.type === "completed") status = "complete";
      else if (event.type === "revision_start") status = "running";

      const entry: TimelineEntry = {
        id: `${event.type}-${event.node || ""}-${Date.now()}`,
        type: event.type,
        node: event.node,
        label,
        status,
        timestamp: event.timestamp,
        data: event.data as Record<string, unknown> | undefined,
      };

      setTimeline((prev) => {
        // Avoid duplicate node_complete after node_start for same node
        if (
          event.type === "node_complete" &&
          prev.some(
            (e) => e.node === event.node && e.type === "node_complete"
          )
        ) {
          return prev;
        }
        return [...prev, entry];
      });
    },
    []
  );

  useEffect(() => {
    if (!runId) return;

    setTimeline([]);
    setLatestEvent(null);
    setConnected(false);

    const es = createSSEConnection(runId, addEntry, () => {
      setConnected(false);
    });

    esRef.current = es;

    return () => {
      es.close();
      esRef.current = null;
    };
  }, [runId, addEntry]);

  const reset = useCallback(() => {
    setTimeline([]);
    setLatestEvent(null);
    setConnected(false);
    if (esRef.current) {
      esRef.current.close();
      esRef.current = null;
    }
  }, []);

  return { timeline, latestEvent, connected, reset };
}
