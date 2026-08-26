ALTER TABLE `play_history` MODIFY COLUMN `group_id` bigint NOT NULL;--> statement-breakpoint
ALTER TABLE `queue_items` MODIFY COLUMN `group_id` bigint NOT NULL;