import { describe, it, expect } from "vitest";
import { env } from "./_core/env";

/**
 * Test SambaNova API integration
 * Validates that the SAMBANOVA_API_KEY is correctly configured
 */
describe("SambaNova API Integration", () => {
  it("should have SAMBANOVA_API_KEY configured", () => {
    expect(env.sambaNovaApiKey).toBeDefined();
    expect(env.sambaNovaApiKey).not.toBe("");
  });

  it("should successfully call SambaNova API", async () => {
    const response = await fetch("https://api.sambanova.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.sambaNovaApiKey}`,
      },
      body: JSON.stringify({
        model: "Meta-Llama-3.1-8B-Instruct",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant. Respond with exactly: 'Test successful'",
          },
          { role: "user", content: "Test" },
        ],
        max_tokens: 10,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`SambaNova API failed: ${JSON.stringify(error)}`);
    }
    
    expect(response.ok).toBe(true);
    const data = await response.json();
    expect(data.choices).toBeDefined();
    expect(data.choices.length).toBeGreaterThan(0);
    expect(data.choices[0].message.content).toBeDefined();
  }, 30000); // 30 second timeout for API call
});
