import { callGemini } from "../../services/gemini.js";
import { buildCuratorPrompt } from "../../prompts/curator.js";
import { extractJson, timestamp } from "../../utils/index.js";
import { config } from "../../config/index.js";
/**
 * Curator Node
 * Filters, deduplicates, and ranks search results using Gemini.
 * Selects the best 5-7 articles for the newsletter.
 */
export async function curatorNode(state) {
    console.log(`\n📰 Curator — filtering ${state.searchResults.length} results...`);
    // Handle empty search results
    if (state.searchResults.length === 0) {
        console.warn("  ⚠ No results to curate");
        return {
            curatedArticles: [],
            status: "curating",
            errors: [
                ...state.errors,
                {
                    node: "curator",
                    message: "No search results available for curation",
                    timestamp: timestamp(),
                    recoverable: true,
                },
            ],
        };
    }
    try {
        const resultsJson = JSON.stringify(state.searchResults, null, 2);
        const prompt = buildCuratorPrompt(state.goal, resultsJson);
        const response = await callGemini(prompt);
        const articles = extractJson(response);
        if (articles &&
            Array.isArray(articles) &&
            articles.length >= config.agent.minCuratedArticles) {
            const capped = articles.slice(0, config.agent.maxCuratedArticles);
            console.log(`  ✓ Selected ${capped.length} articles`);
            capped.forEach((a, i) => console.log(`    ${i + 1}. [${a.source}] ${a.title}`));
            return {
                curatedArticles: capped,
                status: "curating",
            };
        }
        // Fallback: heuristic top-7 by Tavily score
        console.warn("  ⚠ Gemini curation failed, using heuristic fallback");
        const fallback = state.searchResults
            .slice(0, config.agent.maxCuratedArticles)
            .map((r) => ({
            title: r.title,
            url: r.url,
            source: new URL(r.url).hostname.replace("www.", ""),
            snippet: r.content.slice(0, 300),
            publishedDate: r.publishedDate || "",
            relevanceScore: r.score,
        }));
        return {
            curatedArticles: fallback,
            status: "curating",
        };
    }
    catch (error) {
        const err = error;
        console.error(`  ✗ Curator failed: ${err.message}`);
        // Heuristic fallback
        const fallback = state.searchResults
            .slice(0, config.agent.maxCuratedArticles)
            .map((r) => ({
            title: r.title,
            url: r.url,
            source: (() => {
                try {
                    return new URL(r.url).hostname.replace("www.", "");
                }
                catch {
                    return "unknown";
                }
            })(),
            snippet: r.content.slice(0, 300),
            publishedDate: r.publishedDate || "",
            relevanceScore: r.score,
        }));
        return {
            curatedArticles: fallback,
            status: "curating",
            errors: [
                ...state.errors,
                {
                    node: "curator",
                    message: err.message,
                    timestamp: timestamp(),
                    recoverable: true,
                },
            ],
        };
    }
}
//# sourceMappingURL=curator.js.map