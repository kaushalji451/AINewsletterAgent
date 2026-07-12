import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { config } from "../config/index.js";
let modelInstance = null;
/**
 * Returns a singleton Gemini model instance.
 * Uses gemini-2.0-flash for speed and structured output support.
 */
export function getGeminiModel() {
    if (!modelInstance) {
        modelInstance = new ChatGoogleGenerativeAI({
            apiKey: config.gemini.apiKey,
            model: config.gemini.model,
            temperature: 0.7,
            maxOutputTokens: 8192,
        });
    }
    return modelInstance;
}
/**
 * Calls Gemini with a prompt and returns the raw text response.
 * Includes retry logic for 429 rate-limit errors.
 */
export async function callGemini(prompt, retries = 3) {
    const model = getGeminiModel();
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const response = await model.invoke(prompt);
            const text = typeof response.content === "string"
                ? response.content
                : JSON.stringify(response.content);
            return text;
        }
        catch (error) {
            const err = error;
            const isRateLimit = err.status === 429 || err.message?.includes("429");
            if (isRateLimit && attempt < retries) {
                const delay = Math.pow(2, attempt) * 1000;
                console.warn(`  ⚠ Gemini 429 — retrying in ${delay}ms (attempt ${attempt + 1}/${retries})`);
                await new Promise((r) => setTimeout(r, delay));
                continue;
            }
            throw error;
        }
    }
    throw new Error("Gemini: max retries exceeded");
}
//# sourceMappingURL=gemini.js.map