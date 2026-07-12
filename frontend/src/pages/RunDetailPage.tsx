import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSSE } from "@/hooks/useSSE";
import { useResumeRun } from "@/hooks/useResumeRun";
import { getRunStatus } from "@/api/client";
import { ActivityTimeline } from "@/components/ActivityTimeline";
import { StatusBadge } from "@/components/StatusBadge";
import { ApprovalPanel } from "@/components/ApprovalPanel";
import { CritiquePanel } from "@/components/CritiquePanel";
import { NewsletterViewer } from "@/components/NewsletterViewer";
import type { RunStatus } from "@/types";

export function RunDetailPage() {
  const { runId } = useParams<{ runId: string }>();
  const { timeline, latestEvent, connected } = useSSE(runId ?? null);
  const resumeRun = useResumeRun();

  const [runStatus, setRunStatus] = useState<RunStatus | null>(null);
  const [showNewsletter, setShowNewsletter] = useState(false);

  // Poll run status every 3 seconds as a fallback
  useEffect(() => {
    if (!runId) return;

    const poll = async () => {
      try {
        const res = await getRunStatus(runId);
        if (res.success && res.data) {
          setRunStatus(res.data);
        }
      } catch {
        // ignore polling errors
      }
    };

    poll();
    const interval = setInterval(poll, 3000);
    return () => clearInterval(interval);
  }, [runId]);

  // Update runStatus from SSE completed event
  useEffect(() => {
    if (latestEvent?.type === "completed" && latestEvent.data) {
      setRunStatus((prev) =>
        prev
          ? { ...prev, status: "completed", result: latestEvent.data as RunStatus["result"] }
          : prev
      );
      setShowNewsletter(true);
    }
    if (latestEvent?.type === "awaiting_approval" && runStatus?.mode !== "autonomous") {
      setRunStatus((prev) =>
        prev ? { ...prev, status: "awaiting_approval" } : prev
      );
    }
  }, [latestEvent, runStatus?.mode]);

  const currentStatus =
    runStatus?.status ||
    (latestEvent?.type === "completed"
      ? "completed"
      : latestEvent?.type === "awaiting_approval" && runStatus?.mode !== "autonomous"
        ? "awaiting_approval"
        : "running");

  const handleApprove = () => {
    if (!runId) return;
    resumeRun.mutate(
      { runId, approved: true },
      {
        onSuccess: () => {
          setRunStatus((prev) =>
            prev ? { ...prev, status: "running" } : prev
          );
        },
      }
    );
  };

  const handleReject = (feedback: string) => {
    if (!runId) return;
    resumeRun.mutate(
      { runId, approved: false, feedback },
      {
        onSuccess: () => {
          setRunStatus((prev) =>
            prev ? { ...prev, status: "running" } : prev
          );
        },
      }
    );
  };

  if (!runId) return <p className="text-red-500">No run ID provided.</p>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-gray-900">
            {runStatus?.goal || "Running Agent..."}
          </h1>
          <div className="flex items-center gap-2">
            <StatusBadge status={currentStatus} />
            <span className="text-xs text-gray-400">
              {connected ? "Live" : "Connecting..."}
            </span>
          </div>
        </div>
      </div>

      {/* Timeline + Approval side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline */}
        <div className="lg:col-span-1 rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-gray-800 mb-3">
            Activity
          </h2>
          <ActivityTimeline entries={timeline} />
        </div>

        {/* Main content area */}
        <div className="lg:col-span-2 space-y-4">
          {/* Approval Panel (HITL) */}
          {currentStatus === "awaiting_approval" && (
            <ApprovalPanel
              subjectLine={
                (latestEvent?.data?.subjectLine as string) || ""
              }
              draftPreview={
                (latestEvent?.data?.draftPreview as string) || ""
              }
              onApprove={handleApprove}
              onReject={handleReject}
              loading={resumeRun.isPending}
            />
          )}

          {/* Error */}
          {currentStatus === "failed" && runStatus?.error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-600">
              {runStatus.error}
            </div>
          )}

          {/* Critique */}
          {runStatus?.result?.critique && (
            <CritiquePanel
              critique={runStatus.result.critique}
              revisionCount={runStatus.result.revisionCount}
            />
          )}

          {/* Newsletter Output */}
          {showNewsletter && runStatus?.result && (
            <NewsletterViewer
              htmlOutput={runStatus.result.htmlOutput}
              markdownOutput={runStatus.result.markdownOutput}
              subjectLine={runStatus.result.subjectLine}
            />
          )}

          {/* Completed but no newsletter yet (fallback) */}
          {currentStatus === "completed" &&
            !runStatus?.result?.htmlOutput &&
            !showNewsletter && (
              <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
                <p className="text-sm text-gray-500">
                  Pipeline completed. Fetching results...
                </p>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
