import * as cron from 'node-cron';
import { db } from '../db';
import { automaticSettings } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';
import { executeOptimization } from '../routers/optimizer';

interface ScheduledJob {
  userId: number;
  task: cron.ScheduledTask;
  frequency: string;
}

// Store active scheduled jobs
const activeJobs = new Map<number, ScheduledJob>();

/**
 * Convert frequency to cron expression
 */
function getCronExpression(frequency: string): string {
  switch (frequency) {
    case 'daily':
      // Run at 2 AM every day
      return '0 2 * * *';
    case 'weekly':
      // Run at 2 AM every Sunday
      return '0 2 * * 0';
    case 'monthly':
      // Run at 2 AM on the 1st of every month
      return '0 2 1 * *';
    default:
      return '0 2 * * 0'; // Default to weekly
  }
}

/**
 * Schedule optimization for a user
 */
export function scheduleOptimization(userId: number, frequency: string) {
  // Cancel existing job if any
  cancelOptimization(userId);

  const cronExpression = getCronExpression(frequency);
  
  console.log(`[Scheduler] Scheduling optimization for user ${userId} with frequency: ${frequency} (${cronExpression})`);

  // Create new scheduled task
  const task = cron.schedule(cronExpression, async () => {
    try {
      console.log(`[Scheduler] Running scheduled optimization for user ${userId}`);
      
      // Execute optimization
      await executeOptimization(userId);
      
      console.log(`[Scheduler] Completed scheduled optimization for user ${userId}`);
    } catch (error) {
      console.error(`[Scheduler] Error running scheduled optimization for user ${userId}:`, error);
    }
  });

  // Store the job
  activeJobs.set(userId, { userId, task, frequency });
  
  return { success: true, cronExpression };
}

/**
 * Cancel scheduled optimization for a user
 */
export function cancelOptimization(userId: number) {
  const job = activeJobs.get(userId);
  if (job) {
    console.log(`[Scheduler] Canceling scheduled optimization for user ${userId}`);
    job.task.stop();
    activeJobs.delete(userId);
    return { success: true };
  }
  return { success: false, message: 'No active job found' };
}

/**
 * Initialize scheduler on server start
 * Load all enabled schedules from database
 */
export async function initializeScheduler() {
  try {
    console.log('[Scheduler] Initializing optimization scheduler...');
    
    // Get all users with enabled schedules
    if (!db) {
      console.error('[Scheduler] Database not initialized');
      return;
    }
    
    const enabledSettings = await db
      .select()
      .from(automaticSettings)
      .where(eq(automaticSettings.scheduleEnabled, 1));
    
    console.log(`[Scheduler] Found ${enabledSettings.length} users with enabled schedules`);
    
    // Schedule optimization for each user
    for (const settings of enabledSettings) {
      scheduleOptimization(settings.userId, settings.scheduleFrequency);
    }
    
    console.log('[Scheduler] Optimization scheduler initialized successfully');
  } catch (error) {
    console.error('[Scheduler] Error initializing scheduler:', error);
  }
}

/**
 * Update schedule when settings change
 */
export function updateSchedule(userId: number, scheduleEnabled: boolean, frequency: string) {
  if (scheduleEnabled) {
    return scheduleOptimization(userId, frequency);
  } else {
    return cancelOptimization(userId);
  }
}

/**
 * Get active jobs (for debugging/monitoring)
 */
export function getActiveJobs() {
  return Array.from(activeJobs.values()).map(job => ({
    userId: job.userId,
    frequency: job.frequency,
    isRunning: job.task.getStatus() === 'scheduled',
  }));
}
