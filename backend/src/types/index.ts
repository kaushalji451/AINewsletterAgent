// Agent Status 
export type AgentStatus =
  | "idle"
  | "planning"
  | "researching"
  | "curating"
  | "summarizing"
  | "writing"
  | "critiquing"
  | "revising"
  | "awaiting_approval"
  | "completed"
  | "failed";

// Search Result (raw from Tavily) 
export interface SearchResult {
  title: string;
  url: string;
  content: string;
  score: number;
  publishedDate?: string;
}

// Curated Article (after filtering) 
export interface CuratedArticle {
  title: string;
  url: string;
  source: string;
  snippet: string;
  publishedDate?: string;
  relevanceScore: number;
}

// Article Summary
export interface ArticleSummary {
  title: string;
  source: string;
  url: string;
  date: string;
  summary: string;
}

// Critique Types 
export interface CritiqueIssue {
  field: string;
  severity: "critical" | "warning" | "info";
  message: string;
}

export interface CritiqueResult {
  passed: boolean;
  score: number;
  issues: CritiqueIssue[];
  suggestions: string[];
}

// Agent Error 
export interface AgentError {
  node: string;
  message: string;
  timestamp: string;
  recoverable: boolean;
}

// Newsletter State 
export interface NewsletterState {
  goal: string;
  mode: "autonomous" | "hitl";
  searchQueries: string[];
  searchResults: SearchResult[];
  curatedArticles: CuratedArticle[];
  summaries: ArticleSummary[];
  draftNewsletter: string;
  subjectLine: string;
  htmlOutput: string;
  markdownOutput: string;
  critique: CritiqueResult;
  revisionCount: number;
  maxRevisionCount: number;
  approved: boolean;
  status: AgentStatus;
  errors: AgentError[];
  finalNewsletter: string;
}

//  API Response 
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
