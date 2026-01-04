CREATE TABLE `automatic_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`scheduleEnabled` int NOT NULL DEFAULT 0,
	`scheduleFrequency` varchar(20) NOT NULL DEFAULT 'weekly',
	`optimizeOnStartup` int NOT NULL DEFAULT 0,
	`lowDiskSpaceEnabled` int NOT NULL DEFAULT 0,
	`diskSpaceThreshold` int NOT NULL DEFAULT 10,
	`autoBackup` int NOT NULL DEFAULT 1,
	`optimizationProfile` varchar(20) NOT NULL DEFAULT 'balanced',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `automatic_settings_id` PRIMARY KEY(`id`)
);
