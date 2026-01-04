import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { performanceSnapshots } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

/**
 * Performance metrics router for tracking before/after improvements
 */
export const metricsRouter = router({
  /**
   * Capture performance snapshot before fix
   */
  captureBeforeSnapshot: protectedProcedure
    .input(
      z.object({
        fixType: z.string(),
        metrics: z.object({
          bootTimeSeconds: z.number().optional(),
          cpuUsagePercent: z.number().optional(),
          memoryUsagePercent: z.number().optional(),
          diskUsagePercent: z.number().optional(),
          startupProgramsCount: z.number().optional(),
          outdatedDriversCount: z.number().optional(),
          securityIssuesCount: z.number().optional(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.insert(performanceSnapshots).values({
        userId: ctx.user.id,
        snapshotType: "before_fix",
        fixType: input.fixType,
        bootTimeSeconds: input.metrics.bootTimeSeconds,
        cpuUsagePercent: input.metrics.cpuUsagePercent,
        memoryUsagePercent: input.metrics.memoryUsagePercent,
        diskUsagePercent: input.metrics.diskUsagePercent,
        startupProgramsCount: input.metrics.startupProgramsCount,
        outdatedDriversCount: input.metrics.outdatedDriversCount,
        securityIssuesCount: input.metrics.securityIssuesCount,
      });

      return { success: true };
    }),

  /**
   * Capture performance snapshot after fix
   */
  captureAfterSnapshot: protectedProcedure
    .input(
      z.object({
        fixType: z.string(),
        metrics: z.object({
          bootTimeSeconds: z.number().optional(),
          cpuUsagePercent: z.number().optional(),
          memoryUsagePercent: z.number().optional(),
          diskUsagePercent: z.number().optional(),
          startupProgramsCount: z.number().optional(),
          outdatedDriversCount: z.number().optional(),
          securityIssuesCount: z.number().optional(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.insert(performanceSnapshots).values({
        userId: ctx.user.id,
        snapshotType: "after_fix",
        fixType: input.fixType,
        bootTimeSeconds: input.metrics.bootTimeSeconds,
        cpuUsagePercent: input.metrics.cpuUsagePercent,
        memoryUsagePercent: input.metrics.memoryUsagePercent,
        diskUsagePercent: input.metrics.diskUsagePercent,
        startupProgramsCount: input.metrics.startupProgramsCount,
        outdatedDriversCount: input.metrics.outdatedDriversCount,
        securityIssuesCount: input.metrics.securityIssuesCount,
      });

      return { success: true };
    }),

  /**
   * Get performance comparison for a specific fix type
   */
  getPerformanceComparison: protectedProcedure
    .input(
      z.object({
        fixType: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get latest before and after snapshots
      const snapshots = await db
        .select()
        .from(performanceSnapshots)
        .where(
          input.fixType
            ? and(
                eq(performanceSnapshots.userId, ctx.user.id),
                eq(performanceSnapshots.fixType, input.fixType)
              )
            : eq(performanceSnapshots.userId, ctx.user.id)
        )
        .orderBy(desc(performanceSnapshots.createdAt))
        .limit(20);

      if (snapshots.length === 0) {
        return {
          hasData: false,
          improvements: null,
        };
      }

      // Find the most recent before/after pair
      const afterSnapshot = snapshots.find((s) => s.snapshotType === "after_fix");
      const beforeSnapshot = snapshots.find((s) => s.snapshotType === "before_fix");

      if (!afterSnapshot || !beforeSnapshot) {
        return {
          hasData: false,
          improvements: null,
        };
      }

      // Calculate improvements
      const calculateImprovement = (before: number | null, after: number | null) => {
        if (before === null || after === null || before === 0) return null;
        return Math.round(((before - after) / before) * 100);
      };

      const improvements = {
        bootTime: {
          before: beforeSnapshot.bootTimeSeconds,
          after: afterSnapshot.bootTimeSeconds,
          improvement: calculateImprovement(
            beforeSnapshot.bootTimeSeconds,
            afterSnapshot.bootTimeSeconds
          ),
        },
        cpuUsage: {
          before: beforeSnapshot.cpuUsagePercent,
          after: afterSnapshot.cpuUsagePercent,
          improvement: calculateImprovement(
            beforeSnapshot.cpuUsagePercent,
            afterSnapshot.cpuUsagePercent
          ),
        },
        memoryUsage: {
          before: beforeSnapshot.memoryUsagePercent,
          after: afterSnapshot.memoryUsagePercent,
          improvement: calculateImprovement(
            beforeSnapshot.memoryUsagePercent,
            afterSnapshot.memoryUsagePercent
          ),
        },
        diskUsage: {
          before: beforeSnapshot.diskUsagePercent,
          after: afterSnapshot.diskUsagePercent,
          improvement: calculateImprovement(
            beforeSnapshot.diskUsagePercent,
            afterSnapshot.diskUsagePercent
          ),
        },
        startupPrograms: {
          before: beforeSnapshot.startupProgramsCount,
          after: afterSnapshot.startupProgramsCount,
          improvement: calculateImprovement(
            beforeSnapshot.startupProgramsCount,
            afterSnapshot.startupProgramsCount
          ),
        },
        outdatedDrivers: {
          before: beforeSnapshot.outdatedDriversCount,
          after: afterSnapshot.outdatedDriversCount,
          improvement: calculateImprovement(
            beforeSnapshot.outdatedDriversCount,
            afterSnapshot.outdatedDriversCount
          ),
        },
        securityIssues: {
          before: beforeSnapshot.securityIssuesCount,
          after: afterSnapshot.securityIssuesCount,
          improvement: calculateImprovement(
            beforeSnapshot.securityIssuesCount,
            afterSnapshot.securityIssuesCount
          ),
        },
      };

      return {
        hasData: true,
        improvements,
        beforeSnapshot,
        afterSnapshot,
      };
    }),

  /**
   * Get all performance history
   */
  getPerformanceHistory: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const snapshots = await db
      .select()
      .from(performanceSnapshots)
      .where(eq(performanceSnapshots.userId, ctx.user.id))
      .orderBy(desc(performanceSnapshots.createdAt))
      .limit(50);

    return { snapshots };
  }),
});
