import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  // Registration fields
  phone: varchar("phone", { length: 20 }),
  registeredAt: timestamp("registeredAt"),
  isRegistered: int("isRegistered").default(0).notNull(), // 0 = no, 1 = yes
  // Usage tracking
  usageCount: int("usageCount").default(0).notNull(),
  lastUsedAt: timestamp("lastUsedAt"),
  lastNotificationSentAt: timestamp("lastNotificationSentAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Subscriptions table for managing free and pro tiers
 */
export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  tier: mysqlEnum("tier", ["free", "trial", "pro"]).default("free").notNull(),
  plan: mysqlEnum("plan", ["none", "monthly", "quarterly", "biannual", "annual"]).default("none"),
  status: mysqlEnum("status", ["active", "trial", "cancelled", "expired"]).default("active").notNull(),
  licenseKey: varchar("licenseKey", { length: 64 }).unique(),
  stripeCustomerId: varchar("stripeCustomerId", { length: 128 }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 128 }),
  // Trial tracking
  trialStartedAt: timestamp("trialStartedAt"),
  trialEndsAt: timestamp("trialEndsAt"),
  hasUsedTrial: int("hasUsedTrial").default(0).notNull(), // 0 = no, 1 = yes
  // Subscription dates
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

/**
 * System scans table for storing diagnostic results
 */
