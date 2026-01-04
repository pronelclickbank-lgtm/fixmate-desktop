import { z } from "zod";
import { router, publicProcedure } from "../_core/trpc.js";
import * as adminAPI from "../_core/adminDashboardAPI.js";

export const adminDashboardRouter = router({
  // Register a new user
  registerUser: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        username: z.string().optional(),
        phone: z.string().optional(),
        planType: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await adminAPI.registerUser(input);
    }),

  // Activate license key
  activateLicense: publicProcedure
    .input(
      z.object({
        licenseKey: z.string(),
        deviceId: z.string(),
        userEmail: z.string().email(),
      })
    )
    .mutation(async ({ input }) => {
      return await adminAPI.activateLicense(input);
    }),

  // Track user activity
  trackUsage: publicProcedure
    .input(
      z.object({
        userEmail: z.string().email(),
        action: z.string(),
        metadata: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await adminAPI.trackUsage(input);
    }),

  // Get feature flags
  getFeatureFlags: publicProcedure.query(async () => {
    return await adminAPI.getFeatureFlags();
  }),

  // Check for updates
  checkUpdates: publicProcedure
    .input(
      z.object({
        currentVersion: z.string(),
      })
    )
    .query(async ({ input }) => {
      return await adminAPI.checkForUpdates(input.currentVersion);
    }),

  // Get user notifications
  getNotifications: publicProcedure
    .input(
      z.object({
        userEmail: z.string().email(),
      })
    )
    .query(async ({ input }) => {
      return await adminAPI.getNotifications(input.userEmail);
    }),
});
