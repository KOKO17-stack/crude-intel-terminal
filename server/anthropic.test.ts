import { describe, it, expect } from "vitest";
import { invokeLLM } from "./_core/llm";

describe("Anthropic API Integration", () => {
  it("should successfully call Claude API with a simple message", async () => {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant. Respond with exactly: SUCCESS",
        },
        {
          role: "user",
          content: "Test the API connection.",
        },
      ],
    });

    expect(response).toBeDefined();
    expect(response.choices).toBeDefined();
    expect(response.choices.length).toBeGreaterThan(0);
    expect(response.choices[0]?.message?.content).toBeDefined();
    expect(typeof response.choices[0]?.message?.content).toBe("string");
  });

  it("should handle structured JSON responses", async () => {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "You are a JSON generator. Return only valid JSON with a test field.",
        },
        {
          role: "user",
          content: 'Return {"status": "ok", "test": true}',
        },
      ],
    });

    expect(response).toBeDefined();
    const content = response.choices[0]?.message?.content;
    expect(content).toBeDefined();

    // Extract JSON from markdown code blocks if present
    let jsonStr = content as string;
    const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1]?.trim() || jsonStr;
    }

    // Verify we can parse JSON from the response
    const parsed = JSON.parse(jsonStr);
    expect(parsed).toHaveProperty("status");
  });
});
