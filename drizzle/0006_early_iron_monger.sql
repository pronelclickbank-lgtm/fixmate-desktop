CREATE TABLE `startup_programs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(256) NOT NULL,
	`publisher` varchar(256) NOT NULL,
	`path` text NOT NULL,
	`enabled` int NOT NULL DEFAULT 1,
	`impact` enum('Low','Medium','High') NOT NULL DEFAULT 'Low',
	`startupType` varchar(50) NOT NULL,
	`cpuImpact` int NOT NULL DEFAULT 0,
	`ramImpact` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `startup_programs_id` PRIMARY KEY(`id`)
);
