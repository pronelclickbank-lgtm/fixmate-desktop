CREATE TABLE `licenseActivations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`licenseKeyId` int NOT NULL,
	`deviceId` varchar(128) NOT NULL,
	`userEmail` varchar(320),
	`userName` text,
	`installationDate` timestamp NOT NULL,
	`lastSeenAt` timestamp NOT NULL DEFAULT (now()),
	`status` enum('active','revoked') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `licenseActivations_id` PRIMARY KEY(`id`)
);
