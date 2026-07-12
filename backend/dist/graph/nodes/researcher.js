import { searchAllQueries } from "../../services/tavily.js";
import { config } from "../../config/index.js";
import { timestamp } from "../../utils/index.js";
/**
 * Researcher Node
 * Executes search queries against Tavily and aggregates results.
 * Deduplicates by URL and sorts by relevance score.
 */
export async function researcherNode(state) {
    console.log(`\n🔍 Researcher — searching ${state.searchQueries.length} queries...`);
    try {
        const results = await searchAllQueries(state.searchQueries, 5, config.agent.maxSearchResults);
        console.log(`  ✓ Found ${results.length} unique results`);
        if (results.length === 0) {
            console.warn("  ⚠ No search results found — pipeline will continue with empty results");
            return {
                searchResults: [],
                status: "researching",
                errors: [
                    ...state.errors,
                    {
                        node: "researcher",
                        message: "No search results found for any query",
                        timestamp: timestamp(),
                        recoverable: true,
                    },
                ],
            };
        }
        return {
            searchResults: results,
            status: "researching",
        };
    }
    catch (error) {
        const err = error;
        console.error(`  ✗ Researcher failed: ${err.message}`);
        return {
            searchResults: [],
            status: "researching",
            errors: [
                ...state.errors,
                {
                    node: "researcher",
                    message: err.message,
                    timestamp: timestamp(),
                    recoverable: true,
                },
            ],
        };
    }
}
//# sourceMappingURL=researcher.js.map