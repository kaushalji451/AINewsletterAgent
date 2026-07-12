export declare function createGraph(): import("@langchain/langgraph").CompiledStateGraph<{
    messages: string[];
    input: string;
    output: string;
}, {
    messages?: string[] | import("@langchain/langgraph").OverwriteValue<string[]> | undefined;
    input?: string | import("@langchain/langgraph").OverwriteValue<string> | undefined;
    output?: string | import("@langchain/langgraph").OverwriteValue<string> | undefined;
}, "__start__" | "process", {
    messages: import("@langchain/langgraph").BaseChannel<string[], string[] | import("@langchain/langgraph").OverwriteValue<string[]>, unknown>;
    input: import("@langchain/langgraph").BaseChannel<string, string | import("@langchain/langgraph").OverwriteValue<string>, unknown>;
    output: import("@langchain/langgraph").BaseChannel<string, string | import("@langchain/langgraph").OverwriteValue<string>, unknown>;
}, {
    messages: import("@langchain/langgraph").BaseChannel<string[], string[] | import("@langchain/langgraph").OverwriteValue<string[]>, unknown>;
    input: import("@langchain/langgraph").BaseChannel<string, string | import("@langchain/langgraph").OverwriteValue<string>, unknown>;
    output: import("@langchain/langgraph").BaseChannel<string, string | import("@langchain/langgraph").OverwriteValue<string>, unknown>;
}, import("@langchain/langgraph").StateDefinition, {
    process: {
        output: string;
        messages: string[];
    };
}, unknown, unknown, []>;
//# sourceMappingURL=graph.d.ts.map