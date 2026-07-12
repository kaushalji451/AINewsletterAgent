interface Props {
  value: "autonomous" | "hitl";
  onChange: (mode: "autonomous" | "hitl") => void;
  disabled: boolean;
}

export function ModeToggle({ value, onChange, disabled }: Props) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-gray-700">Mode:</span>
      <div className="flex rounded-lg border border-gray-300 overflow-hidden">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange("autonomous")}
          className={`px-4 py-1.5 text-xs font-medium transition-colors ${
            value === "autonomous"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-600 hover:bg-gray-50"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          Autonomous
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange("hitl")}
          className={`px-4 py-1.5 text-xs font-medium transition-colors ${
            value === "hitl"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-600 hover:bg-gray-50"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          Human-in-the-Loop
        </button>
      </div>
    </div>
  );
}
