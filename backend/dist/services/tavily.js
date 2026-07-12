import { tavily } from "@tavily/core";
import { config } from "../config/index.js";
let clientInstance = null;
/**
 * Returns a singleton Tavily client.
 */
function getTavilyClient() {
    if (!clientInstance) {
        clientInstance = tavily({ apiKey: config.tavily.apiKey });
    }
    return clientInstance;
}
/**
 * Searches Tavily with a single query.
 * Returns raw search results.
 */
export async function searchTavily(query, maxResults = 5) {
    const client = getTavilyClient();
    try {
        const response = await client.search(query, {
            searchDepth: "advanced",
            maxResults,
            includeAnswer: false,
        });
        return (response.results || []).map((r) => ({
            title: r.title || "",
            url: r.url || "",
            content: r.content || "",
            score: r.score || 0,
            publishedDate: r.publishedDate || undefined,
        }));
    }
    catch (error) {
        const err = error;
        console.error(`  ✗ Tavily search failed for "${query}": ${err.message}`);
        return [];
    }
}
/**
 * Executes multiple search queries against Tavily.
 * Aggregates, deduplicates by URL, and sorts by score.
 */
export async function searchAllQueries(queries, maxResultsPerQuery = 5, maxTotal = 20) {
    const allResults = [];
    for (const query of queries) {
        const results = await searchTavily(query, maxResultsPerQuery);
        allResults.push(...results);
    }
    // Deduplicate by URL
    const seen = new Set();
    const unique = allResults.filter((r) => {
        if (seen.has(r.url))
            return false;
        seen.add(r.url);
        return true;
    });
    // Sort by score descending and cap
    unique.sort((a, b) => b.score - a.score);
    return unique.slice(0, maxTotal);
}
//# sourceMappingURL=tavily.js.map