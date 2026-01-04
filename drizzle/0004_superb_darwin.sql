ALTER TABLE `users` ADD `phone` varchar(20);--> statement-breakpoint
ALTER TABLE `users` ADD `registeredAt` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `isRegistered` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `usageCount` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `lastUsedAt` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `lastNotificationSentAt` timestamp;