import { runGraph } from "../services/graph.service.js";
export async function handleChat(req, res, next) {
    try {
        const { input } = req.body;
        const result = await runGraph(input);
        const response = {
            success: true,
            data: {
                output: result.output,
                messages: result.messages,
            },
        };
        res.json(response);
    }
    catch (error) {
        next(error);
    }
}
export function handleHealth(_req, res) {
    const response = {
        success: true,
        data: {
            status: "healthy",
            timestamp: new Date().toISOString(),
        },
    };
    res.json(response);
}
//# sourceMappingURL=chat.controller.js.map