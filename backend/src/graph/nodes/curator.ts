import { callGroq } from "../../services/groq.js";
import { buildCuratorPrompt } from "../../prompts/curator.js";
import { extractJson, timestamp } from "../../utils/index.js";
import { config } from "../../config/index.js";
import type {
  AgentError,
  AgentStatus,
  SearchResult,
  CuratedArticle,
} from "../../types/index.js";

interface CuratorState {
  goal: string;
  searchResults: SearchResult[];
  curatedArticles: CuratedArticle[];
  status: AgentStatus;
  errors: AgentError[];
}

/**
 * Curator Node
 * Filters, deduplicates, and ranks search results using Groq.
 * Selects the best 5-7 articles for the newsletter.
 */
export async function curatorNode(
  state: CuratorState
): Promise<Partial<CuratorState>> {
  console.log(`\ Curator — filtering ${state.searchResults.length} results...`);

  // Handle empty search results
  if (state.searchResults.length === 0) {
    console.warn("  No results to curate");
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
    const trimmedResults = state.searchResults.map((r) => ({
      ...r,
      content: r.content.slice(0, 100),
    }));
    const resultsJson = JSON.stringify(trimmedResults, null, 2);
    const prompt = buildCuratorPrompt(state.goal, resultsJson);
    const response = await callGroq(prompt);

    const articles = extractJson<CuratedArticle[]>(response);

    if (
      articles &&
      Array.isArray(articles) &&
      articles.length >= config.agent.minCuratedArticles
    ) {
      const capped = articles.slice(0, config.agent.maxCuratedArticles);
      console.log(`  ✓ Selected ${capped.length} articles`);
      capped.forEach((a, i) =>
        console.log(`    ${i + 1}. [${a.source}] ${a.title}`)
      );

      return {
        curatedArticles: capped,
        status: "curating",
      };
    }

    // Fallback: heuristic top-7 by Tavily score
    console.warn("  Groq curation failed, using heuristic fallback");
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
  } catch (error: unknown) {
    const err = error as Error;
    console.error(`  Curator failed: ${err.message}`);

    // Heuristic fallback
    const fallback = state.searchResults
      .slice(0, config.agent.maxCuratedArticles)
      .map((r) => ({
        title: r.title,
        url: r.url,
        source: (() => {
          try {
            return new URL(r.url).hostname.replace("www.", "");
          } catch {
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
