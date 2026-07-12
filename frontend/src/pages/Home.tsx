import { Link } from "react-router-dom";

export function Home() {
  return (
    <div className="flex flex-col items-center gap-8 py-20 text-center">
      <div className="space-y-3">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
          AI Newsletter Agent
        </h1>
        <p className="max-w-lg text-gray-500">
          Autonomous multi-step agent that researches any topic using Tavily
          Search, curates articles with Groq (LLaMA 3.3), and produces a
          publication-ready HTML newsletter.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl w-full">
        {[
          {
            title: "Research",
            desc: "Auto-generates search queries and fetches results via Tavily",
          },
          {
            title: "Write",
            desc: "Curates, summarizes, and composes a newsletter with Groq",
          },
          {
            title: "Critique",
            desc: "Self-evaluates quality and revises up to 2 times",
          },
        ].map((f) => (
          <div
            key={f.title}
            className="rounded-lg border border-gray-200 bg-white p-4 text-left"
          >
            <h3 className="mt-2 text-sm font-semibold text-gray-800">
              {f.title}
            </h3>
            <p className="mt-1 text-xs text-gray-500">{f.desc}</p>
          </div>
        ))}
      </div>

      <Link
        to="/run"
        className="rounded-lg bg-blue-600 px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700"
      >
        Get Started
      </Link>
    </div>
  );
}
