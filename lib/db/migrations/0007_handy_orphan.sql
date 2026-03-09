CREATE TABLE `processing_queue` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`feed_item_id` integer NOT NULL,
	`pipeline_id` integer,
	`template_id` integer,
	`status` text DEFAULT 'pending' NOT NULL,
	`priority` integer DEFAULT 0 NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`max_attempts` integer DEFAULT 3 NOT NULL,
	`error_message` text,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`started_at` integer,
	`completed_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`feed_item_id`) REFERENCES `feed_items`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`pipeline_id`) REFERENCES `pipelines`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`template_id`) REFERENCES `craft_templates`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `processing_queue_user_id_idx` ON `processing_queue` (`user_id`);--> statement-breakpoint
CREATE INDEX `processing_queue_feed_item_id_idx` ON `processing_queue` (`feed_item_id`);--> statement-breakpoint
CREATE INDEX `processing_queue_status_idx` ON `processing_queue` (`status`);--> statement-breakpoint
ALTER TABLE `feeds` ADD `pipeline_id` integer REFERENCES pipelines(id);--> statement-breakpoint
ALTER TABLE `feeds` ADD `template_id` integer REFERENCES craft_templates(id);--> statement-breakpoint
ALTER TABLE `feeds` ADD `auto_process` integer DEFAULT false NOT NULL;