CREATE TABLE `system_backups` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(256) NOT NULL,
	`description` text,
	`systemState` text NOT NULL,
	`diagnosticsSnapshot` text,
	`metricsSnapshot` text,
	`sizeMB` int NOT NULL DEFAULT 0,
	`backupType` enum('manual','automatic','pre-optimization') NOT NULL DEFAULT 'manual',
	`status` enum('creating','completed','failed') NOT NULL DEFAULT 'creating',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `system_backups_id` PRIMARY KEY(`id`)
);
