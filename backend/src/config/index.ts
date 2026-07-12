import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || "3001", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",
  groq: {
    apiKey: process.env.GROQ_API_KEY || "",
    model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
  },
  tavily: {
    apiKey: process.env.TAVILY_API_KEY || "",
  },
  agent: {
    maxRevisions: 2,
    maxSearchResults: 10,
    minCuratedArticles: 5,
    maxCuratedArticles: 5,
    critiquePassScore: 70,
  },
} as const;
