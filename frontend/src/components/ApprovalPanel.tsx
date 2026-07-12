import { useState } from "react";

interface Props {
  subjectLine: string;
  draftPreview: string;
  onApprove: () => void;
  onReject: (feedback: string) => void;
  loading: boolean;
}

export function ApprovalPanel({
  subjectLine,
  draftPreview,
  onApprove,
  onReject,
  loading,
}: Props) {
  const [feedback, setFeedback] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);

  return (
    <div className="rounded-lg border-2 border-amber-300 bg-amber-50 p-5 space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-lg">⏸</span>
        <h3 className="text-sm font-semibold text-amber-800">
          Approval Required
        </h3>
      </div>

      <div className="rounded-md bg-white border border-amber-200 p-3">
        <p className="text-xs text-gray-400 mb-1">Subject</p>
        <p className="text-sm font-medium text-gray-800">{subjectLine}</p>
      </div>

      <div className="rounded-md bg-white border border-amber-200 p-3">
        <p className="text-xs text-gray-400 mb-1">Preview</p>
        <p className="text-sm text-gray-600 whitespace-pre-wrap line-clamp-6">
          {draftPreview}
        </p>
      </div>

      {!showFeedback ? (
        <div className="flex gap-3">
          <button
            onClick={onApprove}
            disabled={loading}
            className="flex-1 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? "Approving..." : "Approve"}
          </button>
          <button
            onClick={() => setShowFeedback(true)}
            disabled={loading}
            className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Request Changes
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={3}
            placeholder="What changes would you like?"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
          />
          <div className="flex gap-3">
            <button
              onClick={() => onReject(feedback)}
              disabled={loading || !feedback.trim()}
              className="flex-1 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit Changes"}
            </button>
            <button
              onClick={() => setShowFeedback(false)}
              disabled={loading}
              className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
