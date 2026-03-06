CREATE TABLE `craft_templates` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`ai_config_id` integer NOT NULL,
	`prompt_template` text NOT NULL,
	`category` text DEFAULT 'custom' NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`updated_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`ai_config_id`) REFERENCES `ai_configs`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE INDEX `craft_templates_user_id_idx` ON `craft_templates` (`user_id`);--> statement-breakpoint
CREATE INDEX `craft_templates_category_idx` ON `craft_templates` (`category`);