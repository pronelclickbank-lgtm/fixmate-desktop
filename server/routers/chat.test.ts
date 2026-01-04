import { describe, it, expect, vi, beforeEach } from "vitest";
import { chatRouter } from "./chat";

// Mock the database
vi.mock("../db", () => ({
  db: {
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([]),
        }),
      }),
    }),
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockResolvedValue([{ insertId: 1 }]),
    }),
    update: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      }),
    }),
  },
}));

// Mock fetch for AI API calls
global.fetch = vi.fn();

describe("Chat Router - AI Function Calling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should trigger optimization action when AI detects cleaning request", async () => {
    const mockUser = {
      id: 1,
      openId: "test-user",
      name: "Test User",
      email: "test@example.com",
      phone: null,
      role: "user" as const,
      usageCount: 1,
      lastUsedAt: new Date(),
      registeredAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Mock AI response with function call
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              role: "assistant",
              content: null,
              tool_calls: [
                {
                  function: {
                    name: "run_system_optimization",
                    arguments: JSON.stringify({ categories: [] }),
                  },
                },
              ],
            },
          },
        ],
      }),
    });

    const caller = chatRouter.createCaller({
      user: mockUser,
      req: {} as any,
      res: {} as any,
    });

    const result = await caller.sendMessage({
      message: "please clean my junks",
      systemContext: {
        cpu: { usage: 50, cores: 4 },
        memory: { usagePercent: 60 },
        disk: { usagePercent: 70 },
      },
    });

    expect(result.actionTriggered).toBeDefined();
    expect(result.actionTriggered?.action).toBe("run_system_optimization");
    expect(result.message).toContain("optimizing");
  });

  it("should trigger scan action when AI detects scan request", async () => {
    const mockUser = {
      id: 1,
      openId: "test-user",
      name: "Test User",
      email: "test@example.com",
      phone: null,
      role: "user" as const,
      usageCount: 1,
      lastUsedAt: new Date(),
      registeredAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Mock AI response with scan function call
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              role: "assistant",
              content: null,
              tool_calls: [
                {
                  function: {
                    name: "run_system_scan",
                    arguments: "{}",
                  },
                },
              ],
            },
          },
        ],
      }),
    });

    const caller = chatRouter.createCaller({
      user: mockUser,
      req: {} as any,
      res: {} as any,
    });

    const result = await caller.sendMessage({
      message: "scan my system",
    });

    expect(result.actionTriggered).toBeDefined();
    expect(result.actionTriggered?.action).toBe("run_system_scan");
    expect(result.message).toContain("scan");
  });

  it("should handle normal conversation without triggering actions", async () => {
    const mockUser = {
      id: 1,
      openId: "test-user",
      name: "Test User",
      email: "test@example.com",
      phone: null,
      role: "user" as const,
      usageCount: 1,
      lastUsedAt: new Date(),
      registeredAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Mock normal AI response without function calls
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              role: "assistant",
              content: "I can help you with that! What specific issue are you experiencing?",
            },
          },
        ],
      }),
    });

    const caller = chatRouter.createCaller({
      user: mockUser,
      req: {} as any,
      res: {} as any,
    });

    const result = await caller.sendMessage({
      message: "hello",
    });

    expect(result.actionTriggered).toBeNull();
    expect(result.message).toBe("I can help you with that! What specific issue are you experiencing?");
  });

  it("should include system context in AI prompt", async () => {
    const mockUser = {
      id: 1,
      openId: "test-user",
      name: "Test User",
      email: "test@example.com",
      phone: null,
      role: "user" as const,
      usageCount: 1,
      lastUsedAt: new Date(),
      registeredAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              role: "assistant",
              content: "Your CPU usage is at 85%, which is quite high.",
            },
          },
        ],
      }),
    });

    const caller = chatRouter.createCaller({
      user: mockUser,
      req: {} as any,
      res: {} as any,
    });

    await caller.sendMessage({
      message: "why is my PC slow?",
      systemContext: {
        cpu: { usage: 85, cores: 4 },
        memory: { usagePercent: 90 },
        disk: { usagePercent: 95 },
      },
    });

    // Verify fetch was called with system context in the prompt
    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.sambanova.ai/v1/chat/completions",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("CPU: 85%"),
      })
    );
  });
});
