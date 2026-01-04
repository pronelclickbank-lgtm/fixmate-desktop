import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { db } from "../db";
import { startupPrograms } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export const startupRouter = router({
  // Get all startup programs
  getPrograms: protectedProcedure.query(async () => {
    const programs = await db.select().from(startupPrograms);
    return programs;
  }),

  // Toggle program enabled/disabled
  toggleProgram: protectedProcedure
    .input(
      z.object({
        programId: z.number(),
        enabled: z.boolean(),
      })
    )
    .mutation(async ({ input }) => {
      await db
        .update(startupPrograms)
        .set({ enabled: input.enabled ? 1 : 0, updatedAt: new Date() })
        .where(eq(startupPrograms.id, input.programId));

      return { success: true };
    }),

  // Get program details
  getProgram: protectedProcedure
    .input(z.object({ programId: z.number() }))
    .query(async ({ input }) => {
      const program = await db
        .select()
        .from(startupPrograms)
        .where(eq(startupPrograms.id, input.programId))
        .limit(1);

      return program[0] || null;
    }),
});
