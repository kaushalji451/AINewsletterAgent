export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface RunResponse {
  runId: string;
  status: string;
  mode: string;
  message: string;
}

export interface ResumeResponse {
  runId: string;
  status: string;
  approved: boolean;
}

export interface RunStatus {
  runId: string;
  goal: string;
  mode: string;
  status: "running" | "awaiting_approval" | "completed" | "failed";
  result?: {
    subjectLine: string;
    htmlOutput: string;
    markdownOutput: string;
    critique: CritiqueResult;
    revisionCount: number;
    finalNewsletter: string;
  };
  error?: string;
  startedAt: string;
  completedAt?: string;
}

export interface CritiqueResult {
  passed: boolean;
  score: number;
  issues: CritiqueIssue[];
  suggestions: string[];
}

export interface CritiqueIssue {
  field: string;
  severity: "critical" | "warning" | "info";
  message: string;
}

export interface SSEEvent {
  type:
    | "connected"
    | "node_start"
    | "node_complete"
    | "status_change"
    | "error"
    | "completed"
    | "awaiting_approval"
    | "revision_start";
  node?: string;
  status?: string;
  message?: string;
  data?: Record<string, unknown>;
  timestamp: string;
}

export interface TimelineEntry {
  id: string;
  type: SSEEvent["type"];
  node?: string;
  label: string;
  status: "running" | "complete" | "error" | "waiting";
  timestamp: string;
  data?: Record<string, unknown>;
}
