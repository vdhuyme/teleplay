DROP INDEX `group_position_idx` ON `queue_items`;--> statement-breakpoint
CREATE INDEX `group_votes_idx` ON `queue_items` (`group_id`,`votes`);--> statement-breakpoint
ALTER TABLE `queue_items` DROP COLUMN `position`;