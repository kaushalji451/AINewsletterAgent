# AI Newsletter Agent — Backend

Express.js + LangGraph.js backend that powers the AI newsletter generation pipeline. Uses Groq (LLaMA 3.3) for LLM calls and Tavily for web search.

## Tech Stack

- **Runtime:** Node.js + TypeScript
- **Framework:** Express.js v5
- **AI Orchestration:** LangGraph.js (stateful multi-step graph)
- **LLM:** Groq — LLaMA 3.3 70B Versatile
- **Search:** Tavily Search API
- **SSE:** Server-Sent Events for real-time streaming

## Prerequisites

- Node.js 18+
- A [Groq API key](https://console.groq.com/)
- A [Tavily API key](https://tavily.com/)

## Setup

```bash
npm install
cp .env.example .env
```

Edit `.env` with your API keys:

```env
PORT=3001
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxx
GROQ_MODEL=llama-3.3-70b-versatile
TAVILY_API_KEY=tvly-xxxxxxxxxxxxxxxx
CORS_ORIGIN=http://localhost:5173
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with hot reload (port 3001) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled production build |
| `npm run agent -- "topic"` | Run agent standalone (no server) |

## Project Structure

```
backend/src/
├── app.ts                 # Express app setup (cors, helmet, morgan)
├── server.ts              # Server startup
├── agent.ts               # Standalone CLI runner
├── config/
│   └── index.ts           # Environment config (dotenv)
├── types/
│   └── index.ts           # TypeScript type definitions
├── routes/
│   └── agent.ts           # REST API routes
├── services/
│   ├── groq.ts            # Groq LLM wrapper (rate limiter + retries)
│   ├── tavily.ts          # Tavily Search wrapper (dedup)
│   └── run-manager.ts     # Run lifecycle + SSE streaming
├── graph/
│   ├── graph.ts           # LangGraph StateGraph definition
│   ├── state.ts           # LangGraph Annotation state schema
│   └── nodes/
│       ├── planner.ts     # Goal → search queries (Groq)
│       ├── researcher.ts  # Queries → raw results (Tavily)
│       ├── curator.ts     # Results → filtered articles (Groq)
│       ├── summarizer.ts  # Articles → summaries (Groq)
│       ├── writer.ts      # Summaries → HTML + Markdown (Groq)
│       ├── critique.ts    # Newsletter → quality score (Groq)
│       ├── router.ts      # Conditional edge: revise/finalize/interrupt
│       ├── hitl.ts        # Human-in-the-loop interrupt node
│       └── finalize.ts    # Pipeline completion + revision counter
├── prompts/
│   ├── planner.ts         # Search query generation prompt
│   ├── curator.ts         # Article filtering prompt
│   ├── summarizer.ts      # Article summarization prompt
│   ├── writer.ts          # Newsletter composition prompt
│   └── critique.ts        # Quality evaluation prompt (8 criteria)
└── utils/
    └── index.ts           # JSON extraction, timestamps
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/agent/run` | Start a new agent run |
| `POST` | `/api/agent/resume/:runId` | Resume a HITL-paused run |
| `GET` | `/api/agent/events/:runId` | SSE stream of graph events |
| `GET` | `/api/agent/run/:runId` | Get run status and result |

### POST /api/agent/run

```json
{
  "goal": "Latest developments in quantum computing",
  "mode": "autonomous"
}
```

**mode:** `"autonomous"` (runs end-to-end) or `"hitl"` (pauses after draft for human approval)

Response:
```json
{
  "success": true,
  "data": {
    "runId": "uuid",
    "status": "running",
    "mode": "autonomous",
    "message": "Agent run started."
  }
}
```

### POST /api/agent/resume/:runId

```json
{
  "approved": true,
  "feedback": ""
}
```

## Graph Pipeline

```
Planner → Researcher → Curator → Summarizer → Writer → HITL → Evaluate
                                                              │
                                                    ┌─────────┤
                                                    │         │
                                                finalize    revise → writer
                                                    │         │
                                                   END     (loop)
```

Each node reads from and writes to a shared `NewsletterState`. LangGraph merges updates automatically and handles checkpointing for HITL interrupts and revision loops.

## LLM Service (groq.ts)

- Singleton `ChatGroq` instance (LLaMA 3.3 70B)
- Rate limiter: 20-second minimum between calls (stays within 12K TPM free-tier)
- Exponential backoff on 429 errors, max 5 retries
- All nodes call `callGroq(prompt)` for LLM inference

## HITL Flow

1. User selects "Human-in-the-Loop" mode on the frontend
2. Graph runs: Planner → Researcher → Curator → Summarizer → Writer
3. After Writer, the `hitl` node calls `interrupt()` — graph pauses, state is checkpointed
4. Backend emits `awaiting_approval` SSE event with draft preview
5. Frontend shows the draft with Approve / Request Changes buttons
6. User clicks Approve → `POST /agent/resume/:runId` with `approved: true`
7. Graph resumes → Evaluate → Finalize

In **autonomous** mode, the HITL node is a pass-through (no pause).

## SSE Events

| Event Type | Description |
|------------|-------------|
| `node_start` | A graph node has started executing |
| `node_complete` | A graph node has finished |
| `status_change` | Run status changed |
| `awaiting_approval` | HITL interrupt — waiting for human decision |
| `completed` | Pipeline finished, result included |
| `error` | An error occurred |
| `revision_start` | Starting a revision cycle |

## Error Handling

- **Groq 429 (rate limit):** Exponential backoff with 20s call spacing, max 5 retries
- **Tavily failures:** Continue with remaining queries
- **Empty search results:** Pipeline continues with degraded quality
- **JSON parse failures:** Extract from markdown fences, fall back to heuristic
- **Max revisions (2):** Force-finalize and accept current draft
