interface Props {
  status: string;
}

const BADGE_STYLES: Record<string, string> = {
  running: "bg-blue-100 text-blue-700",
  awaiting_approval: "bg-amber-100 text-amber-700",
  completed: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
  idle: "bg-gray-100 text-gray-500",
};

export function StatusBadge({ status }: Props) {
  const style = BADGE_STYLES[status] || "bg-gray-100 text-gray-500";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${style}`}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}
