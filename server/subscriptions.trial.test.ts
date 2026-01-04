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

describe("subscriptions.getPricing", () => {
  it("returns all pricing tiers including 5-day trial", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.subscriptions.getPricing();

    expect(result.tiers).toBeDefined();
    expect(result.tiers.length).toBeGreaterThan(0);

    // Check for trial tier
    const trialTier = result.tiers.find((t) => t.plan === "trial");
    expect(trialTier).toBeDefined();
    expect(trialTier?.price).toBe(0);
    expect(trialTier?.period).toBe("5 days");

    // Check for monthly tier
    const monthlyTier = result.tiers.find((t) => t.plan === "monthly");
    expect(monthlyTier).toBeDefined();
    expect(monthlyTier?.price).toBe(29.99);

    // Check for quarterly tier
    const quarterlyTier = result.tiers.find((t) => t.plan === "quarterly");
    expect(quarterlyTier).toBeDefined();
    expect(quarterlyTier?.price).toBe(69.99);

    // Check for biannual tier
    const biannualTier = result.tiers.find((t) => t.plan === "biannual");
    expect(biannualTier).toBeDefined();
    expect(biannualTier?.price).toBe(99.99);

    // Check for annual tier
    const annualTier = result.tiers.find((t) => t.plan === "annual");
    expect(annualTier).toBeDefined();
    expect(annualTier?.price).toBe(149.99);
  });
});

describe("subscriptions.getMySubscription", () => {
  it("returns free tier for new users", async () => {
    const { ctx } = createAuthContext(999999); // Use high ID unlikely to exist
    const caller = appRouter.createCaller(ctx);

    const result = await caller.subscriptions.getMySubscription();

    expect(result.tier).toBe("free");
    expect(result.status).toBe("active");
    expect(result.canStartTrial).toBe(true);
  });
});

describe("subscriptions.checkFeatureAccess", () => {
  it("denies premium features for free users", async () => {
    const { ctx } = createAuthContext(999998);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.subscriptions.checkFeatureAccess({
      featureKey: "pc-optimization",
    });

    expect(result.hasAccess).toBe(false);
    expect(result.reason).toContain("Pro subscription or active trial");
  });
});
