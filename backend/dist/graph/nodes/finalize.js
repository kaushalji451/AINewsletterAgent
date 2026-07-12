/**
 * Finalize Node
 * Sets the finalNewsletter field and marks the pipeline as completed.
 */
export function finalizeNode(state) {
    console.log("\n✅ Finalize — pipeline complete!");
    return {
        finalNewsletter: state.draftNewsletter,
        status: "completed",
    };
}
/**
 * Revision Node
 * Increments the revision counter and updates status.
 */
export function revisionNode(state) {
    const newCount = state.revisionCount + 1;
    console.log(`\n🔄 Revision ${newCount} — regenerating newsletter...`);
    return {
        revisionCount: newCount,
        status: "revising",
    };
}
//# sourceMappingURL=finalize.js.map