import type { AgentError, AgentStatus, CritiqueResult } from "../../types/index.js";

interface RouterState {
  critique: CritiqueResult;
  revisionCount: number;
  maxRevisionCount: number;
  approved: boolean;
  mode: "autonomous" | "hitl";
  status: AgentStatus;
  errors: AgentError[];
}

/**
 * Router Node
 * Determines the next step based on critique results, revision count,
 * and execution mode (autonomous vs HITL).
 *
 * Returns a routing decision string:
 * - "finalize": Critique passed, move to output
 * - "revise": Critique failed, revisions remaining → go back to writer
 * - "force_finalize": Max revisions reached, accept current draft
 * - "interrupt": HITL mode, pause for human approval
 */
export function routerNode(
  state: RouterState
): string {
  console.log("\n  Router — evaluating next step...");

  // HITL mode: interrupt if not yet approved
  if (state.mode === "hitl" && !state.approved) {
    console.log("  → HITL mode: interrupting for human approval");
    return "interrupt";
  }

  // Critique passed: finalize
  if (state.critique.passed) {
    console.log("   Critique passed: finalizing output");
    return "finalize";
  }

  // Critique failed but revisions remain: revise
  if (state.revisionCount < state.maxRevisionCount) {
    console.log(
      `   Critique failed: revising (attempt ${state.revisionCount + 1}/${state.maxRevisionCount})`
    );
    return "revise";
  }

  // Max revisions reached: force finalize
  console.warn(
    `  → Max revisions (${state.maxRevisionCount}) reached: force finalizing`
  );
  return "force_finalize";
}
