import { callGroq } from "../../services/groq.js";
import { buildSummarizerPrompt } from "../../prompts/summarizer.js";
import { extractJson, timestamp } from "../../utils/index.js";
import type {
  AgentError,
  AgentStatus,
  CuratedArticle,
  ArticleSummary,
} from "../../types/index.js";

interface SummarizerState {
  curatedArticles: CuratedArticle[];
  summaries: ArticleSummary[];
  status: AgentStatus;
  errors: AgentError[];
}

/**
 * Summarizer Node
 * Generates concise, structured summaries of each curated article.
 * Uses batch prompting (single API call) for efficiency.
 */
export async function summarizerNode(
  state: SummarizerState
): Promise<Partial<SummarizerState>> {
  console.log(`\n  Summarizer — summarizing ${state.curatedArticles.length} articles...`);

  if (state.curatedArticles.length === 0) {
    console.warn("   No articles to summarize");
    return {
      summaries: [],
      status: "summarizing",
    };
  }

  try {
    const articlesJson = JSON.stringify(state.curatedArticles, null, 2);
    const prompt = buildSummarizerPrompt(articlesJson);
    const response = await callGroq(prompt);

    const summaries = extractJson<ArticleSummary[]>(response);

    if (summaries && Array.isArray(summaries) && summaries.length > 0) {
      console.log(`   Generated ${summaries.length} summaries`);
      summaries.forEach((s, i) =>
        console.log(`    ${i + 1}. ${s.title.slice(0, 60)}...`)
      );

      return {
        summaries,
        status: "summarizing",
      };
    }

    // Fallback: use raw snippets as summaries
    console.warn("   Could not parse summaries, using raw snippets");
    const fallback = state.curatedArticles.map((a) => ({
      title: a.title,
      source: a.source,
      url: a.url,
      date: a.publishedDate || "",
      summary: a.snippet,
    }));

    return {
      summaries: fallback,
      status: "summarizing",
    };
  } catch (error: unknown) {
    const err = error as Error;
    console.error(`  Summarizer failed: ${err.message}`);

    const fallback = state.curatedArticles.map((a) => ({
      title: a.title,
      source: a.source,
      url: a.url,
      date: a.publishedDate || "",
      summary: a.snippet,
    }));

    return {
      summaries: fallback,
      status: "summarizing",
      errors: [
        ...state.errors,
        {
          node: "summarizer",
          message: err.message,
          timestamp: timestamp(),
          recoverable: true,
        },
      ],
    };
  }
}
