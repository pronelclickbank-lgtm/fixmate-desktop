import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { db } from "../db";
import {
  featureFlags,
  appUpdates,
  licenseKeys,
  subscriptions,
  users,
  appSettings,
} from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { nanoid } from "nanoid";
import { TRPCError } from "@trpc/server";

/**
 * Admin router for managing features, updates, users, and licenses
 * Only accessible to users with admin role
 */

// Middleware to check admin access
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Admin access required",
    });
  }
  return next();
});

export const adminRouter = router({
  // Feature Flags Management
  featureFlags: router({
    list: adminProcedure.query(async () => {
      return await db.select().from(featureFlags).orderBy(featureFlags.flagKey);
    }),

    create: adminProcedure
      .input(
        z.object({
          flagKey: z.string().min(1),
          flagName: z.string().min(1),
          description: z.string().optional(),
          enabled: z.enum(["true", "false"]),
          requiresPro: z.enum(["true", "false"]),
        })
      )
      .mutation(async ({ input }) => {
        const [flag] = await db.insert(featureFlags).values(input);
        return { id: flag.insertId, ...input };
      }),

    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          flagName: z.string().optional(),
          description: z.string().optional(),
          enabled: z.enum(["true", "false"]).optional(),
          requiresPro: z.enum(["true", "false"]).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        await db
          .update(featureFlags)
          .set({ ...updates, updatedAt: new Date() })
          .where(eq(featureFlags.id, id));
        return { success: true };
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.delete(featureFlags).where(eq(featureFlags.id, input.id));
        return { success: true };
      }),
  }),

  // App Updates Management
  updates: router({
    list: adminProcedure.query(async () => {
      return await db.select().from(appUpdates).orderBy(desc(appUpdates.releasedAt));
    }),

    create: adminProcedure
      .input(
        z.object({
          version: z.string().min(1),
          changelog: z.string().min(1),
          downloadUrl: z.string().url(),
          releaseType: z.enum(["stable", "beta", "alpha"]),
          mandatory: z.enum(["true", "false"]),
        })
      )
      .mutation(async ({ input }) => {
        const [update] = await db.insert(appUpdates).values(input);
        return { id: update.insertId, ...input };
      }),

    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          changelog: z.string().optional(),
          downloadUrl: z.string().url().optional(),
          releaseType: z.enum(["stable", "beta", "alpha"]).optional(),
          mandatory: z.enum(["true", "false"]).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        await db.update(appUpdates).set(updates).where(eq(appUpdates.id, id));
        return { success: true };
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.delete(appUpdates).where(eq(appUpdates.id, input.id));
        return { success: true };
      }),

    getLatest: protectedProcedure
      .input(
        z.object({
          releaseType: z.enum(["stable", "beta", "alpha"]).optional(),
        })
      )
      .query(async ({ input }) => {
        const query = db.select().from(appUpdates);

        if (input.releaseType) {
          const [latest] = await query
            .where(eq(appUpdates.releaseType, input.releaseType))
            .orderBy(desc(appUpdates.releasedAt))
            .limit(1);
          return latest || null;
        }

        const [latest] = await query.orderBy(desc(appUpdates.releasedAt)).limit(1);
        return latest || null;
      }),
  }),

  // License Keys Management
  licenses: router({
    list: adminProcedure
      .input(
        z.object({
          status: z.enum(["active", "revoked", "expired"]).optional(),
          limit: z.number().min(1).max(100).default(50),
        })
      )
      .query(async ({ input }) => {
        const query = db.select().from(licenseKeys);

        if (input.status) {
          return await query
            .where(eq(licenseKeys.status, input.status))
            .orderBy(desc(licenseKeys.createdAt))
            .limit(input.limit);
        }

        return await query.orderBy(desc(licenseKeys.createdAt)).limit(input.limit);
      }),

    generate: adminProcedure
      .input(
        z.object({
          count: z.number().min(1).max(100),
          tier: z.enum(["free", "pro"]),
          maxActivations: z.number().min(1).default(1),
          expiresInDays: z.number().min(1).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const keys = [];
        const expiresAt = input.expiresInDays
          ? new Date(Date.now() + input.expiresInDays * 24 * 60 * 60 * 1000)
          : null;

        for (let i = 0; i < input.count; i++) {
          const key = `FM-${nanoid(16).toUpperCase()}`;
          keys.push({
            key,
            tier: input.tier,
            maxActivations: input.maxActivations,
            currentActivations: 0,
            status: "active" as const,
            expiresAt,
          });
        }

        await db.insert(licenseKeys).values(keys);
        return { generated: keys.length, keys: keys.map((k) => k.key) };
      }),

    revoke: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db
          .update(licenseKeys)
          .set({ status: "revoked", updatedAt: new Date() })
          .where(eq(licenseKeys.id, input.id));
        return { success: true };
      }),
  }),

  // User Management
  users: router({
    list: adminProcedure
      .input(
        z.object({
          limit: z.number().min(1).max(100).default(50),
          offset: z.number().min(0).default(0),
        })
      )
      .query(async ({ input }) => {
        const usersList = await db
          .select()
          .from(users)
          .orderBy(desc(users.createdAt))
          .limit(input.limit)
          .offset(input.offset);

        // Get subscription info for each user
        const usersWithSubs = await Promise.all(
          usersList.map(async (user) => {
            const [subscription] = await db
              .select()
              .from(subscriptions)
              .where(eq(subscriptions.userId, user.id))
              .limit(1);

            return {
              ...user,
              subscription: subscription || null,
            };
          })
        );

        return usersWithSubs;
      }),

    updateRole: adminProcedure
      .input(
        z.object({
          userId: z.number(),
          role: z.enum(["user", "admin"]),
        })
      )
      .mutation(async ({ input }) => {
        await db
          .update(users)
          .set({ role: input.role, updatedAt: new Date() })
          .where(eq(users.id, input.userId));
        return { success: true };
      }),

    getStats: adminProcedure.query(async () => {
      const allUsers = await db.select().from(users);
      const allSubscriptions = await db.select().from(subscriptions);

      const totalUsers = allUsers.length;
      const freeUsers = allSubscriptions.filter((s) => s.tier === "free").length;
      const proUsers = allSubscriptions.filter((s) => s.tier === "pro").length;
      const activeSubscriptions = allSubscriptions.filter(
        (s) => s.status === "active"
      ).length;

      return {
        totalUsers,
        freeUsers,
        proUsers,
        activeSubscriptions,
        revenue: proUsers * 29.99, // Simple calculation
      };
    }),
  }),

  // App Settings Management
  getSettings: adminProcedure.query(async () => {
    const [settings] = await db.select().from(appSettings).limit(1);
    if (!settings) {
      // Return default settings if none exist
      return {
        id: 0,
        proPlanEnabled: "false" as const,
        monthlyPrice: 999,
        yearlyPrice: 9999,
        trialDays: 5,
        paypalEnabled: "false" as const,
        paypalClientId: null,
        paypalClientSecret: null,
        paypalMode: "sandbox" as const,
        stripeEnabled: "false" as const,
        stripePublicKey: null,
        stripeSecretKey: null,
        intuitEnabled: "false" as const,
        intuitClientId: null,
        intuitClientSecret: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
    return settings;
  }),

  updateSettings: adminProcedure
    .input(
      z.object({
        proPlanEnabled: z.enum(["true", "false"]),
        monthlyPrice: z.number().min(0),
        yearlyPrice: z.number().min(0),
        trialDays: z.number().min(0),
        paypalEnabled: z.enum(["true", "false"]),
        paypalClientId: z.string().nullable(),
        paypalClientSecret: z.string().nullable(),
        paypalMode: z.enum(["sandbox", "live"]),
        stripeEnabled: z.enum(["true", "false"]),
        stripePublicKey: z.string().nullable(),
        stripeSecretKey: z.string().nullable(),
        intuitEnabled: z.enum(["true", "false"]),
        intuitClientId: z.string().nullable(),
        intuitClientSecret: z.string().nullable(),
      })
    )
    .mutation(async ({ input }) => {
      // Check if settings exist
      const [existing] = await db.select().from(appSettings).limit(1);
      
      if (existing) {
        // Update existing settings
        await db
          .update(appSettings)
          .set({ ...input, updatedAt: new Date() })
          .where(eq(appSettings.id, existing.id));
      } else {
        // Insert new settings
        await db.insert(appSettings).values(input);
      }
      
      return { success: true };
    }),
});
