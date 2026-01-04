import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { subscriptions, licenseKeys } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * Subscriptions router for managing billing, trials, and license keys
 */
export const subscriptionsRouter = router({
  /**
   * Get pricing tiers
   */
  getPricing: publicProcedure.query(() => {
    return {
      tiers: [
        {
          name: "Free",
          price: 0,
          period: "forever",
          plan: "none",
          features: [
            "Basic system diagnostics",
            "Security status check",
            "AI chat support (limited)",
            "View startup programs",
            "Driver detection only",
          ],
        },
        {
          name: "5-Day Trial",
          price: 0,
          period: "5 days",
          plan: "trial",
          features: [
            "Full PC optimization",
            "Speed up your computer",
            "Unlimited AI chat support",
            "All Pro features unlocked",
            "No credit card required",
          ],
          highlight: true,
        },
        {
          name: "Monthly",
          price: 29.99,
          period: "month",
          plan: "monthly",
          features: [
            "Everything in Trial",
            "Driver auto-updates",
            "Advanced optimization",
            "Priority AI support",
            "Performance monitoring",
          ],
        },
        {
          name: "3 Months",
          price: 69.99,
          period: "3 months",
          plan: "quarterly",
          savings: "Save $20",
          features: [
            "Everything in Monthly",
            "3 months of Pro access",
            "Best value for quarterly",
          ],
        },
        {
          name: "6 Months",
          price: 99.99,
          period: "6 months",
          plan: "biannual",
          savings: "Save $80",
          features: [
            "Everything in Monthly",
            "6 months of Pro access",
            "Great long-term value",
          ],
        },
        {
          name: "Annual",
          price: 149.99,
          period: "year",
          plan: "annual",
          savings: "Save $210",
          highlight: true,
          features: [
            "Everything in Monthly",
            "Full year of Pro access",
            "Best value - 58% off",
            "Priority support",
          ],
        },
      ],
    };
  }),

  /**
   * Get current user's subscription status with trial info
   */
  getMySubscription: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, ctx.user.id))
      .limit(1);

    if (!subscription) {
      // Create free tier subscription for new users
      await db.insert(subscriptions).values({
        userId: ctx.user.id,
        tier: "free",
        status: "active",
      });

      return {
        tier: "free" as const,
        status: "active" as const,
        plan: "none" as const,
        hasUsedTrial: false,
        trialEndsAt: null,
        expiresAt: null,
        canStartTrial: true,
      };
    }

    // Check if trial has expired
    const now = new Date();
    if (
      subscription.tier === "trial" &&
      subscription.trialEndsAt &&
      new Date(subscription.trialEndsAt) < now
    ) {
      // Expire the trial
      await db
        .update(subscriptions)
        .set({
          tier: "free",
          status: "expired",
        })
        .where(eq(subscriptions.id, subscription.id));

      return {
        ...subscription,
        tier: "free" as const,
        status: "expired" as const,
        canStartTrial: false,
      };
    }

    return {
      ...subscription,
      canStartTrial: !subscription.hasUsedTrial && subscription.tier === "free",
    };
  }),

  /**
   * Start free 5-day trial
   */
  startTrial: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Check if user already has a subscription
    const [existing] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, ctx.user.id))
      .limit(1);

    if (existing) {
      if (existing.hasUsedTrial) {
        throw new Error("You have already used your free trial");
      }
      if (existing.tier === "trial" || existing.tier === "pro") {
        throw new Error("You already have an active subscription");
      }
    }

    const now = new Date();
    const trialEnds = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000); // 5 days

    if (existing) {
      // Update existing subscription
      await db
        .update(subscriptions)
        .set({
          tier: "trial",
          status: "trial",
          trialStartedAt: now,
          trialEndsAt: trialEnds,
          hasUsedTrial: 1,
          expiresAt: trialEnds,
        })
        .where(eq(subscriptions.userId, ctx.user.id));
    } else {
      // Create new subscription
      await db.insert(subscriptions).values({
        userId: ctx.user.id,
        tier: "trial",
        status: "trial",
        trialStartedAt: now,
        trialEndsAt: trialEnds,
        hasUsedTrial: 1,
        expiresAt: trialEnds,
      });
    }

    return {
      success: true,
      trialEndsAt: trialEnds,
      message: "Your 5-day free trial has started! Enjoy full PC optimization features.",
    };
  }),

  /**
   * Activate a license key
   */
  activateLicense: protectedProcedure
    .input(
      z.object({
        licenseKey: z.string().min(10),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Find the license key
      const [license] = await db
        .select()
        .from(licenseKeys)
        .where(eq(licenseKeys.key, input.licenseKey))
        .limit(1);

      if (!license) {
        throw new Error("Invalid license key");
      }

      if (license.status !== "active") {
        throw new Error("License key is not active");
      }

      if (license.expiresAt && new Date(license.expiresAt) < new Date()) {
        throw new Error("License key has expired");
      }

      if (license.currentActivations >= license.maxActivations) {
        throw new Error("License key has reached maximum activations");
      }

      // Get or create user subscription
      const [existingSub] = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.userId, ctx.user.id))
        .limit(1);

      if (existingSub) {
        // Update existing subscription
        await db
          .update(subscriptions)
          .set({
            tier: license.tier,
            status: "active",
            licenseKey: input.licenseKey,
            expiresAt: license.expiresAt,
            updatedAt: new Date(),
          })
          .where(eq(subscriptions.id, existingSub.id));
      } else {
        // Create new subscription
        await db.insert(subscriptions).values({
          userId: ctx.user.id,
          tier: license.tier,
          status: "active",
          licenseKey: input.licenseKey,
          expiresAt: license.expiresAt,
        });
      }

      // Increment activation count
      await db
        .update(licenseKeys)
        .set({
          currentActivations: license.currentActivations + 1,
          updatedAt: new Date(),
        })
        .where(eq(licenseKeys.id, license.id));

      return {
        success: true,
        tier: license.tier,
        expiresAt: license.expiresAt,
      };
    }),

  /**
   * Check if user has access to a specific feature
   */
  checkFeatureAccess: protectedProcedure
    .input(
      z.object({
        featureKey: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [subscription] = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.userId, ctx.user.id))
        .limit(1);

      // Features that require Pro or Trial tier
      const premiumFeatures = [
        "driver-updates",
        "pc-optimization",
        "speed-boost",
        "advanced-diagnostics",
        "priority-support",
        "auto-fix",
      ];

      const requiresPremium = premiumFeatures.includes(input.featureKey);

      if (
        requiresPremium &&
        (!subscription || (subscription.tier !== "pro" && subscription.tier !== "trial"))
      ) {
        return {
          hasAccess: false,
          reason: "This feature requires a Pro subscription or active trial",
          currentTier: subscription?.tier || "free",
        };
      }

      // Check if subscription is active
      if (subscription && subscription.status !== "active" && subscription.status !== "trial") {
        return {
          hasAccess: false,
          reason: "Your subscription is not active",
          currentTier: subscription.tier,
        };
      }

      // Check if subscription has expired
      if (subscription?.expiresAt && new Date(subscription.expiresAt) < new Date()) {
        return {
          hasAccess: false,
          reason: "Your subscription has expired",
          currentTier: subscription.tier,
        };
      }

      return {
        hasAccess: true,
        currentTier: subscription?.tier || "free",
      };
    }),

  /**
   * Cancel subscription
   */
  cancelSubscription: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, ctx.user.id))
      .limit(1);

    if (!subscription) {
      throw new Error("No active subscription found");
    }

    await db
      .update(subscriptions)
      .set({
        status: "cancelled",
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.id, subscription.id));

    return {
      success: true,
      message: "Subscription cancelled successfully",
    };
  }),
});
