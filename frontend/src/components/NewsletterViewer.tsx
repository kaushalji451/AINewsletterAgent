interface Props {
  htmlOutput: string;
  markdownOutput: string;
  subjectLine: string;
}

export function NewsletterViewer({
  htmlOutput,
  markdownOutput,
  subjectLine,
}: Props) {
  function downloadFile(content: string, filename: string, mime: string) {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      {subjectLine && (
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs text-gray-400 mb-1">Subject Line</p>
          <p className="text-sm font-semibold text-gray-800">{subjectLine}</p>
        </div>
      )}

      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2">
          <p className="text-xs font-medium text-gray-500">Preview</p>
          <div className="flex gap-2">
            <button
              onClick={() =>
                downloadFile(htmlOutput, "newsletter.html", "text/html")
              }
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              Download HTML
            </button>
            <button
              onClick={() =>
                downloadFile(
                  markdownOutput,
                  "newsletter.md",
                  "text/markdown"
                )
              }
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              Download MD
            </button>
          </div>
        </div>
        <div className="max-h-[600px] overflow-auto">
          {htmlOutput ? (
            <iframe
              srcDoc={htmlOutput}
              className="w-full min-h-[400px] border-0"
              title="Newsletter Preview"
            />
          ) : (
            <pre className="p-4 text-sm text-gray-700 whitespace-pre-wrap font-mono">
              {markdownOutput}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
