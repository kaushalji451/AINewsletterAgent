import { Router } from "express";
import { z } from "zod";
import { runManager } from "../services/run-manager.js";
const router = Router();
// ── Validation Schemas ───────────────────────────────────
const runSchema = z.object({
    goal: z.string().min(1, "Goal is required").max(500, "Goal too long"),
    mode: z.enum(["autonomous", "hitl"]).default("autonomous"),
});
const resumeSchema = z.object({
    approved: z.boolean(),
    feedback: z.string().optional(),
});
// ── POST /agent/run ──────────────────────────────────────
// Start a new newsletter agent run
router.post("/run", async (req, res) => {
    try {
        const parsed = runSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({
                success: false,
                error: parsed.error.issues.map((i) => i.message).join(", "),
            });
            return;
        }
        const { goal, mode } = parsed.data;
        const runId = await runManager.startRun(goal, mode);
        res.status(202).json({
            success: true,
            data: {
                runId,
                status: "running",
                mode,
                message: "Agent run started. Connect to SSE endpoint for live updates.",
            },
        });
    }
    catch (error) {
        const err = error;
        console.error("[Run Error]", err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});
// ── POST /agent/resume ───────────────────────────────────
// Resume a paused HITL run
router.post("/resume/:runId", async (req, res) => {
    try {
        const { runId } = req.params;
        const parsed = resumeSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({
                success: false,
                error: parsed.error.issues.map((i) => i.message).join(", "),
            });
            return;
        }
        const { approved, feedback } = parsed.data;
        const success = await runManager.resumeRun(runId, approved, feedback);
        if (!success) {
            const run = runManager.getRun(runId);
            if (!run) {
                res.status(404).json({ success: false, error: "Run not found" });
                return;
            }
            res.status(409).json({
                success: false,
                error: `Run is not awaiting approval (current status: ${run.status})`,
            });
            return;
        }
        res.json({
            success: true,
            data: { runId, status: "resumed", approved },
        });
    }
    catch (error) {
        const err = error;
        console.error("[Resume Error]", err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});
// ── GET /agent/events/:runId ──────────────────────────────
// SSE endpoint for live graph events
router.get("/events/:runId", (req, res) => {
    const { runId } = req.params;
    // Set SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders();
    // Send initial connection event
    res.write(`data: ${JSON.stringify({ type: "connected", runId, timestamp: new Date().toISOString() })}\n\n`);
    const added = runManager.addSSEClient(runId, res);
    if (!added) {
        res.write(`data: ${JSON.stringify({ type: "error", message: "Run not found", timestamp: new Date().toISOString() })}\n\n`);
        res.end();
        return;
    }
    // Heartbeat to keep connection alive
    const heartbeat = setInterval(() => {
        try {
            res.write(`:heartbeat\n\n`);
        }
        catch {
            clearInterval(heartbeat);
        }
    }, 15000);
    req.on("close", () => {
        clearInterval(heartbeat);
    });
});
// ── GET /agent/run/:runId ────────────────────────────────
// Get run status and result
router.get("/run/:runId", (req, res) => {
    const run = runManager.getRun(req.params.runId);
    if (!run) {
        res.status(404).json({ success: false, error: "Run not found" });
        return;
    }
    res.json({
        success: true,
        data: {
            runId: run.runId,
            goal: run.goal,
            mode: run.mode,
            status: run.status,
            result: run.result
                ? {
                    subjectLine: run.result.subjectLine,
                    htmlOutput: run.result.htmlOutput,
                    markdownOutput: run.result.markdownOutput,
                    critique: run.result.critique,
                    revisionCount: run.result.revisionCount,
                    finalNewsletter: run.result.finalNewsletter,
                }
                : undefined,
            error: run.error,
            startedAt: run.startedAt,
            completedAt: run.completedAt,
        },
    });
});
export default router;
//# sourceMappingURL=agent.js.map