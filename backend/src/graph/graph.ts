import { StateGraph, MemorySaver } from "@langchain/langgraph";
import { NewsletterStateAnnotation } from "./state.js";
import { plannerNode } from "./nodes/planner.js";
import { researcherNode } from "./nodes/researcher.js";
import { curatorNode } from "./nodes/curator.js";
import { summarizerNode } from "./nodes/summarizer.js";
import { writerNode } from "./nodes/writer.js";
import { critiqueNode } from "./nodes/critique.js";
import { routerNode } from "./nodes/router.js";
import { finalizeNode, revisionNode } from "./nodes/finalize.js";
import { hitlNode } from "./nodes/hitl.js";

// Singleton checkpointer for all runs
const checkpointer = new MemorySaver();

/**
 * Creates the Newsletter Agent graph with checkpointing.
 *
 * Topology:
 *   start → planner → researcher → curator → summarizer → writer → hitl → evaluate
 */
export function createNewsletterGraph() {
  const workflow = new StateGraph(NewsletterStateAnnotation)
    // Add nodes 
    .addNode("planner", plannerNode)
    .addNode("researcher", researcherNode)
    .addNode("curator", curatorNode)
    .addNode("summarizer", summarizerNode)
    .addNode("writer", writerNode)
    .addNode("hitl", hitlNode)
    .addNode("evaluate", critiqueNode)
    .addNode("finalize", finalizeNode)
    .addNode("revision", revisionNode)

    // Linear edges (main pipeline) 
    .addEdge("__start__", "planner")
    .addEdge("planner", "researcher")
    .addEdge("researcher", "curator")
    .addEdge("curator", "summarizer")
    .addEdge("summarizer", "writer")
    .addEdge("writer", "hitl")
    .addEdge("hitl", "evaluate")
    .addEdge("finalize", "__end__")

    //  Conditional edge from evaluate 
    .addConditionalEdges("evaluate", routerNode, {
      finalize: "finalize",
      revise: "revision",
      force_finalize: "finalize",
      interrupt: "__end__",
    })

    //  Revision loop: revision → writer 
    .addEdge("revision", "writer");

  return workflow.compile({ checkpointer });
}
