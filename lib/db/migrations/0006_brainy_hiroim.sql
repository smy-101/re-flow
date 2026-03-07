CREATE TABLE `processing_results` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`feed_item_id` integer NOT NULL,
	`pipeline_id` integer,
	`template_id` integer,
	`output` text,
	`steps_output` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`error_message` text,
	`tokens_used` integer,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`completed_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`feed_item_id`) REFERENCES `feed_items`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`pipeline_id`) REFERENCES `pipelines`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`template_id`) REFERENCES `craft_templates`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `processing_results_user_id_idx` ON `processing_results` (`user_id`);--> statement-breakpoint
CREATE INDEX `processing_results_feed_item_id_idx` ON `processing_results` (`feed_item_id`);--> statement-breakpoint
CREATE INDEX `processing_results_status_idx` ON `processing_results` (`status`);