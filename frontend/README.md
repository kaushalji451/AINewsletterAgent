# AI Newsletter Agent — Frontend

React + Vite + Tailwind CSS frontend for the AI Newsletter Agent. Provides a real-time UI for creating, monitoring, and viewing AI-generated newsletters.

## Tech Stack

- **Framework:** React 19 + TypeScript
- **Build Tool:** Vite 6
- **Styling:** Tailwind CSS 4
- **State Management:** React Query (TanStack Query v5)
- **Routing:** React Router v7
- **Forms:** React Hook Form + Zod validation
- **HTTP:** Axios
- **Real-time:** Server-Sent Events (EventSource API)

## Prerequisites

- Node.js 18+
- Backend server running on `http://localhost:3001`

## Setup

```bash
npm install
cp .env.example .env
```

Edit `.env` if your backend runs on a different port:

```env
VITE_API_BASE_URL=http://localhost:3001/api
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server (port 5173) |
| `npm run build` | TypeScript check + production build |
| `npm run preview` | Preview production build locally |

## Project Structure

```
frontend/src/
├── main.tsx                 # App entry point
├── App.tsx                  # Router setup
├── index.css                # Global styles (Tailwind)
├── api/
│   └── client.ts            # Axios instance + SSE connection
├── types/
│   └── index.ts             # TypeScript type definitions
├── lib/
│   └── providers.tsx        # React Query + Router providers
├── layouts/
│   └── RootLayout.tsx       # App shell layout
├── pages/
│   ├── Home.tsx             # Landing page
│   ├── RunPage.tsx          # Create new newsletter run
│   └── RunDetailPage.tsx    # Live run view + newsletter output
├── components/
│   ├── GoalInput.tsx        # Topic input with validation
│   ├── ModeToggle.tsx       # Autonomous / HITL toggle
│   ├── ActivityTimeline.tsx # Real-time node progress timeline
│   ├── StatusBadge.tsx      # Run status indicator badge
│   ├── ApprovalPanel.tsx    # HITL approve/reject UI
│   ├── CritiquePanel.tsx    # Quality score + issues display
│   ├── NewsletterViewer.tsx # HTML preview + markdown download
│   └── ui/                  # Shared UI primitives
├── hooks/
│   ├── useStartRun.ts       # Start agent run mutation
│   ├── useResumeRun.ts      # Resume HITL mutation
│   └── useSSE.ts            # SSE connection + timeline state
└── utils/                   # Utility functions
```

## Pages

### Home (`/`)
Landing page with a brief description and a "Create Newsletter" button.

### Run Page (`/new`)
- **GoalInput** — Enter a topic for the newsletter
- **ModeToggle** — Switch between Autonomous and HITL modes
  - **Autonomous:** Agent runs end-to-end without pausing
  - **HITL:** Agent pauses after drafting for human approval
- Submits to `POST /api/agent/run` and navigates to the run detail page

### Run Detail Page (`/run/:runId`)
- **StatusBadge** — Shows current run status (Running, Completed, Failed)
- **ActivityTimeline** — Real-time list of graph nodes as they execute
- **ApprovalPanel** — (HITL only) Shows draft preview with Approve / Request Changes
- **CritiquePanel** — Quality score, issues, and suggestions
- **NewsletterViewer** — Rendered HTML newsletter with markdown download

## Real-time Updates (SSE)

The frontend connects to the backend via Server-Sent Events:

1. `useSSE` hook opens an `EventSource` to `GET /api/agent/events/:runId`
2. Each graph node execution emits `node_start` and `node_complete` events
3. Events update the `ActivityTimeline` in real time
4. `awaiting_approval` events trigger the `ApprovalPanel` (HITL mode only)
5. `completed` events show the final newsletter
6. Heartbeat every 15s keeps the connection alive

## Components

| Component | Purpose |
|-----------|---------|
| `GoalInput` | Text input with submit button, validates non-empty |
| `ModeToggle` | Two-button toggle: Autonomous / Human-in-the-Loop |
| `ActivityTimeline` | Vertical list of node executions with status icons |
| `StatusBadge` | Colored pill showing run status text |
| `ApprovalPanel` | Draft preview + Approve/Reject buttons + feedback textarea |
| `CritiquePanel` | Quality score gauge + list of issues and suggestions |
| `NewsletterViewer` | Rendered HTML iframe + markdown tab + copy/download |

## State Management

- **React Query** handles server state (API mutations for start/resume)
- **React useState** manages local UI state (run status, SSE timeline)
- **SSE events** flow through `useSSE` hook → `latestEvent` → `RunDetailPage` updates

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_BASE_URL` | `http://localhost:3001/api` | Backend API base URL |
