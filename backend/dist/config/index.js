import dotenv from "dotenv";
dotenv.config();
export const config = {
    port: parseInt(process.env.PORT || "3001", 10),
    nodeEnv: process.env.NODE_ENV || "development",
    corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",
    gemini: {
        apiKey: process.env.GEMINI_API_KEY || "",
        model: process.env.GEMINI_MODEL || "gemini-2.0-flash",
    },
    tavily: {
        apiKey: process.env.TAVILY_API_KEY || "",
    },
    agent: {
        maxRevisions: 2,
        maxSearchResults: 20,
        minCuratedArticles: 5,
        maxCuratedArticles: 7,
        critiquePassScore: 70,
    },
};
//# sourceMappingURL=index.js.map