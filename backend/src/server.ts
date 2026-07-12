import app from "./app.js";
import { config } from "./config/index.js";

const server = app.listen(config.port, () => {
  console.log("  AI Newsletter Agent — API Server");
  console.log(`  URL:   http://localhost:${config.port}`);
  console.log(`  Mode:  ${config.nodeEnv}`);
  console.log("  Endpoints:");
  console.log("    GET  /api/health");
  console.log("    POST /api/agent/run");
  console.log("    POST /api/agent/resume/:runId");
  console.log("    GET  /api/agent/events/:runId  (SSE)");
  console.log("    GET  /api/agent/run/:runId");
});

process.on("SIGTERM", () => {
  console.log("\nSIGTERM received. Shutting down gracefully.");
  server.close(() => process.exit(0));
});

process.on("SIGINT", () => {
  console.log("\nSIGINT received. Shutting down gracefully.");
  server.close(() => process.exit(0));
});
