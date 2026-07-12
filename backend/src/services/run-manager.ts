import type { Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { createNewsletterGraph } from "../graph/graph.js";
import type { NewsletterState, AgentStatus } from "../types/index.js";

// SSE Event Types 
export interface SSEEvent {
  type:
    | "node_start"
    | "node_complete"
    | "status_change"
    | "error"
    | "completed"
    | "awaiting_approval"
    | "revision_start";
  node?: string;
  status?: AgentStatus;
  message?: string;
  data?: unknown;
  timestamp: string;
}

// Run State 
export interface Run {
  runId: string;
  threadId: string;
  goal: string;
  mode: "autonomous" | "hitl";
  status: "running" | "awaiting_approval" | "completed" | "failed";
  sseClients: Set<Response>;
  result?: NewsletterState;
  error?: string;
  startedAt: string;
  completedAt?: string;
}

//  Node name → human-readable label mapping 
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

/**
 * RunManager
 *
 * Manages concurrent graph runs and SSE client connections.
 * Each run gets a unique runId and threadId for checkpointing.
 */
class RunManager {
  private runs = new Map<string, Run>();
  private graph = createNewsletterGraph();

  /**
   * Start a new agent run.
   * Returns the runId immediately. The graph executes asynchronously.
   */
  async startRun(
    goal: string,
    mode: "autonomous" | "hitl" = "autonomous"
  ): Promise<string> {
    const runId = uuidv4();
    const threadId = uuidv4();

    const run: Run = {
      runId,
      threadId,
      goal,
      mode,
      status: "running",
      sseClients: new Set(),
      startedAt: new Date().toISOString(),
    };

    this.runs.set(runId, run);

    // Execute graph asynchronously
    this.executeGraph(run).catch((err) => {
      console.error(`\n Run ${runId} failed:`, err);
      run.status = "failed";
      run.error = err instanceof Error ? err.message : String(err);
      run.completedAt = new Date().toISOString();
      this.emitEvent(run, {
        type: "error",
        message: run.error,
        timestamp: new Date().toISOString(),
      });
    });

    return runId;
  }

  /**
   * Resume a paused run after HITL approval.
   */
  async resumeRun(
    runId: string,
    approved: boolean,
    feedback?: string
  ): Promise<boolean> {
    const run = this.runs.get(runId);
    if (!run) return false;
    if (run.status !== "awaiting_approval") return false;

    run.status = "running";

    this.emitEvent(run, {
      type: "status_change",
      status: "writing",
      message: approved ? "Approved — continuing..." : "Changes requested — revising...",
      timestamp: new Date().toISOString(),
    });

    // Resume graph with Command
    try {
      const { Command } = await import("@langchain/langgraph");
      const result = await this.graph.invoke(
        new Command({
          resume: { approved, feedback },
        }),
        { configurable: { thread_id: run.threadId } }
      );

      run.result = result as NewsletterState;
      run.status = "completed";
      run.completedAt = new Date().toISOString();

      this.emitEvent(run, {
        type: "completed",
        data: {
          subjectLine: result.subjectLine,
          htmlOutput: result.htmlOutput,
          markdownOutput: result.markdownOutput,
          critique: result.critique,
          revisionCount: result.revisionCount,
        },
        timestamp: new Date().toISOString(),
      });

      return true;
    } catch (err) {
      run.status = "failed";
      run.error = err instanceof Error ? err.message : String(err);
      run.completedAt = new Date().toISOString();
      this.emitEvent(run, {
        type: "error",
        message: run.error,
        timestamp: new Date().toISOString(),
      });
      return false;
    }
  }

  /**
   * Add an SSE client connection to a run.
   */
  addSSEClient(runId: string, res: Response): boolean {
    const run = this.runs.get(runId);
    if (!run) return false;

    run.sseClients.add(res);

    // Send current state immediately
    this.emitEvent(run, {
      type: "status_change",
      status: run.status === "running" ? "planning" : (run.status as unknown as AgentStatus),
      message: `Connected — status: ${run.status}`,
      timestamp: new Date().toISOString(),
    });

    // Clean up on disconnect
    res.on("close", () => {
      run.sseClients.delete(res);
    });

    return true;
  }

  /**
   * Get run info.
   */
  getRun(runId: string): Run | undefined {
    return this.runs.get(runId);
  }

  /**
   * Get all runs (for debugging).
   */
  getAllRuns(): Run[] {
    return Array.from(this.runs.values());
  }

  // Private Methods 

  /**
   * Execute the graph with streaming to emit SSE events.
   */
  private async executeGraph(run: Run): Promise<void> {
    const initialState = {
      goal: run.goal,
      mode: run.mode,
      searchQueries: [],
      searchResults: [],
      curatedArticles: [],
      summaries: [],
      draftNewsletter: "",
      subjectLine: "",
      htmlOutput: "",
      markdownOutput: "",
      critique: { passed: false, score: 0, issues: [], suggestions: [] },
      revisionCount: 0,
      maxRevisionCount: 2,
      approved: run.mode === "autonomous",
      status: "idle" as AgentStatus,
      errors: [],
      finalNewsletter: "",
    };

    // Use stream to get step-by-step updates
    const stream = await this.graph.stream(initialState, {
      configurable: { thread_id: run.threadId },
      streamMode: "updates",
    });

    let lastNode = "";

    for await (const chunk of stream) {
      // chunk is Record<nodeName, stateUpdate>
      for (const [nodeName, stateUpdate] of Object.entries(chunk)) {
        if (nodeName === "__end__") continue;

        // Skip hitl node events in autonomous mode — it's a pass-through
        if (nodeName === "hitl" && run.mode === "autonomous") {
          lastNode = nodeName;
          continue;
        }

        const state = stateUpdate as Record<string, unknown>;
        const label = NODE_LABELS[nodeName] || nodeName;

        // Emit node start
        if (nodeName !== lastNode) {
          this.emitEvent(run, {
            type: "node_start",
            node: nodeName,
            status: (state.status as AgentStatus) || undefined,
            message: `${label}...`,
            timestamp: new Date().toISOString(),
          });
        }

        // Emit node complete
        this.emitEvent(run, {
          type: "node_complete",
          node: nodeName,
          status: (state.status as AgentStatus) || undefined,
          message: `${label} complete`,
          timestamp: new Date().toISOString(),
        });

        lastNode = nodeName;

        // Check if HITL interrupted (status = awaiting_approval)
        if (state.status === "awaiting_approval") {
          run.status = "awaiting_approval";
          this.emitEvent(run, {
            type: "awaiting_approval",
            data: {
              subjectLine: state.subjectLine,
              draftPreview: (state.draftNewsletter as string)?.slice(0, 500),
            },
            timestamp: new Date().toISOString(),
          });
          return; // Stop streaming — graph is paused
        }

        // LangGraph yields __interrupt__ when interrupt() fires in a node
        if (nodeName === "__interrupt__") {
          const snapshot = await this.graph.getState({
            configurable: { thread_id: run.threadId },
          });
          const values = snapshot.values as NewsletterState;
          run.status = "awaiting_approval";
          console.log(`\n  Run ${run.runId} — HITL interrupt detected, awaiting approval`);
          this.emitEvent(run, {
            type: "awaiting_approval",
            data: {
              subjectLine: values.subjectLine,
              draftPreview: (values.draftNewsletter as string)?.slice(0, 500),
            },
            timestamp: new Date().toISOString(),
          });
          return;
        }

        // Check for revision
        if (nodeName === "revision") {
          this.emitEvent(run, {
            type: "revision_start",
            data: { revisionCount: state.revisionCount },
            message: `Revision ${(state.revisionCount as number) + 1} starting...`,
            timestamp: new Date().toISOString(),
          });
        }
      }
    }

    // Fetch graph state to determine if interrupted or completed
    const snapshot = await this.graph.getState({
      configurable: { thread_id: run.threadId },
    });

    // Check if graph has pending interrupts (paused by hitl node)
    const hasInterrupt = snapshot.tasks?.some(
      (t: { interrupts?: unknown[] }) => t.interrupts && t.interrupts.length > 0
    );

    if (run.status === "running" && hasInterrupt) {
      const values = snapshot.values as NewsletterState;
      run.status = "awaiting_approval";
      console.log(`\n  Run ${run.runId} — HITL interrupt detected, awaiting approval`);
      this.emitEvent(run, {
        type: "awaiting_approval",
        data: {
          subjectLine: values.subjectLine,
          draftPreview: (values.draftNewsletter as string)?.slice(0, 500),
        },
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Graph completed normally
    const result = snapshot.values as NewsletterState;
    run.result = result;
    run.status = "completed";
    run.completedAt = new Date().toISOString();

    this.emitEvent(run, {
      type: "completed",
      data: {
        subjectLine: result.subjectLine,
        htmlOutput: result.htmlOutput,
        markdownOutput: result.markdownOutput,
        critique: result.critique,
        revisionCount: result.revisionCount,
        finalNewsletter: result.finalNewsletter,
      },
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Send an SSE event to all connected clients.
   */
  private emitEvent(run: Run, event: SSEEvent): void {
    const data = `data: ${JSON.stringify(event)}\n\n`;

    for (const client of run.sseClients) {
      try {
        client.write(data);
      } catch {
        run.sseClients.delete(client);
      }
    }
  }
}

// Singleton
export const runManager = new RunManager();
