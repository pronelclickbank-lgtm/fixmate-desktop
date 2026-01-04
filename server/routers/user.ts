import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { db } from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import fetch from "node-fetch";

const ADMIN_API_BASE_URL = "https://pcdoctor-dash-gkqdsdzm.manus.space/api/trpc";

/**
 * Sync user registration to admin dashboard
 */
async function syncUserToAdminDashboard(email: string, name: string, phone: string) {
  try {
    await fetch(`${ADMIN_API_BASE_URL}/users.register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        username: name,
        phone,
        plan_type: "free",
      }),
    });
  } catch (error) {
    console.error("Failed to sync user to admin dashboard:", error);
  }
}

export const userRouter = router({
  /**
   * Register user with name, email, and phone
   */
  register: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required"),
        email: z.string().email("Invalid email address"),
        phone: z.string().min(1, "Phone number is required"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await db
        .update(users)
        .set({
          name: input.name,
          email: input.email,
          phone: input.phone,
          isRegistered: 1,
          registeredAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(users.id, ctx.user.id));

      // Sync to admin dashboard
      await syncUserToAdminDashboard(input.email, input.name, input.phone);

      return { success: true };
    }),

  /**
   * Track app usage - increment usage count
   */
  trackUsage: protectedProcedure.mutation(async ({ ctx }) => {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, ctx.user.id))
      .limit(1);

    if (!user) {
      throw new Error("User not found");
    }

    await db
      .update(users)
      .set({
        usageCount: (user.usageCount || 0) + 1,
        lastUsedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, ctx.user.id));

    return {
      usageCount: (user.usageCount || 0) + 1,
      shouldShowRegistration: (user.usageCount || 0) + 1 >= 2 && user.isRegistered === 0,
    };
  }),

  /**
   * Get current user's registration status
   */
  getRegistrationStatus: protectedProcedure.query(async ({ ctx }) => {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, ctx.user.id))
      .limit(1);

    if (!user) {
      return {
        isRegistered: false,
        usageCount: 0,
        shouldShowRegistration: false,
      };
    }

    return {
      isRegistered: user.isRegistered === 1,
      usageCount: user.usageCount || 0,
      shouldShowRegistration: (user.usageCount || 0) >= 2 && user.isRegistered === 0,
    };
  }),

  /**
   * Update last notification sent timestamp
   */
  updateLastNotification: protectedProcedure.mutation(async ({ ctx }) => {
    await db
      .update(users)
      .set({
        lastNotificationSentAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, ctx.user.id));

    return { success: true };
  }),
});
