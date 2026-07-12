# AI Newsletter Agent

An AI-powered full-stack application that automatically researches a topic, summarizes information from the web, and generates a professional newsletter using multiple AI agents.

The application supports both fully autonomous execution and Human-in-the-Loop (HITL) approval before publishing.

---

## Features

- AI-powered newsletter generation
- Multi-agent workflow using LangGraph
- Web research using Tavily Search
- Newsletter generation using Groq (Llama 3.3)
- Human approval workflow (HITL)
- Real-time progress updates using Server-Sent Events (SSE)
- Markdown and HTML newsletter output
- Quality evaluation with automatic revision support

---

## Tech Stack

### Frontend

- React 19
- TypeScript
- Vite
- Tailwind CSS
- React Query
- React Router
- React Hook Form
- Axios
- Server-Sent Events (SSE)

### Backend

- Node.js
- Express.js
- TypeScript
- LangGraph.js
- Groq (Llama 3.3)
- Tavily Search API
- Server-Sent Events (SSE)

---

## Project Structure

```
AI-Newsletter-Agent/
│
├── frontend/
│   ├── React + Vite UI
│   ├── Newsletter pages
│   ├── Real-time activity timeline
│   └── HITL approval interface
│
├── backend/
│   ├── Express API
│   ├── LangGraph workflow
│   ├── AI agents
│   ├── Groq integration
│   └── Tavily search
│
└── README.md
```

---

## AI Workflow

```
Planner
   │
   ▼
Researcher
   │
   ▼
Curator
   │
   ▼
Summarizer
   │
   ▼
Writer
   │
   ▼
Human Approval (Optional)
   │
   ▼
Critique
   │
   ▼
Finalize
```

### What each agent does

**Planner**
- Generates search queries from the user's topic.

**Researcher**
- Searches the web using Tavily.

**Curator**
- Filters duplicate or irrelevant articles.

**Summarizer**
- Creates concise summaries of selected articles.

**Writer**
- Generates the final newsletter in Markdown and HTML.

**Critique**
- Evaluates newsletter quality and suggests revisions if needed.

---

## Frontend

The frontend allows users to:

- Enter a newsletter topic
- Choose Autonomous or HITL mode
- Monitor agent execution in real time
- Approve or reject drafts (HITL)
- View and download the generated newsletter

---

## Backend

The backend provides:

- REST APIs
- LangGraph workflow execution
- Groq LLM integration
- Tavily web search
- Real-time SSE updates
- Human approval workflow

---

## API Endpoints

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/agent/run` | Start a newsletter |
| POST | `/api/agent/resume/:runId` | Resume HITL workflow |
| GET | `/api/agent/events/:runId` | Live SSE events |
| GET | `/api/agent/run/:runId` | Run status |

---

## Installation

### 1. Clone

```bash
git clone <repository-url>
cd AI-Newsletter-Agent
```

---

### 2. Backend

```bash
cd backend
npm install
```

Create `.env`

```env
PORT=3001

GROQ_API_KEY=your_key
GROQ_MODEL=llama-3.3-70b-versatile

TAVILY_API_KEY=your_key

CORS_ORIGIN=http://localhost:5173
```

Run

```bash
npm run dev
```

---

### 3. Frontend

```bash
cd frontend
npm install
```

Create `.env`

```env
VITE_API_BASE_URL=http://localhost:3001/api
```

Run

```bash
npm run dev
```

---

## Running the Application

Start the backend

```bash
cd backend
npm run dev
```

Start the frontend

```bash
cd frontend
npm run dev
```

Open

```
http://localhost:5173
```

---

## Human-in-the-Loop (HITL)

When HITL mode is selected:

1. AI creates a draft.
2. Workflow pauses.
3. User reviews the newsletter.
4. User approves or requests changes.
5. Workflow resumes automatically.

---

## Real-Time Updates

The frontend receives live events from the backend using Server-Sent Events.

Examples include:

- Planner started
- Research completed
- Writer completed
- Awaiting approval
- Revision started
- Newsletter completed

---

## Future Improvements

- Multiple LLM provider support
- User authentication
- Newsletter templates
- Email delivery
- Export to PDF
- Scheduled newsletter generation
- Database support
- Caching for search results

---

## License

MIT License