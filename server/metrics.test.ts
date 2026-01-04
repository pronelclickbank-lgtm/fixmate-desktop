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

describe("metrics.captureBeforeSnapshot", () => {
  it("captures performance snapshot before fix", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.metrics.captureBeforeSnapshot({
      fixType: "windows_update",
      metrics: {
        bootTimeSeconds: 60,
        cpuUsagePercent: 45,
        memoryUsagePercent: 50,
        diskUsagePercent: 50,
        startupProgramsCount: 10,
        outdatedDriversCount: 3,
        securityIssuesCount: 3,
      },
    });

    expect(result.success).toBe(true);
  });
});

describe("metrics.captureAfterSnapshot", () => {
  it("captures performance snapshot after fix", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.metrics.captureAfterSnapshot({
      fixType: "windows_update",
      metrics: {
        bootTimeSeconds: 40,
        cpuUsagePercent: 35,
        memoryUsagePercent: 40,
        diskUsagePercent: 48,
        startupProgramsCount: 8,
        outdatedDriversCount: 0,
        securityIssuesCount: 0,
      },
    });

    expect(result.success).toBe(true);
  });
});

describe("metrics.getPerformanceComparison", () => {
  it("returns performance comparison data", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // First capture before snapshot
    await caller.metrics.captureBeforeSnapshot({
      fixType: "all_fixes",
      metrics: {
        bootTimeSeconds: 60,
        cpuUsagePercent: 45,
        memoryUsagePercent: 50,
        securityIssuesCount: 3,
      },
    });

    // Then capture after snapshot
    await caller.metrics.captureAfterSnapshot({
      fixType: "all_fixes",
      metrics: {
        bootTimeSeconds: 40,
        cpuUsagePercent: 35,
        memoryUsagePercent: 40,
        securityIssuesCount: 0,
      },
    });

    const result = await caller.metrics.getPerformanceComparison({
      fixType: "all_fixes",
    });

    expect(result.hasData).toBe(true);
    if (result.improvements) {
      expect(result.improvements.bootTime).toBeDefined();
      expect(result.improvements.cpuUsage).toBeDefined();
      expect(result.improvements.memoryUsage).toBeDefined();
    }
  });
});

describe("metrics.getPerformanceHistory", () => {
  it("returns performance history for user", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.metrics.getPerformanceHistory();

    expect(result).toBeDefined();
    expect(result.snapshots).toBeInstanceOf(Array);
  });
});
