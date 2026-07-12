import { Annotation } from "@langchain/langgraph";
import type {
  AgentStatus,
  SearchResult,
  CuratedArticle,
  ArticleSummary,
  CritiqueResult,
  AgentError,
} from "../types/index.js";
import { config } from "../config/index.js";

/**
 * LangGraph State Definition
 *
 * This is the central state object that flows through every node.
 * Each node reads from it and writes partial updates back.
 * LangGraph manages the merging of partial updates.
 */
export const NewsletterStateAnnotation = Annotation.Root({
  // INPUT 
  goal: Annotation<string>({
    reducer: (_prev, next) => next,
    default: () => "",
  }),

  mode: Annotation<"autonomous" | "hitl">({
    reducer: (_prev, next) => next,
    default: () => "autonomous",
  }),

  // PLANNER OUTPUT 
  searchQueries: Annotation<string[]>({
    reducer: (_prev, next) => next,
    default: () => [],
  }),

  //  RESEARCHER OUTPUT 
  searchResults: Annotation<SearchResult[]>({
    reducer: (_prev, next) => next,
    default: () => [],
  }),

  //  CURATOR OUTPUT 
  curatedArticles: Annotation<CuratedArticle[]>({
    reducer: (_prev, next) => next,
    default: () => [],
  }),

  // SUMMARIZER OUTPUT 
  summaries: Annotation<ArticleSummary[]>({
    reducer: (_prev, next) => next,
    default: () => [],
  }),

  // WRITER OUTPUT 
  draftNewsletter: Annotation<string>({
    reducer: (_prev, next) => next,
    default: () => "",
  }),

  subjectLine: Annotation<string>({
    reducer: (_prev, next) => next,
    default: () => "",
  }),

  htmlOutput: Annotation<string>({
    reducer: (_prev, next) => next,
    default: () => "",
  }),

  markdownOutput: Annotation<string>({
    reducer: (_prev, next) => next,
    default: () => "",
  }),

  // CRITIQUE OUTPUT 
  critique: Annotation<CritiqueResult>({
    reducer: (_prev, next) => next,
    default: () => ({
      passed: false,
      score: 0,
      issues: [],
      suggestions: [],
    }),
  }),

  revisionCount: Annotation<number>({
    reducer: (_prev, next) => next,
    default: () => 0,
  }),

  maxRevisionCount: Annotation<number>({
    reducer: (_prev, next) => next,
    default: () => config.agent.maxRevisions,
  }),

  // FLOW CONTROL 
  approved: Annotation<boolean>({
    reducer: (_prev, next) => next,
    default: () => false,
  }),

  status: Annotation<AgentStatus>({
    reducer: (_prev, next) => next,
    default: () => "idle" as AgentStatus,
  }),

  errors: Annotation<AgentError[]>({
    reducer: (prev, next) => [...prev, ...next],
    default: () => [],
  }),

  //  OUTPUT 
  finalNewsletter: Annotation<string>({
    reducer: (_prev, next) => next,
    default: () => "",
  }),
});
