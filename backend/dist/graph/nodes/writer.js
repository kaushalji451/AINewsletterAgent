import { callGemini } from "../../services/gemini.js";
import { buildWriterPrompt } from "../../prompts/writer.js";
import { extractJson, timestamp } from "../../utils/index.js";
/**
 * Writer Node
 * Composes the newsletter in HTML and Markdown from summaries.
 * On revisions, includes critique feedback to guide improvements.
 */
export async function writerNode(state) {
    const isRevision = state.revisionCount > 0;
    const label = isRevision ? `Writer (revision ${state.revisionCount})` : "Writer";
    console.log(`\n✍️  ${label} — composing newsletter from ${state.summaries.length} summaries...`);
    if (state.summaries.length === 0) {
        console.error("  ✗ No summaries available to write from");
        return {
            draftNewsletter: "",
            subjectLine: "Newsletter",
            htmlOutput: "<html><body><p>No content available.</p></body></html>",
            markdownOutput: "# No content available",
            status: "writing",
            errors: [
                ...state.errors,
                {
                    node: "writer",
                    message: "No summaries available",
                    timestamp: timestamp(),
                    recoverable: false,
                },
            ],
        };
    }
    try {
        const summariesJson = JSON.stringify(state.summaries, null, 2);
        const feedback = state.critique.issues
            .map((i) => `- [${i.severity}] ${i.field}: ${i.message}`)
            .join("\n");
        const prompt = buildWriterPrompt(state.goal, summariesJson, isRevision, feedback);
        const response = await callGemini(prompt);
        const output = extractJson(response);
        if (output &&
            output.subjectLine &&
            output.html &&
            output.markdown) {
            console.log(`  ✓ Newsletter written: "${output.subjectLine}"`);
            console.log(`    HTML: ${output.html.length} chars`);
            console.log(`    Markdown: ${output.markdown.length} chars`);
            return {
                draftNewsletter: output.markdown,
                subjectLine: output.subjectLine,
                htmlOutput: output.html,
                markdownOutput: output.markdown,
                status: "writing",
            };
        }
        // Partial fallback: try to extract what we can
        console.warn("  ⚠ Incomplete writer output, using partial extraction");
        const subjectLine = output?.subjectLine || "Weekly Newsletter";
        const html = output?.html || `<html><body><pre>${response}</pre></body></html>`;
        const markdown = output?.markdown || response;
        return {
            draftNewsletter: markdown,
            subjectLine,
            htmlOutput: html,
            markdownOutput: markdown,
            status: "writing",
        };
    }
    catch (error) {
        const err = error;
        console.error(`  ✗ Writer failed: ${err.message}`);
        return {
            draftNewsletter: "",
            subjectLine: "Newsletter",
            htmlOutput: "",
            markdownOutput: "",
            status: "writing",
            errors: [
                ...state.errors,
                {
                    node: "writer",
                    message: err.message,
                    timestamp: timestamp(),
                    recoverable: false,
                },
            ],
        };
    }
}
//# sourceMappingURL=writer.js.map