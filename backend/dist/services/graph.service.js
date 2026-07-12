import { createGraph } from "../graph/graph.js";
const graph = createGraph();
export async function runGraph(input) {
    const result = await graph.invoke({ input, messages: [], output: "" });
    return result;
}
//# sourceMappingURL=graph.service.js.map