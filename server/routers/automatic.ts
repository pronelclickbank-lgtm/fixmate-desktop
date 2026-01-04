import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { automaticSettings } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { updateSchedule } from "../schedulers/optimizationScheduler";

export const automaticRouter = router({
  getSettings: protectedProcedure.query(async ({ ctx }) => {
    
    // Get user's automatic settings
    const [settings] = await db
      .select()
      .from(automaticSettings)
      .where(eq(automaticSettings.userId, ctx.user.id))
      .limit(1);
    
    // Return settings or defaults
    return settings || {
      scheduleEnabled: false,
      scheduleFrequency: 'weekly',
      optimizeOnStartup: false,
      lowDiskSpaceEnabled: false,
      diskSpaceThreshold: 10,
      autoBackup: true,
      optimizationProfile: 'balanced',
    };
  }),

  saveSettings: protectedProcedure
    .input(
      z.object({
        scheduleEnabled: z.boolean(),
        scheduleFrequency: z.enum(['daily', 'weekly', 'monthly']),
        optimizeOnStartup: z.boolean(),
        lowDiskSpaceEnabled: z.boolean(),
        diskSpaceThreshold: z.number().min(5).max(30),
        autoBackup: z.boolean(),
        optimizationProfile: z.enum(['quick', 'balanced', 'deep']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      
      // Check if settings exist
      const [existing] = await db
        .select()
        .from(automaticSettings)
        .where(eq(automaticSettings.userId, ctx.user.id))
        .limit(1);
      
      if (existing) {
        // Update existing settings
        await db
          .update(automaticSettings)
          .set({
            scheduleEnabled: input.scheduleEnabled ? 1 : 0,
            scheduleFrequency: input.scheduleFrequency,
            optimizeOnStartup: input.optimizeOnStartup ? 1 : 0,
            lowDiskSpaceEnabled: input.lowDiskSpaceEnabled ? 1 : 0,
            diskSpaceThreshold: input.diskSpaceThreshold,
            autoBackup: input.autoBackup ? 1 : 0,
            optimizationProfile: input.optimizationProfile,
          })
          .where(eq(automaticSettings.userId, ctx.user.id));
      } else {
        // Insert new settings
        await db.insert(automaticSettings).values({
          userId: ctx.user.id,
          scheduleEnabled: input.scheduleEnabled ? 1 : 0,
          scheduleFrequency: input.scheduleFrequency,
          optimizeOnStartup: input.optimizeOnStartup ? 1 : 0,
          lowDiskSpaceEnabled: input.lowDiskSpaceEnabled ? 1 : 0,
          diskSpaceThreshold: input.diskSpaceThreshold,
          autoBackup: input.autoBackup ? 1 : 0,
          optimizationProfile: input.optimizationProfile,
        });
      }
      
      // Update scheduler
      updateSchedule(ctx.user.id, input.scheduleEnabled, input.scheduleFrequency);
      
      return { success: true };
    }),
});
