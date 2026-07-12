import axios from "axios";
import type { ApiResponse, RunResponse, ResumeResponse, RunStatus } from "@/types";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  headers: { "Content-Type": "application/json" },
});

export async function healthCheck(): Promise<ApiResponse> {
  const { data } = await api.get<ApiResponse>("/health");
  return data;
}

export async function startRun(
  goal: string,
  mode: "autonomous" | "hitl" = "autonomous"
): Promise<ApiResponse<RunResponse>> {
  const { data } = await api.post<ApiResponse<RunResponse>>("/agent/run", {
    goal,
    mode,
  });
  return data;
}

export async function resumeRun(
  runId: string,
  approved: boolean,
  feedback?: string
): Promise<ApiResponse<ResumeResponse>> {
  const { data } = await api.post<ApiResponse<ResumeResponse>>(
    `/agent/resume/${runId}`,
    { approved, feedback }
  );
  return data;
}

export async function getRunStatus(
  runId: string
): Promise<ApiResponse<RunStatus>> {
  const { data } = await api.get<ApiResponse<RunStatus>>(
    `/agent/run/${runId}`
  );
  return data;
}

/**
 * Open an SSE connection to receive real-time graph events.
 * Returns an EventSource that the caller must close.
 */
export function createSSEConnection(
  runId: string,
  onEvent: (event: import("@/types").SSEEvent) => void,
  onError?: (error: Event) => void
): EventSource {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || "/api";
  const es = new EventSource(`${baseUrl}/agent/events/${runId}`);

  es.onmessage = (msg) => {
    try {
      const event = JSON.parse(msg.data) as import("@/types").SSEEvent;
      onEvent(event);
    } catch {
      // ignore malformed events
    }
  };

  es.onerror = (err) => {
    onError?.(err);
  };

  return es;
}
