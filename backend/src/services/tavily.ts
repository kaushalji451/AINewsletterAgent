import { tavily } from "@tavily/core";
import { config } from "../config/index.js";
import type { SearchResult } from "../types/index.js";

let clientInstance: ReturnType<typeof tavily> | null = null;

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
export async function searchTavily(
  query: string,
  maxResults = 5
): Promise<SearchResult[]> {
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
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error(`  ✗ Tavily search failed for "${query}": ${err.message}`);
    return [];
  }
}

/**
 * Executes multiple search queries against Tavily.
 * Aggregates, deduplicates by URL, and sorts by score.
 */
export async function searchAllQueries(
  queries: string[],
  maxResultsPerQuery = 5,
  maxTotal = 20
): Promise<SearchResult[]> {
  const allResults: SearchResult[] = [];

  for (const query of queries) {
    const results = await searchTavily(query, maxResultsPerQuery);
    allResults.push(...results);
  }

  // Deduplicate by URL
  const seen = new Set<string>();
  const unique = allResults.filter((r) => {
    if (seen.has(r.url)) return false;
    seen.add(r.url);
    return true;
  });

  // Sort by score descending and cap
  unique.sort((a, b) => b.score - a.score);
  return unique.slice(0, maxTotal);
}
