import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  goal: z
    .string()
    .min(5, "Goal must be at least 5 characters")
    .max(500, "Goal must be under 500 characters"),
});

type FormData = z.infer<typeof schema>;

interface Props {
  onSubmit: (goal: string) => void;
  loading: boolean;
}

export function GoalInput({ onSubmit, loading }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      goal: "Latest developments in artificial intelligence and large language models",
    },
  });

  return (
    <form onSubmit={handleSubmit((d) => onSubmit(d.goal))} className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Newsletter Topic
      </label>
      <textarea
        {...register("goal")}
        rows={3}
        placeholder="e.g. Latest breakthroughs in quantum computing..."
        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
      />
      {errors.goal && (
        <p className="text-xs text-red-500">{errors.goal.message}</p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Starting..." : "Run Agent"}
      </button>
    </form>
  );
}
