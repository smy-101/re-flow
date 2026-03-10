CREATE TABLE `ai_configs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`name` text NOT NULL,
	`provider_type` text NOT NULL,
	`provider_id` text,
	`api_format` text NOT NULL,
	`base_url` text NOT NULL,
	`api_key_encrypted` text NOT NULL,
	`api_key_iv` text NOT NULL,
	`api_key_tag` text NOT NULL,
	`model` text NOT NULL,
	`system_prompt` text,
	`model_params` text,
	`is_default` integer DEFAULT false NOT NULL,
	`is_enabled` integer DEFAULT true NOT NULL,
	`health_status` text DEFAULT 'unverified' NOT NULL,
	`last_error` text,
	`last_error_at` integer,
	`extra_params` text,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`updated_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `ai_configs_user_id_idx` ON `ai_configs` (`user_id`);--> statement-breakpoint
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
CREATE INDEX `craft_templates_category_idx` ON `craft_templates` (`category`);--> statement-breakpoint
CREATE TABLE `feed_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`feed_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	`title` text NOT NULL,
	`link` text NOT NULL,
	`content` text NOT NULL,
	`published_at` integer NOT NULL,
	`is_read` integer DEFAULT false NOT NULL,
	`is_favorite` integer DEFAULT false NOT NULL,
	`author` text,
	`reading_time` integer,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`feed_id`) REFERENCES `feeds`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `feed_items_feed_id_idx` ON `feed_items` (`feed_id`);--> statement-breakpoint
CREATE INDEX `feed_items_user_id_idx` ON `feed_items` (`user_id`);--> statement-breakpoint
CREATE INDEX `feed_items_published_at_idx` ON `feed_items` (`published_at`);--> statement-breakpoint
CREATE INDEX `feed_items_is_favorite_idx` ON `feed_items` (`is_favorite`);--> statement-breakpoint
CREATE TABLE `feeds` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`title` text NOT NULL,
	`feed_url` text NOT NULL,
	`site_url` text,
	`description` text,
	`category` text,
	`pipeline_id` integer,
	`template_id` integer,
	`auto_process` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`last_updated_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`pipeline_id`) REFERENCES `pipelines`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`template_id`) REFERENCES `craft_templates`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `feeds_feed_url_unique` ON `feeds` (`feed_url`);--> statement-breakpoint
CREATE INDEX `feeds_user_id_idx` ON `feeds` (`user_id`);--> statement-breakpoint
CREATE TABLE `pipelines` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`steps` text NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`updated_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `pipelines_user_id_idx` ON `pipelines` (`user_id`);--> statement-breakpoint
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
CREATE INDEX `processing_results_status_idx` ON `processing_results` (`status`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`nickname` text NOT NULL,
	`password_hash` text NOT NULL,
	`email_verified` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `users_email_idx` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `verification_codes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`code` text NOT NULL,
	`type` text NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `verification_codes_email_type_idx` ON `verification_codes` (`email`,`type`);