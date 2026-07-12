import { Annotation } from "@langchain/langgraph";
import { config } from "../config/index.js";
/**
 * LangGraph State Definition
 *
 * This is the central state object that flows through every node.
 * Each node reads from it and writes partial updates back.
 * LangGraph manages the merging of partial updates.
 */
export const NewsletterStateAnnotation = Annotation.Root({
    // ── INPUT ──────────────────────────────────────────────
    goal: Annotation({
        reducer: (_prev, next) => next,
        default: () => "",
    }),
    mode: Annotation({
        reducer: (_prev, next) => next,
        default: () => "autonomous",
    }),
    // ── PLANNER OUTPUT ────────────────────────────────────
    searchQueries: Annotation({
        reducer: (_prev, next) => next,
        default: () => [],
    }),
    // ── RESEARCHER OUTPUT ─────────────────────────────────
    searchResults: Annotation({
        reducer: (_prev, next) => next,
        default: () => [],
    }),
    // ── CURATOR OUTPUT ────────────────────────────────────
    curatedArticles: Annotation({
        reducer: (_prev, next) => next,
        default: () => [],
    }),
    // ── SUMMARIZER OUTPUT ─────────────────────────────────
    summaries: Annotation({
        reducer: (_prev, next) => next,
        default: () => [],
    }),
    // ── WRITER OUTPUT ─────────────────────────────────────
    draftNewsletter: Annotation({
        reducer: (_prev, next) => next,
        default: () => "",
    }),
    subjectLine: Annotation({
        reducer: (_prev, next) => next,
        default: () => "",
    }),
    htmlOutput: Annotation({
        reducer: (_prev, next) => next,
        default: () => "",
    }),
    markdownOutput: Annotation({
        reducer: (_prev, next) => next,
        default: () => "",
    }),
    // ── CRITIQUE OUTPUT ───────────────────────────────────
    critique: Annotation({
        reducer: (_prev, next) => next,
        default: () => ({
            passed: false,
            score: 0,
            issues: [],
            suggestions: [],
        }),
    }),
    revisionCount: Annotation({
        reducer: (_prev, next) => next,
        default: () => 0,
    }),
    maxRevisionCount: Annotation({
        reducer: (_prev, next) => next,
        default: () => config.agent.maxRevisions,
    }),
    // ── FLOW CONTROL ──────────────────────────────────────
    approved: Annotation({
        reducer: (_prev, next) => next,
        default: () => false,
    }),
    status: Annotation({
        reducer: (_prev, next) => next,
        default: () => "idle",
    }),
    errors: Annotation({
        reducer: (prev, next) => [...prev, ...next],
        default: () => [],
    }),
    // ── OUTPUT ────────────────────────────────────────────
    finalNewsletter: Annotation({
        reducer: (_prev, next) => next,
        default: () => "",
    }),
});
//# sourceMappingURL=state.js.map