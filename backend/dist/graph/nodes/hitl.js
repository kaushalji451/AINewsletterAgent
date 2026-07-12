import { interrupt } from "@langchain/langgraph";
/**
 * HITL Node (Human-in-the-Loop)
 *
 * Placed after Writer, before Evaluate.
 * In autonomous mode: pass-through.
 * In HITL mode: calls interrupt() to pause the graph until human approves.
 *
 * When interrupted, the graph state is checkpointed.
 * To resume, the client calls POST /agent/resume with the runId.
 */
export function hitlNode(state) {
    if (state.mode === "hitl" && !state.approved) {
        console.log("\n⏸️  HITL — pausing for human approval...");
        const approval = interrupt({
            type: "approval_required",
            subjectLine: state.subjectLine,
            draftPreview: state.draftNewsletter.slice(0, 500),
        });
        // This runs after resume — the interrupt returns the resume value
        if (approval && typeof approval === "object" && "approved" in approval) {
            const a = approval;
            console.log(`  → Human ${a.approved ? "approved" : "rejected"} the draft`);
            return {
                approved: a.approved,
                status: "writing",
            };
        }
    }
    // Autonomous mode or already approved
    return {};
}
//# sourceMappingURL=hitl.js.map