import { ChatGroq } from "@langchain/groq";
import { config } from "../config/index.js";

let modelInstance: ChatGroq | null = null;

// Simple rate limiter: enforce minimum gap between Groq calls to stay under TPM limit
let lastCallTime = 0;
const MIN_CALL_INTERVAL_MS = 20_000;

/**
 * Returns a singleton Groq model instance.
 * Uses llama-3.3-70b-versatile for speed and structured output support.
 */
export function getGroqModel(): ChatGroq {
  if (!modelInstance) {
    modelInstance = new ChatGroq({
      apiKey: config.groq.apiKey,
      model: config.groq.model,
      temperature: 0.7,
      maxTokens: 4096,
    });
  }
  return modelInstance;
}

/**
 * Calls Groq with a prompt and returns the raw text response.
 * Includes rate-limit-aware retry logic and minimum call spacing.
 */
export async function callGroq(
  prompt: string,
  retries = 5
): Promise<string> {
  const model = getGroqModel();



  // Wait if needed to respect minimum interval between calls
  const elapsed = Date.now() - lastCallTime;
  if (elapsed < MIN_CALL_INTERVAL_MS && lastCallTime > 0) {
    const wait = MIN_CALL_INTERVAL_MS - elapsed;
    console.log(`   Rate limiter — waiting ${Math.round(wait / 1000)}s before Groq call`);
    await new Promise((r) => setTimeout(r, wait));
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
    const promptLen = prompt.length;
    const estimatedTokens = Math.ceil(promptLen / 4);
    console.log(`   Groq API → model=${config.groq.model} | attempt=${attempt + 1}/${retries + 1} | prompt=${promptLen} chars (~${estimatedTokens} tokens)`);
    const startTime = Date.now();

    try {
      lastCallTime = Date.now();
      const response = await model.invoke(prompt);
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      const text =
        typeof response.content === "string"
          ? response.content
          : JSON.stringify(response.content);
      console.log(`    Groq OK — ${text.length} chars response in ${duration}s`);
      return text;
    } catch (error: any) {
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);

      console.error("\n========== GROQ ERROR ==========");
      console.error("Status:", error?.status);
      console.error("Message:", error?.message);
      console.error("Name:", error?.name);
      console.error("Code:", error?.code);

      // Raw response from Groq
      console.error("Response:", error?.response);

      // Response body (usually contains the real reason)
      console.error("Response Data:", error?.response?.data);

      // Body if available
      console.error("Body:", error?.body);

      // Dump everything
      console.dir(error, { depth: null });

      console.error("================================\n");

      const isRateLimit =
        error?.status === 429 ||
        error?.message?.includes("429");

      if (isRateLimit && attempt < retries) {
        const waitMatch = error.message?.match(/try again in ([\d.]+)s/);
        const waitSeconds = waitMatch
          ? parseFloat(waitMatch[1])
          : Math.min(10 * Math.pow(2, attempt), 60);

        console.warn(
          ` Retrying in ${waitSeconds}s...`
        );

        await new Promise((r) => setTimeout(r, waitSeconds * 1000));
        continue;
      }
   
      throw error;
    }
  }

  throw new Error("Groq: max retries exceeded");
}
