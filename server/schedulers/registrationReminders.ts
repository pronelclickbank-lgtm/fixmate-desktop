import { db } from "../db";
import { users } from "../../drizzle/schema";
import { eq, and, or, isNull, lt } from "drizzle-orm";
import { notifyOwner } from "../_core/notification";

/**
 * Send registration reminders to unregistered users
 * Runs every 4 hours to check for users who need reminders
 */
export async function sendRegistrationReminders() {
  try {
    // Find unregistered users who haven't been notified in the last 4 hours
    const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000);
    
    const unregisteredUsers = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.isRegistered, 0),
          or(
            isNull(users.lastNotificationSentAt),
            lt(users.lastNotificationSentAt, fourHoursAgo)
          )
        )
      );

    console.log(`[Registration Reminders] Found ${unregisteredUsers.length} users to notify`);

    for (const user of unregisteredUsers) {
      // Send notification to owner about unregistered user
      await notifyOwner({
        title: "User Registration Reminder",
        content: `User ${user.name || user.email || user.openId} (Usage: ${user.usageCount || 0} times) hasn't registered yet. Consider sending them a reminder.`,
      });

      // Update last notification timestamp
      await db
        .update(users)
        .set({
          lastNotificationSentAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id));
    }

    return {
      success: true,
      notifiedCount: unregisteredUsers.length,
    };
  } catch (error) {
    console.error("[Registration Reminders] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Initialize the scheduler
 * Call this function from your server startup
 */
export function startRegistrationReminderScheduler() {
  // Run immediately on startup
  sendRegistrationReminders();

  // Then run every 4 hours
  setInterval(sendRegistrationReminders, 4 * 60 * 60 * 1000);
  
  console.log("[Registration Reminders] Scheduler started (runs every 4 hours)");
}
