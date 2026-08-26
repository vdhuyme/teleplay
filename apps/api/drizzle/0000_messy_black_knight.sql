CREATE TABLE `groups` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255),
	`status` enum('idle','playing','paused','stopped') NOT NULL DEFAULT 'idle',
	`video_id` varchar(32),
	`title` varchar(500),
	`thumbnail` varchar(1000),
	`duration` int unsigned,
	`position` int unsigned NOT NULL DEFAULT 0,
	`volume` int unsigned NOT NULL DEFAULT 80,
	`requested_by` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `groups_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `play_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`group_id` int NOT NULL,
	`video_id` varchar(32) NOT NULL,
	`title` varchar(500) NOT NULL,
	`requested_by` varchar(255),
	`played_at` timestamp NOT NULL DEFAULT (now()),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `play_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `queue_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`group_id` int NOT NULL,
	`video_id` varchar(32) NOT NULL,
	`title` varchar(500) NOT NULL,
	`thumbnail` varchar(1000),
	`duration` int unsigned,
	`position` int unsigned NOT NULL,
	`votes` bigint unsigned NOT NULL DEFAULT 1,
	`requested_by` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `queue_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `group_played_at_idx` ON `play_history` (`group_id`,`played_at`);--> statement-breakpoint
CREATE INDEX `group_position_idx` ON `queue_items` (`group_id`,`position`);