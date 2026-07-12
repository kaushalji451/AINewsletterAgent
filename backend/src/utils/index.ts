/**
 * Utility functions shared across the application.
 */

/**
 * Extracts a JSON object or array from a string that may contain
 * markdown fences, explanations, or other non-JSON content.
 */
export function extractJson<T>(text: string): T | null {
  // Try direct parse first
  try {
    return JSON.parse(text) as T;
  } catch {
    // continue
  }

  // Try extracting from markdown code fences
  const fenceMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  if (fenceMatch) {
    try {
      return JSON.parse(fenceMatch[1]) as T;
    } catch {
      // continue
    }
  }

  // Try finding first { ... } or [ ... ]
  const objectMatch = text.match(/\{[\s\S]*\}/);
  if (objectMatch) {
    try {
      return JSON.parse(objectMatch[0]) as T;
    } catch {
      // continue
    }
  }

  const arrayMatch = text.match(/\[[\s\S]*\]/);
  if (arrayMatch) {
    try {
      return JSON.parse(arrayMatch[0]) as T;
    } catch {
      // continue
    }
  }

  return null;
}

/**
 * Generates an ISO timestamp string for logging.
 */
export function timestamp(): string {
  return new Date().toISOString();
}

/**
 * Delays execution for the specified milliseconds.
 */
export function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
