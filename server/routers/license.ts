import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { db } from "../db";
import { licenseKeys, licenseActivations } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

export const licenseRouter = router({
  /**
   * Validate and activate a license key
   */
  validateLicense: publicProcedure
    .input(
      z.object({
        licenseKey: z.string().min(1),
        deviceId: z.string().min(1),
        userEmail: z.string().email().optional(),
        userName: z.string().optional(),
        installationDate: z.string(), // ISO date string
      })
    )
    .mutation(async ({ input }) => {
      if (!db) throw new Error("Database not initialized");

      // Find the license key
      const [license] = await db
        .select()
        .from(licenseKeys)
        .where(eq(licenseKeys.key, input.licenseKey))
        .limit(1);

      if (!license) {
        return {
          success: false,
          message: "Invalid license key",
        };
      }

      // Check if license is active
      if (license.status !== "active") {
        return {
          success: false,
          message: `License is ${license.status}`,
        };
      }

      // Check if license has expired
      if (license.expiresAt && new Date(license.expiresAt) < new Date()) {
        return {
          success: false,
          message: "License has expired",
        };
      }

      // Check if this device already has an activation
      const [existingActivation] = await db
        .select()
        .from(licenseActivations)
        .where(
          and(
            eq(licenseActivations.licenseKeyId, license.id),
            eq(licenseActivations.deviceId, input.deviceId)
          )
        )
        .limit(1);

      if (existingActivation) {
        // Update last seen
        await db
          .update(licenseActivations)
          .set({
            lastSeenAt: new Date(),
            userEmail: input.userEmail,
            userName: input.userName,
          })
          .where(eq(licenseActivations.id, existingActivation.id));

        return {
          success: true,
          message: "License already activated on this device",
          license: {
            tier: license.tier,
            expiresAt: license.expiresAt,
          },
        };
      }

      // Check if max activations reached
      if (license.currentActivations >= license.maxActivations) {
        return {
          success: false,
          message: `Maximum activations (${license.maxActivations}) reached for this license`,
        };
      }

      // Create new activation
      await db.insert(licenseActivations).values({
        licenseKeyId: license.id,
        deviceId: input.deviceId,
        userEmail: input.userEmail || null,
        userName: input.userName || null,
        installationDate: new Date(input.installationDate),
        lastSeenAt: new Date(),
        status: "active",
      });

      // Increment activation count
      await db
        .update(licenseKeys)
        .set({
          currentActivations: license.currentActivations + 1,
        })
        .where(eq(licenseKeys.id, license.id));

      return {
        success: true,
        message: "License activated successfully",
        license: {
          tier: license.tier,
          expiresAt: license.expiresAt,
        },
      };
    }),

  /**
   * Check if a license is valid for a device
   */
  checkLicense: publicProcedure
    .input(
      z.object({
        licenseKey: z.string().min(1),
        deviceId: z.string().min(1),
      })
    )
    .query(async ({ input }) => {
      if (!db) throw new Error("Database not initialized");

      // Find the license key
      const [license] = await db
        .select()
        .from(licenseKeys)
        .where(eq(licenseKeys.key, input.licenseKey))
        .limit(1);

      if (!license) {
        return {
          valid: false,
          message: "Invalid license key",
        };
      }

      // Check if license is active
      if (license.status !== "active") {
        return {
          valid: false,
          message: `License is ${license.status}`,
        };
      }

      // Check if license has expired
      if (license.expiresAt && new Date(license.expiresAt) < new Date()) {
        return {
          valid: false,
          message: "License has expired",
        };
      }

      // Check if this device has an active activation
      const [activation] = await db
        .select()
        .from(licenseActivations)
        .where(
          and(
            eq(licenseActivations.licenseKeyId, license.id),
            eq(licenseActivations.deviceId, input.deviceId),
            eq(licenseActivations.status, "active")
          )
        )
        .limit(1);

      if (!activation) {
        return {
          valid: false,
          message: "License not activated on this device",
        };
      }

      // Update last seen
      await db
        .update(licenseActivations)
        .set({
          lastSeenAt: new Date(),
        })
        .where(eq(licenseActivations.id, activation.id));

      return {
        valid: true,
        message: "License is valid",
        license: {
          tier: license.tier,
          expiresAt: license.expiresAt,
        },
      };
    }),

  /**
   * Generate a new license key (admin only)
   */
  generateLicense: publicProcedure
    .input(
      z.object({
        tier: z.enum(["free", "pro"]),
        maxActivations: z.number().int().min(1).default(1),
        expiresAt: z.string().optional(), // ISO date string
      })
    )
    .mutation(async ({ input }) => {
      if (!db) throw new Error("Database not initialized");

      // Generate a random license key
      const key = generateLicenseKey();

      // Insert into database
      await db.insert(licenseKeys).values({
        key,
        tier: input.tier,
        maxActivations: input.maxActivations,
        currentActivations: 0,
        status: "active",
        expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
      });

      return {
        success: true,
        licenseKey: key,
      };
    }),

  /**
   * List all license keys (admin only)
   */
  listLicenses: publicProcedure.query(async () => {
    if (!db) throw new Error("Database not initialized");

    const licenses = await db.select().from(licenseKeys);

    return licenses;
  }),

  /**
   * List all activations for a license key (admin only)
   */
  listActivations: publicProcedure
    .input(z.object({ licenseKeyId: z.number().int() }))
    .query(async ({ input }) => {
      if (!db) throw new Error("Database not initialized");

      const activations = await db
        .select()
        .from(licenseActivations)
        .where(eq(licenseActivations.licenseKeyId, input.licenseKeyId));

      return activations;
    }),
});

/**
 * Generate a random license key in format: FMAI-XXXX-XXXX-XXXX-XXXX
 */
function generateLicenseKey(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Exclude similar looking characters
  const segments = 4;
  const segmentLength = 4;

  const parts = ["FMAI"];

  for (let i = 0; i < segments; i++) {
    let segment = "";
    for (let j = 0; j < segmentLength; j++) {
      segment += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    parts.push(segment);
  }

  return parts.join("-");
}
