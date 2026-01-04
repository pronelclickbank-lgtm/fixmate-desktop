import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId: number = 1): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: userId,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return { ctx };
}

describe("fixes.fixWindowsUpdates", () => {
  it("requires premium subscription to fix Windows updates", async () => {
    const { ctx } = createAuthContext(999997);
    const caller = appRouter.createCaller(ctx);

    await expect(caller.fixes.fixWindowsUpdates()).rejects.toThrow(
      "Windows Update fix requires a Pro subscription or active trial"
    );
  });
});

describe("fixes.fixSecurityIssues", () => {
  it("requires premium subscription to fix security issues", async () => {
    const { ctx } = createAuthContext(999996);
    const caller = appRouter.createCaller(ctx);

    await expect(caller.fixes.fixSecurityIssues()).rejects.toThrow(
      "Security fixes require a Pro subscription or active trial"
    );
  });
});

describe("fixes.fixAllIssues", () => {
  it("requires premium subscription to fix all issues", async () => {
    const { ctx } = createAuthContext(999995);
    const caller = appRouter.createCaller(ctx);

    await expect(caller.fixes.fixAllIssues()).rejects.toThrow(
      "Fix All requires a Pro subscription or active trial"
    );
  });
});

describe("fixes.getFixHistory", () => {
  it("returns fix history for authenticated user", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.fixes.getFixHistory();

    expect(result).toBeDefined();
    expect(result.fixes).toBeInstanceOf(Array);
  });
});
