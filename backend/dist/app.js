import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { config } from "./config/index.js";
import agentRoutes from "./routes/agent.js";
const app = express();
app.use(helmet());
app.use(cors({ origin: config.corsOrigin }));
app.use(morgan("dev"));
app.use(express.json());
// ── Health Check ─────────────────────────────────────────
app.get("/api/health", (_req, res) => {
    res.json({
        success: true,
        data: { status: "healthy", timestamp: new Date().toISOString() },
    });
});
// ── Agent Routes ─────────────────────────────────────────
app.use("/api/agent", agentRoutes);
// ── 404 Handler ──────────────────────────────────────────
app.use((_req, res) => {
    res.status(404).json({ success: false, error: "Not found" });
});
// ── Error Handler ────────────────────────────────────────
app.use((err, _req, res, _next) => {
    console.error("[Error]", err.message);
    res.status(500).json({
        success: false,
        error: config.nodeEnv === "production"
            ? "Internal server error"
            : err.message,
    });
});
export default app;
//# sourceMappingURL=app.js.map