export const systemScans = mysqlTable("systemScans", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  scanType: mysqlEnum("scanType", ["full", "quick", "drivers", "security"]).notNull(),
  results: text("results").notNull(), // JSON string
  issuesFound: int("issuesFound").default(0).notNull(),
  status: mysqlEnum("status", ["running", "completed", "failed"]).default("running").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SystemScan = typeof systemScans.$inferSelect;
export type InsertSystemScan = typeof systemScans.$inferInsert;

/**
 * Chat conversations table for AI chat history
 */
export const chatConversations = mysqlTable("chatConversations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  messages: text("messages").notNull(), // JSON array of messages
  systemContext: text("systemContext"), // JSON string of system info
  status: mysqlEnum("status", ["active", "archived"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ChatConversation = typeof chatConversations.$inferSelect;
export type InsertChatConversation = typeof chatConversations.$inferInsert;

/**
 * Feature flags table for admin control of features
 */
export const featureFlags = mysqlTable("featureFlags", {
  id: int("id").autoincrement().primaryKey(),
  flagKey: varchar("flagKey", { length: 128 }).notNull().unique(),
  flagName: varchar("flagName", { length: 256 }).notNull(),
  description: text("description"),
  enabled: mysqlEnum("enabled", ["true", "false"]).default("true").notNull(),
  requiresPro: mysqlEnum("requiresPro", ["true", "false"]).default("false").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FeatureFlag = typeof featureFlags.$inferSelect;
export type InsertFeatureFlag = typeof featureFlags.$inferInsert;

/**
 * App updates table for version management
 */
export const appUpdates = mysqlTable("appUpdates", {
  id: int("id").autoincrement().primaryKey(),
  version: varchar("version", { length: 32 }).notNull().unique(),
  changelog: text("changelog").notNull(),
  downloadUrl: varchar("downloadUrl", { length: 512 }).notNull(),
  releaseType: mysqlEnum("releaseType", ["stable", "beta", "alpha"]).default("stable").notNull(),
  mandatory: mysqlEnum("mandatory", ["true", "false"]).default("false").notNull(),
  releasedAt: timestamp("releasedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AppUpdate = typeof appUpdates.$inferSelect;
export type InsertAppUpdate = typeof appUpdates.$inferInsert;

/**
 * License keys table for activation codes
 */
export const licenseKeys = mysqlTable("licenseKeys", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 64 }).notNull().unique(),
  tier: mysqlEnum("tier", ["free", "pro"]).default("pro").notNull(),
  maxActivations: int("maxActivations").default(1).notNull(),
  currentActivations: int("currentActivations").default(0).notNull(),
  status: mysqlEnum("status", ["active", "revoked", "expired"]).default("active").notNull(),
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LicenseKey = typeof licenseKeys.$inferSelect;
export type InsertLicenseKey = typeof licenseKeys.$inferInsert;

/**
 * License activations table for tracking which users have activated which licenses
 */
export const licenseActivations = mysqlTable("licenseActivations", {
  id: int("id").autoincrement().primaryKey(),
  licenseKeyId: int("licenseKeyId").notNull(),
  deviceId: varchar("deviceId", { length: 128 }).notNull(), // Unique device identifier
  userEmail: varchar("userEmail", { length: 320 }),
  userName: text("userName"),
  installationDate: timestamp("installationDate").notNull(),
  lastSeenAt: timestamp("lastSeenAt").defaultNow().notNull(),
  status: mysqlEnum("status", ["active", "revoked"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LicenseActivation = typeof licenseActivations.$inferSelect;
export type InsertLicenseActivation = typeof licenseActivations.$inferInsert;

/**
 * Performance snapshots for tracking system improvements before/after fixes
 */
export const performanceSnapshots = mysqlTable("performanceSnapshots", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  snapshotType: mysqlEnum("snapshotType", ["before_fix", "after_fix"]).notNull(),
  fixType: varchar("fixType", { length: 100 }), // e.g., "windows_update", "startup_optimization", "all_fixes"
  
  // Performance metrics
  bootTimeSeconds: int("bootTimeSeconds"),
  cpuUsagePercent: int("cpuUsagePercent"),
  memoryUsagePercent: int("memoryUsagePercent"),
  diskUsagePercent: int("diskUsagePercent"),
  startupProgramsCount: int("startupProgramsCount"),
  outdatedDriversCount: int("outdatedDriversCount"),
  securityIssuesCount: int("securityIssuesCount"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PerformanceSnapshot = typeof performanceSnapshots.$inferSelect;
export type InsertPerformanceSnapshot = typeof performanceSnapshots.$inferInsert;

/**
 * App settings table for admin configuration of Pro plan and payment providers
 */
export const appSettings = mysqlTable("appSettings", {
  id: int("id").autoincrement().primaryKey(),
  // Pro plan configuration
  proPlanEnabled: mysqlEnum("proPlanEnabled", ["true", "false"]).default("false").notNull(),
  monthlyPrice: int("monthlyPrice").default(999).notNull(), // in cents
  yearlyPrice: int("yearlyPrice").default(9999).notNull(), // in cents
  trialDays: int("trialDays").default(5).notNull(),
  
  // Payment provider toggles
  paypalEnabled: mysqlEnum("paypalEnabled", ["true", "false"]).default("false").notNull(),
  stripeEnabled: mysqlEnum("stripeEnabled", ["true", "false"]).default("false").notNull(),
  intuitEnabled: mysqlEnum("intuitEnabled", ["true", "false"]).default("false").notNull(),
  
  // Payment provider credentials (encrypted in production)
  paypalClientId: text("paypalClientId"),
  paypalClientSecret: text("paypalClientSecret"),
  paypalMode: mysqlEnum("paypalMode", ["sandbox", "live"]).default("sandbox"),
  
  stripePublicKey: text("stripePublicKey"),
  stripeSecretKey: text("stripeSecretKey"),
  
  intuitClientId: text("intuitClientId"),
  intuitClientSecret: text("intuitClientSecret"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AppSettings = typeof appSettings.$inferSelect;
export type InsertAppSettings = typeof appSettings.$inferInsert;
/**
 * Automatic optimization settings table
 */
export const automaticSettings = mysqlTable("automatic_settings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  scheduleEnabled: int("scheduleEnabled").default(0).notNull(), // 0 = disabled, 1 = enabled
  scheduleFrequency: varchar("scheduleFrequency", { length: 20 }).default("weekly").notNull(),
  optimizeOnStartup: int("optimizeOnStartup").default(0).notNull(),
  lowDiskSpaceEnabled: int("lowDiskSpaceEnabled").default(0).notNull(),
  diskSpaceThreshold: int("diskSpaceThreshold").default(10).notNull(),
  autoBackup: int("autoBackup").default(1).notNull(),
  optimizationProfile: varchar("optimizationProfile", { length: 20 }).default("balanced").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AutomaticSettings = typeof automaticSettings.$inferSelect;
export type InsertAutomaticSettings = typeof automaticSettings.$inferInsert;

/**
 * Startup programs table for managing Windows startup applications
 */
export const startupPrograms = mysqlTable("startup_programs", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 256 }).notNull(),
  publisher: varchar("publisher", { length: 256 }).notNull(),
  path: text("path").notNull(),
  enabled: int("enabled").default(1).notNull(), // 0 = disabled, 1 = enabled
  impact: mysqlEnum("impact", ["Low", "Medium", "High"]).default("Low").notNull(),
  startupType: varchar("startupType", { length: 50 }).notNull(), // "Registry", "Startup Folder", "Task Scheduler"
  cpuImpact: int("cpuImpact").default(0).notNull(), // 0-100
  ramImpact: int("ramImpact").default(0).notNull(), // MB
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type StartupProgram = typeof startupPrograms.$inferSelect;
export type InsertStartupProgram = typeof startupPrograms.$inferInsert;

/**
 * System backups table for storing system restore points
 */
export const systemBackups = mysqlTable("system_backups", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 256 }).notNull(),
  description: text("description"),
  // Snapshot of system state at backup time
  systemState: text("systemState").notNull(), // JSON string
  // Diagnostics snapshot
  diagnosticsSnapshot: text("diagnosticsSnapshot"), // JSON string
  // Metrics snapshot
  metricsSnapshot: text("metricsSnapshot"), // JSON string
  // Backup size in MB
  sizeMB: int("sizeMB").default(0).notNull(),
  // Backup type
  backupType: mysqlEnum("backupType", ["manual", "automatic", "pre-optimization"]).default("manual").notNull(),
  // Status
  status: mysqlEnum("status", ["creating", "completed", "failed"]).default("creating").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SystemBackup = typeof systemBackups.$inferSelect;
export type InsertSystemBackup = typeof systemBackups.$inferInsert;
