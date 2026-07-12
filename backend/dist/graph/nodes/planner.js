import { callGemini } from "../../services/gemini.js";
import { buildPlannerPrompt } from "../../prompts/planner.js";
import { extractJson, timestamp } from "../../utils/index.js";
/**
 * Planner Node
 * Transforms a high-level goal into 3-5 targeted search queries
 * using Gemini. Falls back to using the raw goal if parsing fails.
 */
export async function plannerNode(state) {
    console.log(`\n📋 Planner — generating search queries for: "${state.goal}"`);
    try {
        const prompt = buildPlannerPrompt(state.goal);
        const response = await callGemini(prompt);
        const queries = extractJson(response);
        if (queries && Array.isArray(queries) && queries.length > 0) {
            console.log(`  ✓ Generated ${queries.length} search queries`);
            queries.forEach((q, i) => console.log(`    ${i + 1}. ${q}`));
            return {
                searchQueries: queries,
                status: "planning",
            };
        }
        // Fallback: use the raw goal as a single query
        console.warn("  ⚠ Could not parse queries, using goal as single query");
        return {
            searchQueries: [state.goal],
            status: "planning",
        };
    }
    catch (error) {
        const err = error;
        console.error(`  ✗ Planner failed: ${err.message}`);
        // Fatal: we can't search without queries
        return {
            searchQueries: [state.goal],
            status: "planning",
            errors: [
                ...state.errors,
                {
                    node: "planner",
                    message: err.message,
                    timestamp: timestamp(),
                    recoverable: false,
                },
            ],
        };
    }
}
//# sourceMappingURL=planner.js.map