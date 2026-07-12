import { callGemini } from "../../services/gemini.js";
import { buildCritiquePrompt } from "../../prompts/critique.js";
import { extractJson, timestamp } from "../../utils/index.js";
/**
 * Critique Node
 * Evaluates the newsletter quality against 8 explicit criteria.
 * Returns a structured assessment with score and issues.
 */
export async function critiqueNode(state) {
    console.log("\n🔎 Critique — evaluating newsletter quality...");
    if (!state.draftNewsletter) {
        console.warn("  ⚠ No newsletter to critique");
        return {
            critique: {
                passed: false,
                score: 0,
                issues: [
                    {
                        field: "newsletter",
                        severity: "critical",
                        message: "No newsletter content to evaluate",
                    },
                ],
                suggestions: [],
            },
            status: "critiquing",
        };
    }
    try {
        const prompt = buildCritiquePrompt(state.draftNewsletter, state.subjectLine, state.summaries.length);
        const response = await callGemini(prompt);
        const result = extractJson(response);
        if (result && typeof result.passed === "boolean" && typeof result.score === "number") {
            const status = result.passed ? "✅ PASSED" : "❌ FAILED";
            console.log(`  ${status} Score: ${result.score}/100`);
            if (result.issues.length > 0) {
                console.log(`  Issues (${result.issues.length}):`);
                result.issues.forEach((i) => console.log(`    [${i.severity}] ${i.field}: ${i.message}`));
            }
            if (result.suggestions.length > 0) {
                console.log(`  Suggestions (${result.suggestions.length}):`);
                result.suggestions.forEach((s) => console.log(`    → ${s}`));
            }
            return {
                critique: result,
                status: "critiquing",
            };
        }
        // Fallback: default to passed (don't block on critique failure)
        console.warn("  ⚠ Could not parse critique, defaulting to passed");
        return {
            critique: {
                passed: true,
                score: 80,
                issues: [],
                suggestions: ["Critique parsing failed — defaulting to pass"],
            },
            status: "critiquing",
        };
    }
    catch (error) {
        const err = error;
        console.error(`  ✗ Critique failed: ${err.message}`);
        // Default to passed on error
        return {
            critique: {
                passed: true,
                score: 80,
                issues: [],
                suggestions: [`Critique error: ${err.message}`],
            },
            status: "critiquing",
            errors: [
                ...state.errors,
                {
                    node: "critique",
                    message: err.message,
                    timestamp: timestamp(),
                    recoverable: true,
                },
            ],
        };
    }
}
//# sourceMappingURL=critique.js.map