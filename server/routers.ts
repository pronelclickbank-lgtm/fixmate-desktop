import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { diagnosticsRouter } from "./routers/diagnostics";
import { subscriptionsRouter } from "./routers/subscriptions";
import { chatRouter } from "./routers/chat";
import { adminRouter } from "./routers/admin";
import { fixesRouter } from "./routers/fixes";
import { metricsRouter } from "./routers/metrics";
import { userRouter } from "./routers/user";
import { optimizerRouter } from "./routers/optimizer";
import { updatesRouter } from "./routers/updates";
import { automaticRouter } from "./routers/automatic";
import { startupRouter } from "./routers/startup";
import { processesRouter } from "./routers/processes";
import { backupsRouter } from "./routers/backups";
import { adminDashboardRouter } from "./routers/adminDashboardIntegration";
import { licenseRouter } from "./routers/license";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // FixMate AI routers
  diagnostics: diagnosticsRouter,
  subscriptions: subscriptionsRouter,
  chat: chatRouter,
  admin: adminRouter,
  fixes: fixesRouter,
  metrics: metricsRouter,
  user: userRouter,
  optimizer: optimizerRouter,
  updates: updatesRouter,
  automatic: automaticRouter,
  startup: startupRouter,
  processes: processesRouter,
  backups: backupsRouter,
  adminDashboard: adminDashboardRouter,
  license: licenseRouter,
});

export type AppRouter = typeof appRouter;
