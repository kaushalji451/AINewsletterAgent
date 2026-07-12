import { searchAllQueries } from "../../services/tavily.js";
import { config } from "../../config/index.js";
import { timestamp } from "../../utils/index.js";
import type { AgentError, AgentStatus, SearchResult } from "../../types/index.js";

interface ResearcherState {
  searchQueries: string[];
  searchResults: SearchResult[];
  status: AgentStatus;
  errors: AgentError[];
}

/**
 * Researcher Node
 * Executes search queries against Tavily and aggregates results.
 * Deduplicates by URL and sorts by relevance score.
 */
export async function researcherNode(
  state: ResearcherState
): Promise<Partial<ResearcherState>> {
  console.log(`\n  Researcher — searching ${state.searchQueries.length} queries...`);

  try {
    const results = await searchAllQueries(
      state.searchQueries,
      5,
      config.agent.maxSearchResults
    );

    console.log(`   Found ${results.length} unique results`);

    if (results.length === 0) {
      console.warn("   No search results found — pipeline will continue with empty results");
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
  } catch (error: unknown) {
    const err = error as Error;
    console.error(`  Researcher failed: ${err.message}`);

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
