import type { AgentStatus, AgentError, CritiqueResult } from "../../types/index.js";

interface FinalizeState {
  draftNewsletter: string;
  subjectLine: string;
  htmlOutput: string;
  markdownOutput: string;
  critique: CritiqueResult;
  status: AgentStatus;
  errors: AgentError[];
  finalNewsletter: string;
}

/**
 * Finalize Node
 * Sets the finalNewsletter field and marks the pipeline as completed.
 */
export function finalizeNode(state: FinalizeState): Partial<FinalizeState> {
  console.log("\n  Finalize — pipeline complete!");

  return {
    finalNewsletter: state.draftNewsletter,
    status: "completed" as AgentStatus,
  };
}

interface RevisionState {
  revisionCount: number;
  status: AgentStatus;
}

/**
 * Revision Node
 * Increments the revision counter and updates status.
 */
export function revisionNode(state: RevisionState): Partial<RevisionState> {
  const newCount = state.revisionCount + 1;
  console.log(`\n Revision ${newCount} — regenerating newsletter...`);

  return {
    revisionCount: newCount,
    status: "revising" as AgentStatus,
  };
}
