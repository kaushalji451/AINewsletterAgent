/**
 * Standalone Agent Runner
 *
 * Executes the Newsletter Agent graph directly from the command line.
 * Usage: npx tsx src/agent.ts "your topic here"
 *    or: npm run agent -- "your topic here"
 *
 * This script does NOT start an Express server.
 * It runs the graph, logs each node's progress, and exits.
 */

import { createNewsletterGraph } from "./graph/graph.js";
import { config } from "./config/index.js";

const DEFAULT_GOAL =
  "Latest developments in artificial intelligence and large language models";

async function main() {
  const goal = process.argv[2] || DEFAULT_GOAL;
  const mode = (process.argv[3] as "autonomous" | "hitl") || "autonomous";

  console.log("   AI Newsletter Agent");
  console.log(`  Goal: ${goal}`);
  console.log(`  Mode: ${mode}`);
  console.log(`  Groq Model: ${config.groq.model}`);

  // Validate config
  if (!config.groq.apiKey) {
    console.error("\ GROQ_API_KEY is not set. Check your .env file.");
    process.exit(1);
  }
  if (!config.tavily.apiKey) {
    console.error("\ TAVILY_API_KEY is not set. Check your .env file.");
    process.exit(1);
  }

  const graph = createNewsletterGraph();
  const startTime = Date.now();

  try {
    console.log("\n Starting pipeline...\n");

    const result = await graph.invoke({
      goal,
      mode,
      searchQueries: [],
      searchResults: [],
      curatedArticles: [],
      summaries: [],
      draftNewsletter: "",
      subjectLine: "",
      htmlOutput: "",
      markdownOutput: "",
      critique: {
        passed: false,
        score: 0,
        issues: [],
        suggestions: [],
      },
      revisionCount: 0,
      maxRevisionCount: config.agent.maxRevisions,
      approved: mode === "autonomous",
      status: "idle",
      errors: [],
      finalNewsletter: "",
    });

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log("   PIPELINE COMPLETE");
    console.log(`  Status:     ${result.status}`);
    console.log(`  Revisions:  ${result.revisionCount}`);
    console.log(`  Critique:   ${result.critique.score}/100 (${result.critique.passed ? "passed" : "failed"})`);
    console.log(`  Articles:   ${result.summaries.length}`);
    console.log(`  Time:       ${elapsed}s`);

    if (result.errors.length > 0) {
      console.log(`\n  ⚠ Errors (${result.errors.length}):`);
      result.errors.forEach((e) =>
        console.log(`    [${e.node}] ${e.message}`)
      );
    }

    if (result.subjectLine) {
      console.log(`\n   Subject: ${result.subjectLine}`);
    }

    if (result.markdownOutput) {
      console.log(result.markdownOutput);
    }

    // Save HTML output to file
    if (result.htmlOutput) {
      const fs = await import("fs");
      const outputPath = "output-newsletter.html";
      fs.writeFileSync(outputPath, result.htmlOutput, "utf-8");
      console.log(`\n   HTML saved to: ${outputPath}`);
    }

    if (result.markdownOutput) {
      const fs = await import("fs");
      const outputPath = "output-newsletter.md";
      fs.writeFileSync(outputPath, result.markdownOutput, "utf-8");
      console.log(`\n   Markdown saved to: ${outputPath}`);
    }
  } catch (error: unknown) {
    const err = error as Error;
    console.error(`\n Pipeline failed: ${err.message}`);
    console.error(err.stack);
    process.exit(1);
  }
}

main();
