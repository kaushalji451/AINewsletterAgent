import { callGroq } from "../../services/groq.js";
import { buildPlannerPrompt } from "../../prompts/planner.js";
import { extractJson, timestamp } from "../../utils/index.js";
import type { AgentError, AgentStatus } from "../../types/index.js";

interface PlannerState {
  goal: string;
  searchQueries: string[];
  status: AgentStatus;
  errors: AgentError[];
}

/**
 * Planner Node
 * Transforms a high-level goal into 3-5 targeted search queries
 * using Groq. Falls back to using the raw goal if parsing fails.
 */
export async function plannerNode(
  state: PlannerState
): Promise<Partial<PlannerState>> {
  console.log(`\n  Planner — generating search queries for: "${state.goal}"`);

  try {
    const prompt = buildPlannerPrompt(state.goal);
    const response = await callGroq(prompt);

    const queries = extractJson<string[]>(response);

    if (queries && Array.isArray(queries) && queries.length > 0) {
      console.log(`   Generated ${queries.length} search queries`);
      queries.forEach((q, i) => console.log(`    ${i + 1}. ${q}`));

      return {
        searchQueries: queries,
        status: "planning",
      };
    }

    // Fallback: use the raw goal as a single query
    console.warn("   Could not parse queries, using goal as single query");
    return {
      searchQueries: [state.goal],
      status: "planning",
    };
  } catch (error: unknown) {
    const err = error as Error;
    console.error(`  Planner failed: ${err.message}`);

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
